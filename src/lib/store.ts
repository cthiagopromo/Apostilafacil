
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project, Block, BlockType, BlockContent, QuizOption, LayoutSettings } from './types';
import { initialProjects } from './initial-data';
import { produce } from 'immer';

type State = {
  projects: Project[];
  activeProject: Project | null;
  activeBlockId: string | null;
  isDirty: boolean; // To track unsaved changes
};

type Actions = {
  setProjects: (projects: Project[]) => void;
  getProjectById: (projectId: string) => Project | undefined;
  setActiveProject: (projectId: string) => void;
  setActiveBlockId: (blockId: string | null) => void;
  addProject: () => Project;
  saveProject: (projectId: string) => void;
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

    setProjects: (projects) => set({ projects }),

    getProjectById: (projectId) => {
        return get().projects.find((p) => p.id === projectId);
    },

    setActiveProject: (projectId) => {
      const project = get().projects.find((p) => p.id === projectId);
      if (project) {
        set({ activeProject: project, activeBlockId: null, isDirty: false });
      }
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

    saveProject: (projectId: string) => {
        // In a real app, this would save to a server. Here we just update the state.
        // The persistence to localStorage is handled by the subscription middleware.
        set(state => {
            const project = state.projects.find(p => p.id === projectId);
            if (project) {
                project.updatedAt = new Date().toISOString();
            }
            state.isDirty = false;
        });
    },

    updateProjectTitle: (projectId, title) => {
      set(state => {
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.title = title;
          if (state.activeProject?.id === projectId) {
            state.activeProject.title = title;
          }
          state.isDirty = true;
        }
      })
    },

    updateProjectDescription: (projectId, description) => {
      set(state => {
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.description = description;
          if (state.activeProject?.id === projectId) {
            state.activeProject.description = description;
          }
          state.isDirty = true;
        }
      })
    },

    updateLayoutSetting: (projectId, setting, value) => {
        set(state => {
            const project = state.projects.find(p => p.id === projectId);
            if (project) {
                // @ts-ignore
                project.layoutSettings[setting] = value;
                if (state.activeProject?.id === projectId) {
                    // @ts-ignore
                    state.activeProject.layoutSettings[setting] = value;
                }
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
            const project = state.projects.find((p) => p.id === projectId);
            if (project) {
                if (!project.blocks) {
                    project.blocks = [];
                }
                project.blocks.push(newBlock);

                if (state.activeProject?.id === projectId) {
                    if (!state.activeProject.blocks) {
                        state.activeProject.blocks = [];
                    }
                    state.activeProject.blocks.push(newBlock);
                    state.activeBlockId = newBlock.id;
                }
                state.isDirty = true;
            }
        });
    },

    deleteBlock: (projectId, blockId) => {
      set(state => {
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.blocks = project.blocks.filter(b => b.id !== blockId);
          if (state.activeProject?.id === projectId) {
            state.activeProject.blocks = state.activeProject.blocks.filter(b => b.id !== blockId);
            if (state.activeBlockId === blockId) {
                state.activeBlockId = null;
            }
          }
          state.isDirty = true;
        }
      });
    },

    moveBlock: (projectId, blockId, direction) => {
      set(state => {
          const project = state.projects.find(p => p.id === projectId);
          if (project) {
              const index = project.blocks.findIndex(b => b.id === blockId);
              if (index === -1) return;

              const newIndex = direction === 'up' ? index - 1 : index + 1;
              if (newIndex < 0 || newIndex >= project.blocks.length) return;

              const temp = project.blocks[index];
              project.blocks[index] = project.blocks[newIndex];
              project.blocks[newIndex] = temp;

              if (state.activeProject?.id === projectId) {
                  state.activeProject.blocks = [...project.blocks];
              }
              state.isDirty = true;
          }
      });
    },

    duplicateBlock: (projectId, blockId) => {
        set(state => {
            const project = state.projects.find(p => p.id === projectId);
            if (project) {
                const blockToDuplicate = project.blocks.find(b => b.id === blockId);
                if (!blockToDuplicate) return;

                const newBlock = produce(blockToDuplicate, draft => {
                    draft.id = `block_${new Date().getTime()}`;
                    // Reset quiz answers on duplication
                    if(draft.type === 'quiz') {
                        draft.content.userAnswerId = null;
                    }
                });

                const index = project.blocks.findIndex(b => b.id === blockId);
                project.blocks.splice(index + 1, 0, newBlock);

                if (state.activeProject?.id === projectId) {
                    state.activeProject.blocks = [...project.blocks];
                }
                state.isDirty = true;
            }
        });
    },

    updateBlockContent: (blockId, newContent) => {
      set((state) => {
        const projectIndex = state.projects.findIndex(p => p.id === state.activeProject?.id);
        if (projectIndex === -1) return;

        const blockIndex = state.projects[projectIndex].blocks.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return;
        
        state.projects[projectIndex].blocks[blockIndex].content = {
            ...state.projects[projectIndex].blocks[blockIndex].content,
            ...newContent
        };

        if (state.activeProject) {
            state.activeProject = {...state.projects[projectIndex]};
        }
        state.isDirty = true;
      });
    },

    addQuizOption: (blockId) => {
        set(state => {
            const block = state.activeProject?.blocks.find(b => b.id === blockId);
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
            const projectsToUpdate = [
                state.activeProject,
                ...state.projects.filter(p => p.id === state.activeProject?.id)
            ];
            
            projectsToUpdate.forEach(proj => {
                if (proj) {
                    const block = proj.blocks.find(b => b.id === blockId);
                    if (block && block.type === 'quiz') {
                        block.content.userAnswerId = null;
                    }
                }
            });
            // This is arguably not a "dirty" action, so we don't set isDirty = true
        })
    }

  }))
);

if (typeof window !== 'undefined') {
    const KEY = 'apostila-facil-projects';
    
    const loadState = () => {
        try {
            const storedProjects = localStorage.getItem(KEY);
            let projects: Project[] | null = null;
            if (storedProjects) {
                projects = JSON.parse(storedProjects);
            }
            
            if (Array.isArray(projects)) {
                // This is the migration logic.
                // It ensures all loaded projects have a layoutSettings object.
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
                return migratedProjects.length > 0 ? migratedProjects : initialProjects;
            }
        } catch (e) {
            console.error("Failed to parse projects from localStorage", e);
        }
        return initialProjects;
    };
    
    const projects = loadState();
    useProjectStore.setState({ projects });
    if(projects.length > 0) {
        useProjectStore.setState({ activeProject: projects[0] });
    }

    useProjectStore.subscribe((state) => {
        const stateToPersist = { ...state };
        // Don't persist activeProject, activeBlockId, or isDirty in localStorage
        // @ts-ignore
        delete stateToPersist.activeProject;
        // @ts-ignore
        delete stateToPersist.activeBlockId;
        // @ts-ignore
        delete stateToPersist.isDirty;

        localStorage.setItem(KEY, JSON.stringify(stateToPersist.projects));
    });
}


export default useProjectStore;
