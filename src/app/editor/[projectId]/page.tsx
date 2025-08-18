
'use client';

import { useEffect, useState } from 'react';
import useProjectStore from '@/lib/store';
import { EditorLayout } from '@/components/EditorLayout';
import type { Project } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const { projects, setActiveProject, activeProject } = useProjectStore();
  const [projectData, setProjectData] = useState<Project | null | undefined>(undefined);
  const projectId = params.projectId as string;

  useEffect(() => {
    const foundProject = projects.find(p => p.id === projectId);
    setProjectData(foundProject);
    if (foundProject) {
      // Condition to avoid re-setting the active project if it's already the correct one.
      if (!activeProject || activeProject.id !== foundProject.id) {
          setActiveProject(foundProject.id);
      }
    }
  }, [projectId, projects, setActiveProject, activeProject]);
  
  if (projectData === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <div className="text-center">
          <p className="text-xl">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-secondary">
            <p className="text-xl mb-4">Projeto não encontrado.</p>
            <Button onClick={() => router.push('/')}>Voltar para a lista de projetos</Button>
        </div>
    );
  }

  return <EditorLayout />;
}
