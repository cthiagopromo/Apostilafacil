
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader } from 'lucide-react';

interface LoadingModalProps {
  isOpen: boolean;
  text?: string;
}

export function LoadingModal({ isOpen, text = "Carregando..." }: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-xs p-8 flex flex-col items-center gap-4" hideCloseButton>
        <DialogHeader className="flex flex-col items-center">
            <DialogTitle className="sr-only">Carregando</DialogTitle>
             <DialogDescription className="sr-only">Por favor, aguarde enquanto o conteúdo está sendo carregado.</DialogDescription>
            <Loader className="h-10 w-10 text-primary animate-spin" />
            <p className="text-center text-muted-foreground mt-4">{text}</p>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
