
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project, Block, BlockType, BlockContent, QuizOption, LayoutSettings, HandbookData, Theme } from './types';
import { initialHandbookData } from './initial-data';
import { produce } from 'immer';

const STORE_KEY = 'apostila-facil-data';

// Helper for unique IDs
const getUniqueId = (prefix: 'proj' | 'block' | 'opt' | 'handbook') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
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
  isDirty: boolean; // To track unsaved changes
};

type Actions = {
  initializeStore: () => void;
  setActiveProject: (projectId: string) => void;
  setActiveBlockId: (blockId: string | null) => void;
  updateHandbookTitle: (title: string) => void;
  updateHandbookDescription: (description: string) => void;
  updateHandbookTheme: (theme: Partial<Theme>) => void;
  createNewHandbook: () => Project | null;
  loadHandbookData: (data: HandbookData) => Project | null;
  addProject: () => Project;
  deleteProject: (projectId: string) => string | null;
  saveData: () => void;
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

    initializeStore: () => {
      if (typeof window !== 'undefined') {
        try {
          const storedData = localStorage.getItem(STORE_KEY);
          let data: HandbookData | null = storedData ? JSON.parse(storedData) : null;
          
          if (data && data.projects && data.projects.length > 0) {
             const migratedData = produce(data, draft => {
                if (!draft.theme) {
                    draft.theme = { colorPrimary: '221 83% 53%' };
                }
                draft.projects.forEach(p => {
                  if (!p.layoutSettings) {
                    p.layoutSettings = {
                      containerWidth: 'large',
                      sectionSpacing: 'standard',
                      navigationType: 'sidebar',
                    };
                  }
                  // @ts-ignore
                  if (p.theme) {
                    // @ts-ignore
                    delete p.theme;
                  }
                });
             });

            set({ 
                handbookId: migratedData.id || getUniqueId('handbook'),
                projects: migratedData.projects,
                handbookTitle: migratedData.title,
                handbookDescription: migratedData.description,
                handbookUpdatedAt: migratedData.updatedAt || new Date().toISOString(),
                handbookTheme: migratedData.theme
            });
          } else {
             const initialData = initialHandbookData;
             if (initialData.projects.length === 0) {
                 initialData.projects.push({
                    id: getUniqueId('proj'),
                    title: 'Primeiro Módulo',
                    description: 'Comece a adicionar blocos a este módulo.',
                    layoutSettings: {
                        containerWidth: 'large',
                        sectionSpacing: 'standard',
                        navigationType: 'sidebar',
                    },
                    blocks: [],
                    version: '1.0.0',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
             }
            set({ 
                handbookId: initialData.id,
                projects: initialData.projects,
                handbookTitle: initialData.title,
                handbookDescription: initialData.description,
                handbookUpdatedAt: initialData.updatedAt,
                handbookTheme: initialData.theme,
            });
          }
        } catch (e) {
          console.error("Failed to parse projects from localStorage", e);
          set({ 
            handbookId: initialHandbookData.id,
            projects: initialHandbookData.projects,
            handbookTitle: initialHandbookData.title,
            handbookDescription: initialHandbookData.description,
            handbookUpdatedAt: initialHandbookData.updatedAt,
            handbookTheme: initialHandbookData.theme,
          });
        }
        
        const projects = get().projects;
        if (projects.length > 0 && !get().activeProject) {
          set(state => {
            state.activeProject = JSON.parse(JSON.stringify(projects[0]));
          });
        }
      }
    },
    
    setActiveProject: (projectId) => {
      get().saveData(); // Autosave when switching
      set(state => {
        const projectToActivate = state.projects.find((p) => p.id === projectId);
        if (projectToActivate) {
          state.activeProject = JSON.parse(JSON.stringify(projectToActivate)); // Deep copy
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

        set({
            handbookId: getUniqueId('handbook'),
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
        return newProject;
    },

    loadHandbookData: (data) => {
        set({
            handbookId: data.id,
            handbookTitle: data.title,
            handbookDescription: data.description,
            handbookTheme: data.theme,
            projects: data.projects,
            handbookUpdatedAt: data.updatedAt,
            activeProject: data.projects[0] ? JSON.parse(JSON.stringify(data.projects[0])) : null,
            activeBlockId: null,
            isDirty: true,
        });
        get().saveData();
        return data.projects[0] || null;
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

    saveData: () => {
      set(state => {
        // No need to save if nothing has changed.
        // Also prevents saving initial empty state on first load.
        if (!state.isDirty && localStorage.getItem(STORE_KEY)) return; 

        if (state.activeProject) {
            const projectIndex = state.projects.findIndex(p => p.id === state.activeProject!.id);
            if (projectIndex !== -1) {
                state.projects[projectIndex] = JSON.parse(JSON.stringify(state.activeProject));
                state.projects[projectIndex].updatedAt = new Date().toISOString();
            }
        }
        
        state.handbookUpdatedAt = new Date().toISOString();

        if (typeof window !== 'undefined') {
          const dataToSave: HandbookData = {
            id: state.handbookId,
            title: state.handbookTitle,
            description: state.handbookDescription,
            projects: state.projects,
            updatedAt: state.handbookUpdatedAt,
            theme: state.handbookTheme
          };
          localStorage.setItem(STORE_KEY, JSON.stringify(dataToSave));
        }
        state.isDirty = false;
      });
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
  useProjectStore.getState().initializeStore();
  
  // Debounce save function
  let saveTimeout: NodeJS.Timeout;
  const debouncedSave = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        if (useProjectStore.getState().isDirty) {
            useProjectStore.getState().saveData();
        }
    }, 1000); // Save after 1 second of inactivity
  };
  
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

  // Also, you might want to replace direct calls to saveData with debouncedSave
  // in parts of the store where changes happen frequently.
  // For now, this periodic check and save-on-close is a good safety net.
}

export default useProjectStore;
