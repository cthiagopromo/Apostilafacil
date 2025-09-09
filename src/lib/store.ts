import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project, Block, BlockType, BlockContent, QuizOption, LayoutSettings, HandbookData, Theme } from './types';
import { initialHandbookData } from './initial-data';
import { produce } from 'immer';
import localforage from 'localforage';

const STORE_KEY = 'apostila-facil-data';

const getUniqueId = (prefix: 'proj' | 'block' | 'opt' | 'handbook') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`;
};

type State = {
  handbookId: string;
  handbookTitle: string;
  handbookDescription: string;
  handbookUpdatedAt: string;
  handbookTheme: Theme;
  projects: Project[];
  activeProject: Project | null;
  activeBlockId: string | null;
  isDirty: boolean;
  isInitialized: boolean;
};

type Actions = {
  initializeStore: (handbookIdFromUrl: string | null) => Promise<void>;
  setActiveProject: (projectId: string) => void;
  setActiveBlockId: (blockId: string | null) => void;
  updateHandbookTitle: (title: string) => void;
  updateHandbookDescription: (description: string) => void;
  updateHandbookTheme: (theme: Partial<Theme>) => void;
  createNewHandbook: () => { handbookId: string, projectId: string };
  loadHandbookData: (data: HandbookData) => Promise<void>;
  addProject: () => Project;
  deleteProject: (projectId: string) => string | null;
  saveData: () => Promise<void>;
  updateProjectTitle: (projectId: string, title: string) => void;
  updateProjectDescription: (projectId: string, description: string) => void;
  updateLayoutSetting: (projectId: string, setting: keyof LayoutSettings, value: string) => void;
  addBlock: (projectId: string, type: BlockType) => void;
  deleteBlock: (projectId: string, blockId: string) => void;
  reorderBlocks: (projectId: string, startIndex: number, endIndex: number) => void;
  duplicateBlock: (projectId: string, blockId: string) => void;
  updateBlockContent: (blockId: string, newContent: Partial<BlockContent>) => void;
  addQuizOption: (blockId: string) => void;
  updateQuizOption: (blockId: string, optionId: string, updates: Partial<QuizOption>) => void;
  deleteQuizOption: (blockId: string, optionId: string) => void;
  resetQuiz: (blockId: string) => void;
};

const performSave = async (dataToSave: HandbookData) => {
    if (!dataToSave || typeof window === 'undefined') return;
    try {
        // Use a safe stringify by creating a clean copy, avoiding circular references or proxy issues.
        const cleanData = JSON.parse(JSON.stringify(dataToSave));
        await localforage.setItem(STORE_KEY, cleanData);

        // A chamada da API é 'best-effort'. Falhas não devem impedir o salvamento local.
        fetch('/api/saveApostila', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apostila_id: cleanData.id,
                data: cleanData
            })
        }).catch(apiError => {
            console.warn('[Store] Falha ao salvar na API, mas os dados foram salvos localmente:', apiError);
        });
    } catch (error) {
        console.error('[Store] Falha crítica ao salvar os dados:', error);
        throw error;
    }
};

const useProjectStore = create<State & Actions>()(
  immer((set, get) => ({
    handbookId: '',
    handbookTitle: '',
    handbookDescription: '',
    handbookUpdatedAt: new Date().toISOString(),
    handbookTheme: { colorPrimary: '221 83% 53%' },
    projects: [],
    activeProject: null,
    activeBlockId: null,
    isDirty: false,
    isInitialized: false,

    initializeStore: async (handbookIdFromUrl: string | null) => {
      if (get().isInitialized || typeof window === 'undefined') {
        return;
      }

      let dataToLoad: HandbookData | null = null;

      try {
        // 1. Prioritize loading from URL if ID is present
        if (handbookIdFromUrl) {
            try {
                const response = await fetch(`/api/getApostila/${handbookIdFromUrl}`);
                if (response.ok) {
                    dataToLoad = await response.json();
                } else {
                    console.warn(`Apostila com ID ${handbookIdFromUrl} não encontrada no DB.`);
                }
            } catch (e) {
                console.error("Erro ao buscar apostila da API:", e);
            }
        }
        
        // 2. Fallback to local storage if no URL or API fetch fails
        if (!dataToLoad) {
            dataToLoad = await localforage.getItem<HandbookData>(STORE_KEY);
        }

        // 3. If still nothing, use initial data
        if (!dataToLoad || !dataToLoad.projects || dataToLoad.projects.length === 0) {
            dataToLoad = initialHandbookData;
        }

        // Migration and setting state
        const migratedData = produce(dataToLoad, draft => {
            if (!draft.theme) draft.theme = { colorPrimary: '221 83% 53%' };
            draft.projects.forEach(p => {
                if (!p.layoutSettings) {
                    p.layoutSettings = { containerWidth: 'large', sectionSpacing: 'standard', navigationType: 'sidebar' };
                }
            });
        });

        set({ 
            handbookId: migratedData.id,
            projects: migratedData.projects,
            handbookTitle: migratedData.title,
            handbookDescription: migratedData.description,
            handbookUpdatedAt: migratedData.updatedAt || new Date().toISOString(),
            handbookTheme: migratedData.theme
        });
        
      } catch (e) {
        console.error("Falha ao inicializar a store", e);
        set({ ...initialHandbookData });
      } finally {
          const projects = get().projects;
          if (projects.length > 0) {
            set(state => {
              state.activeProject = JSON.parse(JSON.stringify(projects[0]));
            });
          }
          set({ isInitialized: true });
      }
    },
    
    setActiveProject: (projectId) => {
      get().saveData();
      set(state => {
        const projectToActivate = state.projects.find((p) => p.id === projectId);
        if (projectToActivate) {
          state.activeProject = JSON.parse(JSON.stringify(projectToActivate));
          state.activeBlockId = null;
        }
      });
    },
    
    setActiveBlockId: (blockId) => set({ activeBlockId: blockId }),
    
    updateHandbookTitle: (title) => {
        set(state => {
            state.handbookTitle = title;
            state.isDirty = true;
        });
    },

    updateHandbookDescription: (description) => {
        set(state => {
            state.handbookDescription = description;
            state.isDirty = true;
        });
    },

    updateHandbookTheme: (theme) => {
        set(state => {
            state.handbookTheme = { ...state.handbookTheme, ...theme };
            state.isDirty = true;
        })
    },

    createNewHandbook: () => {
        const newHandbookId = getUniqueId('handbook');
        const newProjectId = getUniqueId('proj');
        const newProject: Project = {
            id: newProjectId,
            title: 'Novo Módulo',
            description: 'Uma nova apostila com blocos editáveis.',
            layoutSettings: {
                containerWidth: 'large',
                sectionSpacing: 'standard',
                navigationType: 'sidebar',
            },
            blocks: [],
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        set({
            handbookId: newHandbookId,
            handbookTitle: 'Nova Apostila',
            handbookDescription: 'Comece a criar sua nova apostila.',
            handbookUpdatedAt: new Date().toISOString(),
            handbookTheme: { colorPrimary: '221 83% 53%' },
            projects: [newProject],
            activeProject: JSON.parse(JSON.stringify(newProject)),
            activeBlockId: null,
            isDirty: true,
        });
        get().saveData();
        return { handbookId: newHandbookId, projectId: newProjectId };
    },

    loadHandbookData: async (data) => {
        set({
            handbookId: data.id,
            handbookTitle: data.title,
            handbookDescription: data.description,
            handbookTheme: data.theme,
            projects: data.projects,
            handbookUpdatedAt: new Date().toISOString(),
            activeProject: data.projects[0] ? JSON.parse(JSON.stringify(data.projects[0])) : null,
            activeBlockId: null,
            isDirty: true,
        });
        await get().saveData();
    },

    addProject: () => {
        const newProject: Project = {
            id: getUniqueId('proj'),
            title: 'Novo Módulo',
            description: 'Uma nova apostila com blocos editáveis.',
            layoutSettings: {
                containerWidth: 'large',
                sectionSpacing: 'standard',
                navigationType: 'sidebar',
            },
            blocks: [],
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        set(state => {
            state.projects.push(newProject);
            state.isDirty = true;
        });
        get().saveData();
        return newProject;
    },

    deleteProject: (projectId: string) => {
      let nextActiveProjectId: string | null = null;
      set(state => {
        const projectIndex = state.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return;

        if (state.projects.length <= 1) {
            console.warn("Cannot delete the last module.");
            return;
        }

        state.projects.splice(projectIndex, 1);

        if (state.activeProject?.id === projectId) {
          if (state.projects.length > 0) {
            const newActiveIndex = Math.max(0, projectIndex - 1);
            nextActiveProjectId = state.projects[newActiveIndex].id;
            state.activeProject = JSON.parse(JSON.stringify(state.projects[newActiveIndex]));
          } else {
            state.activeProject = null;
            nextActiveProjectId = null;
          }
        } else if (state.projects.length > 0 && !state.activeProject) {
            const nextActiveProject = state.projects[0];
            state.activeProject = JSON.parse(JSON.stringify(nextActiveProject));
            nextActiveProjectId = nextActiveProject.id;
        } else if (state.activeProject) {
          nextActiveProjectId = state.activeProject.id;
        }
        state.isDirty = true;
      });
      get().saveData();
      return nextActiveProjectId;
    },

    saveData: async () => {
      if (!get().isDirty && get().isInitialized) {
        return;
      }
      
      let dataToSave: HandbookData | null = null;

      set(state => {
          if (state.activeProject) {
              const projectIndex = state.projects.findIndex(p => p.id === state.activeProject!.id);
              if (projectIndex !== -1) {
                  state.projects[projectIndex] = JSON.parse(JSON.stringify(state.activeProject));
                  state.projects[projectIndex].updatedAt = new Date().toISOString();
              }
          }
          state.handbookUpdatedAt = new Date().toISOString();
          state.isDirty = false;
          
          dataToSave = {
              id: state.handbookId,
              title: state.handbookTitle,
              description: state.handbookDescription,
              projects: state.projects,
              updatedAt: state.handbookUpdatedAt,
              theme: state.handbookTheme
          };
      });
      
      if(dataToSave) {
          try {
            await performSave(dataToSave);
          } catch (error) {
            set({ isDirty: true });
          }
      }
    },

    updateProjectTitle: (projectId, title) => {
      set(state => {
        const project = state.activeProject;
        if (project && project.id === projectId) {
          project.title = title;
          state.isDirty = true;
        }
      })
    },

    updateProjectDescription: (projectId, description) => {
      set(state => {
        const project = state.activeProject;
        if (project && project.id === projectId) {
          project.description = description;
          state.isDirty = true;
        }
      })
    },

    updateLayoutSetting: (projectId, setting, value) => {
        set(state => {
            const project = state.activeProject;
            if (project && project.id === projectId) {
                // @ts-ignore
                project.layoutSettings[setting] = value;
                state.isDirty = true;
            }
        });
    },

    addBlock: (projectId, type) => {
        let content: BlockContent = {};
        switch (type) {
            case 'text':
                content = { text: '<p>Novo bloco de texto...</p>' };
                break;
            case 'image':
                content = { url: 'https://placehold.co/600x400.png', alt: 'Placeholder image', caption: '', width: 100 };
                break;
            case 'video':
                content = { 
                    videoType: 'youtube',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    vimeoVideoId: '824804258',
                    cloudflareVideoId: '',
                    smartplayUrl: '',
                    videoTitle: 'Título do Vídeo',
                    autoplay: false,
                    showControls: true,
                };
                break;
            case 'button':
                content = { buttonText: 'Clique Aqui', buttonUrl: '#' };
                break;
            case 'quote':
                content = { text: 'No início de 1905, Albert Einstein tinha 25 anos de idade e era um desconhecido funcionário do departamento de patentes da Suíça.' };
                break;
            case 'quiz':
                content = { 
                    question: 'Qual é a pergunta?', 
                    options: [
                        { id: getUniqueId('opt'), text: 'Opção 1', isCorrect: true },
                        { id: getUniqueId('opt'), text: 'Opção 2', isCorrect: false }
                    ],
                    userAnswerId: null
                };
                break;
        }

        const newBlock: Block = {
            id: getUniqueId('block'),
            type,
            content,
        };

        set((state) => {
            const project = state.activeProject;
            if (project && project.id === projectId) {
                if (!project.blocks) {
                    project.blocks = [];
                }
                project.blocks.push(newBlock);
                state.activeBlockId = newBlock.id;
                state.isDirty = true;
            }
        });
    },

    deleteBlock: (projectId, blockId) => {
      set(state => {
        const project = state.activeProject;
        if (project && project.id === projectId) {
          project.blocks = project.blocks.filter(b => b.id !== blockId);
          if (state.activeBlockId === blockId) {
              state.activeBlockId = null;
          }
          state.isDirty = true;
        }
      });
    },

    reorderBlocks: (projectId, startIndex, endIndex) => {
      set(state => {
        const project = state.activeProject;
        if (project && project.id === projectId) {
          const [removed] = project.blocks.splice(startIndex, 1);
          project.blocks.splice(endIndex, 0, removed);
          state.isDirty = true;
        }
      });
    },

    duplicateBlock: (projectId, blockId) => {
        set(state => {
            const project = state.activeProject;
            if (project && project.id === projectId) {
                const blockToDuplicate = project.blocks.find(b => b.id === blockId);
                if (!blockToDuplicate) return;

                const newBlock = produce(blockToDuplicate, draft => {
                    draft.id = getUniqueId('block');
                    if(draft.type === 'quiz' && draft.content.options) {
                        draft.content.userAnswerId = null;
                        draft.content.options = draft.content.options.map(o => ({...o, id: getUniqueId('opt')}))
                    }
                });

                const index = project.blocks.findIndex(b => b.id === blockId);
                project.blocks.splice(index + 1, 0, newBlock);
                state.isDirty = true;
            }
        });
    },

    updateBlockContent: (blockId, newContent) => {
      set((state) => {
        if (!state.activeProject) return;
        const block = state.activeProject.blocks.find(b => b.id === blockId);
        if(!block) return;
        block.content = {...block.content, ...newContent};
        state.isDirty = true;
      });
    },

    addQuizOption: (blockId) => {
        set(state => {
            if (!state.activeProject) return;
            const block = state.activeProject.blocks.find(b => b.id === blockId);
            if (block && block.type === 'quiz') {
                if (!block.content.options) {
                    block.content.options = [];
                }
                const newOption: QuizOption = {
                    id: getUniqueId('opt'),
                    text: 'Nova Opção',
                    isCorrect: false,
                };
                block.content.options.push(newOption);
                state.isDirty = true;
            }
        });
    },

    updateQuizOption: (blockId, optionId, updates) => {
        set(state => {
            const block = state.activeProject?.blocks.find(b => b.id === blockId);
            if (block && block.type === 'quiz' && block.content.options) {
                const option = block.content.options.find(o => o.id === optionId);
                if (option) {
                    Object.assign(option, updates);
                    if (updates.isCorrect) {
                        block.content.options.forEach(o => {
                            if(o.id !== optionId) {
                                o.isCorrect = false;
                            }
                        })
                    }
                    state.isDirty = true;
                }
            }
        });
    },

    deleteQuizOption: (blockId, optionId) => {
        set(state => {
            const block = state.activeProject?.blocks.find(b => b.id === blockId);
            if (block && block.type === 'quiz' && block.content.options) {
                block.content.options = block.content.options.filter(o => o.id !== optionId);
                state.isDirty = true;
            }
        });
    },
    
    resetQuiz: (blockId) => {
        set(state => {
            if (!state.activeProject) return;
            const block = state.activeProject.blocks.find(b => b.id === blockId);
            if (block && block.type === 'quiz') {
                block.content.userAnswerId = null;
            }
        })
    }

  }))
);

if (typeof window !== 'undefined') {
  const SCRIPT_TAG_ID = 'zustand-init-script';
  if (!document.getElementById(SCRIPT_TAG_ID)) {
    let saveTimeout: NodeJS.Timeout;
    useProjectStore.subscribe((state) => {
      if (state.isDirty && state.isInitialized) {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          useProjectStore.getState().saveData();
        }, 2000); 
      }
    });

    window.addEventListener('beforeunload', () => {
        if (useProjectStore.getState().isDirty) {
          useProjectStore.getState().saveData();
        }
    });

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && useProjectStore.getState().isDirty) {
        useProjectStore.getState().saveData();
      }
    });

    const script = document.createElement('script');
    script.id = SCRIPT_TAG_ID;
    document.head.appendChild(script);
  }
}

export default useProjectStore;
