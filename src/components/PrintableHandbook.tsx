
'use client';

import type { Project } from '@/lib/types';
import BlockRenderer from '@/components/BlockRenderer';

interface PrintableHandbookProps {
    projects: Project[];
}

/**
 * Um componente projetado especificamente para renderização em string HTML.
 * Ele espelha a estrutura da página de pré-visualização para garantir consistência 1:1.
 */
export function PrintableHandbook({ projects }: PrintableHandbookProps) {
  if (!projects || projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        Nenhum conteúdo para visualizar.
      </div>
    );
  }

  return (
    <>
      {projects.map((project) => (
        <section key={project.id} className="module-section">
          <header className='text-center'>
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
    </>
  );
}
