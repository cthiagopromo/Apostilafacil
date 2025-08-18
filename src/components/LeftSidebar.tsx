'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import useProjectStore from '@/lib/store';
import PageList from './PageList';
import { Input } from './ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"


export default function LeftSidebar() {
  const { addPage, activeProject } = useProjectStore();
  const [newPageTitle, setNewPageTitle] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddPage = () => {
    if (newPageTitle.trim() && activeProject) {
      // Para simplificar, adicionaremos um template padrão.
      // Uma implementação mais robusta permitiria ao usuário escolher o template.
      addPage(activeProject.id, newPageTitle.trim(), 'text_image');
      setNewPageTitle('');
      setIsDialogOpen(false);
    }
  };

  return (
    <aside className="w-72 bg-card/60 border-r flex flex-col">
      <div className="p-2 border-b flex items-center justify-between">
        <h2 className="text-md font-semibold px-2">Páginas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!activeProject}>
              <PlusCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Página</DialogTitle>
              <DialogDescription>
                Digite um título para a sua nova página.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Ex: A Membrana Plasmática"
              value={newPageTitle}
              onChange={(e) => setNewPageTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
              autoFocus
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleAddPage}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 overflow-y-auto">
        <PageList />
      </div>
    </aside>
  );
}
