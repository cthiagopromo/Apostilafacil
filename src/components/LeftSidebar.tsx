
'use client';

import { useState } from 'react';
import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, File, MoreHorizontal, Trash2, GripVertical, ListOrdered } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/hooks/use-toast';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Project } from '@/lib/types';
import { ReorderModulesModal } from './ReorderModulesModal';


function SortableModuleItem({ project }: { project: Project }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: project.id });
    const { activeProjectId, setActiveProjectId, deleteProject, projects, handbookId } = useProjectStore();
    const router = useRouter();
    const { toast } = useToast();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    
    const handleProjectSelect = (projectId: string) => {
        setActiveProjectId(projectId);
        if (handbookId) {
            router.push(`/editor/${handbookId}/${projectId}`);
        }
    }

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
                "w-full h-auto items-center p-2 rounded-md flex group",
                activeProjectId === project.id ? "bg-primary/10 text-primary" : "hover:bg-accent"
            )}
            onClick={() => handleProjectSelect(project.id)}
        >
            <button {...attributes} {...listeners} className="cursor-grab p-1 text-muted-foreground group-hover:text-foreground flex-shrink-0">
                <GripVertical className="h-5 w-5" />
            </button>
            <div className='flex items-center justify-start flex-grow min-w-0 ml-1'>
                 <File className='mr-3 mt-1 flex-shrink-0' />
                 <div className='flex flex-col items-start text-left flex-grow min-w-0'>
                    <span className='font-semibold w-full truncate'>{project.title}</span>
                    <span className={cn('text-xs w-full truncate', activeProjectId === project.id ? 'text-primary/80' : 'text-muted-foreground')}>/{project.title.toLowerCase().replace(/\s/g, '-')}</span>
                </div>
            </div>
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className='h-5 w-5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                   <AlertDialogTrigger asChild>
                      <DropdownMenuItem className='text-destructive focus:text-destructive focus:bg-destructive/10'>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Módulo
                      </DropdownMenuItem>
                   </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

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
    )
}


export default function LeftSidebar() {
  const { projects, addProject, handbookId, reorderProjects } = useProjectStore();
  const router = useRouter();
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  
  const handleNewProject = () => {
    const newProject = addProject();
    if (handbookId) {
        router.push(`/editor/${handbookId}/${newProject.id}`);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = projects.findIndex(p => p.id === active.id);
        const newIndex = projects.findIndex(p => p.id === over.id);
        reorderProjects(oldIndex, newIndex);
    }
  }

  return (
    <>
      <ReorderModulesModal isOpen={isReorderModalOpen} onOpenChange={setIsReorderModalOpen} />
      <aside className="w-72 bg-card border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
              <div className='flex items-center gap-2'>
                  <h2 className="text-lg font-semibold">Módulos</h2>
                  <Badge variant="secondary">{projects.length}</Badge>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleNewProject} className='w-full'>
              <PlusCircle className="mr-2" />
              Novo
            </Button>
            <Button onClick={() => setIsReorderModalOpen(true)} variant="outline">
              <ListOrdered className="mr-2" />
              Reordenar
            </Button>
          </div>
        </div>
        <div className="p-4 border-b">
          <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Filtrar módulos..." className="pl-9" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
          >
              <SortableContext
                  items={projects.map(p => p.id)}
                  strategy={verticalListSortingStrategy}
              >
                  <div className='p-2 space-y-1'>
                      {projects.map((project) => (
                        <SortableModuleItem key={project.id} project={project} />
                      ))}
                  </div>
              </SortableContext>
          </DndContext>
        </ScrollArea>
      </aside>
    </>
  );
}
