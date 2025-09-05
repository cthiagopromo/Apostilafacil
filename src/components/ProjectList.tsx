
'use client';

import { useState, useRef } from 'react';
import useProjectStore from '@/lib/store';
import {
  Card,
  CardContent,
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
import { ArrowRight, PlusCircle, Trash2, FileText, Loader, Upload } from 'lucide-react';
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
import { LoadingModal } from './LoadingModal';
import { useToast } from '@/hooks/use-toast';
import type { HandbookData } from '@/lib/types';

export function ProjectList() {
  const { handbookTitle, handbookUpdatedAt, projects, createNewHandbook, loadHandbookData } = useProjectStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleNavigation = (path: string) => {
    setIsLoading(true);
    setTimeout(() => {
      router.push(path);
    }, 100);
  };
  
  const handleNewHandbook = () => {
    setIsLoading(true);
     setTimeout(() => {
        const newActiveProject = createNewHandbook();
        if (newActiveProject) {
            router.push(`/editor/${newActiveProject.id}`);
        } else {
            setIsLoading(false);
        }
    }, 100);
  };

  const handleDeleteHandbook = () => {
    handleNewHandbook();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const htmlContent = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const dataElement = doc.getElementById('handbook-data');
        
        if (!dataElement || !dataElement.textContent) {
          throw new Error('Arquivo HTML inválido ou não contém dados da apostila.');
        }

        const importedData: HandbookData = JSON.parse(dataElement.textContent);
        
        // Aguarda a conclusão do carregamento dos dados no estado
        await loadHandbookData(importedData);
        
        const firstProject = useProjectStore.getState().projects[0];

        toast({ title: 'Apostila importada com sucesso!' });

        if (firstProject) {
          // A navegação ocorre após o estado ser atualizado
          router.push(`/editor/${firstProject.id}`);
        } else {
          // Fallback, caso a apostila importada não tenha projetos
          router.push('/');
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Falha ao importar arquivo:", error);
        toast({
          variant: 'destructive',
          title: 'Erro na Importação',
          description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.',
        });
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'Erro de Leitura',
        description: 'Não foi possível ler o arquivo selecionado.',
      });
      setIsLoading(false);
    };

    reader.readAsText(file);
    // Reset file input to allow re-uploading the same file
    if (event.target) {
        event.target.value = ''; 
    }
  };

  const totalBlocks = projects.reduce((acc, proj) => acc + (proj.blocks?.length || 0), 0);
  const firstProjectId = projects.length > 0 ? projects[0].id : null;

  if (isLoading) {
    return <LoadingModal isOpen={true} text="Carregando apostila..." />;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center">
        <div className="border-2 border-dashed rounded-xl p-12 bg-card">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="text-2xl font-medium text-foreground mt-4">
            Nenhuma apostila encontrada.
          </h3>
          <p className="text-muted-foreground my-4">
            Comece do zero ou importe uma apostila existente para editar.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleNewHandbook} size="lg">
              <PlusCircle className="mr-2" />
              Criar Nova Apostila
            </Button>
             <Button onClick={handleImportClick} size="lg" variant="outline">
              <Upload className="mr-2" />
              Importar Apostila
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".html"
              className="hidden"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-center gap-4">
        <Button onClick={handleNewHandbook} size="lg" disabled={isLoading}>
          {isLoading ? <Loader className="mr-2 animate-spin" /> : <PlusCircle className="mr-2" />}
          {isLoading ? 'Criando...' : 'Nova Apostila'}
        </Button>
        <Button onClick={handleImportClick} size="lg" variant="outline">
          <Upload className="mr-2" />
          Importar Apostila
        </Button>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".html"
            className="hidden"
        />
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!firstProjectId || isLoading}
                      onClick={() => firstProjectId && handleNavigation(`/editor/${firstProjectId}`)}
                    >
                      Editar <ArrowRight className="ml-2 h-4 w-4" />
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
                            Esta ação não pode ser desfeita. A apostila atual será substituída por uma nova em branco.
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
