
'use client';

import {
  Hand,
  ZoomIn,
  ZoomOut,
  Contrast,
  Droplets,
  Printer,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AccessibilityToolbarProps {
  setIsExporting: (isExporting: boolean) => void;
  handbookId?: string;
}

export function AccessibilityToolbar({ setIsExporting, handbookId }: AccessibilityToolbarProps) {

  const handlePdfExport = () => {
    if (handbookId) {
      // Abre página de impressão dedicada em nova aba
      window.open(`/print/${handbookId}`, '_blank');
    } else {
      // Fallback para impressão direta
      setIsExporting(true);
    }
  };

  const handleFontSize = (increase: boolean) => {
    const body = document.body;
    const currentSize = parseFloat(window.getComputedStyle(body).fontSize);
    const newSize = increase ? currentSize + 1 : currentSize - 1;
    if (newSize >= 12 && newSize <= 24) {
      body.style.fontSize = `${newSize}px`;
    }
  };

  const toggleContrast = () => {
    document.body.classList.toggle('high-contrast');
  };

  const showAlert = (feature: string) => {
    alert(`${feature} - Funcionalidade em desenvolvimento.`);
  }

  return (
    <>
      <div className="flex items-center gap-1 bg-primary p-1 rounded-lg border border-primary-foreground/20 accessibility-toolbar">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handlePdfExport} className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground' data-action="print">
                <Printer className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Imprimir ou Salvar como PDF</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => showAlert('Libras')} className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'>
                <Hand className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Libras (Em desenvolvimento)</p></TooltipContent>
          </Tooltip>

          <div className="flex items-center border-l border-r border-primary-foreground/20 mx-1 px-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => handleFontSize(false)} className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground' data-action="zoom-out">
                  <ZoomOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Diminuir Fonte</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => handleFontSize(true)} className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground' data-action="zoom-in">
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Aumentar Fonte</p></TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleContrast} className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground' data-action="contrast">
                <Contrast className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Alto Contraste</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => showAlert('Acessibilidade')} className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'>
                <Droplets className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Verificador de Cores (Em desenvolvimento)</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}
