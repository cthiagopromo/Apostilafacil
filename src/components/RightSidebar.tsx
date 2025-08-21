
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Settings, Palette, Type, Layout, Book, FileText } from 'lucide-react';
import ModuleSettings from './ModuleSettings';
import LayoutSettings from './LayoutSettings';
import HandbookSettings from './HandbookSettings';

export default function RightSidebar() {
  return (
    <aside className="w-80 bg-card border-l flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Configurações</h2>
        </div>
      </div>
      <div className="p-4 flex-1">
        <Accordion type="multiple" defaultValue={['item-apostila', 'item-modulo']} className="w-full">
           <AccordionItem value="item-apostila">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                <span>Geral da Apostila</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <HandbookSettings />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-modulo">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Módulo Ativo</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ModuleSettings />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                <span>Tipografia</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              Em breve...
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    <span>Layout</span>
                </div>
            </AccordionTrigger>
            <AccordionContent>
              <LayoutSettings />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
}

    