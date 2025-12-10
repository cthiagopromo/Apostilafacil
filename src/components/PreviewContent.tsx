
'use client';

import React, { useEffect, useState } from 'react';
import BlockRenderer from '@/components/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PreviewHeader from '@/components/PreviewHeader';
import { LoadingModal } from '@/components/LoadingModal';
import type { HandbookData, Project } from '@/lib/types';
import FloatingNav from '@/components/FloatingNav';
import { cn } from '@/lib/utils';
import { Toaster } from './ui/toaster';

interface PreviewContentProps {
    handbookData: HandbookData | null;
}

export default function PreviewContent({ handbookData }: PreviewContentProps) {
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [isPreparingPrint, setIsPreparingPrint] = useState(false);

    useEffect(() => {
        if (isPreparingPrint) {
            const handlePrint = async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                window.print();
                setIsPreparingPrint(false);
            };
            handlePrint();
        }
    }, [isPreparingPrint]);

    useEffect(() => {
        if (handbookData?.theme) {
            const root = document.documentElement;
            if (handbookData.theme.colorPrimary) {
                root.style.setProperty('--primary', handbookData.theme.colorPrimary);
            }
            if (handbookData.theme.fontHeading) {
                root.style.setProperty('--font-heading', handbookData.theme.fontHeading);
            }
            if (handbookData.theme.fontBody) {
                root.style.setProperty('--font-body', handbookData.theme.fontBody);
            }
        }
    }, [handbookData?.theme]);


    if (!handbookData || !handbookData.projects || handbookData.projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-secondary">
                <p className="text-xl mb-4">Nenhum conteúdo para visualizar.</p>
            </div>
        );
    }

    const currentProject = handbookData.projects[currentModuleIndex];

    const getContainerWidthClass = (project: Project) => {
        switch (project?.layoutSettings?.containerWidth) {
            case 'standard': return 'max-w-4xl';
            case 'large': return 'max-w-6xl';
            case 'full': return 'max-w-full px-4';
            default: return 'max-w-4xl';
        }
    };

    const getSectionSpacingClass = (project: Project) => {
        switch (project?.layoutSettings?.sectionSpacing) {
            case 'compact': return 'space-y-4';
            case 'standard': return 'space-y-8';
            case 'comfortable': return 'space-y-12';
            default: return 'space-y-8';
        }
    }

    const handleModuleChange = (index: number) => {
        if (index >= 0 && index < handbookData.projects.length) {
            setCurrentModuleIndex(index);
            const contentArea = document.getElementById('preview-scroll-area');
            if (contentArea) {
                contentArea.scrollTo(0, 0);
            }
        }
    };

    return (
        <>
            <Toaster />
            <LoadingModal isOpen={isPreparingPrint} text="Preparando para impressão..." />
            <div id="handbook-root-container" className="h-full flex flex-col bg-secondary/40">
                <PreviewHeader setIsExporting={setIsPreparingPrint} handbookTitle={handbookData.title} handbookId={handbookData.id} />
                <div id="preview-scroll-area" className="flex-1 overflow-y-auto">
                    <div id="printable-content" className="flex flex-col">
                        <FloatingNav
                            modules={handbookData.projects}
                            currentIndex={currentModuleIndex}
                            onModuleSelect={handleModuleChange}
                        />

                        {handbookData.theme.cover && (
                            <section className={cn("cover-section", { 'module-section': isPreparingPrint })}>
                                <img src={handbookData.theme.cover} alt="Capa da Apostila" className="cover-image" />
                                <div className="cover-content">
                                    <button id="start-handbook-btn" className="no-print inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                        Iniciar Apostila
                                    </button>
                                </div>
                            </section>
                        )}

                        <main className={cn("p-4 sm:p-8 md:p-12 relative flex-grow print:p-0 print:m-0")}>
                            <div id="handbook-root" className={cn("bg-card rounded-xl shadow-lg mx-auto print:shadow-none print:rounded-none print:bg-white", getContainerWidthClass(currentProject), { 'p-8 sm:p-12 md:p-16': !isPreparingPrint }, { 'mt-8': !!handbookData.theme.cover && !isPreparingPrint })}>
                                {handbookData.projects.map((project, index) => (
                                    <section
                                        key={project.id}
                                        className={cn('module-section', { 'hidden': !isPreparingPrint && index !== currentModuleIndex })}
                                    >
                                        <header className='text-center mb-12'>
                                            <h2 className="text-3xl font-bold mb-2 pb-2">{project.title}</h2>
                                            <p className="text-muted-foreground">{project.description}</p>
                                        </header>
                                        <div className={cn(getSectionSpacingClass(project))}>
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
                                                Módulo {currentModuleIndex + 1} de {handbookData.projects.length}
                                            </span>
                                            <Button
                                                onClick={() => handleModuleChange(currentModuleIndex + 1)}
                                                disabled={currentModuleIndex === handbookData.projects.length - 1}
                                            >
                                                Próximo Módulo
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </footer>
                                    </section>
                                ))}
                            </div>
                        </main>
                        {handbookData.theme.backCover && (
                            <section className="back-cover-section module-section flex-shrink-0 h-[400px] relative rounded-md overflow-hidden mt-12">
                                <img src={handbookData.theme.backCover} alt="Contracapa da Apostila" className="w-full h-full object-cover" />
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
