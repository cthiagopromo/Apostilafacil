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
  const { projects, setActiveProject, activeProject, handbookId, isInitialized } = useProjectStore();
  const [projectData, setProjectData] = useState<Project | null | undefined>(undefined);
  const projectId = params.projectId as string;
  const handbookIdFromUrl = params.handbook_id as string;

  useEffect(() => {
    // Se a loja está inicializada e o ID da apostila na loja é diferente
    // do da URL, significa que estamos carregando uma apostila nova/diferente.
    // O useEffect na store (initializeStore) cuidará de carregar os dados.
    if (isInitialized && handbookId && handbookIdFromUrl && handbookId !== handbookIdFromUrl) {
      // A lógica de carregamento está centralizada na store
      return;
    }

    const foundProject = projects.find(p => p.id === projectId);
    setProjectData(foundProject);
    
    if (foundProject) {
      if (!activeProject || activeProject.id !== foundProject.id) {
          setActiveProject(foundProject.id);
      }
    }
  }, [projectId, projects, activeProject, setActiveProject, isInitialized, handbookId, handbookIdFromUrl]);
  
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
            <p className="text-xl mb-4">Projeto não encontrado.</p>
            <Button onClick={() => router.push('/')}>Voltar para a lista de projetos</Button>
        </div>
    );
  }

  return <EditorLayout />;
}