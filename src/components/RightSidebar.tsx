'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import BlockSettings from './BlockSettings';

export default function RightSidebar() {
  return (
    <aside className="w-80 bg-card/60 border-l">
      <Tabs defaultValue="settings" className="h-full flex flex-col">
        <div className="p-2 border-b">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1"/>Configurações do Bloco</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="settings" className="flex-1 overflow-y-auto p-4">
          <BlockSettings />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
