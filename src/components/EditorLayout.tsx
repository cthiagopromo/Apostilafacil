
'use client';

import { useEffect } from 'react';
import useProjectStore from '@/lib/store';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import RightSidebar from './RightSidebar';

export function EditorLayout() {
  const { getActiveProject, handbookTheme } = useProjectStore();
  const activeProject = getActiveProject();

  useEffect(() => {
    const root = document.documentElement;
    // This effect is simplified as globals.css now handles the theme directly.
    // This can be used for dynamic theme updates if needed in the future.
  }, [handbookTheme]);

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <p>Nenhum projeto selecionado. Selecione um na barra lateral.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex flex-1 border-t overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <MainContent />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
