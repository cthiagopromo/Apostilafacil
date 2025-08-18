
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project, Block, BlockType, BlockContent, QuizOption, LayoutSettings } from './types';
import { initialProjects } from './initial-data';
import { produce } from 'immer';

const STORE_KEY = 'apostila-facil-projects';

type State = {
  projects: Project[];
  activeProject: Project | null;
  activeBlockId: string | null;
  isDirty: boolean; // To track unsaved changes
};

type Actions = {
  initializeStore: () => void;
  getProjectById: (projectId: string) => Project | undefined;
  setActiveProject: (projectId: string) => void;
  setActiveBlockId: (blockId: string | null) => void;
  addProject: () => Project;
  saveProjects: () => void;
  updateProjectTitle: (projectId: string, title: string) => void;
  updateProjectDescription: (projectId: string, description: string) => void;
  updateLayoutSetting: (projectId: string, setting: keyof LayoutSettings, value: string) => void;
  addBlock: (projectId: string, type: BlockType) => void;
  deleteBlock: (projectId: string, blockId: string) => void;
  moveBlock: (projectId: string, blockId: string, direction: 'up' | 'down') => void;
  duplicateBlock: (projectId: string, blockId: string) => void;
  updateBlockContent: (blockId: string, newContent: Partial<BlockContent>) => void;
  addQuizOption: (blockId: string) => void;
  updateQuizOption: (blockId: string, optionId: string, updates: Partial<QuizOption>) => void;
  deleteQuizOption: (blockId: string, optionId: string) => void;
  resetQuiz: (blockId: string) => void;
};

const useProjectStore = create<State & Actions>()(
  immer((set, get) => ({
    projects: [],
    activeProject: null,
    activeBlockId: null,
    isDirty: false,

    initializeStore: () => {
      if (typeof window !== 'undefined') {
        try {
          const storedProjects = localStorage.getItem(STORE_KEY);
          let projects: Project[] | null = storedProjects ? JSON.parse(storedProjects) : null;
          
          if (Array.isArray(projects)) {
            const migratedProjects = projects.map(p => {
              if (!p.layoutSettings) {
                p.layoutSettings = {
                  containerWidth: 'large',
                  sectionSpacing: 'standard',
                  navigationType: 'sidebar',
                };
              }
              return p;
            });
            set({ projects: migratedProjects.length > 0 ? migratedProjects : initialProjects });
          } else {
            set({ projects: initialProjects });
          }
        } catch (e) {
          console.error("Failed to parse projects from localStorage", e);
          set({ projects: initialProjects });
        }
        
        const projects = get().projects;
        if (projects.length > 0) {
          set({ activeProject: projects[0] });
        }
      }
    },
    
    getProjectById: (projectId) => {
        return get().projects.find((p) => p.id === projectId);
    },

    setActiveProject: (projectId) => {
      set(state => {
        const projectToActivate = state.projects.find((p) => p.id === projectId);
        if (projectToActivate) {
          state.activeProject = JSON.parse(JSON.stringify(projectToActivate)); // Deep copy
          state.activeBlockId = null;
        }
      });
    },
    
    setActiveBlockId: (blockId) => set({ activeBlockId: blockId }),
    
    addProject: () => {
        const newProject: Project = {
            id: `proj_${new Date().getTime()}`,
            title: 'Novo Módulo',
            description: 'Uma nova apostila com blocos editáveis.',
            theme: {
              colorPrimary: '#2563EB',
              colorBackground: '#F9FAFB',
              colorAccent: '#60A5FA',
              fontBody: 'Inter',
            },
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
        return newProject;
    },

    saveProjects: () => {
      set(state => {
        if (!state.activeProject) return;

        const projectIndex = state.projects.findIndex(p => p.id === state.activeProject!.id);
        if (projectIndex !== -1) {
            state.projects[projectIndex] = JSON.parse(JSON.stringify(state.activeProject));
            state.projects[projectIndex].updatedAt = new Date().toISOString();
        }
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORE_KEY, JSON.stringify(state.projects));
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
                content = { videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' };
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
                        { id: `opt_${new Date().getTime()}`, text: 'Opção 1', isCorrect: true },
                        { id: `opt_${new Date().getTime() + 1}`, text: 'Opção 2', isCorrect: false }
                    ],
                    userAnswerId: null
                };
                break;
        }

        const newBlock: Block = {
            id: `block_${new Date().getTime()}`,
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

    moveBlock: (projectId, blockId, direction) => {
      set(state => {
          const project = state.activeProject;
          if (project && project.id === projectId) {
              const index = project.blocks.findIndex(b => b.id === blockId);
              if (index === -1) return;

              const newIndex = direction === 'up' ? index - 1 : index + 1;
              if (newIndex < 0 || newIndex >= project.blocks.length) return;

              const temp = project.blocks[index];
              project.blocks[index] = project.blocks[newIndex];
              project.blocks[newIndex] = temp;
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
                    draft.id = `block_${new Date().getTime()}`;
                    // Reset quiz answers on duplication
                    if(draft.type === 'quiz') {
                        draft.content.userAnswerId = null;
                        if(draft.content.options) {
                           draft.content.options = draft.content.options.map(o => ({...o, id: `opt_${new Date().getTime()}`}))
                        }
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
                    id: `opt_${new Date().getTime()}`,
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
                    // If setting this option to correct, set others to false
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
  
  window.addEventListener('storage', (event) => {
    if (event.key === STORE_KEY) {
      useProjectStore.getState().initializeStore();
    }
  });
}

export default useProjectStore;
