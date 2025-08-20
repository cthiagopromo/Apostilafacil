
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
</head>
<body>
    <div id="app">
        <nav class="sidebar">
            <h2>${title}</h2>
            <div class="toc-container"></div>
            <div class="actions">
                <button id="export-pdf">📄 Salvar PDF</button>
                <button id="toggle-theme">🌙 Tema</button>
            </div>
        </nav>
        <main class="content">
            <div class="content-header">
                <button id="prev-section">← Anterior</button>
                <div class="progress-bar"></div>
                <button id="next-section">Próximo →</button>
            </div>
            <div class="content-body" id="main-content">
                <!-- Conteúdo dinâmico será inserido aqui -->
            </div>
        </main>
    </div>
    
    <!-- Scripts -->
    <script id="course-data" type="application/json">
        ${jsonData}
    </script>
    <script src="libs/html2pdf.min.js"></script>
    <script src="assets/app.js"></script>
</body>
</html>`;
};


const getAppJsTemplate = (): string => {
    return `
class InteractiveCourse {
    constructor() {
        this.courseData = null;
        this.currentSection = 0;
        this.init();
    }
    
    init() {
        this.courseData = this.loadCourseData();
        if (this.courseData) {
            this.renderContent();
            // In future steps, we will add:
            // this.renderTOC();
            // this.bindEvents();
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
            const mainContent = document.getElementById('main-content');
            if(mainContent) {
                mainContent.innerHTML = '<p style="color: red; text-align: center; padding: 2rem;">Falha ao carregar os dados da apostila. Os dados embutidos não puderam ser lidos.</p>';
            }
            return null;
        }
    }

    renderContent() {
        const mainContent = document.getElementById('main-content');
        if (!mainContent || !this.courseData || !this.courseData.projects) {
            console.error('Main content area or project data not found.');
            return;
        }

        let html = '';
        this.courseData.projects.forEach(project => {
            html += \`<section class="module-section">
                        <header class="module-header">
                            <h2>\${project.title}</h2>
                            <p>\${project.description}</p>
                        </header>\`;
            
            project.blocks.forEach(block => {
                html += '<div class="block">';
                switch (block.type) {
                    case 'text':
                        html += block.content.text || '';
                        break;
                    case 'image':
                        html += \`<figure>
                                    <img src="\${block.content.url}" alt="\${block.content.alt}" style="width: \${block.content.width || 100}%" />
                                    \${block.content.caption ? \`<figcaption>\${block.content.caption}</figcaption>\` : ''}
                                 </figure>\`;
                        break;
                    case 'quote':
                        html += \`<blockquote>\${block.content.text}</blockquote>\`;
                        break;
                    // Add other block types here in the future
                    default:
                        html += \`<p><em>Bloco do tipo '\${block.type}' ainda não suportado.</em></p>\`;
                }
                html += '</div>';
            });
            html += '</section>';
        });

        mainContent.innerHTML = html;
    }
    
    async exportToPDF() {
        // This will be implemented in a future step
        alert('Funcionalidade "Salvar como PDF" em desenvolvimento.');
        // const content = document.getElementById('main-content');
        // const options = {
        //     margin: [10, 10, 10, 10],
        //     filename: \`\${this.courseData.title}.pdf\`,
        //     image: { type: 'jpeg', quality: 0.98 },
        //     html2canvas: { scale: 2 },
        //     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        // };
        // await html2pdf().set(options).from(content).save();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InteractiveCourse();
});
    `;
}

const getAppCssTemplate = (): string => {
    return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

:root {
    --primary-color: #2563EB;
    --background-color: #F9FAFB;
    --card-background: #FFFFFF;
    --text-color: #111827;
    --muted-text-color: #6B7280;
    --border-color: #E5E7EB;
    --font-family: 'Inter', sans-serif;
}

body {
    font-family: var(--font-family);
    background-color: var(--background-color);
    color: var(--text-color);
    margin: 0;
    line-height: 1.6;
}

#app {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 280px;
    background-color: var(--card-background);
    border-right: 1px solid var(--border-color);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
}

.sidebar h2 {
    margin-top: 0;
    color: var(--primary-color);
}

.content {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
}

.content-body {
    max-width: 800px;
    margin: 0 auto;
    background-color: var(--card-background);
    padding: 3rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.module-section {
    margin-bottom: 4rem;
}

.module-header {
    text-align: center;
    margin-bottom: 2.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--primary-color);
}

.module-header h2 {
    font-size: 2rem;
    margin-bottom: 0.25rem;
}

.module-header p {
    color: var(--muted-text-color);
    font-size: 1rem;
}

.block {
    margin-bottom: 1.5rem;
}

.block h1, .block h2, .block h3 {
    color: var(--primary-color);
}

.block figure {
    margin: 1rem 0;
    text-align: center;
}

.block img {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.block figcaption {
    font-size: 0.9rem;
    color: var(--muted-text-color);
    margin-top: 0.5rem;
    font-style: italic;
}

.block blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid var(--primary-color);
    background-color: var(--background-color);
    border-radius: 0 8px 8px 0;
    font-style: italic;
}
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

        // 1. HTML da aplicação (com dados embutidos)
        const htmlContent = getAppHtmlTemplate(handbookTitle, jsonDataString);
        zip.file('index.html', htmlContent);

        // 2. CSS da Aplicação
        zip.file('assets/styles.css', getAppCssTemplate());

        // 3. JS da Aplicação
        zip.file('assets/app.js', getAppJsTemplate());
        
        // 4. README
        zip.file('README.md', 'Para usar esta apostila, extraia o conteúdo deste ZIP e abra o arquivo index.html em seu navegador.');
        
        // TODO: Adicionar assets (imagens, libs)

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
