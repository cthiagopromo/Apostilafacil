'use client';

import { ApostilaFacilApp } from '@/components/ApostilaFacilApp';
import { ProjectProvider } from '@/context/ProjectContext';

export default function Home() {
  return (
    <ProjectProvider>
      <ApostilaFacilApp />
    </ProjectProvider>
  );
}
