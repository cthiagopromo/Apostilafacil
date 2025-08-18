'use client';

import useProjectStore from '@/lib/store';
import BlockEditor from './BlockEditor';
import { ScrollArea } from './ui/scroll-area';

export default function MainContent() {
  const { activeProject } = useProjectStore();

  if (!activeProject || !activeProject.blocks || activeProject.blocks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Apostila Vazia</h2>
            <p>Adicione um bloco de conteúdo usando o menu à esquerda para começar.</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        {activeProject.blocks.map((block) => (
           <BlockEditor key={block.id} block={block} />
        ))}
      </div>
    </ScrollArea>
  );
}
