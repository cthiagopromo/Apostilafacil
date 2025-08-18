'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette } from 'lucide-react';
import ProjectSettings from './ProjectSettings';
import ThemeCustomizer from './ThemeCustomizer';

export default function RightSidebar() {
  return (
    <aside className="w-80 bg-card/60 border-l">
      <Tabs defaultValue="settings" className="h-full flex flex-col">
        <div className="p-2 border-b">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-1"/>Config</TabsTrigger>
            <TabsTrigger value="theme"><Palette className="h-4 w-4 mr-1"/>Tema</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="settings" className="flex-1 overflow-y-auto p-4">
          <ProjectSettings />
        </TabsContent>
        <TabsContent value="theme" className="flex-1 overflow-y-auto p-4">
          <ThemeCustomizer />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
