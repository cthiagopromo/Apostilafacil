// This is a new file
'use client';

import type { Block } from '@/lib/types';
import useProjectStore from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { GripVertical, Trash2, ArrowUp, ArrowDown, Copy } from 'lucide-react';
import { Card, CardContent } from './ui/card';
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
} from "@/components/ui/alert-dialog"

interface BlockEditorProps {
    block: Block;
}

const BlockRenderer = ({ block }: { block: Block }) => {
    switch(block.type) {
        case 'text':
            return <div dangerouslySetInnerHTML={{ __html: block.content.text || '' }} className="prose dark:prose-invert max-w-none" />;
        case 'image':
            return (
                <div className='flex justify-center'>
                    <img src={block.content.url || 'https://placehold.co/600x400.png'} alt={block.content.alt || 'Placeholder image'} className="rounded-md shadow-md max-w-full h-auto" />
                </div>
            )
        default:
            return <p className="text-muted-foreground">Bloco <strong>{block.type}</strong> ainda não é renderizado.</p>
    }
}


const BlockEditor = ({ block }: BlockEditorProps) => {
    const { activeProject, activeBlockId, setActiveBlockId, deleteBlock, moveBlock, duplicateBlock } = useProjectStore();

    const isActive = block.id === activeBlockId;

    const handleAction = (action: (projectId: string, blockId: string) => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeProject) {
            action(activeProject.id, block.id);
        }
    }
    
    return (
        <div className="relative group mb-4" onClick={() => setActiveBlockId(block.id)}>
            <Card className={cn("transition-all", isActive ? 'border-primary ring-2 ring-primary/50' : 'hover:border-primary/50')}>
                <CardContent className="p-4">
                    <BlockRenderer block={block} />
                </CardContent>
            </Card>

             <div className="absolute top-1/2 -translate-y-1/2 -left-12 h-8 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center bg-card p-1 rounded-md border shadow-sm">
                    <Button variant="ghost" size="icon" className="h-6 w-6 cursor-grab" onMouseDown={e => e.preventDefault()}>
                        <GripVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -right-14 h-8 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex flex-col items-center bg-card p-1 rounded-md border shadow-sm space-y-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAction( (pId, bId) => moveBlock(pId, bId, 'up'))}>
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAction( (pId, bId) => moveBlock(pId, bId, 'down'))}>
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            <div className="absolute -top-3 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center bg-card p-1 rounded-md border shadow-sm">
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAction(duplicateBlock)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                             <AlertDialogHeader>
                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isto irá deletar o bloco permanentemente.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleAction(deleteBlock)}>Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    )
}

export default BlockEditor;
