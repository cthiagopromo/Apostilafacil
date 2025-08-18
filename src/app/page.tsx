import { ProjectList } from '@/components/ProjectList';
import { FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto p-6 sm:p-8 lg:p-10">
      <header className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-primary">Editor de Apostilas</h1>
          <p className="text-lg text-muted-foreground">Seus projetos de apostilas interativas.</p>
        </div>
      </header>
      <main>
        <ProjectList />
      </main>
    </div>
  );
}
