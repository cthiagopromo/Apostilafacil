
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import useProjectStore from '@/lib/store';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ReorderModulesModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function SortableItem({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: project.id });
  const { activeProjectId, deleteProject, projects, handbookId } = useProjectStore();
  const { toast } = useToast();
  const router = useRouter();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (projects.length <= 1) {
        toast({
            variant: "destructive",
            title: "Ação não permitida",
            description: "Não é possível excluir o último módulo da apostila.",
        });
        return;
    }

    const nextProjectId = deleteProject(projectId);
    if (nextProjectId && handbookId) {
      router.push(`/editor/${handbookId}/${nextProjectId}`);
    } else if (!nextProjectId) {
      router.push('/');
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center p-2 rounded-lg border bg-card",
        activeProjectId === project.id && 'border-primary'
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab p-2 text-muted-foreground">
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="font-medium flex-grow">{project.title}</span>
      <AlertDialog>
          <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => e.stopPropagation()}>
                  <Trash2 className="h-4 w-4" />
              </Button>
          </AlertDialogTrigger>
          <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isto irá deletar o módulo e todo o seu conteúdo permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={(e) => handleDeleteProject(e, project.id)}>Deletar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function ReorderModulesModal({ isOpen, onOpenChange }: ReorderModulesModalProps) {
  const { projects, reorderProjects, saveData } = useProjectStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      reorderProjects(oldIndex, newIndex);
    }
  };

  const handleClose = () => {
    saveData();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">Reordenar Módulos</DialogTitle>
          <DialogDescription>
            Arraste e solte os módulos para alterar a sua ordem na apostila.
          </DialogDescription>
        </DialogHeader>

        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <ScrollArea className='h-[400px]'>
            <div className='p-1'>
                <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {projects.map((project) => (
                            <SortableItem key={project.id} project={project} />
                        ))}
                    </div>
                </SortableContext>
            </div>
          </ScrollArea>
        </DndContext>
        
        <DialogFooter>
          <Button onClick={handleClose}>Concluir</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    