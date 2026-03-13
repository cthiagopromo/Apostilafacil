# Proposta: Correções na Exportação HTML e PDF

## Problemas Identificados

### 1. Tipografia - Múltiplas Fontes no HTML Exportado
**Problema:** O HTML exportado está incluindo todas as fontes do Google Fonts, mesmo quando o usuário selecionou apenas "Inter".

**Sintoma:**
- HTML inclui: Roboto Slab, Inter, Lato, Rethink Sans
- Deveria incluir: Apenas a fonte selecionada (Inter)
- Impacto: HTML maior, carregamento mais lento

### 2. Navegação Entre Páginas Quebrada
**Problema:** Botão "Próximo Módulo" não funciona no HTML exportado.

**Sintoma:**
- Clicar em "Próximo Módulo" não avança
- Navegação por clique nos módulos não funciona
- JavaScript de navegação pode estar com erro

### 3. Quiz com Resposta Pré-Selecionada
**Problema:** Quizzes aparecem com uma resposta já selecionada no HTML exportado.

**Sintoma:**
- Radio button já vem marcado
- Usuário não consegue responder corretamente
- Estado do quiz está sendo exportado incorretamente

### 4. Design Quebrado no HTML Exportado
**Problema:** Layout está desconfigurado no HTML exportado.

**Sintoma:**
- CSS não está sendo aplicado corretamente
- Elementos fora de posição
- Classes Tailwind não estão funcionando

### 5. PDF Mal Formatado
**Problema:** Opção de "Salvar PDF" está gerando PDF com formatação quebrada.

**Sintoma:**
- Páginas cortadas incorretamente
- Elementos sobrepostos
- Margens inadequadas
- Quebra de página em locais errados

## Impacto

| Problema | Severidade | Usuários Afetados |
|----------|------------|-------------------|
| Tipografia múltipla | Média | 100% |
| Navegação quebrada | **Crítica** | 100% |
| Quiz pré-selecionado | **Crítica** | 100% |
| Design quebrado | **Crítica** | 100% |
| PDF mal formatado | Alta | 80% |

## Soluções Propostas

### 1. Filtrar Fontes no HTML Exportado

**Solução:** Gerar URL do Google Fonts dinâmica baseada apenas na fonte selecionada.

```typescript
// Antes: Inclui todas as fontes
const fonts = ['Roboto Slab', 'Inter', 'Lato', 'Rethink Sans'];

// Depois: Inclui apenas a fonte selecionada
const fonts = [handbookTheme.fontHeading, handbookTheme.fontBody].filter(unique);
```

**Impacto:** HTML 15-20KB menor, carregamento mais rápido.

### 2. Corrigir Navegação JavaScript

**Solução:** Revisar e corrigir o script de navegação injetado no HTML.

**Ações:**
- Verificar event listeners dos botões
- Corrigir seleção de elementos DOM
- Testar navegação em todos os navegadores

### 3. Resetar Estado dos Quizzes

**Solução:** Garantir que quizzes sejam exportados sem respostas selecionadas.

```typescript
// Antes: Exporta com userAnswerId
block.content.userAnswerId = 'opt_123'; // ❌

// Depois: Exporta sem resposta
block.content.userAnswerId = null; // ✅
```

### 4. Consolidar CSS no HTML Exportado

**Solução:** Incluir CSS completo e otimizado no HTML.

**Ações:**
- Usar classes CSS consolidadas
- Incluir CSS crítico inline
- Garantir que todas as classes usadas estejam presentes

### 5. Melhorar Configurações de Impressão/PDF

**Solução:** Ajustar CSS de impressão para melhor formatação.

**Ações:**
- Configurar `@page` corretamente
- Ajustar `page-break` properties
- Testar em diferentes navegadores
- Adicionar instruções de uso

## Critérios de Aceite

- [ ] HTML exportado inclui apenas a fonte selecionada
- [ ] Navegação "Próximo/Anterior" funciona
- [ ] Navegação por menu flutuante funciona
- [ ] Quizzes aparecem sem respostas selecionadas
- [ ] Layout está idêntico ao preview
- [ ] PDF gera com páginas bem formatadas
- [ ] PDF não corta elementos ao meio
- [ ] Testado em Chrome, Firefox, Edge

## Métricas de Sucesso

| Métrica | Atual | Meta |
|---------|-------|------|
| Tamanho HTML (fontes) | ~50KB | ~10KB |
| Navegação funcional | 0% | 100% |
| Quizzes funcionais | 0% | 100% |
| Qualidade do PDF | Baixa | Alta |
| Satisfação do usuário | Baixa | Alta |

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Quebrar navegação existente | Baixa | Alto | Testes extensivos |
| PDF piorar em algum navegador | Média | Médio | Testes multi-browser |
| Fontes não carregarem | Baixa | Alto | Fallbacks no CSS |

## Próximos Passos

1. Ver `design.md` para detalhes técnicos
2. Ver `tasks.md` para implementação passo-a-passo
