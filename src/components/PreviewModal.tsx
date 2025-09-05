
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Loader } from 'lucide-react';
import { Button } from './ui/button';
import useProjectStore from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { handleExportZip } from '@/lib/export';
import PreviewContent from './PreviewContent';
import type { HandbookData } from '@/lib/types';
import { LoadingModal } from './LoadingModal';

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function PreviewModal({ isOpen, onOpenChange }: PreviewModalProps) {
  const { handbookTitle, handbookDescription, handbookId, handbookUpdatedAt, handbookTheme, projects, isInitialized } = useProjectStore();
  const [isExporting, setIsExporting] = React.useState(false);
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

  const handbookData: HandbookData | null = isInitialized ? {
      id: handbookId,
      title: handbookTitle,
      description: handbookDescription,
      theme: handbookTheme,
      projects,
      updatedAt: handbookUpdatedAt,
  } : null;
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex-row flex justify-between items-center">
          <DialogTitle className="text-xl">Pré-visualização Interativa</DialogTitle>
          <Button onClick={onExportClick} disabled={isExporting}>
            {isExporting ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Download className="mr-2 h-4 w-4" />
            )}
            {isExporting ? 'Exportando...' : 'Exportar ZIP'}
          </Button>
        </DialogHeader>
        <div className="flex-1 w-full h-full overflow-hidden relative">
            {!isInitialized ? (
                 <LoadingModal isOpen={true} text="Carregando visualização..." />
            ) : (
                <PreviewContent handbookData={handbookData} />
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
