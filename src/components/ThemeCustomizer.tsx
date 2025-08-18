'use client';

import useProjectStore from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ThemeCustomizer() {
  const { activeProject } = useProjectStore();

  const handleThemeChange = (key: string, value: string) => {
    // Lógica para atualizar o tema no Zustand
  };

  if (!activeProject) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalização do Tema</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primary-color">Cor Primária</Label>
          <div className="flex items-center gap-2">
             <Input
                type="color"
                className="p-1 h-10 w-10"
                value={activeProject.theme.colorPrimary}
                onChange={(e) => handleThemeChange('colorPrimary', e.target.value)}
            />
            <Input
              id="primary-color"
              value={activeProject.theme.colorPrimary}
              onChange={(e) => handleThemeChange('colorPrimary', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="background-color">Cor de Fundo</Label>
          <div className="flex items-center gap-2">
            <Input
                type="color"
                className="p-1 h-10 w-10"
                value={activeProject.theme.colorBackground}
                onChange={(e) => handleThemeChange('colorBackground', e.target.value)}
            />
            <Input
              id="background-color"
              value={activeProject.theme.colorBackground}
              onChange={(e) => handleThemeChange('colorBackground', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="accent-color">Cor de Destaque</Label>
          <div className="flex items-center gap-2">
            <Input
                type="color"
                className="p-1 h-10 w-10"
                value={activeProject.theme.colorAccent}
                onChange={(e) => handleThemeChange('colorAccent', e.target.value)}
            />
            <Input
              id="accent-color"
              value={activeProject.theme.colorAccent}
              onChange={(e) => handleThemeChange('colorAccent', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
