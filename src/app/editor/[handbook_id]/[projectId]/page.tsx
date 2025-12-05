'use client';

import { useEffect, useMemo, useState } from 'react'; // --> otimizado: useMemo adicionado
import useProjectStore from '@/lib/store';
import { EditorLayout } from '@/components/EditorLayout';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const EditorSkeleton = () => (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden" aria-live="polite" aria-busy="true">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between p-3 h-16 bg-card border-b">
            <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-24" />
                <div className="w-px h-8 bg-border"></div>
                <div className='flex items-center gap-3'>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
            </div>
        </div>
        <div className="flex flex-1 border-t overflow-hidden">
            {/* Left Sidebar Skeleton */}
            <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
                <div className="p-4 border-b border-sidebar-border">
                    <Skeleton className="h-7 w-32 mb-4" />
                    <div className="grid grid-cols-2 gap-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                <div className="p-4 border-b border-sidebar-border">
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className='p-2 space-y-2'>
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                    ))}
                </div>
            </aside>
            {/* Main Content Skeleton */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-card">
                    <Skeleton className="h-7 w-40" />
                </div>
                <div className="flex-1 bg-muted p-12">
                    <Skeleton className="h-32 w-full mb-6" />
                    <Skeleton className="h-48 w-full mb-6" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </main>
            {/* Right Sidebar Skeleton */}
            <aside className="w-80 bg-sidebar border-l border-sidebar-border flex flex-col">
                <div className="p-4 border-b border-sidebar-border">
                    <Skeleton className="h-7 w-40" />
                </div>
                <div className="p-4 space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </aside>
        </div>
    </div>
);

export default function EditorPage() {
  const router = useRouter();
  const params = useParams();
  
  // --> otimizado: Seletores individuais para minimizar re-renderizações desnecessárias.
  const isInitialized = useProjectStore(state => state.isInitialized);
  const initializeStore = useProjectStore(state => state.initializeStore);
  const activeProjectId = useProjectStore(state => state.activeProjectId);
  const setActiveProjectId = useProjectStore(state => state.setActiveProjectId);
  const projects = useProjectStore(state => state.projects);

  const projectId = params.projectId as string;
  const handbookIdFromUrl = params.handbook_id as string;

  useEffect(() => {
    // --> otimizado: Condição `!isInitialized` previne chamadas múltiplas.
    if (!isInitialized) {
      initializeStore(handbookIdFromUrl);
    }
  }, [isInitialized, initializeStore, handbookIdFromUrl]);

  useEffect(() => {
    if (isInitialized) {
      // --> otimizado: A lógica agora só roda se o projectId da URL for diferente do ativo
      if (activeProjectId !== projectId) {
        setActiveProjectId(projectId);
      }
    }
  }, [projectId, isInitialized, activeProjectId, setActiveProjectId]);
  
  // --> otimizado: useMemo para evitar recálculos do projeto ativo em cada renderização
  const projectData = useMemo(() => {
    if (!activeProjectId || !projects) return null;
    return projects.find(p => p.id === activeProjectId) ?? null;
  }, [activeProjectId, projects]);

  if (!isInitialized || !projectData) {
    return <EditorSkeleton />;
  }
  
  const isValidProjectId = projects.some(p => p.id === projectId);
  if (!isValidProjectId) {
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
