'use client';

import useProjectStore from '@/lib/store';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Check, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

const colorOptions = [
  { name: 'Azul INCI', hsl: '235 81% 30%'},
  { name: 'Laranja', hsl: '32 100% 47%'},
  { name: 'Roxo', hsl: '262 84% 53%'},
  { name: 'Rosa', hsl: '322 84% 53%'},
];


export default function HandbookSettings() {
  const { 
      handbookTitle,
      handbookDescription,
      handbookTheme,
      updateHandbookTitle,
      updateHandbookDescription,
      updateHandbookTheme
  } = useProjectStore();
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const backCoverFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleColorSelect = (hsl: string) => {
    updateHandbookTheme({ colorPrimary: hsl });
  }

  const handleImageUpload = (file: File, type: 'cover' | 'backCover') => {
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
          if (type === 'cover') {
            updateHandbookTheme({ cover: base64Url });
            toast({
                title: 'Upload da capa concluído',
                description: 'A imagem de capa foi incorporada com sucesso.',
            });
          } else {
            updateHandbookTheme({ backCover: base64Url });
            toast({
                title: 'Upload da contracapa concluído',
                description: 'A imagem de contracapa foi incorporada com sucesso.',
            });
          }
      };
      reader.onerror = () => {
           toast({
              variant: 'destructive',
              title: 'Erro no Upload',
              description: 'Não foi possível ler o arquivo da imagem.',
          });
      }
      reader.readAsDataURL(file);
  }
  
  const removeCover = () => {
    updateHandbookTheme({ cover: undefined });
  }

  const removeBackCover = () => {
    updateHandbookTheme({ backCover: undefined });
  }

  const currentColor = handbookTheme?.colorPrimary || '235 81% 30%';


  return (
    <div className="space-y-6">
       <div className="space-y-2">
        <Label htmlFor="handbook-title">Título da Apostila</Label>
        <Input
          id="handbook-title"
          value={handbookTitle}
          onChange={(e) => updateHandbookTitle(e.target.value)}
          placeholder="Ex: Guia Completo de..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="handbook-description">Descrição da Apostila</Label>
        <Textarea
          id="handbook-description"
          value={handbookDescription}
          onChange={(e) => updateHandbookDescription(e.target.value)}
          placeholder="Uma breve descrição sobre a apostila."
          rows={3}
          maxLength={260}
        />
        <p className="text-xs text-muted-foreground text-right">{handbookDescription.length}/260</p>
      </div>
       <div className="space-y-2">
        <Label>Cor Principal</Label>
        <div className="flex items-center gap-3 pt-1">
          {colorOptions.map((color) => (
            <button
              key={color.name}
              title={color.name}
              onClick={() => handleColorSelect(color.hsl)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center",
                `bg-[hsl(${color.hsl})]`,
                currentColor === color.hsl ? 'border-ring ring-2 ring-offset-2 ring-ring' : 'border-transparent'
              )}
            >
              {currentColor === color.hsl && (
                <Check className="w-5 h-5 text-primary-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Imagem de Capa</Label>
        {handbookTheme.cover ? (
            <div className='relative group'>
                <img src={handbookTheme.cover} alt="Pré-visualização da capa" className='rounded-md border' />
                <Button onClick={removeCover} variant="destructive" size="icon" className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <X />
                </Button>
            </div>
        ) : (
            <>
              <Button variant="outline" className='w-full' onClick={() => coverFileInputRef.current?.click()}>
                  <Upload className='mr-2' />
                  Enviar Imagem (Max 2MB)
              </Button>
              <Input 
                  type="file"
                  ref={coverFileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'cover')}
              />
            </>
        )}
      </div>
       <div className="space-y-2">
        <Label>Imagem de Contracapa</Label>
        {handbookTheme.backCover ? (
            <div className='relative group'>
                <img src={handbookTheme.backCover} alt="Pré-visualização da contracapa" className='rounded-md border' />
                <Button onClick={removeBackCover} variant="destructive" size="icon" className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <X />
                </Button>
            </div>
        ) : (
            <>
              <Button variant="outline" className='w-full' onClick={() => backCoverFileInputRef.current?.click()}>
                  <Upload className='mr-2' />
                  Enviar Imagem (Max 2MB)
              </Button>
              <Input 
                  type="file"
                  ref={backCoverFileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'backCover')}
              />
            </>
        )}
      </div>
    </div>
  );
}
