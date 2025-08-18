'use client';

import { useProject } from '@/context/ProjectContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ThemeCustomizer() {
  const { project, updateProject } = useProject();

  const handleThemeChange = (key: string, value: string) => {
    updateProject({ theme: { ...project.theme, [key]: value } });
  };

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
                value={project.theme.colorPrimary}
                onChange={(e) => handleThemeChange('colorPrimary', e.target.value)}
            />
            <Input
              id="primary-color"
              value={project.theme.colorPrimary}
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
                value={project.theme.colorBackground}
                onChange={(e) => handleThemeChange('colorBackground', e.target.value)}
            />
            <Input
              id="background-color"
              value={project.theme.colorBackground}
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
                value={project.theme.colorAccent}
                onChange={(e) => handleThemeChange('colorAccent', e.target.value)}
            />
            <Input
              id="accent-color"
              value={project.theme.colorAccent}
              onChange={(e) => handleThemeChange('colorAccent', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
