
'use client';

import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

interface PreviewHeaderProps {
  setIsExporting: (isExporting: boolean) => void;
  handbookTitle: string;
  handbookId?: string;
}

export function PreviewHeader({ setIsExporting, handbookTitle, handbookId }: PreviewHeaderProps) {

  return (
    <header className="py-4 px-6 bg-primary text-primary-foreground no-print no-export">
      <div className="max-w-4xl mx-auto flex flex-row justify-between items-center">
        <h1 className="text-xl font-bold">{handbookTitle}</h1>
        <AccessibilityToolbar setIsExporting={setIsExporting} handbookId={handbookId} />
      </div>
    </header>
  );
}

export default PreviewHeader;
