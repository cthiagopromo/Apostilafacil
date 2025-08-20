
'use client';

import {
  FileDown,
  Hand,
  CaseSensitive,
  Contrast,
  Droplets,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AccessibilityToolbar() {
  const handlePdfExport = () => {
    // This assumes the preview is in an iframe.
    // In a real scenario, we might need a more robust way to trigger print on the iframe's content.
    window.print();
  };

  const handleFontSize = (increase: boolean) => {
    const body = document.body;
    const currentSize = parseFloat(window.getComputedStyle(body).fontSize);
    const newSize = increase ? currentSize + 1 : currentSize - 1;
    if (newSize >= 12 && newSize <= 24) { // Set min/max font size
      body.style.fontSize = `${newSize}px`;
    }
  };

  const toggleContrast = () => {
    document.body.classList.toggle('high-contrast');
  };
  
  const showAlert = (feature: string) => {
    alert(`${feature} - Funcionalidade em desenvolvimento.`);
  }

  const tools = [
    { icon: FileDown, label: 'Exportar para PDF', action: handlePdfExport },
    { icon: Hand, label: 'Libras', action: () => showAlert('Libras') },
    { icon: CaseSensitive, label: 'Ajustar Fonte', action: () => handleFontSize(true), isGroup: true },
    { icon: Contrast, label: 'Alto Contraste', action: toggleContrast },
    { icon: Droplets, label: 'Acessibilidade', action: () => showAlert('Acessibilidade') },
  ];

  return (
    <div className="flex items-center gap-1 bg-card p-1 rounded-lg border">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handlePdfExport}>
              <FileDown className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Exportar para PDF</p></TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => showAlert('Libras')}>
              <Hand className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Libras (Em desenvolvimento)</p></TooltipContent>
        </Tooltip>

        <div className="flex items-center border-l border-r mx-1 px-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleFontSize(false)}>
                <ZoomOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Diminuir Fonte</p></TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => handleFontSize(true)}>
                <ZoomIn className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent><p>Aumentar Fonte</p></TooltipContent>
          </Tooltip>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleContrast}>
              <Contrast className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Alto Contraste</p></TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => showAlert('Acessibilidade')}>
              <Droplets className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Acessibilidade (Em desenvolvimento)</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
