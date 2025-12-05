
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
import { cn } from '@/lib/utils';

interface AddBlockModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const blockOptions = [
  {
    type: 'text' as BlockType,
    title: 'Texto',
    description: 'Adicione texto formatado com negrito, itálico e listas',
    icon: <Type className="h-6 w-6 text-primary dark:text-card-foreground" />,
    badgeColors: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
  },
  {
    type: 'image' as BlockType,
    title: 'Imagem',
    description: 'Insira imagens com legenda e texto alternativo',
    icon: <Image className="h-6 w-6 text-primary dark:text-card-foreground" />,
    badgeColors: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
  },
    {
    type: 'quote' as BlockType,
    title: 'Citação',
    description: 'Destaque uma citação ou frase importante',
    icon: <Quote className="h-6 w-6 text-primary dark:text-card-foreground" />,
    badgeColors: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  },
  {
    type: 'video' as BlockType,
    title: 'Vídeo/Embed',
    description: 'Adicione vídeos do YouTube, Vimeo ou arquivos locais',
    icon: <Video className="h-6 w-6 text-primary dark:text-card-foreground" />,
    badgeColors: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
  },
  {
    type: 'button' as BlockType,
    title: 'Botão',
    description: 'Crie botões com links para ações específicas',
    icon: <MousePointerClick className="h-6 w-6 text-primary dark:text-card-foreground" />,
    badgeColors: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
  },
  {
    type: 'quiz' as BlockType,
    title: 'Quiz',
    description: 'Adicione perguntas interativas com múltiplas escolhas',
    icon: <HelpCircle className="h-6 w-6 text-primary dark:text-card-foreground" />,
    badgeColors: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
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
                <div className="p-2 bg-muted dark:bg-primary/10 rounded-full">{option.icon}</div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <Badge variant="outline" className={cn("capitalize", option.badgeColors)}>{option.type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
