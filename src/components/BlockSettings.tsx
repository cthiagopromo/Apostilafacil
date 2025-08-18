'use client';

import useProjectStore from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Switch } from './ui/switch';
import type { QuizOption } from '@/lib/types';
import RichTextEditor from './RichTextEditor';
import { Textarea } from './ui/textarea';

const BlockSettings = () => {
    const { 
        activeProject, 
        activeBlockId, 
        updateBlockContent,
        addQuizOption,
        updateQuizOption,
        deleteQuizOption
    } = useProjectStore();

    const activeBlock = activeProject?.blocks?.find(b => b.id === activeBlockId);

    if (!activeBlock) {
        return (
            <div className="text-center text-muted-foreground mt-8">
                <p>Selecione um bloco para ver suas configurações.</p>
            </div>
        );
    }

    const renderSettings = () => {
        switch (activeBlock.type) {
            case 'text':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="text-content">Conteúdo do Texto</Label>
                        <RichTextEditor 
                            value={activeBlock.content.text || ''}
                            onChange={(value) => updateBlockContent(activeBlock.id, { text: value })}
                        />
                    </div>
                )
            case 'image':
                 return (
                    <div className='space-y-4'>
                        <div className="space-y-2">
                            <Label htmlFor="image-url">URL da Imagem</Label>
                            <Input 
                                id="image-url" 
                                value={activeBlock.content.url || ''} 
                                onChange={e => updateBlockContent(activeBlock.id, { url: e.target.value })} 
                                placeholder="https://placehold.co/600x400.png"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-alt">Texto Alternativo (Alt)</Label>
                            <Input 
                                id="image-alt" 
                                value={activeBlock.content.alt || ''} 
                                onChange={e => updateBlockContent(activeBlock.id, { alt: e.target.value })} 
                                placeholder="Descrição da imagem"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="image-caption">Legenda (Opcional)</Label>
                            <Input 
                                id="image-caption" 
                                value={activeBlock.content.caption || ''} 
                                onChange={e => updateBlockContent(activeBlock.id, { caption: e.target.value })} 
                                placeholder="Legenda da imagem"
                            />
                        </div>
                    </div>
                )
            case 'video':
                return (
                    <div className="space-y-2">
                        <Label htmlFor="video-url">URL do Vídeo (YouTube)</Label>
                        <Input 
                            id="video-url" 
                            value={activeBlock.content.videoUrl || ''} 
                            onChange={e => updateBlockContent(activeBlock.id, { videoUrl: e.target.value })} 
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>
                )
            case 'button':
                return (
                    <div className='space-y-4'>
                        <div className="space-y-2">
                            <Label htmlFor="button-text">Texto do Botão</Label>
                            <Input 
                                id="button-text" 
                                value={activeBlock.content.buttonText || ''} 
                                onChange={e => updateBlockContent(activeBlock.id, { buttonText: e.target.value })} 
                                placeholder="Ex: Saiba Mais"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="button-url">URL do Link</Label>
                            <Input 
                                id="button-url" 
                                value={activeBlock.content.buttonUrl || ''} 
                                onChange={e => updateBlockContent(activeBlock.id, { buttonUrl: e.target.value })} 
                                placeholder="https://exemplo.com"
                            />
                        </div>
                    </div>
                )
            case 'quiz':
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="quiz-question">Pergunta</Label>
                            <Textarea 
                                id="quiz-question"
                                value={activeBlock.content.question || ''}
                                onChange={(e) => updateBlockContent(activeBlock.id, { question: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <Label>Opções de Resposta</Label>
                            {activeBlock.content.options?.map((option: QuizOption, index: number) => (
                                <div key={option.id} className="p-3 bg-muted/50 rounded-md space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={option.text}
                                            onChange={(e) => updateQuizOption(activeBlock.id, option.id, { text: e.target.value })}
                                            className='flex-grow'
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => deleteQuizOption(activeBlock.id, option.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id={`is-correct-${option.id}`}
                                            checked={option.isCorrect}
                                            onCheckedChange={(checked) => updateQuizOption(activeBlock.id, option.id, { isCorrect: checked })}
                                        />
                                        <Label htmlFor={`is-correct-${option.id}`}>Resposta Correta</Label>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => addQuizOption(activeBlock.id)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Adicionar Opção
                            </Button>
                        </div>
                    </div>
                )
            default:
                return <p>Configurações para o bloco <strong>{activeBlock.type}</strong> ainda não implementadas.</p>
        }
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Configurações do Bloco</CardTitle>
                <CardDescription>
                    Tipo de Bloco: <span className="font-semibold text-primary">{activeBlock.type}</span>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {renderSettings()}
            </CardContent>
        </Card>
    )
}

export default BlockSettings;
