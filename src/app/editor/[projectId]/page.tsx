import { EditorLayout } from '@/components/EditorLayout';
import { initialProjects } from '@/lib/initial-data';

export default function EditorPage({ params }: { params: { projectId: string } }) {
  // Em uma aplicação real, você buscaria os dados do projeto.
  // Aqui, estamos usando dados iniciais para demonstração.
  const project = initialProjects.find(p => p.id === params.projectId);

  if (!project) {
    return <div>Projeto não encontrado</div>;
  }

  return <EditorLayout project={project} />;
}
