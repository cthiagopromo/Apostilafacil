
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LoadingModal } from './LoadingModal';

export function AccessibilityToolbar() {
  const [isExporting, setIsExporting] = useState(false);

  const handlePdfExport = async () => {
    const content = document.getElementById('printable-content');
    if (!content) return;

    setIsExporting(true);

    try {
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null, 
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height],
        hotfixes: ['px_scaling']
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      window.open(pdfUrl, '_blank');
      URL.revokeObjectURL(pdfUrl);

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsExporting(false);
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
      <LoadingModal isOpen={isExporting} text="Gerando PDF, por favor aguarde..." />
      <div className="flex items-center gap-1 bg-card p-1 rounded-lg border">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handlePdfExport} disabled={isExporting}>
                {isExporting ? <Loader className="h-5 w-5 animate-spin"/> : <FileDown className="h-5 w-5" />}
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
    </>
  );
}
