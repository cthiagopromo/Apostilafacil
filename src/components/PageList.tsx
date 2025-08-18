'use client';

import useProjectStore from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function PageList() {
  const { activeProject, activePageId, setActivePageId } = useProjectStore();

  if (!activeProject) {
    return <div className="p-4 text-sm text-muted-foreground">Nenhum projeto ativo.</div>;
  }
  
  const handleMove = (index: number, direction: 'up' | 'down') => {
    // Lógica de reordenação a ser implementada no Zustand
  };
  
  return (
    <nav className="p-2 space-y-1">
      {activeProject.pages.map((page, index) => (
        <div
          key={page.id}
          className={cn(
            'group flex items-center justify-between rounded-md text-sm font-medium transition-colors',
            activePageId === page.id
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-muted'
          )}
        >
          <button
            onClick={() => setActivePageId(page.id)}
            className="flex-1 flex items-center gap-2 text-left p-2 truncate"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50 shrink-0" />
            <span className="truncate">{page.title}</span>
          </button>
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-1">
             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMove(index, 'up')} disabled={index === 0}>
                <ArrowUp className="h-4 w-4"/>
             </Button>
             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMove(index, 'down')} disabled={index === activeProject.pages.length - 1}>
                <ArrowDown className="h-4 w-4"/>
             </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isto irá deletar permanentemente a página "{page.title}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { /* Lógica de deleção */ }}>Deletar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </nav>
  );
}
