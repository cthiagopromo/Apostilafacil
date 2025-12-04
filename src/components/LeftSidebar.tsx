
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
                "w-full rounded-md grid grid-cols-[auto_1fr_auto] items-center gap-2 group transition-colors duration-200 ease-in-out",
                activeProjectId === project.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent"
            )}
        >
            {/* Drag Handle */}
            <button {...attributes} {...listeners} className="cursor-grab p-2 text-muted-foreground group-hover:text-foreground">
                <GripVertical className="h-5 w-5" />
            </button>

            {/* Content Area */}
            <div 
                className="flex items-center gap-2 min-w-0 cursor-pointer h-full py-2"
                onClick={() => handleProjectSelect(project.id)}
            >
                <File className='h-4 w-4 flex-shrink-0' />
                <div className='flex flex-col min-w-0'>
                    <span className='font-semibold truncate text-sm'>{project.title}</span>
                    <span className={cn('text-xs truncate text-muted-foreground', activeProjectId === project.id && 'text-sidebar-accent-foreground/80')}>
                        /{project.title.toLowerCase().replace(/\s/g, '-')}
                    </span>
                </div>
            </div>

            {/* Actions Menu */}
            <div className="pr-2">
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className='h-4 w-4' />
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
      <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex justify-between items-center mb-4">
              <div className='flex items-center gap-2'>
                  <h2 className="text-lg font-semibold text-sidebar-foreground">Módulos</h2>
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
        <div className="p-4 border-b border-sidebar-border">
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
