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
  const [project, setProject] = useState<Project | null>(null);
  const projectId = params.projectId as string;
  
  useEffect(() => {
    // This component reads from localStorage-persisted state,
    // so we need to ensure it's client-side mounted.
    const foundProject = projects.find(p => p.id === projectId);
    setProject(foundProject || null);
  }, [projectId, projects]);

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl mb-4">Projeto não encontrado ou carregando...</p>
        <Button onClick={() => router.push('/')}>Voltar para a lista de projetos</Button>
      </div>
    );
  }

  const { title, blocks } = project;

  return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border-b">
            <div className='flex items-center gap-4'>
                <Book className="h-7 w-7 text-primary" />
                <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            <Button onClick={() => router.push(`/editor/${projectId}`)}>
                <ArrowLeft className="mr-2" />
                Voltar ao Editor
            </Button>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            {blocks.map((block) => (
              <Card key={block.id} className="mb-4 overflow-hidden">
                <div className='p-4'>
                    <BlockRenderer block={block} />
                </div>
              </Card>
            ))}
        </main>
      </div>
  );
}
