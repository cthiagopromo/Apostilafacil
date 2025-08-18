import { ProjectList } from '@/components/ProjectList';

export default function Home() {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary">ApostilaFácil</h1>
        <p className="text-lg text-muted-foreground">Seus projetos de apostilas interativas.</p>
      </header>
      <ProjectList />
    </div>
  );
}
