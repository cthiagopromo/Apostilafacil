'use client';

import { useProject } from '@/context/ProjectContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EditorView from './EditorView';
import PreviewView from './PreviewView';
import { Skeleton } from './ui/skeleton';

export default function MainContent() {
  const { activeModule } = useProject();

  if (!activeModule) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-8">
        <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Nenhum módulo selecionado</h2>
            <p>Selecione um módulo na barra lateral esquerda para começar a editar.</p>
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
    <div className="flex-1 flex flex-col h-full">
      <Tabs defaultValue="editor" className="flex-1 flex flex-col h-full">
        <div className="px-4 py-2 border-b">
          <TabsList>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Prévia</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="editor" className="flex-1 overflow-y-auto p-0 m-0">
          <EditorView module={activeModule} />
        </TabsContent>
        <TabsContent value="preview" className="flex-1 overflow-y-auto p-0 m-0">
          <PreviewView module={activeModule} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
