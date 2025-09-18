
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
    if (handbookTheme?.colorPrimary) {
      root.style.setProperty('--primary', handbookTheme.colorPrimary);
    }
     if (handbookTheme?.fontHeading) {
      root.style.setProperty('--font-heading', handbookTheme.fontHeading);
    }
    if (handbookTheme?.fontBody) {
      root.style.setProperty('--font-body', handbookTheme.fontBody);
    }
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--font-heading');
      root.style.removeProperty('--font-body');
    };
  }, [handbookTheme]);

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <p>Nenhum projeto selecionado. Selecione um na barra lateral.</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex flex-1 border-t border-border overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          <MainContent />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
