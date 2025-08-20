
'use client';

import React, { useEffect, useState } from 'react';
import useProjectStore from '@/lib/store';
import BlockRenderer from '@/components/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PreviewHeader from '@/components/PreviewHeader';
import { LoadingModal } from '@/components/LoadingModal';
import type { HandbookData, Project } from '@/lib/types';
import FloatingNav from '@/components/FloatingNav';
import { cn } from '@/lib/utils';

const getInteractiveScript = (handbookData: HandbookData) => {
    const scriptLogic = `
        document.addEventListener('DOMContentLoaded', () => {
            const dataElement = document.getElementById('apostila-data');
            if (!dataElement) return;

            const handbookData = JSON.parse(dataElement.textContent || '{}');
            let currentModuleIndex = 0;
            const modules = document.querySelectorAll('.module-section');
            const navButtons = document.querySelectorAll('.module-nav-btn');
            const floatingNavButtons = document.querySelectorAll('.floating-nav-btn');
            const floatingNavMenu = document.getElementById('floating-nav-menu');
            const floatingNavToggle = document.getElementById('floating-nav-toggle');

            const showModule = (index) => {
                modules.forEach((module, i) => {
                    if (i === index) {
                        module.classList.remove('hidden');
                    } else {
                        module.classList.add('hidden');
                    }
                });
                floatingNavButtons.forEach((btn, i) => {
                    if (i === index) {
                        btn.classList.add('bg-primary', 'text-primary-foreground');
                    } else {
                        btn.classList.remove('bg-primary', 'text-primary-foreground');
                    }
                });
                currentModuleIndex = index;
                window.scrollTo(0, 0);
            };

            navButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const direction = e.currentTarget.dataset.direction;
                    let newIndex = currentModuleIndex;
                    if (direction === 'next') {
                        newIndex = Math.min(modules.length - 1, currentModuleIndex + 1);
                    } else if (direction === 'prev') {
                        newIndex = Math.max(0, currentModuleIndex - 1);
                    }
                    showModule(newIndex);
                });
            });

            floatingNavButtons.forEach((button, index) => {
                button.addEventListener('click', () => {
                    showModule(index);
                    if (floatingNavMenu) floatingNavMenu.classList.add('hidden');
                });
            });
            
            if (floatingNavToggle && floatingNavMenu) {
                floatingNavToggle.addEventListener('click', () => {
                    floatingNavMenu.classList.toggle('hidden');
                });
            }

            // --- Quiz Interactivity ---
            document.querySelectorAll('.quiz-card').forEach(card => {
                const retryBtn = card.querySelector('.retry-btn');
                const radioButtons = card.querySelectorAll('input[type="radio"]');
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
            
            showModule(0); // Show the first module initially
        });
    `;

    return (
        <>
            <script
              id="apostila-data"
              type="application/json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(handbookData),
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
  const [isClient, setIsClient] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  useEffect(() => {
    setIsClient(true);
    document.body.classList.add('ready-for-export');
    
    // Reset scroll on module change
    window.scrollTo(0, 0);

  }, [currentModuleIndex]);

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

  const handleModuleChange = (index: number) => {
    if (index >= 0 && index < projects.length) {
      setCurrentModuleIndex(index);
    }
  };

  return (
      <>
        <div id="handbook-root-container">
            <div className="bg-secondary/40 min-h-screen">
                <PreviewHeader setIsExporting={() => {}} />
                <main id="printable-content" className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12 relative">
                    <FloatingNav 
                        modules={projects} 
                        currentIndex={currentModuleIndex} 
                        onModuleSelect={handleModuleChange}
                    />

                    <div id="handbook-root" className="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
                        {handbookData.projects.map((project, index) => (
                            <section 
                                key={project.id} 
                                className={cn('module-section', { 'hidden': index !== currentModuleIndex })}
                            >
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
                                <footer className="mt-16 flex justify-between items-center no-print">
                                    <Button 
                                      onClick={() => handleModuleChange(currentModuleIndex - 1)}
                                      disabled={currentModuleIndex === 0}
                                      variant="outline"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Módulo Anterior
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        Módulo {currentModuleIndex + 1} de {projects.length}
                                    </span>
                                    <Button 
                                      onClick={() => handleModuleChange(currentModuleIndex + 1)}
                                      disabled={currentModuleIndex === projects.length - 1}
                                    >
                                        Próximo Módulo
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </footer>
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
