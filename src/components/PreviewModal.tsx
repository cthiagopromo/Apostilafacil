
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

interface PreviewModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function PreviewModal({ isOpen, onOpenChange }: PreviewModalProps) {
  const { handbookTitle, handbookDescription, handbookId, handbookUpdatedAt, handbookTheme, projects } = useProjectStore();
  const [isExporting, setIsExporting] = React.useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

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
           <iframe
            key={handbookUpdatedAt} // Force re-render on data change
            src="/preview"
            className="w-full h-full border-0"
            title="Pré-visualização da Apostila"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
