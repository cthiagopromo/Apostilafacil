
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useProjectStore from '@/lib/store';
import { Type, Image, Video, MousePointerClick, HelpCircle, Quote } from 'lucide-react';
import type { BlockType } from '@/lib/types';

interface AddBlockModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const blockOptions = [
  {
    type: 'text' as BlockType,
    title: 'Texto',
    description: 'Adicione texto formatado com negrito, itálico e listas',
    icon: <Type className="h-6 w-6 text-primary" />,
  },
  {
    type: 'image' as BlockType,
    title: 'Imagem',
    description: 'Insira imagens com legenda e texto alternativo',
    icon: <Image className="h-6 w-6 text-primary" />,
  },
    {
    type: 'quote' as BlockType,
    title: 'Citação',
    description: 'Destaque uma citação ou frase importante',
    icon: <Quote className="h-6 w-6 text-primary" />,
  },
  {
    type: 'video' as BlockType,
    title: 'Vídeo/Embed',
    description: 'Adicione vídeos do YouTube, Vimeo ou arquivos locais',
    icon: <Video className="h-6 w-6 text-primary" />,
  },
  {
    type: 'button' as BlockType,
    title: 'Botão',
    description: 'Crie botões com links para ações específicas',
    icon: <MousePointerClick className="h-6 w-6 text-primary" />,
  },
  {
    type: 'quiz' as BlockType,
    title: 'Quiz',
    description: 'Adicione perguntas interativas com múltiplas escolhas',
    icon: <HelpCircle className="h-6 w-6 text-primary" />,
  },
];

export function AddBlockModal({ isOpen, onOpenChange }: AddBlockModalProps) {
  const { getActiveProject, addBlock } = useProjectStore();

  const handleAddBlock = (type: BlockType) => {
    const activeProject = getActiveProject();
    if (activeProject) {
      addBlock(activeProject.id, type);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Adicionar Bloco</DialogTitle>
          <DialogDescription>
            Escolha o tipo de conteúdo que deseja adicionar
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {blockOptions.map((option) => (
            <Card
              key={option.type}
              className="cursor-pointer hover:shadow-lg hover:border-primary transition-all group"
              onClick={() => handleAddBlock(option.type)}
            >
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-full">{option.icon}</div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <Badge variant="secondary" className="capitalize">{option.type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
