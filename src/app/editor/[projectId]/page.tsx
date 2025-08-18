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
  const { getProjectById, setActiveProject } = useProjectStore();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const projectId = params.projectId as string;

  useEffect(() => {
    const foundProject = getProjectById(projectId);
    setProject(foundProject);
    if (foundProject) {
      setActiveProject(foundProject.id);
    }
  }, [projectId, getProjectById, setActiveProject]);
  
  if (project === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <div className="text-center">
          <p className="text-xl">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-secondary">
            <p className="text-xl mb-4">Projeto não encontrado.</p>
            <Button onClick={() => router.push('/')}>Voltar para a lista de projetos</Button>
        </div>
    );
  }

  return <EditorLayout />;
}
