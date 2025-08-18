
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

  if (projects.length === 0) {
    return (
      <div className="text-center">
        <div className="border-2 border-dashed rounded-xl p-12 bg-card">
          <h3 className="text-2xl font-medium text-foreground">Nenhum projeto encontrado.</h3>
          <p className="text-muted-foreground my-4">Comece a criar sua primeira apostila interativa agora mesmo.</p>
          <Button onClick={handleNewProject} size="lg">
            <PlusCircle className="mr-2" />
            Criar meu primeiro projeto
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <div className="flex justify-center">
         <Button onClick={handleNewProject} size="lg">
           <PlusCircle className="mr-2" />
           Novo Projeto
         </Button>
       </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow flex flex-col bg-card text-left">
            <CardHeader className="flex-grow">
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <CardDescription>{project.blocks?.length || 0} blocos</CardDescription>
            </CardHeader>
            <CardFooter className="flex gap-2 bg-muted/50 p-4 rounded-b-lg">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/editor/${project.id}`}>
                  Editar <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
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
      </div>
    </div>
  );
}
