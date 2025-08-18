
'use client';

import useProjectStore from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export function ProjectList() {
  const { projects, addProject, deleteProject } = useProjectStore();
  const router = useRouter();
  
  const handleNewProject = () => {
    const newProject = addProject();
    router.push(`/editor/${newProject.id}`);
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-end">
         <Button onClick={handleNewProject} size="lg">
           <PlusCircle className="mr-2" />
           Novo Projeto
         </Button>
       </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.blocks?.length || 0} blocos</CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/editor/${project.id}`}>
                  Editar <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isto irá deletar a apostila permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteProject(project.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
         {projects.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-medium text-muted-foreground">Nenhum projeto encontrado.</h3>
            <p className="text-muted-foreground mb-4">Comece criando um novo projeto.</p>
            <Button onClick={handleNewProject}>
              <PlusCircle className="mr-2" />
              Criar meu primeiro projeto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
