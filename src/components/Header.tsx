
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

const getAppHtmlTemplate = (title: string): string => {
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
    
    async init() {
        // Carregar dados do curso
        this.courseData = await this.loadCourseData();
        console.log('Course data loaded:', this.courseData);
        
        // Renderizar interface
        if (this.courseData) {
            // this.renderTOC();
            // this.renderContent();
            // this.bindEvents();
        }
    }

    async loadCourseData() {
        try {
            const response = await fetch('assets/course-data.json');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
            const mainContent = document.getElementById('main-content');
            if(mainContent) {
                mainContent.innerHTML = '<p style="color: red;">Falha ao carregar os dados da apostila.</p>';
            }
            return null;
        }
    }
    
    async exportToPDF() {
        const content = document.getElementById('main-content');
        const options = {
            margin: [10, 10, 10, 10],
            filename: \`\${this.courseData.title}.pdf\`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        await html2pdf().set(options).from(content).save();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new InteractiveCourse();
});
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

        // 1. HTML da aplicação
        const htmlContent = getAppHtmlTemplate(handbookTitle);
        zip.file('index.html', htmlContent);

        // 2. CSS (vazio por enquanto)
        zip.file('assets/styles.css', '/* Estilos da aplicação aqui */');

        // 3. JS da Aplicação
        zip.file('assets/app.js', getAppJsTemplate());
        
        // 4. Dados do curso
        zip.file('assets/course-data.json', JSON.stringify(handbookData, null, 2));

        // 5. README
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
