'use client';

import useProjectStore from '@/lib/store';
import BlockEditor from './BlockEditor';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { AddBlockModal } from './AddBlockModal';

export default function MainContent() {
  const { activeProject } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);


  return (
    <div className="flex flex-col h-full">
       <AddBlockModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="p-4 border-b bg-card">
        {activeProject && (
          <h2 className="text-lg font-semibold">{activeProject.title}</h2>
        )}
      </div>
      <ScrollArea className="flex-1 bg-secondary/40">
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          {activeProject && activeProject.blocks && activeProject.blocks.length > 0 ? (
            <>
              {activeProject.blocks.map((block, index) => (
                <BlockEditor key={block.id} block={block} index={index}/>
              ))}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <div className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full h-16 w-16 mb-4">
                  <PlusCircle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Comece adicionando um bloco</h2>
              <p>Escolha entre texto, imagem, vídeo, botão ou quiz para<br/>criar sua apostila interativa.</p>
            </div>
          )}

          <div className="text-center mt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2" />
              Adicionar Bloco
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
