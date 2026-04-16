---
name: project-analyzer
description: Analisa projetos TypeScript/React para detectar erros de tipos, lint, problemas de padrões React/Next.js e sugere correções
triggers: [analyze, check-errors, diagnose, analyze-project, check-project, project-health]
---

# Project Analyzer

Analisa projetos TypeScript, React e Next.js para detectar erros, warnings e problemas de padrões.

## Use esta skill quando

- Precisa verificar erros TypeScript
- Quer verificar problemas de lint
- Precisa identificar padrões problemáticos em código React/Next.js
- Quer fazer uma auditoria completa do projeto
- Precisa verificar dependências desatualizadas

## Não use esta skill quando

- O projeto não é TypeScript/React/Next.js
- Precisa de debugging em tempo de execução
- Precisa de testes unitários (use test-engineer skill)

---

## Instruções

### Passo 1: Verificações Iniciais

Execute as verificações base:

```bash
# TypeScript - verifica erros de tipos
npx tsc --noEmit 2>&1

# Lint - verifica problemas de código
npm run lint 2>&1
```

### Passo 2: Análise de Padrões

Execute grep para detectar padrões problemáticos:

| Padrão | Comando Grep | Severidade |
|--------|--------------|------------|
| `any` types | `grep -r ": any" --include="*.ts"` | warning |
| console.log | `grep -r "console.log" --include="*.ts"` | warning |
| useEffect sem cleanup | `grep -r "useEffect" --include="*.tsx"` + manual | warning |
| use client faltando | detectar hooks em arquivos sem diretiva | error |

### Passo 3: Formate a Saída

Agrupe os resultados por tipo e severidade:

```
═══ DIAGNÓSTICO DO PROJETO ═══

[ERROS TypeScript] ❌
├── arquivo:linha - descrição
└── ...

[WARNINGS] ⚠️
├── arquivo:linha - descrição
└── ...

[PADRÕES PROBLEMÁTICOS] 🔴
├── arquivo:linha - descrição
└── ...

[DEPENDÊNCIAS DESATUALIZADAS]
└── ...
```

### Passo 4: Sugira Correções

Para cada erro, forneça:
1. **O problema** - o que está errado
2. **A causa** - por que ocorre
3. **A correção** - snippet de código

---

## Verificações Detalhadas

### 1. TypeScript

Executar: `npx tsc --noEmit`

Parsear erros no formato:
```
arquivo.ts(linha,coluna): error TS1234: mensagem
```

### 2. Lint

Executar: `npm run lint`

### 3. Padrões React/Next.js

| Verificação | Como Fazer | Ação |
|-------------|-----------|------|
| `use client` faltando | Grep por `useState\|useEffect` sem `'use client'` no topo | Adicionar diretiva |
| Key em listas | Grep `map(` sem `key=` | Adicionar key única |
| console.log | Grep `console.log` | Remover ou usar logger |
| any implícito | Grep `: any` ou `as any` | Tipar corretamente |
| fetch sem AbortController | Analisar useEffect com fetch | Adicionar cleanup |

### 4. Dependencies

Executar: `npm outdated`

Verificar se há major updates disponíveis.

---

## Exemplos de Saída

### Exemplo 1: Erro TypeScript
```
[ERROS TypeScript] ❌ 2 encontrado(s)
├── src/components/WatermarkOverlay.tsx:45 - Property 'style' is missing in type
└── src/lib/store.ts:150 - Type '{ enabled: false... }' missing 'style'

→ CORREÇÃO: Adicionar 'style: "sidebar"' ao objeto
```

### Exemplo 2: Padrão Problemático
```
[PADRÕES PROBLEMÁTICOS] 🔴 3 encontrado(s)
├── src/components/Button.tsx:12 - useEffect sem return cleanup
│   → listeners podem vazar memória
├── src/app/page.tsx:8 - console.log encontrado
│   → remover em produção
└── src/components/List.tsx:23 - map sem key única
│   → adicionar key={item.id}
```

---

## Ferramentas Disponíveis

- **Bash** - executar tsc, lint, npm outdated
- **Grep** - buscar padrões no código
- **Read** - analisar arquivos problemáticos
- **glob** - encontrar arquivos por padrão
- **codesearch** - buscar soluções na documentação

---

## Referências

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- React Hooks: https://react.dev/reference/react
- Next.js Best Practices: ver `.Skills/Design/skills/react-best-practices/AGENTS.md`
