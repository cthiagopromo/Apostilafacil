
'use client';

import { useEffect } from 'react';
import useProjectStore from '@/lib/store';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import RightSidebar from './RightSidebar';
import type { Theme } from '@/lib/types';

const applyThemeToDom = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme.colorPrimary) {
    // Convert hex to HSL if needed, assuming HSL for now
    const color = theme.colorPrimary;
    if (color.includes('#')) {
        // This is a simple conversion, might not be perfect
        let r = 0, g = 0, b = 0;
        if (color.length === 4) {
            r = parseInt(color[1] + color[1], 16);
            g = parseInt(color[2] + color[2], 16);
            b = parseInt(color[3] + color[3], 16);
        } else if (color.length === 7) {
            r = parseInt(color.substring(1, 3), 16);
            g = parseInt(color.substring(3, 5), 16);
            b = parseInt(color.substring(5, 7), 16);
        }
        // A simple approximation to get HSL values. For accurate conversion a library would be better.
        // For now, we will assume the store provides HSL strings.
    } else {
         root.style.setProperty('--primary', theme.colorPrimary);
    }
  }
  if (theme.fontHeading) {
    root.style.setProperty('--font-heading', theme.fontHeading);
  }
  if (theme.fontBody) {
    root.style.setProperty('--font-body', theme.fontBody);
  }
};


export function EditorLayout() {
  const { getActiveProject, handbookTheme } = useProjectStore();
  const activeProject = getActiveProject();

  useEffect(() => {
    if (handbookTheme) {
      applyThemeToDom(handbookTheme);
    }
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
