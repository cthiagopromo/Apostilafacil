'use client';

import { useEffect } from 'react';
import { useStore } from 'zustand';
import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';

export function UndoRedoControls() {
  const { undo, redo, pastStates, futureStates } = useStore(useProjectStore.temporal, (state) => state);
  
  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => undo()}
        disabled={!canUndo}
        title="Desfazer (Ctrl+Z)"
        className="h-8 w-8"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => redo()}
        disabled={!canRedo}
        title="Refazer (Ctrl+Y)"
        className="h-8 w-8"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
