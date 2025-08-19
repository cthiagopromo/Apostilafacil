
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
  const { handbookTitle, handbookUpdatedAt, projects, createNewHandbook, activeProject } = useProjectStore();
  const router = useRouter();

  const handleNewHandbook = () => {
    createNewHandbook();
    if(activeProject) {
        router.push(`/editor/${activeProject.id}`);
    }
  };

  const handleDeleteHandbook = () => {
    // For now, we just create a new one, effectively deleting the old one from view
    // In a real multi-document app, you'd have a proper delete mechanism.
    handleNewHandbook();
  };

  const totalBlocks = projects.reduce((acc, proj) => acc + (proj.blocks?.length || 0), 0);
  const firstProjectId = projects.length > 0 ? projects[0].id : null;


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
          <Button onClick={handleNewHandbook} size="lg">
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
        <Button onClick={handleNewHandbook} size="lg">
          <PlusCircle className="mr-2" />
          Nova Apostila
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título da Apostila</TableHead>
                <TableHead className="text-center w-[120px]">Módulos</TableHead>
                <TableHead className="text-center w-[120px]">Blocos</TableHead>
                <TableHead className="w-[200px]">Última Atualização</TableHead>
                <TableHead className="text-right w-[200px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{handbookTitle}</TableCell>
                   <TableCell className="text-center">
                    {projects.length}
                  </TableCell>
                  <TableCell className="text-center">
                    {totalBlocks}
                  </TableCell>
                  <TableCell>
                    {format(new Date(handbookUpdatedAt), "dd/MM/yyyy 'às' HH:mm")}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button asChild variant="outline" size="sm" disabled={!firstProjectId}>
                      {firstProjectId ? (
                        <Link href={`/editor/${firstProjectId}`}>
                          Editar <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      ) : (
                        <span>Editar <ArrowRight className="ml-2 h-4 w-4" /></span>
                      )}
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
                            apostila e todos os seus módulos permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteHandbook}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Excluir e Começar de Novo
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
