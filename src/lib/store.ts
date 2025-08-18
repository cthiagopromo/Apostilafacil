import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project, Block, BlockType, BlockContent } from './types';
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
  addBlock: (projectId: string, type: BlockType) => void;
  deleteBlock: (projectId: string, blockId: string) => void;
  moveBlock: (projectId: string, blockId: string, direction: 'up' | 'down') => void;
  duplicateBlock: (projectId: string, blockId: string) => void;
  updateBlockContent: (blockId: string, content: Partial<BlockContent>) => void;
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
            title: 'Novo Projeto de Apostila',
            description: 'Uma nova apostila com blocos editáveis.',
            theme: {
              colorPrimary: '#2563EB',
              colorBackground: '#F9FAFB',
              colorAccent: '#60A5FA',
              fontBody: 'Inter',
            },
            blocks: [
              {
                id: `block_${new Date().getTime()}`,
                type: 'text',
                content: {
                  text: '<h1>Bem-vindo à sua nova apostila!</h1><p>Comece a adicionar conteúdo clicando nos tipos de bloco à esquerda.</p>',
                },
              },
            ],
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

    addBlock: (projectId, type) => {
      const newBlock: Block = {
        id: `block_${new Date().getTime()}`,
        type,
        content: type === 'text' ? { text: '<p>Novo bloco de texto...</p>'} : { url: '', alt: ''},
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
        if (state.activeProject) {
          const block = state.activeProject.blocks.find((b) => b.id === blockId);
          if (block) {
            block.content = { ...block.content, ...newContent };
          }
          // Also update the main projects array
          const project = state.projects.find(p => p.id === state.activeProject?.id);
           if (project) {
              const blockInProject = project.blocks.find(b => b.id === blockId);
              if (blockInProject) {
                  blockInProject.content = { ...blockInProject.content, ...newContent };
              }
           }
        }
      });
    },
  }))
);

// Inicializar a store com dados do localStorage se existirem, ou com dados iniciais
if (typeof window !== 'undefined') {
    const KEY = 'apostila-facil-projects';
    const storedProjects = localStorage.getItem(KEY);
    let initialData = initialProjects;
    
    try {
        const parsed = storedProjects ? JSON.parse(storedProjects) : null;
        if (Array.isArray(parsed) && parsed.length > 0) {
            initialData = parsed;
        }
    } catch (e) {
        console.error("Failed to parse projects from localStorage", e);
        // Se a análise falhar, use os projetos iniciais padrão
        initialData = initialProjects;
    }
    
    useProjectStore.setState({ projects: initialData });

    useProjectStore.subscribe(
        (state) => {
            localStorage.setItem(KEY, JSON.stringify(state.projects));
        }
    );
}

export default useProjectStore;
