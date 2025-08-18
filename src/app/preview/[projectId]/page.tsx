'use client';

import { useEffect, useState } from 'react';
import useProjectStore from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import type { Project } from '@/lib/types';
import BlockRenderer from '@/components/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const { projects } = useProjectStore();
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const projectId = params.projectId as string;
  
  useEffect(() => {
    // This component can read from localStorage-persisted state.
    // We use a check to ensure we are on the client side.
    if (typeof window !== 'undefined') {
      const foundProject = projects.find(p => p.id === projectId);
      setProject(foundProject || null);
    }
  }, [projectId, projects]);

  if (project === undefined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-secondary">
        <p className="text-xl">Carregando pré-visualização...</p>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-secondary">
        <p className="text-xl mb-4">Projeto não encontrado.</p>
        <Button onClick={() => router.push('/')}>Voltar para a lista de projetos</Button>
      </div>
    );
  }

  const { title, blocks } = project;

  return (
      <div className="min-h-screen bg-secondary text-foreground">
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b">
            <div className='flex items-center gap-4'>
                <Book className="h-7 w-7 text-primary" />
                <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            <Button variant="outline" onClick={() => router.push(`/editor/${projectId}`)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Editor
            </Button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            {blocks.map((block) => (
              <Card key={block.id} className="mb-6 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className='p-6'>
                    <BlockRenderer block={block} />
                </div>
              </Card>
            ))}
        </main>
      </div>
  );
}
