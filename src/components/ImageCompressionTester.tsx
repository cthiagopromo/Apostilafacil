'use client';

import { useState } from 'react';
import { compressImage, compressImageToSize, calculateImageSavings } from '@/lib/image-compressor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Upload, Download, Image as ImageIcon } from 'lucide-react';

export function ImageCompressionTester() {
  const [originalImage, setOriginalImage] = useState<string>('');
  const [compressedImage, setCompressedImage] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [quality, setQuality] = useState(0.75);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [format, setFormat] = useState<'avif' | 'webp' | 'jpeg'>('avif');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setOriginalImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCompress = async () => {
    if (!originalImage) return;
    
    setIsCompressing(true);
    try {
      const result = await compressImage(originalImage, {
        maxWidth,
        maxHeight: maxWidth, // Manter aspect ratio
        quality,
        format,
      });
      setCompressedImage(result);
    } catch (error) {
      console.error('Erro ao comprimir:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCompressToSize = async () => {
    if (!originalImage) return;
    
    setIsCompressing(true);
    try {
      const result = await compressImageToSize(originalImage, 500 * 1024, maxWidth, maxWidth);
      setCompressedImage(result);
    } catch (error) {
      console.error('Erro ao comprimir:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  const getSavings = () => {
    if (!originalImage || !compressedImage) return null;
    return calculateImageSavings(originalImage, compressedImage);
  };

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    link.click();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const savings = getSavings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Compressão de Imagens</CardTitle>
        <CardDescription>
          Teste diferentes configurações de compressão para suas imagens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload */}
        <div className="space-y-2">
          <Label>1. Selecione uma imagem</Label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Escolher Imagem
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {originalImage && (
              <span className="text-sm text-muted-foreground">
                {formatBytes(Math.ceil((originalImage.length * 3) / 4))}
              </span>
            )}
          </div>
        </div>

        {/* Configurações */}
        {originalImage && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Qualidade: {quality * 100}%</Label>
                <Slider
                  value={[quality * 100]}
                  min={50}
                  max={100}
                  step={5}
                  onValueChange={(v) => setQuality(v[0] / 100)}
                />
              </div>
              <div className="space-y-2">
                <Label>Largura Máxima: {maxWidth}px</Label>
                <Slider
                  value={[maxWidth]}
                  min={800}
                  max={3000}
                  step={100}
                  onValueChange={(v) => setMaxWidth(v[0])}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Formato</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avif">AVIF (Melhor compressão)</SelectItem>
                  <SelectItem value="webp">WebP (Mais compatível)</SelectItem>
                  <SelectItem value="jpeg">JPEG (Universal)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              <Button onClick={handleCompress} disabled={isCompressing}>
                <ImageIcon className="mr-2 h-4 w-4" />
                {isCompressing ? 'Comprimindo...' : 'Comprimir'}
              </Button>
              <Button onClick={handleCompressToSize} disabled={isCompressing} variant="outline">
                Comprimir para 500KB
              </Button>
            </div>

            {/* Resultados */}
            {compressedImage && savings && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Resultados:</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Original</div>
                      <div className="font-mono">{formatBytes(savings.originalBytes)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Comprimido</div>
                      <div className="font-mono">{formatBytes(savings.compressedBytes)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Economia</div>
                      <div className="font-mono text-green-600">
                        {formatBytes(savings.savingsBytes)} ({savings.savingsPercent.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Original</Label>
                    <img
                      src={originalImage}
                      alt="Original"
                      className="w-full rounded-lg border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => downloadImage(originalImage, 'original.png')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar Original
                    </Button>
                  </div>
                  <div>
                    <Label>Comprimido</Label>
                    <img
                      src={compressedImage}
                      alt="Comprimido"
                      className="w-full rounded-lg border"
                    />
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => downloadImage(compressedImage, `compressed.${format}`)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Baixar Comprimido
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
