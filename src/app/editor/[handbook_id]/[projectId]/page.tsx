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
  const { projects, setActiveProject, activeProject, handbookId, isInitialized, initializeStore } = useProjectStore();
  const [projectData, setProjectData] = useState<Project | null | undefined>(undefined);
  
  const projectId = params.projectId as string;
  const handbookIdFromUrl = params.handbook_id as string;

  useEffect(() => {
    if (!isInitialized) {
      // Passa o ID da apostila da URL para a store inicializar
      initializeStore(handbookIdFromUrl);
      return; // Aguarda a inicialização
    }
    
    // Após a inicialização, a store terá os dados corretos
    const foundProject = projects.find(p => p.id === projectId);
    setProjectData(foundProject);
    
    if (foundProject) {
      if (!activeProject || activeProject.id !== foundProject.id) {
          setActiveProject(foundProject.id);
      }
    }
  }, [projectId, projects, activeProject, setActiveProject, isInitialized, handbookIdFromUrl, initializeStore]);
  
  // Mostrar carregando enquanto a store não estiver inicializada
  if (!isInitialized) {
    return <LoadingModal isOpen={true} text="Carregando apostila..." />;
  }

  // Após inicializado, se o projeto ainda não foi encontrado
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
