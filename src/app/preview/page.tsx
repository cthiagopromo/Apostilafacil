
'use client';

import useProjectStore from '@/lib/store';
import BlockRenderer from '@/components/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

export default function PreviewPage() {
  const { handbookTitle, handbookDescription, projects } = useProjectStore();
  const router = useRouter();

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-secondary">
        <p className="text-xl mb-4">Nenhum conteúdo para visualizar.</p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Editor
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-secondary/40 min-h-screen">
      <main id="printable-content" className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
        <div className="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
          <header className="text-center mb-12">
            <div className="inline-block p-4 bg-primary/10 rounded-2xl mb-4 no-print">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold text-primary">{handbookTitle}</h1>
            <p className="text-xl text-muted-foreground mt-2">{handbookDescription}</p>
          </header>

          <div className="sticky top-0 z-10 bg-card py-4 mb-8 no-print flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4">{handbookTitle}</h2>
            <AccessibilityToolbar />
          </div>


          {projects.map((project) => (
            <section key={project.id} className="mb-16">
              <h2 className="text-3xl font-bold mb-2 border-b-2 border-primary pb-2">{project.title}</h2>
              <p className="text-muted-foreground mb-8">{project.description}</p>
              <div className="space-y-8">
                {project.blocks.map((block) => (
                  <BlockRenderer key={block.id} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
