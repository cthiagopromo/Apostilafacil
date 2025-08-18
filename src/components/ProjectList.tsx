
'use client';

import useProjectStore from '@/lib/store';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, PlusCircle, Trash2, FileText } from 'lucide-react';
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
import { format } from 'date-fns';

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
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="text-2xl font-medium text-foreground mt-4">
            Nenhuma apostila encontrada.
          </h3>
          <p className="text-muted-foreground my-4">
            Comece a criar sua primeira apostila interativa agora mesmo.
          </p>
          <Button onClick={handleNewProject} size="lg">
            <PlusCircle className="mr-2" />
            Criar minha primeira apostila
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Button onClick={handleNewProject} size="lg">
          <PlusCircle className="mr-2" />
          Nova Apostila
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="text-center w-[120px]">Blocos</TableHead>
                <TableHead className="w-[200px]">Última Atualização</TableHead>
                <TableHead className="text-right w-[200px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell className="text-center">
                    {project.blocks?.length || 0}
                  </TableCell>
                  <TableCell>
                    {format(new Date(project.updatedAt), "dd/MM/yyyy 'às' HH:mm")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/editor/${project.id}`}>
                        Editar <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon-sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isto irá deletar a
                            apostila permanentemente.
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
