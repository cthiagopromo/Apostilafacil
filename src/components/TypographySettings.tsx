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

const headingFonts = [
  { name: 'Roboto Slab', value: 'var(--font-roboto-slab)' },
  { name: 'Inter', value: 'var(--font-inter)' },
  { name: 'Lato', value: 'var(--font-lato)' },
];

const bodyFonts = [
  { name: 'Inter', value: 'var(--font-inter)' },
  { name: 'Lato', value: 'var(--font-lato)' },
  { name: 'Roboto Slab', value: 'var(--font-roboto-slab)' },
];

export default function TypographySettings() {
  const { handbookTheme, updateHandbookTheme } = useProjectStore();

  const handleHeadingFontChange = (value: string) => {
    updateHandbookTheme({ fontHeading: value });
  };

  const handleBodyFontChange = (value: string) => {
    updateHandbookTheme({ fontBody: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Fonte dos Títulos</Label>
        <Select
          value={handbookTheme.fontHeading}
          onValueChange={handleHeadingFontChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma fonte" />
          </SelectTrigger>
          <SelectContent>
            {headingFonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Fonte do Corpo</Label>
        <Select
          value={handbookTheme.fontBody}
          onValueChange={handleBodyFontChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma fonte" />
          </SelectTrigger>
          <SelectContent>
            {bodyFonts.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
