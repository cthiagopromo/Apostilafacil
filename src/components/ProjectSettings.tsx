'use client';

import { useProject } from '@/context/ProjectContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function ProjectSettings() {
  const { project, updateProject } = useProject();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Projeto</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-title">Título do Projeto</Label>
          <Input
            id="project-title"
            value={project.title}
            onChange={(e) => updateProject({ title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-description">Descrição</Label>
          <Textarea
            id="project-description"
            value={project.description}
            onChange={(e) => updateProject({ description: e.target.value })}
            placeholder="Descreva sua apostila..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
