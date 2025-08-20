
'use client';

import { useState, useRef } from 'react';
import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Save, Loader, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { PreviewModal } from './PreviewModal';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { HandbookData } from '@/lib/types';

const getAppHtmlTemplate = (title: string, jsonData: string): string => {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="assets/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/lucide/0.4.0/lucide.min.css" />
</head>
<body>
    <div id="handbook-root-container">
        <div class="bg-secondary/40 min-h-screen">
            <header class="py-4 px-6 bg-primary text-primary-foreground no-print no-export">
                <div class="max-w-4xl mx-auto flex flex-row justify-between items-center">
                    <h1 class="text-xl font-bold">${title}</h1>
                </div>
            </header>
            <main id="printable-content" class="max-w-4xl mx-auto p-4 sm:p-8 md:p-12">
                <div id="handbook-root" class="bg-card rounded-xl shadow-lg p-8 sm:p-12 md:p-16">
                    <!-- Conteúdo dinâmico será inserido aqui -->
                </div>
            </main>
        </div>
    </div>
    
    <!-- Scripts -->
    <script id="course-data" type="application/json">
        ${jsonData}
    </script>
    <script src="assets/app.js"></script>
</body>
</html>`;
};


const getAppJsTemplate = (): string => {
    return `
class InteractiveCourse {
    constructor() {
        this.courseData = null;
        this.init();
    }
    
    init() {
        this.courseData = this.loadCourseData();
        if (this.courseData) {
            this.renderContent();
        }
    }

    loadCourseData() {
        try {
            const dataElement = document.getElementById('course-data');
            if (!dataElement) {
                throw new Error('Elemento de dados do curso não encontrado.');
            }
            return JSON.parse(dataElement.textContent || '{}');
        } catch (error) {
            console.error('Falha ao carregar ou analisar os dados do curso:', error);
            const mainContent = document.getElementById('handbook-root');
            if(mainContent) {
                mainContent.innerHTML = '<p style="color: red; text-align: center; padding: 2rem;">Falha ao carregar os dados da apostila.</p>';
            }
            return null;
        }
    }

    renderBlock(block) {
        switch(block.type) {
            case 'text':
                return \`<div class="prose dark:prose-invert max-w-none">\${block.content.text || ''}</div>\`;
            case 'image':
                const width = block.content.width || 100;
                return \`
                    <div class='flex justify-center'>
                        <figure class='flex flex-col items-center gap-2' style="width: \${width}%">
                            <img 
                              src="\${block.content.url || 'https://placehold.co/600x400.png'}" 
                              alt="\${block.content.alt || 'Placeholder image'}" 
                              class="rounded-md shadow-md max-w-full h-auto" 
                            />
                            \${block.content.caption ? \`<figcaption class="text-sm text-center text-muted-foreground italic mt-2">\${block.content.caption}</figcaption>\` : ''}
                        </figure>
                    </div>
                \`;
            case 'quote':
                return \`
                    <div class="relative">
                        <blockquote class="p-6 bg-muted/50 border-l-4 border-primary rounded-r-lg text-lg italic text-foreground/80 m-0">
                            \${block.content.text}
                        </blockquote>
                    </div>
                \`;
             case 'quiz':
                const optionsHtml = block.content.options?.map(option => \`
                     <div class="quiz-option flex items-center space-x-3 p-3 rounded-md transition-all">
                        <input type="radio" name="quiz-\${block.id}" value="\${option.id}" id="\${option.id}" class="radio-group-item" />
                        <label for="\${option.id}" class="flex-1 cursor-pointer">\${option.text}</label>
                     </div>
                \`).join('');
                return \`
                    <div class="quiz-card bg-muted/30 rounded-lg border">
                       <div class="p-6">
                         <h3 class="font-semibold">\${block.content.question}</h3>
                         <p class="text-sm text-muted-foreground">Selecione a resposta correta.</p>
                       </div>
                       <div class="p-6 pt-0">
                         <div class="space-y-2">\${optionsHtml}</div>
                       </div>
                    </div>
                \`;
            default:
                return \`<p class="text-muted-foreground">Bloco <strong>\${block.type}</strong> ainda não é renderizado.</p>\`;
        }
    }

    renderContent() {
        const mainContent = document.getElementById('handbook-root');
        if (!mainContent || !this.courseData || !this.courseData.projects) {
            console.error('Main content area or project data not found.');
            return;
        }

        let html = '';
        this.courseData.projects.forEach(project => {
            html += \`<section class="module-section mb-12 last:mb-0">
                        <header class='text-center mb-12'>
                            <h2 class="text-3xl font-bold mb-2 pb-2">\${project.title}</h2>
                            <p class="text-muted-foreground">\${project.description}</p>
                        </header>
                        <div class="space-y-8">\`;
            
            project.blocks.forEach(block => {
                html += \`<div data-block-id="\${block.id}">\${this.renderBlock(block)}</div>\`;
            });

            html += \`</div></section>\`;
        });

        mainContent.innerHTML = html;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InteractiveCourse();
});
    `;
}

const getAppCssTemplate = (): string => {
    // This will be a straight copy of the globals.css to ensure consistency
    return \`
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 5% 96%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 221 83% 53%;
    --primary-foreground: 0 0% 98%;
    --secondary: 210 40% 98%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 214 31.8% 91.4%;
    --input: 214 31.8% 91.4%;
    --ring: 221 83% 53%;
    --radius: 0.75rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217 91% 65%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 217.2 32.6% 17.5%;
  }
}

@layer base {
  * {
    border-color: hsl(var(--border));
  }
  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* Basic component styles to match shadcn */
.min-h-screen { min-height: 100vh; }
.bg-primary { background-color: hsl(var(--primary)); }
.text-primary-foreground { color: hsl(var(--primary-foreground)); }
.bg-secondary\/40 { background-color: hsla(var(--secondary), 0.4); }
.bg-card { background-color: hsl(var(--card)); }
.text-foreground { color: hsl(var(--foreground)); }
.text-muted-foreground { color: hsl(var(--muted-foreground)); }
.max-w-4xl { max-width: 56rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.p-4 { padding: 1rem; }
.p-8 { padding: 2rem; }
.p-12 { padding: 3rem; }
.p-16 { padding: 4rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.flex { display: flex; }
.flex-row { flex-direction: row; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.font-bold { font-weight: 700; }
.rounded-xl { border-radius: 0.75rem; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); }
.mb-12 { margin-bottom: 3rem; }
.last\\:mb-0:last-child { margin-bottom: 0; }
.text-center { text-align: center; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.pb-2 { padding-bottom: 0.5rem; }
.space-y-8 > :not([hidden]) ~ :not([hidden]) { margin-top: 2rem; }
.justify-center { justify-content: center; }
.gap-2 { gap: 0.5rem; }
.rounded-md { border-radius: 0.5rem; }
.max-w-full { max-width: 100%; }
.h-auto { height: auto; }
.italic { font-style: italic; }
.mt-2 { margin-top: 0.5rem; }
.relative { position: relative; }
.m-0 { margin: 0; }
.bg-muted\\/50 { background-color: hsla(var(--muted), 0.5); }
.border-l-4 { border-left-width: 4px; }
.border-primary { border-color: hsl(var(--primary)); }
.rounded-r-lg { border-top-right-radius: 0.5rem; border-bottom-right-radius: 0.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-foreground\\/80 { color: hsla(var(--foreground), 0.8); }

/* Prose styles for text blocks */
.prose { color: hsl(var(--foreground)); }
.prose h1, .prose h2, .prose h3 { color: hsl(var(--primary)); }
.prose a { color: hsl(var(--primary)); }
.prose blockquote { border-left-color: hsl(var(--border)); }
.prose strong { color: hsl(var(--foreground)); }
`;
}

export default function Header() {
  const { handbookTitle, handbookDescription, handbookId, handbookUpdatedAt, projects, saveData, isDirty } = useProjectStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { toast } = useToast();
  const previewIframeRef = useRef<HTMLIFrameElement>(null);


  const handleExportZip = async () => {
    if (!projects || projects.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Nenhum projeto para exportar',
        description: 'Adicione pelo menos um módulo antes de exportar.',
      });
      return;
    }

    setIsExporting(true);
    
    try {
        const zip = new JSZip();
        const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\s+/g, '-');
        
        const handbookData: HandbookData = { 
            id: handbookId, 
            title: handbookTitle, 
            description: handbookDescription, 
            updatedAt: handbookUpdatedAt,
            projects 
        };

        const jsonDataString = JSON.stringify(handbookData, null, 2);

        const htmlContent = getAppHtmlTemplate(handbookTitle, jsonDataString);
        zip.file('index.html', htmlContent);

        zip.file('assets/styles.css', getAppCssTemplate());
        zip.file('assets/app.js', getAppJsTemplate());
        
        zip.file('README.md', 'Para usar esta apostila, extraia o conteúdo deste ZIP e abra o arquivo index.html em seu navegador.');
        
        const blob = await zip.generateAsync({ type: 'blob' });
        saveAs(blob, `apostila-${cleanTitle}.zip`);

        toast({
            title: 'Exportação Concluída',
            description: 'Sua apostila interativa foi exportada como um arquivo ZIP.',
        });

    } catch (error) {
        console.error('Falha ao exportar o projeto', error);
        toast({
            variant: 'destructive',
            title: 'Erro na Exportação',
            description: `Não foi possível exportar o projeto. Detalhes: ${error instanceof Error ? error.message : 'Erro desconhecido.'}`,
        });
    } finally {
        setIsExporting(false);
    }
  };


  const handleSave = () => {
    if (!isDirty) return;

    setIsSaving(true);
    setTimeout(() => {
        saveData();
        setIsSaving(false);
        toast({
            title: "Projeto salvo com sucesso!",
        });
    }, 500);
  }

  const handlePreview = () => {
     if (!projects || projects.length === 0) {
      toast({
          variant: "destructive",
          title: "Nenhum projeto para visualizar",
          description: "Adicione pelo menos um módulo antes de visualizar.",
      });
      return;
    }
    setIsPreviewModalOpen(true);
  }

  return (
    <>
      <PreviewModal 
        isOpen={isPreviewModalOpen} 
        onOpenChange={setIsPreviewModalOpen}
        iframeRef={previewIframeRef}
      />
      <header className="flex items-center justify-between p-3 h-16 bg-card border-b">
        <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Início
              </Link>
            </Button>
            <div className="w-px h-8 bg-border"></div>
              <div className='flex items-center gap-3'>
                <h1 className="text-lg font-semibold truncate max-w-xs md:max-w-md">
                  {handbookTitle}
                </h1>
                {isSaving ? (
                  <Badge variant="outline">Salvando...</Badge>
                ) : isDirty ? (
                  <Badge variant="destructive">Não Salvo</Badge>
                ) : (
                  <Badge variant="secondary">Salvo</Badge>
                )}
              </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={isSaving || !isDirty}>
            {isSaving ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button onClick={handlePreview} variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
          </Button>
          <Button onClick={handleExportZip} disabled={isExporting}>
              {isExporting ? (
                  <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Exportando...
                  </>
              ) : (
                  <>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar ZIP
                  </>
              )}
          </Button>
        </div>
      </header>
    </>
  );
}
