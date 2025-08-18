'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Settings, Info, Palette, Type, Layout, Book } from 'lucide-react';
import ModuleSettings from './ModuleSettings';
import LayoutSettings from './LayoutSettings';

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
        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Informações Gerais</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ModuleSettings />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                <span>Configurações da Apostila</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              Em breve...
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span>Tema & Cores</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              Em breve...
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
