
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
  { name: 'Inter', value: 'Inter, ui-sans-serif, sans-serif, system-ui' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Menlo', value: 'Menlo, monospace' },
];

const bodyFonts = [
  { name: 'Inter', value: 'Inter, ui-sans-serif, sans-serif, system-ui' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Menlo', value: 'Menlo, monospace' },
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

    