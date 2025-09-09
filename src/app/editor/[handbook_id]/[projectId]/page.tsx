'use client';

import { useEffect, useState } from 'react';
import useProjectStore from '@/lib/store';
import { EditorLayout } from '@/components/EditorLayout';
import type { Project } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoadingModal } from '@/components/LoadingModal';

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  const { 
    isInitialized, 
    initializeStore, 
    getActiveProject, 
    setActiveProjectId 
  } = useProjectStore();
  
  const [projectData, setProjectData] = useState<Project | null | undefined>(undefined);
  
  const projectId = params.projectId as string;
  const handbookIdFromUrl = params.handbook_id as string;

  useEffect(() => {
    if (!isInitialized) {
      initializeStore(handbookIdFromUrl);
      return;
    }
    
    const currentActiveProject = getActiveProject();

    if (currentActiveProject?.id !== projectId) {
      setActiveProjectId(projectId);
    }
    
    const foundProject = getActiveProject();
    setProjectData(foundProject);

  }, [projectId, handbookIdFromUrl, isInitialized, initializeStore, getActiveProject, setActiveProjectId]);
  
  if (!isInitialized) {
    return <LoadingModal isOpen={true} text="Carregando apostila..." />;
  }

  if (projectData === undefined) {
      return <LoadingModal isOpen={true} text="Carregando módulo..." />;
  }

  if (!projectData) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-secondary">
            <p className="text-xl mb-4">Módulo não encontrado.</p>
            <p className="text-sm text-muted-foreground mb-4">Isso pode acontecer se a URL estiver incorreta ou o módulo foi excluído.</p>
            <Button onClick={() => router.push('/')}>Voltar para a página inicial</Button>
        </div>
    );
  }

  return <EditorLayout />;
}
