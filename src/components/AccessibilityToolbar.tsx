
'use client';

import { useState } from 'react';
import {
  FileDown,
  Hand,
  ZoomIn,
  ZoomOut,
  Contrast,
  Droplets,
  Loader
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LoadingModal } from './LoadingModal';

export function AccessibilityToolbar() {
  const [isExporting, setIsExporting] = useState(false);

  const handlePdfExport = async () => {
    setIsExporting(true);
    // This now just triggers the browser's print dialog.
    // Paged.js will have already formatted the page for printing.
    window.print();
    // We can't know when the user closes the print dialog, so we'll hide the loader after a short delay.
    setTimeout(() => setIsExporting(false), 2000);
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
      <LoadingModal isOpen={isExporting} text="Preparando documento para impressão..." />
      <div className="flex items-center gap-1 bg-primary p-1 rounded-lg border border-primary-foreground/20">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handlePdfExport} disabled={isExporting} className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'>
                {isExporting ? <Loader className="h-5 w-5 animate-spin"/> : <FileDown className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Exportar para PDF</p></TooltipContent>
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
                <Button variant="ghost" size="icon" onClick={() => handleFontSize(false)} className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'>
                  <ZoomOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Diminuir Fonte</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => handleFontSize(true)} className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'>
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Aumentar Fonte</p></TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleContrast} className='text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground'>
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
            <TooltipContent><p>Acessibilidade (Em desenvolvimento)</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}
