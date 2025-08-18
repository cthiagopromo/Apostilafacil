import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Project, Page } from './types';
import { initialProjects } from './initial-data';
import { useRouter } from 'next/router';

type State = {
  projects: Project[];
  activeProject: Project | null;
  activePageId: string | null;
};

type Actions = {
  setProjects: (projects: Project[]) => void;
  getProjectById: (projectId: string) => Project | undefined;
  setActiveProject: (projectId: string) => void;
  setActivePageId: (pageId: string | null) => void;
  addProject: () => Project;
  addPage: (projectId: string, title: string, template: Page['template']) => void;
  updatePageContent: (pageId: string, content: Partial<Page['content']>) => void;
};

const useProjectStore = create<State & Actions>()(
  immer((set, get) => ({
    projects: [],
    activeProject: null,
    activePageId: null,

    setProjects: (projects) => set({ projects }),

    getProjectById: (projectId) => {
        return get().projects.find((p) => p.id === projectId);
    },

    setActiveProject: (projectId) => {
      const project = get().projects.find((p) => p.id === projectId);
      if (project) {
        set({ activeProject: project, activePageId: project.pages[0]?.id || null });
      }
    },
    
    setActivePageId: (pageId) => set({ activePageId: pageId }),
    
    addProject: () => {
        const newProject: Project = {
            id: `proj_${new Date().getTime()}`,
            title: 'Novo Projeto',
            description: 'Clique para editar o título e a descrição.',
            theme: {
              colorPrimary: '#2563EB',
              colorBackground: '#F9FAFB',
              colorAccent: '#60A5FA',
              fontBody: 'Inter',
            },
            pages: [
              {
                id: `page_${new Date().getTime()}`,
                title: 'Nova Página',
                template: 'cover',
                content: {
                  title: 'Título da Capa',
                  subtitle: 'Subtítulo da sua apostila',
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

    addPage: (projectId, title, template) => {
      const newPage: Page = {
        id: `page_${new Date().getTime()}`,
        title,
        template,
        content: { title: 'Nova Página' },
      };
      set((state) => {
        const project = state.projects.find((p) => p.id === projectId);
        if (project) {
          project.pages.push(newPage);
          if (state.activeProject?.id === projectId) {
              state.activeProject.pages.push(newPage);
          }
        }
      });
    },

    updatePageContent: (pageId, newContent) => {
      set((state) => {
        if (state.activeProject) {
          const page = state.activeProject.pages.find((p) => p.id === pageId);
          if (page) {
            page.content = { ...page.content, ...newContent };
          }
        }
      });
    },
  }))
);

// Inicializar a store com dados do localStorage se existirem, ou com dados iniciais
if (typeof window !== 'undefined') {
    const storedProjects = localStorage.getItem('apostila-facil-projects');
    if (storedProjects) {
        useProjectStore.setState({ projects: JSON.parse(storedProjects) });
    } else {
        useProjectStore.setState({ projects: initialProjects });
    }

    useProjectStore.subscribe(
        (state) => {
            localStorage.setItem('apostila-facil-projects', JSON.stringify(state.projects));
        }
    );
}

export default useProjectStore;
