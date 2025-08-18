'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Project, Module } from '@/lib/types';
import { initialProject } from '@/lib/initial-data';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { toKebabCase } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface ProjectContextType {
  project: Project;
  updateProject: (data: Partial<Omit<Project, 'modules'>>) => void;
  activeModuleId: string | null;
  setActiveModuleId: (id: string | null) => void;
  activeModule: Module | undefined;
  addModule: (title: string) => void;
  updateModule: (id: string, data: Partial<Omit<Module, 'id' | 'slug' | 'blocks'>>) => void;
  deleteModule: (id: string) => void;
  reorderModules: (modules: Module[]) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useLocalStorage<Project>('apostila-facil-project', initialProject);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(project.modules[0]?.id || null);
  const { toast } = useToast();

  const activeModule = project.modules.find(m => m.id === activeModuleId);

  const updateProject = (data: Partial<Omit<Project, 'modules'>>) => {
    setProject(prev => ({ ...prev, ...data, updatedAt: new Date().toISOString() }));
  };

  const addModule = (title: string) => {
    if (title.length < 3 || title.length > 80) {
        toast({
            title: "Erro ao criar módulo",
            description: "O título deve ter entre 3 e 80 caracteres.",
            variant: "destructive"
        })
        return;
    }

    const newModule: Module = {
      id: `mod_${new Date().getTime()}`,
      title,
      slug: toKebabCase(title),
      contentHTML: `<h1>${title}</h1><p>Comece a escrever seu conteúdo aqui.</p>`,
      blocks: [],
    };
    setProject(prev => {
      const slugExists = prev.modules.some(m => m.slug === newModule.slug);
      if (slugExists) {
        toast({
            title: "Erro ao criar módulo",
            description: "Um módulo com este título já existe.",
            variant: "destructive"
        })
        return prev;
      }
      const updatedModules = [...prev.modules, newModule];
      toast({
          title: "Módulo criado!",
          description: `O módulo "${title}" foi adicionado.`,
      })
      return { ...prev, modules: updatedModules, updatedAt: new Date().toISOString() };
    });
  };
  
  const updateModule = (id: string, data: Partial<Omit<Module, 'id' | 'slug' | 'blocks'>>) => {
    setProject(prev => ({
      ...prev,
      modules: prev.modules.map(m => (m.id === id ? { ...m, ...data } : m)),
      updatedAt: new Date().toISOString()
    }));
  };

  const deleteModule = (id: string) => {
     if (project.modules.length <= 1) {
        toast({
            title: "Ação não permitida",
            description: "Não é possível excluir o último módulo.",
            variant: "destructive",
        });
        return;
    }
    setProject(prev => {
        const newModules = prev.modules.filter(m => m.id !== id);
        if (id === activeModuleId) {
            setActiveModuleId(newModules[0]?.id || null);
        }
        return { ...prev, modules: newModules, updatedAt: new Date().toISOString() }
    });
    toast({
        title: "Módulo excluído",
        description: "O módulo foi removido com sucesso.",
    });
  }

  const reorderModules = (modules: Module[]) => {
    setProject(prev => ({...prev, modules, updatedAt: new Date().toISOString()}))
  }

  const value: ProjectContextType = {
    project,
    updateProject,
    activeModuleId,
    setActiveModuleId,
    activeModule,
    addModule,
    updateModule,
    deleteModule,
    reorderModules
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
