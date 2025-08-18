// This is a new file
'use client';

import { useEffect, useState } from 'react';
import useProjectStore from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import type { Project } from '@/lib/types';
import BlockRenderer from '@/components/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book } from 'lucide-react';
import { toKebabCase } from '@/lib/utils';
import { Card } from '@/components/ui/card';

const hexToHsl = (hex: string): string => {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

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

  const { theme, title, blocks } = project;

  const cssVariables = `
    :root {
      --background: ${hexToHsl(theme.colorBackground)};
      --primary: ${hexToHsl(theme.colorPrimary)};
      --accent: ${hexToHsl(theme.colorAccent)};
      --foreground: 222.2 84% 4.9%;
      --card: 0 0% 100%;
      --card-foreground: 0 0% 3.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 0 0% 3.9%;
      --primary-foreground: 0 0% 98%;
      --secondary: 0 0% 96.1%;
      --secondary-foreground: 0 0% 9%;
      --muted: 0 0% 96.1%;
      --muted-foreground: 0 0% 45.1%;
      --accent-foreground: 0 0% 9%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;
      --border: 0 0% 89.8%;
      --input: 0 0% 89.8%;
      --ring: ${hexToHsl(theme.colorPrimary)};
      --radius: 0.5rem;
    }
  `;

  return (
    <>
      <style>{cssVariables}</style>
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
    </>
  );
}
