
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
  const { handbookTitle, projects, saveData, isDirty } = useProjectStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { toast } = useToast();
  const previewIframeRef = useRef<HTMLIFrameElement>(null);

  const getPreviewContentAsHtml = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        const iframe = previewIframeRef.current;
        if (!iframe?.contentWindow?.document) {
            return reject(new Error('Não foi possível acessar o conteúdo da pré-visualização.'));
        }
        
        const maxTries = 20; // 20 * 250ms = 5 seconds timeout
        let tries = 0;

        const checkForReadyState = () => {
            const iframeDoc = iframe.contentWindow?.document;
            if (iframeDoc && iframeDoc.body && iframeDoc.body.classList.contains('ready-for-export')) {
                // Directly use the outerHTML of the fully rendered document
                const finalHtml = iframeDoc.documentElement.outerHTML;
                resolve(`<!DOCTYPE html>${finalHtml}`);
            } else if (tries < maxTries) {
                tries++;
                setTimeout(checkForReadyState, 250);
            } else {
                reject(new Error('Tempo de espera excedido para a pré-visualização carregar.'));
            }
        };
        
        checkForReadyState();
    });
  };

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
    
    // Open the modal first, which starts loading the iframe
    setIsPreviewModalOpen(true);
    
    try {
        const htmlContent = await getPreviewContentAsHtml();

        if (!htmlContent) {
            throw new Error("O conteúdo HTML não pôde ser gerado.");
        }

        const zip = new JSZip();
        const cleanTitle = (handbookTitle || 'apostila').toLowerCase().replace(/\s+/g, '-');
        
        zip.file('index.html', htmlContent);
        zip.file('README.md', 'Para usar esta apostila, suba o arquivo index.html para o seu servidor web, ou abra-o diretamente no navegador.');

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
        // Do not close the modal, let the user do it.
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
