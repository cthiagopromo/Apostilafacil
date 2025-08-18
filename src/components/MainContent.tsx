'use client';

import useProjectStore from '@/lib/store';
import { Skeleton } from './ui/skeleton';
import EditorView from './EditorView';

export default function MainContent() {
  const { activeProject, activePageId } = useProjectStore();
  
  const activePage = activeProject?.pages.find(p => p.id === activePageId);

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Nenhuma página selecionada</h2>
            <p>Selecione uma página na barra lateral para começar a editar.</p>
            <div className="pt-8 w-full max-w-md mx-auto">
                <Skeleton className="h-8 w-3/4 mb-4"/>
                <Skeleton className="h-4 w-full mb-2"/>
                <Skeleton className="h-4 w-5/6"/>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <EditorView page={activePage} />
    </div>
  );
}
