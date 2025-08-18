'use client';

import useProjectStore from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ModuleSettings() {
  const { activeProject, updateProjectTitle, updateProjectDescription } = useProjectStore();

  if (!activeProject) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="module-title">Título do Módulo</Label>
        <Input
          id="module-title"
          value={activeProject.title}
          onChange={(e) => updateProjectTitle(activeProject.id, e.target.value)}
          placeholder="Ex: Biologia Celular"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="module-description">Descrição do Módulo</Label>
        <Textarea
          id="module-description"
          value={activeProject.description}
          onChange={(e) => updateProjectDescription(activeProject.id, e.target.value)}
          placeholder="Uma breve descrição sobre o módulo."
          rows={4}
        />
      </div>
    </div>
  );
}
