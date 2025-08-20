
'use client';

import React from 'react';
import useProjectStore from '@/lib/store';
import BlockRenderer from '@/components/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PreviewHeader from '@/components/PreviewHeader';
import { LoadingModal } from '@/components/LoadingModal';
import type { HandbookData } from '@/lib/types';

const getOfflineScript = (handbookData: HandbookData) => {
    const interactiveScript = `
        document.addEventListener('DOMContentLoaded', () => {
            const data = window.apostilaData;
            if (!data) return;

            // --- Quiz Interactivity ---
            const quizCards = document.querySelectorAll('.quiz-card');
            quizCards.forEach(card => {
                const options = card.querySelectorAll('.quiz-option');
                const radioButtons = card.querySelectorAll('.radio-group-item');
                const retryBtn = card.querySelector('.retry-btn');
                const blockId = card.closest('[data-block-id]')?.dataset.blockId;

                const getBlockData = () => {
                   for (const project of data.projects) {
                       const block = project.blocks.find(b => b.id === blockId);
                       if (block) return block;
                   }
                   return null;
                }
                
                const handleAnswer = (e) => {
                    const selectedOptionEl = e.currentTarget.closest('.quiz-option');
                    if (!selectedOptionEl) return;

                    options.forEach(opt => {
                        const isCorrect = opt.dataset.correct === 'true';
                        opt.classList.remove('bg-primary/10', 'dark:bg-primary/20', 'border-primary/50', 'border', 'bg-red-100', 'dark:bg-red-900/50', 'border-red-500');
                        
                        const checkIcon = opt.querySelector('.lucide-check-circle');
                        const xIcon = opt.querySelector('.lucide-x-circle');
                        if(checkIcon) checkIcon.style.display = 'none';
                        if(xIcon) xIcon.style.display = 'none';
                    });

                    radioButtons.forEach(rb => rb.disabled = true);

                    const isSelectedCorrect = selectedOptionEl.dataset.correct === 'true';
                    if (isSelectedCorrect) {
                        selectedOptionEl.classList.add('bg-primary/10', 'dark:bg-primary/20', 'border-primary/50', 'border');
                        const icon = selectedOptionEl.querySelector('.lucide-check-circle');
                        if (icon) icon.style.display = 'inline-block';
                    } else {
                        selectedOptionEl.classList.add('bg-red-100', 'dark:bg-red-900/50', 'border-red-500', 'border');
                        const icon = selectedOptionEl.querySelector('.lucide-x-circle');
                        if (icon) icon.style.display = 'inline-block';
                        
                        const correctOption = card.querySelector('.quiz-option[data-correct="true"]');
                        if(correctOption) {
                           correctOption.classList.add('bg-primary/10', 'dark:bg-primary/20', 'border-primary/50', 'border');
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
                           opt.classList.remove('bg-primary/10', 'dark:bg-primary/20', 'border-primary/50', 'border', 'bg-red-100', 'dark:bg-red-900/50', 'border-red-500');
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

    return `
        <script id="apostila-data" type="application/json">${JSON.stringify(handbookData)}</script>
        <script>${interactiveScript}</script>
    `;
};

const getGlobalStyles = () => {
  // A simple way to grab all the styles from the current document.
  // This is better than fetching globals.css as it includes all dynamic styles.
  if (typeof document === 'undefined') return '';
  
  const styleSheets = Array.from(document.styleSheets);
  let cssText = '';

  for (const sheet of styleSheets) {
    try {
      if (sheet.cssRules) {
        cssText += Array.from(sheet.cssRules).map(rule => rule.cssText).join('\\n');
      }
    } catch (e) {
      console.warn("Could not read stylesheet rules (likely CORS):", sheet.href);
    }
  }
  return cssText;
}


const OfflineHandout = ({ handbookData }: { handbookData: HandbookData }) => {
    // This is the structure for the offline HTML file
    return (
        <html lang="pt-BR">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{handbookData.title}</title>
                <style dangerouslySetInnerHTML={{ __html: getGlobalStyles() }} />
            </head>
            <body className='font-sans antialiased' suppressHydrationWarning>
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
                    <div dangerouslySetInnerHTML={{ __html: getOfflineScript(handbookData) }} />
                </div>
            </body>
        </html>
    );
};


export default function PreviewPage() {
  const { projects, handbookTitle, handbookDescription, handbookId, handbookUpdatedAt } = useProjectStore();
  const router = useRouter();
  const [isExporting, setIsExporting] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
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

  return <OfflineHandout handbookData={handbookData} />;
}
