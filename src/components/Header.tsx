'use client';

import { useState } from 'react';
import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Save, Loader, ArrowLeft, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { PreviewModal } from './PreviewModal';
import { handleExportZip } from '@/lib/export';
import { LoadingModal } from './LoadingModal';


export default function Header() {
  const { handbookTitle, handbookDescription, handbookId, handbookUpdatedAt, handbookTheme, projects, saveData, isDirty } = useProjectStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const onExportClick = async () => {
    await handleExportZip({ 
        projects, 
        handbookTitle, 
        handbookDescription, 
        handbookId, 
        handbookUpdatedAt,
        handbookTheme,
        setIsExporting, 
        toast 
    });
  }

  const handleSave = () => {
    if (!isDirty) return;

    setIsSaving(true);
    saveData().then(() => {
        setIsSaving(false);
        toast({
            title: "Projeto salvo com sucesso!",
        });
    });
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

  const handleNavigateHome = () => {
    setIsNavigating(true);
    router.push('/');
  }

  return (
    <>
      <PreviewModal 
        isOpen={isPreviewModalOpen} 
        onOpenChange={setIsPreviewModalOpen}
      />
      <LoadingModal isOpen={isNavigating} text="A carregar..." />
      <header className="flex items-center justify-between p-3 h-16 bg-card border-b">
        <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleNavigateHome} aria-label="Voltar para a página inicial">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Início
            </Button>
            <div className="w-px h-8 bg-border"></div>
              <div className='flex items-center gap-3'>
                <h1 className="text-lg font-semibold truncate max-w-xs md:max-w-md text-foreground">
                  {handbookTitle}
                </h1>
                {isSaving ? (
                  <Badge variant="outline" aria-live="polite">A Salvar...</Badge>
                ) : isDirty ? (
                  <Badge variant="destructive" aria-live="polite">Não Salvo</Badge>
                ) : (
                  <Badge variant="secondary" aria-live="polite">Salvo</Badge>
                )}
              </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={isSaving || !isDirty} aria-label="Salvar alterações">
            {isSaving ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSaving ? 'A Salvar...' : 'Salvar'}
          </Button>
          <Button onClick={handlePreview} variant="outline" aria-label="Visualizar a apostila">
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
          </Button>
        </div>
      </header>
    </>
  );
}
