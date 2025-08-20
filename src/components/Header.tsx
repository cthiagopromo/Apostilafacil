
'use client';

import { useState } from 'react';
import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Save, Loader, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { generateZip } from '@/lib/export.tsx';
import { useRouter } from 'next/navigation';
import { PreviewModal } from './PreviewModal';

export default function Header() {
  const { handbookTitle, handbookDescription, activeProject, saveData, isDirty, projects } = useProjectStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleExport = async () => {
    if (!projects || projects.length === 0) {
        toast({
            variant: "destructive",
            title: "Nenhum projeto para exportar",
            description: "Adicione pelo menos um módulo antes de exportar.",
        });
        return;
    };

    setIsExporting(true);
    try {
      await generateZip(projects, handbookTitle, handbookDescription);
      toast({
        title: "Exportação Concluída",
        description: "Seu projeto foi exportado como um arquivo ZIP.",
      });
    } catch (error) {
      console.error("Failed to export project", error);
      toast({
        variant: "destructive",
        title: "Erro na Exportação",
        description: "Não foi possível exportar o projeto. Tente novamente.",
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
      <PreviewModal isOpen={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen} />
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
          {/* Espaço central para futuros botões de edição de módulo */}
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
          <Button onClick={handleExport} disabled={isExporting}>
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
