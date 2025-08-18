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
import BlockRenderer from './BlockRenderer';

interface BlockEditorProps {
    block: Block;
    index: number;
}

const BlockEditor = ({ block, index }: BlockEditorProps) => {
    const { activeProject, activeBlockId, setActiveBlockId, deleteBlock, moveBlock, duplicateBlock } = useProjectStore();

    const isActive = block.id === activeBlockId;
    const totalBlocks = activeProject?.blocks?.length ?? 0;

    const handleAction = (action: (projectId: string, blockId: string) => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeProject) {
            action(activeProject.id, block.id);
        }
    }
    
    return (
        <div className="relative group" onClick={() => setActiveBlockId(block.id)}>
            <Card className={cn("transition-all mb-4", isActive ? 'border-primary ring-2 ring-primary/50' : 'hover:border-primary/50')}>
                <CardContent className="p-4">
                    <BlockRenderer block={block} />
                </CardContent>
            </Card>
            
            <div className="absolute top-2 right-2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center bg-card p-1 rounded-md border shadow-sm">
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-grab" onMouseDown={e => e.preventDefault()}>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAction( (pId, bId) => moveBlock(pId, bId, 'up'))} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAction( (pId, bId) => moveBlock(pId, bId, 'down'))} disabled={index === totalBlocks - 1}>
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAction(duplicateBlock)}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={(e) => e.stopPropagation()}>
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
