
'use client';

import React, { useEffect, useState } from 'react';
import useProjectStore from '@/lib/store';
import BlockRenderer from '@/components/BlockRenderer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PreviewHeader from '@/components/PreviewHeader';
import { LoadingModal } from '@/components/LoadingModal';
import type { HandbookData } from '@/lib/types';
import FloatingNav from '@/components/FloatingNav';
import { cn } from '@/lib/utils';

const PreviewContent = ({ handbookData }: { handbookData: HandbookData }) => {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  const primaryColor = handbookData.theme?.colorPrimary;

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
      document.documentElement.style.setProperty('--primary', primaryColor);
    }
    return () => {
       document.documentElement.style.removeProperty('--primary');
    }
  }, [primaryColor]);

  const handleModuleChange = (index: number) => {
    if (index >= 0 && index < handbookData.projects.length) {
      setCurrentModuleIndex(index);
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <LoadingModal isOpen={isPreparingPrint} text="Preparando para impressão..." />
      <div id="handbook-root-container">
          <div className="bg-secondary/40 min-h-screen">
              <PreviewHeader setIsExporting={setIsPreparingPrint} />
              <main id="printable-content" className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12 relative">
                  <FloatingNav 
                      modules={handbookData.projects} 
                      currentIndex={currentModuleIndex} 
                      onModuleSelect={handleModuleChange}
                  />

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
};


export default function PreviewPage() {
  const { isInitialized, projects, handbookTitle, handbookDescription, handbookId, handbookUpdatedAt, handbookTheme } = useProjectStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient || !isInitialized) {
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
    theme: handbookTheme,
    projects 
  };
  
  // Use key to force remount on handbookId change
  return <PreviewContent key={handbookId} handbookData={handbookData} />;
}
