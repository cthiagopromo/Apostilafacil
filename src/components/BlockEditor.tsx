'use client';

import type { Block, QuizOption } from '@/lib/types';
import useProjectStore from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { GripVertical, Trash2, ArrowUp, ArrowDown, Copy, PlusCircle, Save } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from './ui/switch';
import RichTextEditor from './RichTextEditor';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';

const BlockSettingsEditor = ({ block, onSave }: { block: Block, onSave: (e: React.MouseEvent) => void }) => {
    const { 
        updateBlockContent,
        addQuizOption,
        updateQuizOption,
        deleteQuizOption
    } = useProjectStore();

    const renderContent = () => {
        switch (block.type) {
            case 'text':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={`text-content-${block.id}`}>Conteúdo do Texto</Label>
                        <RichTextEditor 
                            value={block.content.text || ''}
                            onChange={(value) => updateBlockContent(block.id, { text: value })}
                        />
                    </div>
                )
            case 'image':
                 return (
                    <div className='space-y-4'>
                        <div className="space-y-2">
                            <Label htmlFor={`image-url-${block.id}`}>URL da Imagem</Label>
                            <Input 
                                id={`image-url-${block.id}`} 
                                value={block.content.url || ''} 
                                onChange={e => updateBlockContent(block.id, { url: e.target.value })} 
                                placeholder="https://placehold.co/600x400.png"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`image-alt-${block.id}`}>Texto Alternativo (Alt)</Label>
                            <Input 
                                id={`image-alt-${block.id}`} 
                                value={block.content.alt || ''} 
                                onChange={e => updateBlockContent(block.id, { alt: e.target.value })} 
                                placeholder="Descrição da imagem"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`image-caption-${block.id}`}>Legenda (Opcional)</Label>
                            <Input 
                                id={`image-caption-${block.id}`} 
                                value={block.content.caption || ''} 
                                onChange={e => updateBlockContent(block.id, { caption: e.target.value })} 
                                placeholder="Legenda da imagem"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`image-width-${block.id}`}>Largura da Imagem ({block.content.width || 100}%)</Label>
                            <Slider
                                id={`image-width-${block.id}`}
                                min={25}
                                max={100}
                                step={5}
                                value={[block.content.width || 100]}
                                onValueChange={(value) => updateBlockContent(block.id, { width: value[0] })}
                            />
                        </div>
                    </div>
                )
            case 'video':
                return (
                    <div className="space-y-2">
                        <Label htmlFor={`video-url-${block.id}`}>URL do Vídeo (YouTube)</Label>
                        <Input 
                            id={`video-url-${block.id}`} 
                            value={block.content.videoUrl || ''} 
                            onChange={e => updateBlockContent(block.id, { videoUrl: e.target.value })} 
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>
                )
            case 'button':
                return (
                    <div className='space-y-4'>
                        <div className="space-y-2">
                            <Label htmlFor={`button-text-${block.id}`}>Texto do Botão</Label>
                            <Input 
                                id={`button-text-${block.id}`} 
                                value={block.content.buttonText || ''} 
                                onChange={e => updateBlockContent(block.id, { buttonText: e.target.value })} 
                                placeholder="Ex: Saiba Mais"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`button-url-${block.id}`}>URL do Link</Label>
                            <Input 
                                id={`button-url-${block.id}`} 
                                value={block.content.buttonUrl || ''} 
                                onChange={e => updateBlockContent(block.id, { buttonUrl: e.target.value })} 
                                placeholder="https://exemplo.com"
                            />
                        </div>
                    </div>
                )
            case 'quiz':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor={`quiz-question-${block.id}`}>Pergunta</Label>
                            <Textarea 
                                id={`quiz-question-${block.id}`}
                                value={block.content.question || ''}
                                onChange={(e) => updateBlockContent(block.id, { question: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label>Opções de Resposta</Label>
                            {block.content.options?.map((option: QuizOption) => (
                                <div key={option.id} className="p-3 bg-secondary rounded-md space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={option.text}
                                            onChange={(e) => updateQuizOption(block.id, option.id, { text: e.target.value })}
                                            className='flex-grow'
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => deleteQuizOption(block.id, option.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id={`is-correct-${option.id}`}
                                            checked={option.isCorrect}
                                            onCheckedChange={(checked) => updateQuizOption(block.id, option.id, { isCorrect: checked })}
                                        />
                                        <Label htmlFor={`is-correct-${option.id}`}>Resposta Correta</Label>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => addQuizOption(block.id)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar Opção
                            </Button>
                        </div>
                    </div>
                )
            default:
                return <p>Configurações para o bloco <strong>{block.type}</strong> ainda não implementadas.</p>
        }
    }

    return (
        <Card onClick={(e) => e.stopPropagation()}>
            <CardHeader className="bg-muted/50 py-3 px-4 border-b">
                <h3 className="font-semibold text-md capitalize">{block.type}</h3>
            </CardHeader>
            <CardContent className="p-4">
                {renderContent()}
            </CardContent>
            <CardFooter className="bg-muted/50 py-3 px-4 border-t flex justify-end">
                <Button onClick={onSave}><Save className="mr-2 h-4 w-4" /> Salvar Bloco</Button>
            </CardFooter>
        </Card>
    )
}

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

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveBlockId(null);
    }
    
    return (
        <div className="relative group" onClick={() => setActiveBlockId(block.id)}>
            <div className={cn("transition-all mb-4", isActive ? 'border-primary ring-2 ring-primary/50 rounded-lg' : 'hover:border-primary/50 rounded-lg')}>
                 {isActive ? (
                    <BlockSettingsEditor block={block} onSave={handleSave} />
                 ) : (
                    <Card>
                        <CardContent className="p-4">
                            <BlockRenderer block={block} />
                        </CardContent>
                    </Card>
                 )}
            </div>
            
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
