'use client';

import type { Module } from '@/lib/types';
import { useProject } from '@/context/ProjectContext';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditorViewProps {
  module: Module;
}

export default function EditorView({ module }: EditorViewProps) {
  const { updateModule } = useProject();

  return (
    <div className="p-6 space-y-6 h-full">
        <div className='space-y-2'>
            <Label htmlFor='module-title'>Título do Módulo</Label>
            <Input 
                id='module-title'
                value={module.title}
                onChange={(e) => updateModule(module.id, { title: e.target.value })}
                className="text-2xl font-bold h-auto p-2"
            />
        </div>
        <div className='space-y-2'>
            <Label htmlFor='module-content'>Conteúdo</Label>
            <Textarea
                id='module-content'
                value={module.contentHTML}
                onChange={(e) => updateModule(module.id, { contentHTML: e.target.value })}
                placeholder="Comece a escrever o conteúdo do seu módulo aqui..."
                className="w-full h-[60vh] text-base"
            />
        </div>
    </div>
  );
}
