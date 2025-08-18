'use client';

import { useEffect } from 'react';
import useProjectStore from '@/lib/store';
import type { Project } from '@/lib/types';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import MainContent from './MainContent';
import RightSidebar from './RightSidebar';

interface EditorLayoutProps {
  project: Project;
}

export function EditorLayout({ project }: EditorLayoutProps) {
  const { setActiveProject } = useProjectStore();

  useEffect(() => {
    setActiveProject(project.id);
  }, [project, setActiveProject]);
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex flex-1 border-t border-border overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <MainContent />
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
