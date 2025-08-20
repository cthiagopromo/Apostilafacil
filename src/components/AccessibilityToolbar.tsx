
'use client';

import {
  FileDown,
  Hand,
  CaseSensitive,
  Contrast,
  Droplets,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const tools = [
  { icon: FileDown, label: 'Exportar para PDF' },
  { icon: Hand, label: 'Libras' },
  { icon: CaseSensitive, label: 'Ajustar Fonte' },
  { icon: Contrast, label: 'Alto Contraste' },
  { icon: Droplets, label: 'Acessibilidade' },
];

export function AccessibilityToolbar() {
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        {tools.map((tool, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <tool.icon className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
