'use client';

import { useState, useEffect } from 'react';
import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Book, Eye, Download, Check, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { activeProject, updateProjectTitle } = useProjectStore((s) => ({
    activeProject: s.activeProject,
    updateProjectTitle: s.updateProjectTitle,
  }));
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(activeProject?.title || '');

  useEffect(() => {
    setTitle(activeProject?.title || '');
  }, [activeProject]);

  const handleTitleSave = () => {
    if (title.trim() && activeProject) {
      updateProjectTitle(activeProject.id, title.trim());
      setIsEditing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(activeProject?.title || '');
      setIsEditing(false);
    }
  };

  return (
    <header className="flex items-center justify-between p-2 h-16 bg-card/80 backdrop-blur-sm border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-primary">
            <Link href="/" passHref>
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
          <Book className="h-7 w-7" />
          <span className="text-xl font-bold">ApostilaFácil</span>
        </div>
        <div className="w-px h-6 bg-border mx-2"></div>
        {activeProject && (
          <>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-9"
                  autoFocus
                  onBlur={handleTitleSave}
                />
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={handleTitleSave}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <h1
                className="text-lg font-semibold cursor-pointer rounded-md px-2 py-1 hover:bg-muted"
                onClick={() => setIsEditing(true)}
              >
                {activeProject.title}
              </h1>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/preview/${activeProject?.id}`} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Pré-visualizar
          </Link>
        </Button>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar .zip
        </Button>
      </div>
    </header>
  );
}
