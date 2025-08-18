'use client';

import { useState } from 'react';
import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Download, Save, Settings, ChevronsLeft, ChevronsRight, FileJson, Loader } from 'lucide-react';
import Link from 'next/link';
import { exportToZip } from '@/lib/export';
import { toast } from '@/hooks/use-toast';

export default function Header() {
  const { activeProject, projects } = useProjectStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!projects || projects.length === 0) {
        toast({
            variant: "destructive",
            title: "Nenhum projeto para exportar",
            description: "Adicione pelo menos um módulo antes de exportar.",
        });
        return;
    };

    setIsExporting(true);
    try {
      // Pass all projects to the export function
      await exportToZip(projects);
      toast({
        title: "Exportação Concluída",
        description: "Seu projeto foi exportado como um arquivo ZIP.",
      });
    } catch (error) {
      console.error("Failed to export project", error);
      toast({
        variant: "destructive",
        title: "Erro na Exportação",
        description: "Não foi possível exportar o projeto. Tente novamente.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="flex items-center justify-between p-2 h-16 bg-card border-b">
      <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold leading-none">Editor de Apostilas</span>
              <span className="text-xs text-muted-foreground">Templates Prontos</span>
            </div>
          </div>
          <div className="w-px h-8 bg-border"></div>
          {activeProject && (
            <div className='flex items-center gap-3'>
              <h1 className="text-lg font-semibold">
                {activeProject.title}
              </h1>
              <Badge variant="secondary">1 módulo</Badge>
              <Badge variant="outline">Salvo</Badge>
            </div>
          )}
      </div>

      <div className="flex-1 flex justify-center items-center gap-2">
         {/* Espaço central para futuros botões de edição de módulo */}
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/preview/${activeProject?.id}`} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            Pré-visualizar
          </Link>
        </Button>
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Salvar
        </Button>
        <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
                <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                </>
            ) : (
                <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar ZIP
                </>
            )}
        </Button>
      </div>
    </header>
  );
}
