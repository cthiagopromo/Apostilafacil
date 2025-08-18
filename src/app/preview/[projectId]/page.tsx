
'use client';

import { useEffect, useState } from 'react';
import useProjectStore from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import type { Project } from '@/lib/types';
import BlockRenderer from '@/components/BlockRenderer';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, 
    Book, 
    Download, 
    ZoomIn, 
    ZoomOut, 
    Contrast, 
    Moon, 
    Volume2 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

  const { title, blocks, layoutSettings } = project;

  const containerWidthClass = {
    standard: 'max-w-4xl',
    large: 'max-w-6xl',
    full: 'max-w-full px-4',
  }[layoutSettings?.containerWidth || 'large'];

  const sectionSpacingClass = {
    compact: 'mb-4',
    standard: 'mb-6',
    comfortable: 'mb-8',
  }[layoutSettings?.sectionSpacing || 'standard'];


  return (
      <div className="min-h-screen bg-secondary text-foreground">
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b">
            <div className='flex items-center gap-4'>
                <Button variant="outline" size="icon" onClick={() => router.push(`/editor/${projectId}`)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <div className='flex items-center gap-3'>
                    <Book className="h-7 w-7 text-primary" />
                    <h1 className="text-2xl font-bold">{title}</h1>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon"><Download /></Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="icon"><ZoomIn /></Button>
                <Button variant="ghost" size="icon"><ZoomOut /></Button>
                <Button variant="ghost" size="icon"><Contrast /></Button>
                <Button variant="ghost" size="icon"><Moon /></Button>
                <Button variant="ghost" size="icon"><Volume2 /></Button>
            </div>
        </header>
        <main className={`p-6 sm:p-8 lg:p-12 mx-auto ${containerWidthClass}`}>
            {blocks.map((block) => (
              <Card key={block.id} className={`${sectionSpacingClass} overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300`}>
                <div className='p-6'>
                    <BlockRenderer block={block} />
                </div>
              </Card>
            ))}
        </main>
      </div>
  );
}
