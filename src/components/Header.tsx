'use client';

import { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Book, PlusCircle, Eye, Download, Check, X } from 'lucide-react';

export default function Header() {
  const { project, updateProject } = useProject();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(project.title);

  const handleTitleSave = () => {
    if (title.trim()) {
      updateProject({ title: title.trim() });
      setIsEditing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(project.title);
      setIsEditing(false);
    }
  };

  return (
    <header className="flex items-center justify-between p-2 h-16 bg-card/80 backdrop-blur-sm border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-primary">
          <Book className="h-7 w-7" />
          <span className="text-xl font-bold">ApostilaFácil</span>
        </div>
        <div className="w-px h-6 bg-border mx-2"></div>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-9"
              autoFocus
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
            {project.title}
          </h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Pré-visualizar
        </Button>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar .zip
        </Button>
      </div>
    </header>
  );
}
