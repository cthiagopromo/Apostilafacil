
'use client';

import useProjectStore from '@/lib/store';
import { AccessibilityToolbar } from '@/components/AccessibilityToolbar';

export default function PreviewHeader() {
  const { handbookTitle } = useProjectStore();

  return (
    <header className="py-4 no-print">
      <div className="max-w-4xl mx-auto flex flex-row justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">{handbookTitle}</h1>
        <AccessibilityToolbar />
      </div>
    </header>
  );
}
