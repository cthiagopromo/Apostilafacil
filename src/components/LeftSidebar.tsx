
'use client';

import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, File, MoreHorizontal, Trash2 } from 'lucide-react';
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

export default function LeftSidebar() {
  const { projects, activeProject, addProject, setActiveProject, deleteProject } = useProjectStore();
  const router = useRouter();
  
  const handleNewProject = () => {
    const newProject = addProject();
    router.push(`/editor/${newProject.id}`);
  };

  const handleProjectSelect = (projectId: string) => {
    setActiveProject(projectId);
    router.push(`/editor/${projectId}`);
  }

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    const nextProject = deleteProject(projectId);
    if (nextProject) {
      router.push(`/editor/${nextProject.id}`);
    } else {
      router.push('/');
    }
  }

  return (
    <aside className="w-72 bg-card border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
            <div className='flex items-center gap-2'>
                <h2 className="text-lg font-semibold">Módulos</h2>
                <Badge variant="secondary">{projects.length}</Badge>
            </div>
        </div>
        <Button onClick={handleNewProject} className='w-full'>
           <PlusCircle className="mr-2" />
           Novo Módulo
        </Button>
      </div>
      <div className="p-4 border-b">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Filtrar módulos..." className="pl-9" />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className='p-2 space-y-1'>
            {projects.map((project) => (
              <div key={project.id} className={cn(
                  "w-full h-auto justify-start items-start p-3 rounded-md flex",
                  activeProject?.id === project.id ? "bg-primary/10 text-primary" : "hover:bg-accent"
              )}>
                <Button 
                    variant="ghost" 
                    className="flex-grow h-auto p-0 justify-start items-start hover:bg-transparent"
                    onClick={() => handleProjectSelect(project.id)}
                >
                    <File className='mr-3 mt-1 flex-shrink-0' />
                    <div className='flex flex-col items-start text-left'>
                        <span className='font-semibold'>{project.title}</span>
                        <span className={cn('text-xs', activeProject?.id === project.id ? 'text-primary/80' : 'text-muted-foreground')}>/{project.title.toLowerCase().replace(/\s/g, '-')}</span>
                    </div>
                </Button>
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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
                      <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(e) => handleDeleteProject(e, project.id)}
                      >
                        Deletar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
        </div>
      </ScrollArea>
      <div className='p-3 border-t text-xs text-center text-muted-foreground'>
          <p>Última atualização: {new Date().toLocaleTimeString()}</p>
          <p className='text-primary font-semibold'>Salvo automaticamente</p>
      </div>
    </aside>
  );
}
