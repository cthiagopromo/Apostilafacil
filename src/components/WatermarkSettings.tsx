'use client';

import useProjectStore from '@/lib/store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WatermarkStyle } from '@/lib/types';

export default function WatermarkSettings() {
  const { handbookTheme, updateHandbookTheme } = useProjectStore();
  
  const watermark = handbookTheme.watermark || {
    enabled: false,
    text: 'CONFIDENCIAL',
    opacity: 0.1,
    fontSize: 60,
    color: '#000000',
    rotate: -45,
    style: 'sidebar'
  };

  const updateWatermark = (updates: Partial<typeof watermark>) => {
    updateHandbookTheme({
      watermark: { ...watermark, ...updates }
    });
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="watermark-enabled" className="cursor-pointer">Ativar Marca D'água</Label>
        <Switch
          id="watermark-enabled"
          checked={watermark.enabled}
          onCheckedChange={(checked) => updateWatermark({ enabled: checked })}
        />
      </div>

      {watermark.enabled && (
        <>
          <div className="space-y-2">
            <Label>Estilo</Label>
            <Select 
              value={watermark.style} 
              onValueChange={(val) => updateWatermark({ style: val as WatermarkStyle })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sidebar">Barra Lateral</SelectItem>
                <SelectItem value="center">Centralizado</SelectItem>
                <SelectItem value="ghost">Outline</SelectItem>
                <SelectItem value="classic">Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="watermark-text">Texto</Label>
            <Input
              id="watermark-text"
              value={watermark.text}
              onChange={(e) => updateWatermark({ text: e.target.value })}
              placeholder="Ex: CONFIDENCIAL"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Opacidade</Label>
              <span className="text-xs text-muted-foreground">{Math.round(watermark.opacity * 100)}%</span>
            </div>
            <Slider
              value={[watermark.opacity * 100]}
              min={1}
              max={50}
              step={1}
              onValueChange={(vals) => updateWatermark({ opacity: vals[0] / 100 })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Tamanho da Fonte</Label>
              <span className="text-xs text-muted-foreground">{watermark.fontSize}px</span>
            </div>
            <Slider
              value={[watermark.fontSize]}
              min={20}
              max={150}
              step={5}
              onValueChange={(vals) => updateWatermark({ fontSize: vals[0] })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="watermark-color">Cor</Label>
            <div className="flex gap-2">
                <input
                  id="watermark-color"
                  type="color"
                  value={watermark.color}
                  onChange={(e) => updateWatermark({ color: e.target.value })}
                  className="w-12 h-10 p-1 bg-transparent border rounded cursor-pointer"
                />
                <Input 
                   value={watermark.color}
                   onChange={(e) => updateWatermark({ color: e.target.value })}
                   className="flex-1"
                />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
