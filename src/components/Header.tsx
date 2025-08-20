
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

export default function Header() {
  const { handbookTitle, handbookDescription, activeProject, saveData, isDirty, projects } = useProjectStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { toast } = useToast();
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const getPreviewContentAsHtml = async (): Promise<string | null> => {
    const iframe = previewIframeRef.current;
    if (!iframe?.contentWindow?.document?.documentElement) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Acessar Conteúdo',
        description: 'Não foi possível acessar o conteúdo da pré-visualização. Aguarde o carregamento e tente novamente.',
      });
      return null;
    }

    const doc = iframe.contentWindow.document;
    const clone = doc.documentElement.cloneNode(true) as HTMLElement;
    
    // Remove elements that should not be in the final export
    clone.querySelectorAll('.no-export').forEach(el => el.remove());
    clone.querySelectorAll('script[src*="next/dist"]').forEach(el => el.remove());
    
    // Ensure all interactivity scripts and data are present, they are already in the preview page.

    const finalHtml = clone.outerHTML;
    
    return `<!DOCTYPE html>${finalHtml}`;
  }


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
    
    // Ensure the modal is open to have the iframe rendered.
    if (!isPreviewModalOpen) {
      setIsPreviewModalOpen(true);
      // Wait a moment for the iframe content to load.
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    try {
      const htmlContent = await getPreviewContentAsHtml();

      if (!htmlContent) {
        throw new Error("O conteúdo HTML não pôde ser gerado.");
      }

      const zip = new JSZip();
      const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\s+/g, '-');

      zip.file('index.html', htmlContent);
      zip.file('README.md', 'Para usar esta apostila, suba o arquivo index.html para o seu servidor web.');

      const blob = await zip.generateAsync({ type: 'blob' });
      saveAs(blob, `${cleanTitle}.zip`);

      toast({
        title: 'Exportação Concluída',
        description: 'Seu projeto foi exportado como um arquivo ZIP.',
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
      // Keep the modal open for user convenience
      // setIsPreviewModalOpen(false); 
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
            {activeProject && (
              <div className='flex items-center gap-3'>
                <h1 className="text-lg font-semibold">
                  {handbookTitle}
                </h1>
                {isSaving ? (
                  <Badge variant="outline">Salvando...</Badge>
                ) : isDirty ? (
                  <Badge variant="destructive">Alterações não salvas</Badge>
                ) : (
                  <Badge variant="outline">Salvo</Badge>
                )}
              </div>
            )}
        </div>

        <div className="flex-1 flex justify-center items-center gap-2">
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
