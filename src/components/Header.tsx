
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

// Função para buscar o conteúdo CSS.
// É mais confiável do que manter uma cópia estática no código.
const fetchCssContent = async (path: string): Promise<string> => {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Falha ao buscar o CSS de ${path}:`, error);
        // Retorna um CSS básico como fallback em caso de erro.
        return 'body { font-family: sans-serif; }';
    }
};

export default function Header() {
  const { handbookTitle, projects, saveData, isDirty } = useProjectStore();
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
        
        // 1. Busca o HTML renderizado da página de preview
        const previewResponse = await fetch('/preview');
        if (!previewResponse.ok) throw new Error('Falha ao buscar o conteúdo da pré-visualização.');
        let htmlContent = await previewResponse.text();

        // 2. Busca o conteúdo do CSS global
        const cssContent = await fetchCssContent('/globals.css');

        // 3. Ajusta o HTML para funcionar localmente
        // Remove o script do Next.js e outros scripts específicos do ambiente de desenvolvimento
        htmlContent = htmlContent.replace(/<script src="\/_next\/[^"]+" defer><\/script>/g, '');
        // Troca o caminho do CSS para o arquivo local no ZIP
        htmlContent = htmlContent.replace(/<link rel="stylesheet" href="\/_next\/static\/css\/[^"]+">/g, '');
        htmlContent = htmlContent.replace('</head>', '<link rel="stylesheet" href="assets/styles.css"></head>');


        // Adiciona os arquivos ao ZIP
        zip.file('index.html', htmlContent);
        const assets = zip.folder('assets');
        if(assets) {
            assets.file('styles.css', cssContent);
        }
        
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
