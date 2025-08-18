'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Settings, Info, Palette, Type, Layout } from 'lucide-react';
import useProjectStore from '@/lib/store';
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import BlockSettings from "./BlockSettings";

export default function RightSidebar() {
  const { activeProject, updateProjectTitle, updateProjectDescription } = useProjectStore();

  if (!activeProject) return (
    <aside className="w-80 bg-card border-l p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Nenhum projeto selecionado</p>
    </aside>
  );

  return (
    <aside className="w-80 bg-card border-l flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Settings className="h-5 w-5"/> Configurações</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <BlockSettings />

        <Accordion type="multiple" defaultValue={['general']} className="w-full">
          <AccordionItem value="general">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                <span>Informações Gerais</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="project-title">Título do Projeto</Label>
                <Input 
                  id="project-title"
                  value={activeProject.title}
                  onChange={(e) => updateProjectTitle(activeProject.id, e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">Descrição da apostila</Label>
                <Textarea 
                  id="project-description"
                  value={activeProject.description}
                  onChange={(e) => updateProjectDescription(activeProject.id, e.target.value)}
                  rows={4}
                />
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Criado em</Label>
                    <p className="text-sm text-muted-foreground">{new Date(activeProject.createdAt).toLocaleDateString()}</p>
                </div>
                 <div className="space-y-2">
                    <Label>Versão</Label>
                    <p className="text-sm text-muted-foreground">{activeProject.version}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="theme">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                <span>Tema e Cores</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
               <p className="text-sm text-muted-foreground">Configurações de tema e cores.</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="typography">
            <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <Type className="h-5 w-5" />
                    <span>Tipografia</span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <p className="text-sm text-muted-foreground">Configurações de tipografia.</p>
            </AccordionContent>
          </AccordionItem>

           <AccordionItem value="layout">
            <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    <span>Layout</span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
               <p className="text-sm text-muted-foreground">Configurações de layout.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </aside>
  );
}
