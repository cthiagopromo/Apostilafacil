
'use client';

import useProjectStore from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function HandbookSettings() {
  const { handbookTitle, handbookDescription, updateHandbookTitle, updateHandbookDescription } = useProjectStore();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="handbook-title">Título da Apostila</Label>
        <Input
          id="handbook-title"
          value={handbookTitle}
          onChange={(e) => updateHandbookTitle(e.target.value)}
          placeholder="Ex: Curso Completo de Biologia"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="handbook-description">Descrição da Apostila</Label>
        <Textarea
          id="handbook-description"
          value={handbookDescription}
          onChange={(e) => updateHandbookDescription(e.target.value)}
          placeholder="Uma breve descrição sobre toda a apostila."
          rows={4}
        />
      </div>
    </div>
  );
}
