'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useProject } from '@/context/ProjectContext';
import ModuleList from './ModuleList';
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
  const { addModule } = useProject();
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddModule = () => {
    if (newModuleTitle.trim()) {
      addModule(newModuleTitle.trim());
      setNewModuleTitle('');
      setIsDialogOpen(false);
    }
  };

  return (
    <aside className="w-72 bg-card/60 border-r flex flex-col">
      <div className="p-2 border-b flex items-center justify-between">
        <h2 className="text-md font-semibold px-2">Módulos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Módulo</DialogTitle>
              <DialogDescription>
                Digite um título para o seu novo módulo.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Ex: A Mitocôndria"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddModule()}
              autoFocus
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleAddModule}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ModuleList />
      </div>
    </aside>
  );
}
