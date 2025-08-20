
'use client';

import React, { useEffect } from 'react';
import useProjectStore from '@/lib/store';
import BlockRenderer from '@/components/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PreviewHeader from '@/components/PreviewHeader';
import { LoadingModal } from '@/components/LoadingModal';
import type { HandbookData } from '@/lib/types';

const getInteractiveScript = (handbookData: HandbookData) => {
    // This script contains all the client-side interactivity logic.
    // It will be embedded directly into the exported HTML.
    const scriptLogic = `
        document.addEventListener('DOMContentLoaded', () => {
            // Data is embedded in a script tag with id 'apostila-data'
            const dataElement = document.getElementById('apostila-data');
            if (!dataElement) {
                console.error('Handbook data script tag not found.');
                return;
            }
            // No need to parse, it's already an object via window
            const handbookData = window.apostilaData;

            // --- Quiz Interactivity ---
            document.querySelectorAll('.quiz-card').forEach(card => {
                const retryBtn = card.querySelector('.retry-btn');
                const radioButtons = card.querySelectorAll('.radio-group-item');
                const options = card.querySelectorAll('.quiz-option');

                const handleAnswer = (e) => {
                    const selectedOptionEl = e.currentTarget.closest('.quiz-option');
                    if (!selectedOptionEl) return;
                    
                    radioButtons.forEach(rb => {
                       rb.disabled = true;
                    });
                    
                    const isSelectedCorrect = selectedOptionEl.dataset.correct === 'true';

                    if (isSelectedCorrect) {
                        selectedOptionEl.classList.add('bg-primary/10', 'border-primary/50', 'border');
                        const icon = selectedOptionEl.querySelector('.lucide-check-circle');
                        if (icon) icon.style.display = 'inline-block';
                    } else {
                        selectedOptionEl.classList.add('bg-red-100', 'border-red-500', 'border');
                        const icon = selectedOptionEl.querySelector('.lucide-x-circle');
                        if (icon) icon.style.display = 'inline-block';
                        
                        // Also show the correct answer
                        const correctOption = card.querySelector('.quiz-option[data-correct="true"]');
                        if(correctOption) {
                           correctOption.classList.add('bg-primary/10', 'border-primary/50', 'border');
                           const correctIcon = correctOption.querySelector('.lucide-check-circle');
                           if(correctIcon) correctIcon.style.display = 'inline-block';
                        }
                    }

                    if (retryBtn) retryBtn.style.display = 'inline-flex';
                };

                radioButtons.forEach(radio => {
                    radio.addEventListener('change', handleAnswer);
                });

                if (retryBtn) {
                    retryBtn.addEventListener('click', () => {
                        radioButtons.forEach(rb => {
                            rb.disabled = false;
                            rb.checked = false;
                        });
                        options.forEach(opt => {
                           opt.classList.remove('bg-primary/10', 'border-primary/50', 'border', 'bg-red-100', 'border-red-500');
                           const checkIcon = opt.querySelector('.lucide-check-circle');
                           const xIcon = opt.querySelector('.lucide-x-circle');
                           if(checkIcon) checkIcon.style.display = 'none';
                           if(xIcon) xIcon.style.display = 'none';
                        });
                        retryBtn.style.display = 'none';
                    });
                }
            });

            // --- Accessibility Toolbar ---
            const toolbar = document.querySelector('.accessibility-toolbar');
            if (toolbar) {
                const printBtn = toolbar.querySelector('[data-action="print"]');
                const zoomInBtn = toolbar.querySelector('[data-action="zoom-in"]');
                const zoomOutBtn = toolbar.querySelector('[data-action="zoom-out"]');
                const contrastBtn = toolbar.querySelector('[data-action="contrast"]');
                
                if (printBtn) printBtn.addEventListener('click', () => window.print());
                if (contrastBtn) contrastBtn.addEventListener('click', () => document.body.classList.toggle('high-contrast'));
                
                const handleFontSize = (increase) => {
                    const body = document.body;
                    const currentSize = parseFloat(window.getComputedStyle(body).fontSize);
                    const newSize = increase ? currentSize + 1 : currentSize - 1;
                    if (newSize >= 12 && newSize <= 24) { 
                      body.style.fontSize = \`\${newSize}px\`;
                    }
                };

                if (zoomInBtn) zoomInBtn.addEventListener('click', () => handleFontSize(true));
                if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => handleFontSize(false));
            }
        });
    `;

    return (
        <>
            <script
              id="apostila-data"
              dangerouslySetInnerHTML={{
                __html: `window.apostilaData = ${JSON.stringify(handbookData)};`,
              }}
            />
            <script
              id="interactive-script"
              dangerouslySetInnerHTML={{ __html: scriptLogic }}
            />
        </>
    );
};

export default function PreviewPage() {
  const { projects, handbookTitle, handbookDescription, handbookId, handbookUpdatedAt } = useProjectStore();
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);

  useEffect(() => {
    setIsClient(true);
    document.body.classList.add('ready-for-export');
  }, []);

  if (!isClient) {
    return <LoadingModal isOpen={true} text="Carregando visualização..." />
  }

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
  
  const handbookData: HandbookData = { 
    id: handbookId, 
    title: handbookTitle, 
    description: handbookDescription, 
    updatedAt: handbookUpdatedAt,
    projects 
  };

  return (
      <>
        <div id="handbook-root-container">
            <div className="bg-secondary/40 min-h-screen">
                <PreviewHeader setIsExporting={() => {}} />
                <main id="printable-content" className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
                    <div id="handbook-root" className="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
                        {handbookData.projects.map((project) => (
                            <section key={project.id} className="module-section mb-12 last:mb-0">
                                <header className='text-center mb-12'>
                                    <h2 className="text-3xl font-bold mb-2 pb-2">{project.title}</h2>
                                    <p className="text-muted-foreground">{project.description}</p>
                                </header>
                                <div className="space-y-8">
                                    {project.blocks.map((block) => (
                                        <div key={block.id} data-block-id={block.id}>
                                             <BlockRenderer block={block} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </main>
            </div>
        </div>
        {getInteractiveScript(handbookData)}
      </>
  );
}
