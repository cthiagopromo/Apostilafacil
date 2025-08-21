
'use client';

import type { Block, QuizOption, VideoType } from '@/lib/types';
import useProjectStore from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { GripVertical, Trash2, ArrowUp, ArrowDown, Copy, PlusCircle, Save, Upload } from 'lucide-react';
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
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import RichTextEditor from './RichTextEditor';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const BlockSettingsEditor = ({ block, onSave }: { block: Block, onSave: (e: React.MouseEvent) => void }) => {
    const { 
        updateBlockContent,
        addQuizOption,
        updateQuizOption,
        deleteQuizOption
    } = useProjectStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast({
                variant: 'destructive',
                title: 'Imagem muito grande',
                description: 'Por favor, escolha uma imagem com menos de 2MB.',
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const base64Url = loadEvent.target?.result as string;
            updateBlockContent(block.id, { url: base64Url });
            toast({
                title: 'Upload concluído',
                description: 'A imagem foi incorporada com sucesso.',
            });
        };
        reader.onerror = () => {
             toast({
                variant: 'destructive',
                title: 'Erro no Upload',
                description: 'Não foi possível ler o arquivo da imagem.',
            });
        }
        reader.readAsDataURL(file);
    };

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
            case 'quote':
                 return (
                    <div className="space-y-2">
                        <Label htmlFor={`quote-content-${block.id}`}>Texto da Citação</Label>
                        <Textarea 
                            id={`quote-content-${block.id}`}
                            value={block.content.text || ''}
                            onChange={(e) => updateBlockContent(block.id, { text: e.target.value })}
                            rows={5}
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
                                placeholder="https://exemplo.com/imagem.png ou faça upload"
                            />
                        </div>

                         <div className="space-y-2">
                             <Label>Fazer Upload</Label>
                             <Button variant="outline" className='w-full' onClick={() => fileInputRef.current?.click()}>
                                 <Upload className='mr-2' />
                                 Escolher Imagem (Max 2MB)
                             </Button>
                             <Input 
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                onChange={handleImageUpload}
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
                 const videoType = block.content.videoType || 'youtube';
                 return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tipo de Vídeo</Label>
                            <Select 
                                value={videoType} 
                                onValueChange={(value: VideoType) => updateBlockContent(block.id, { videoType: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo de vídeo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="youtube">YouTube</SelectItem>
                                    <SelectItem value="vimeo">Vimeo</SelectItem>
                                    <SelectItem value="cloudflare">Cloudflare</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {videoType === 'youtube' && (
                            <div className="space-y-2">
                                <Label htmlFor={`video-url-${block.id}`}>URL do Vídeo no YouTube</Label>
                                <Input 
                                    id={`video-url-${block.id}`} 
                                    value={block.content.videoUrl || ''} 
                                    onChange={e => updateBlockContent(block.id, { videoUrl: e.target.value })} 
                                    placeholder="https://www.youtube.com/watch?v=..."
                                />
                            </div>
                        )}

                        {videoType === 'vimeo' && (
                            <div className="space-y-2">
                                <Label htmlFor={`video-vimeo-${block.id}`}>ID do Vídeo no Vimeo</Label>
                                <Input 
                                    id={`video-vimeo-${block.id}`} 
                                    value={block.content.vimeoVideoId || ''} 
                                    onChange={e => updateBlockContent(block.id, { vimeoVideoId: e.target.value })} 
                                    placeholder="Ex: 123456789"
                                />
                            </div>
                        )}
                        
                        {videoType === 'cloudflare' && (
                             <div className="space-y-2">
                                <Label htmlFor={`video-cloudflare-${block.id}`}>ID do Vídeo no Cloudflare</Label>
                                <Input 
                                    id={`video-cloudflare-${block.id}`} 
                                    value={block.content.cloudflareVideoId || ''} 
                                    onChange={e => updateBlockContent(block.id, { cloudflareVideoId: e.target.value })} 
                                    placeholder="Ex: 8d6s5f4g..."
                                />
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor={`video-title-${block.id}`}>Título do Vídeo</Label>
                            <Input 
                                id={`video-title-${block.id}`} 
                                value={block.content.videoTitle || ''} 
                                onChange={e => updateBlockContent(block.id, { videoTitle: e.target.value })} 
                                placeholder="Digite o título do vídeo..."
                            />
                        </div>

                        <div className='flex items-center justify-between'>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`autoplay-${block.id}`}
                                    checked={block.content.autoplay}
                                    onCheckedChange={(checked) => updateBlockContent(block.id, { autoplay: checked })}
                                />
                                <Label htmlFor={`autoplay-${block.id}`}>Reprodução Automática</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id={`controls-${block.id}`}
                                    checked={block.content.showControls}
                                    onCheckedChange={(checked) => updateBlockContent(block.id, { showControls: checked })}
                                />
                                <Label htmlFor={`controls-${block.id}`}>Exibir Controles</Label>
                            </div>
                        </div>

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
    const { activeProject, activeBlockId, setActiveBlockId, deleteBlock, duplicateBlock } = useProjectStore();
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isActive = block.id === activeBlockId;

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
        <div ref={setNodeRef} style={style} className="relative group" onClick={() => setActiveBlockId(block.id)}>
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-grab" {...attributes} {...listeners}>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
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

    