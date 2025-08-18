'use client';

import { useEffect, useState } from 'react';
import useProjectStore from '@/lib/store';
import { EditorLayout } from '@/components/EditorLayout';
import type { Project } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function EditorPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const getProjectById = useProjectStore((s) => s.getProjectById);
  const [project, setProject] = useState<Project | null | undefined>(undefined);

  useEffect(() => {
    // O store pode não ter sido hidratado ainda, então esperamos um pouco
    setTimeout(() => {
      const foundProject = getProjectById(params.projectId);
      setProject(foundProject);
    }, 100);
  }, [params.projectId, getProjectById]);
  
  if (project === undefined) {
    return <div>Carregando...</div>;
  }

  if (!project) {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <p className="text-xl mb-4">Projeto não encontrado.</p>
            <Button onClick={() => router.push('/')}>Voltar para a lista de projetos</Button>
        </div>
    );
  }

  return <EditorLayout project={project} />;
}
