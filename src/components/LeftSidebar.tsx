'use client';

import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, File, MoreHorizontal, GripVertical } from 'lucide-react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

export default function LeftSidebar() {
  const { projects, activeProject, addProject, setActiveProject } = useProjectStore();
  const router = useRouter();
  
  const handleNewProject = () => {
    const newProject = addProject();
    router.push(`/editor/${newProject.id}`);
  };

  const handleProjectSelect = (projectId: string) => {
    setActiveProject(projectId);
    router.push(`/editor/${projectId}`);
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
                <Button 
                    key={project.id}
                    variant="ghost" 
                    className={cn(
                        "w-full h-auto justify-start items-start p-3",
                        activeProject?.id === project.id && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                    )}
                    onClick={() => handleProjectSelect(project.id)}
                >
                    <File className='mr-3 mt-1 flex-shrink-0' />
                    <div className='flex flex-col items-start'>
                        <span className='font-semibold'>{project.title}</span>
                        <span className='text-xs text-muted-foreground'>/{project.title.toLowerCase().replace(/\s/g, '-')}</span>
                    </div>
                    <MoreHorizontal className='ml-auto h-5 w-5' />
                </Button>
            ))}
        </div>
      </ScrollArea>
      <div className='p-3 border-t text-xs text-center text-muted-foreground'>
          <p>Última atualização: {new Date().toLocaleTimeString()}</p>
          <p className='text-green-600 font-semibold'>Salvo automaticamente</p>
      </div>
    </aside>
  );
}
