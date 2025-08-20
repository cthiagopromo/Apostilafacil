
'use client';

import React from 'react';
import useProjectStore from '@/lib/store';
import BlockRenderer from '@/components/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PreviewHeader from '@/components/PreviewHeader';
import { LoadingModal } from '@/components/LoadingModal';

const PrintableHandbook = ({ projects }: { projects: ReturnType<typeof useProjectStore>['projects'] }) => (
    <>
      {projects.map((project) => (
        <section key={project.id} className="module-section">
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
    </>
);

export default function PreviewPage() {
  const { projects, handbookTitle, handbookDescription, handbookId, handbookUpdatedAt } = useProjectStore();
  const router = useRouter();
  const [isExporting, setIsExporting] = React.useState(false);

  // This script is crucial for the ZIP export to function offline.
  // It embeds the data and a minimal renderer into the exported HTML.
  const getOfflineScript = () => {
    const handbookData = { 
        id: handbookId, 
        title: handbookTitle, 
        description: handbookDescription, 
        updatedAt: handbookUpdatedAt,
        projects 
    };
    
    // This is a minimal, dependency-free script to render the handbook content.
    // It's designed to be embedded in the final exported HTML.
    const rendererScript = `
      // Minimal React-like createElement function
      const e = (type, props, ...children) => {
        // Simple type mapping for basic elements
        const el = document.createElement(type);
        if (props) {
          for (const key in props) {
            if (key === 'className') el.className = props[key];
            else if (key === 'style') Object.assign(el.style, props[key]);
            else if (key === 'onClick') el.addEventListener('click', props[key]);
            else if (key === 'dangerouslySetInnerHTML') el.innerHTML = props[key].__html;
            else if (key.startsWith('data-')) el.setAttribute(key, props[key]);
            else el[key] = props[key];
          }
        }
        children.flat().forEach(child => {
          if (typeof child === 'string' || typeof child === 'number') {
            el.appendChild(document.createTextNode(child));
          } else if (child) {
            el.appendChild(child);
          }
        });
        return el;
      };

      // The core rendering logic
      document.addEventListener('DOMContentLoaded', () => {
        const root = document.getElementById('root');
        const data = window.apostilaData;
        if (!root || !data) {
            console.error('Root element or handbook data not found.');
            if(root) root.innerText = 'Erro: Não foi possível carregar os dados da apostila.';
            return;
        }
        // Simplified rendering logic goes here, mirroring React components
        // This is a placeholder for the full dynamic rendering logic
        root.appendChild(e('h1', { className: 'text-2xl font-bold' }, data.title));
      });
    `;

    return `
        <script id="apostila-data" type="application/json">${JSON.stringify(handbookData)}</script>
        <script>${rendererScript}</script>
    `;
  };

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
    <>
      <LoadingModal isOpen={isExporting} text="Preparando documento para impressão..."/>
      <div className="bg-secondary/40 min-h-screen">
        <PreviewHeader setIsExporting={setIsExporting} />
        <main id="printable-content" className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
          <div id="handbook-root" className="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
            <PrintableHandbook projects={projects} />
          </div>
        </main>
      </div>
      {/* This script is not rendered but used by the export function */}
      <div id="offline-script-container" dangerouslySetInnerHTML={{ __html: getOfflineScript() }} style={{ display: 'none' }} />
    </>
  );
}
