'use client';

import { useState, useEffect } from 'react';
import useProjectStore from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, Download, Save, Settings, ChevronsLeft, ChevronsRight, FileJson } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { activeProject } = useProjectStore();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Supondo que a sidebar comece aberta

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
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Pré-visualizar
        </Button>
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Salvar
        </Button>
        <Button asChild>
          <Link href={`/preview/${activeProject?.id}`} target="_blank">
            <Download className="mr-2 h-4 w-4" />
            Exportar ZIP
          </Link>
        </Button>
      </div>
    </header>
  );
}
