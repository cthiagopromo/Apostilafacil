
'use client';

import { useEffect } from 'react';
import useProjectStore from '@/lib/store';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import RightSidebar from './RightSidebar';

export function EditorLayout() {
  const { activeProject, handbookTheme } = useProjectStore();

  useEffect(() => {
    if (handbookTheme?.colorPrimary) {
      document.documentElement.style.setProperty('--primary', handbookTheme.colorPrimary);
    }
    // Cleanup function to reset to default when component unmounts or project changes
    return () => {
      // You might want to reset to a default color or remove the property
      document.documentElement.style.removeProperty('--primary');
    };
  }, [handbookTheme?.colorPrimary]);

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

    