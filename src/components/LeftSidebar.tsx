'use client';

import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { PlusCircle, Type, Image, Video, Link2, HelpCircle } from 'lucide-react';
import type { BlockType } from '@/lib/types';

const blockTypes: { name: BlockType, label: string, icon: React.ReactNode }[] = [
    { name: 'text', label: 'Texto', icon: <Type /> },
    { name: 'image', label: 'Imagem', icon: <Image /> },
    { name: 'video', label: 'Vídeo/Embed', icon: <Video /> },
    { name: 'button', label: 'Botão', icon: <Link2 /> },
    { name: 'quiz', label: 'Quiz', icon: <HelpCircle /> },
]

export default function LeftSidebar() {
  const { addBlock, activeProject } = useProjectStore();

  const handleAddBlock = (type: BlockType) => {
    if (activeProject) {
        addBlock(activeProject.id, type);
    }
  };

  return (
    <aside className="w-72 bg-card/60 border-r flex flex-col">
      <div className="p-2 border-b">
        <h2 className="text-md font-semibold px-2">Adicionar Blocos</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className='grid grid-cols-2 gap-2'>
            {blockTypes.map(block => (
                <Button 
                    key={block.name}
                    variant="outline" 
                    className="h-24 flex flex-col gap-2"
                    onClick={() => handleAddBlock(block.name)}
                    disabled={!activeProject}
                >
                    {block.icon}
                    <span className='text-sm'>{block.label}</span>
                </Button>
            ))}
        </div>
      </div>
    </aside>
  );
}
