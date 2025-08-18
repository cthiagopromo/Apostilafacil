import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project, Block, BlockType, BlockContent, QuizOption } from './types';
import { initialProjects } from './initial-data';
import { produce } from 'immer';

type State = {
  projects: Project[];
  activeProject: Project | null;
  activeBlockId: string | null;
};

type Actions = {
  setProjects: (projects: Project[]) => void;
  getProjectById: (projectId: string) => Project | undefined;
  setActiveProject: (projectId: string) => void;
  setActiveBlockId: (blockId: string | null) => void;
  addProject: () => Project;
  updateProjectTitle: (projectId: string, title: string) => void;
  updateProjectDescription: (projectId: string, description: string) => void;
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

    setProjects: (projects) => set({ projects }),

    getProjectById: (projectId) => {
        return get().projects.find((p) => p.id === projectId);
    },

    setActiveProject: (projectId) => {
      const project = get().projects.find((p) => p.id === projectId);
      if (project) {
        set({ activeProject: project, activeBlockId: project.blocks && project.blocks.length > 0 ? project.blocks[0]?.id : null });
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
            blocks: [],
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        set(state => {
            state.projects.push(newProject);
        });
        return newProject;
    },

    updateProjectTitle: (projectId, title) => {
      set(state => {
        const project = state.projects.find(p => p.id === projectId);
        if (project) {
          project.title = title;
          if (state.activeProject?.id === projectId) {
            state.activeProject.title = title;
          }
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
        }
      })
    },

    addBlock: (projectId, type) => {
        let content: BlockContent = {};
        switch (type) {
            case 'text':
                content = { text: '<p>Novo bloco de texto...</p>' };
                break;
            case 'image':
                content = { url: 'https://placehold.co/600x400.png', alt: 'Placeholder image', caption: '' };
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
            }
        });
    },

    updateBlockContent: (blockId, newContent) => {
      set((state) => {
          const updateInProject = (project: Project) => {
              const block = project.blocks.find((b) => b.id === blockId);
              if (block) {
                  block.content = { ...block.content, ...newContent };
              }
          };

          if (state.activeProject) {
              updateInProject(state.activeProject);
          }
          const projectInList = state.projects.find(p => p.id === state.activeProject?.id);
          if (projectInList) {
              updateInProject(projectInList);
          }
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
                }
            }
        });
    },

    deleteQuizOption: (blockId, optionId) => {
        set(state => {
            const block = state.activeProject?.blocks.find(b => b.id === blockId);
            if (block && block.type === 'quiz' && block.content.options) {
                block.content.options = block.content.options.filter(o => o.id !== optionId);
            }
        });
    },
    
    resetQuiz: (blockId) => {
        set(state => {
            // We need to update both the active project and the project in the main list
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
        })
    }

  }))
);

if (typeof window !== 'undefined') {
    const KEY = 'apostila-facil-projects';
    
    const loadState = () => {
        try {
            const storedProjects = localStorage.getItem(KEY);
            const parsed = storedProjects ? JSON.parse(storedProjects) : null;
            if (Array.isArray(parsed)) {
                return parsed.length > 0 ? parsed : initialProjects;
            }
        } catch (e) {
            console.error("Failed to parse projects from localStorage", e);
        }
        return initialProjects;
    };
    
    useProjectStore.setState({ projects: loadState() });

    useProjectStore.subscribe((state) => {
        localStorage.setItem(KEY, JSON.stringify(state.projects));
    });
}


export default useProjectStore;
