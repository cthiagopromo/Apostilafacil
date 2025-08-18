'use client';

import { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getAccessibilityImprovements } from '@/ai/flows/accessibility-improvements';
import type { GetAccessibilityImprovementsOutput } from '@/ai/flows/accessibility-improvements';
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function AccessibilityChecker() {
  const { activeModule } = useProject();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GetAccessibilityImprovementsOutput | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!activeModule) {
      toast({
        title: "Nenhum módulo selecionado",
        description: "Por favor, selecione um módulo para analisar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await getAccessibilityImprovements({
        contentHTML: activeModule.contentHTML,
        theme: 'light',
      });
      setResult(response);
    } catch (error) {
      console.error('Error analyzing accessibility:', error);
      toast({
        title: "Erro na Análise",
        description: "Não foi possível analisar a acessibilidade. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Verificador de Acessibilidade</CardTitle>
          <CardDescription>
            Use nossa IA para analisar o conteúdo do seu módulo e receber sugestões para torná-lo mais acessível.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAnalyze} disabled={isLoading || !activeModule} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Analisar Módulo Atual
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Contraste</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{result.contrastAnalysis}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sugestões de Melhoria</CardTitle>
            </CardHeader>
            <CardContent>
              {result.suggestions.length > 0 ? (
                <ul className="space-y-2 list-disc pl-5">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">{suggestion}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma sugestão encontrada. Bom trabalho!</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
       {!activeModule && !isLoading && (
        <Card className="border-dashed">
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2"/>
                Selecione um módulo na barra lateral esquerda para poder analisá-lo.
            </CardContent>
        </Card>
       )}
    </div>
  );
}
