
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

    const primaryColor = handbookData?.theme?.colorPrimary;
    const coverImage = handbookData?.theme?.cover;

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
        if (primaryColor) {
            const root = document.querySelector(':root') as HTMLElement;
            if (root) {
                 root.style.setProperty('--primary', primaryColor);
            }
        }
        return () => {
             const root = document.querySelector(':root') as HTMLElement;
            if (root) {
                root.style.removeProperty('--primary');
            }
        }
    }, [primaryColor]);


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
                <PreviewHeader setIsExporting={setIsPreparingPrint} handbookTitle={handbookData.title} />
                <div id="preview-scroll-area" className="flex-1 overflow-y-auto">
                    <main id="printable-content" className={cn("mx-auto p-4 sm:p-8 md:p-12 relative", getContainerWidthClass(currentProject))}>
                        <FloatingNav 
                            modules={handbookData.projects} 
                            currentIndex={currentModuleIndex} 
                            onModuleSelect={handleModuleChange}
                        />
                        
                        {coverImage && (
                            <section className="cover-section module-section">
                                <img src={coverImage} alt="Capa da Apostila" className="cover-image"/>
                            </section>
                        )}
                        
                        <div id="handbook-root" className="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
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
                </div>
            </div>
        </>
    );
}
