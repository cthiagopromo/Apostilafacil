
'use client';

import useProjectStore from '@/lib/store';
import BlockRenderer from '@/components/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PreviewHeader from '@/components/PreviewHeader';

export default function PreviewPage() {
  const { projects } = useProjectStore();
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
      <PreviewHeader />
      <main id="printable-content" className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
        <div className="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
          {projects.map((project) => (
            <section key={project.id} className="mb-16 last:mb-0">
              <header className='text-center mb-12'>
                <h2 className="text-3xl font-bold mb-2 pb-2">{project.title}</h2>
                <p className="text-muted-foreground">{project.description}</p>
              </header>
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
