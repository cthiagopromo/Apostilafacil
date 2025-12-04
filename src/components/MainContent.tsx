'use client';

import useProjectStore from '@/lib/store';
import BlockEditor from './BlockEditor';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { AddBlockModal } from './AddBlockModal';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';


export default function MainContent() {
  const { getActiveProject, reorderBlocks } = useProjectStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeProject = getActiveProject();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (activeProject && over && active.id !== over.id) {
        const oldIndex = activeProject.blocks.findIndex(b => b.id === active.id);
        const newIndex = activeProject.blocks.findIndex(b => b.id === over.id);
        reorderBlocks(activeProject.id, oldIndex, newIndex);
    }
  }

  const getContainerWidthClass = () => {
    switch (activeProject?.layoutSettings?.containerWidth) {
      case 'standard':
        return 'max-w-4xl';
      case 'large':
        return 'max-w-6xl';
      case 'full':
        return 'max-w-full px-4';
      default:
        return 'max-w-4xl';
    }
  };

  const getBlockSpacingClass = (index: number) => {
    if (index === 0) return '';
    switch (activeProject?.layoutSettings?.sectionSpacing) {
        case 'compact':
            return 'mt-6'; // 1.5rem
        case 'standard':
            return 'mt-10'; // 2.5rem
        case 'comfortable':
            return 'mt-16'; // 4rem
        default:
            return 'mt-10';
    }
  }


  return (
    <div className="flex flex-col h-full">
       <AddBlockModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
      <div className="p-4 border-b bg-card">
        {activeProject && (
          <h2 className="text-lg font-semibold">{activeProject.title}</h2>
        )}
      </div>
      <ScrollArea className="flex-1 bg-muted">
        <div className={cn("mx-auto p-6 sm:p-8 lg:p-12", getContainerWidthClass())}>
          {activeProject && activeProject.blocks && activeProject.blocks.length > 0 ? (
            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={activeProject.blocks.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {activeProject.blocks.map((block, index) => (
                      <div key={block.id} className={cn(index > 0 && getBlockSpacingClass(index))}>
                        <BlockEditor block={block} index={index}/>
                      </div>
                    ))}
                </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <div className="inline-flex items-center justify-center bg-primary/10 text-primary rounded-full h-16 w-16 mb-4">
                  <PlusCircle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Comece adicionando um bloco</h2>
              <p>Escolha entre texto, imagem, vídeo, botão ou quiz para<br/>criar sua apostila interativa.</p>
            </div>
          )}

          <div className="text-center mt-6">
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
