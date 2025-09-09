'use client';

import useProjectStore from '@/lib/store';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LayoutSettings } from '@/lib/types';

export default function LayoutSettings() {
  const { getActiveProject, updateLayoutSetting } = useProjectStore();
  const activeProject = getActiveProject();

  if (!activeProject || !activeProject.layoutSettings) {
    return null;
  }
  
  const handleUpdate = (setting: keyof LayoutSettings, value: string) => {
      if (activeProject) {
          updateLayoutSetting(activeProject.id, setting, value);
      }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Largura do Container</Label>
        <Select 
            value={activeProject.layoutSettings.containerWidth}
            onValueChange={(value) => handleUpdate('containerWidth', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a largura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Padrão (960px)</SelectItem>
            <SelectItem value="large">Grande (1200px)</SelectItem>
            <SelectItem value="full">Tela Cheia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Espaçamento Entre Seções</Label>
        <Select
            value={activeProject.layoutSettings.sectionSpacing}
            onValueChange={(value) => handleUpdate('sectionSpacing', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o espaçamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compacto (1rem)</SelectItem>
            <SelectItem value="standard">Padrão (2rem)</SelectItem>
            <SelectItem value="comfortable">Confortável (4rem)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Tipo de Navegação</Label>
        <Select
            value={activeProject.layoutSettings.navigationType}
            onValueChange={(value) => handleUpdate('navigationType', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a navegação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">Topo</SelectItem>
            <SelectItem value="sidebar">Lateral (Sidebar)</SelectItem>
            <SelectItem value="bottom">Rodapé</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
