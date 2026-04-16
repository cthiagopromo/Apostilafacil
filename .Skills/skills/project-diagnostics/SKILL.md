---
name: project-diagnostics
description: Análise completa de projetos TypeScript/React/Next.js para detectar erros, bugs, vulnerabilidades e problemas de performance
triggers: [diagnose, analyze, check-bugs, audit, project-health, /diagnose, /analyze, /check]
---

# Project Diagnostics

Análise abrangente de projetos para detectar erros, bugs, vulnerabilidades e problemas de performance.

## Use esta skill quando

- Precisa encontrar erros de código
- Quer fazer auditoria completa do projeto
- Precisa identificar bugs e vulnerabilidades
- Quer verificar problemas de performance
- Precisa verificar dependências inseguras

## Não use esta skill quando

- O projeto não é TypeScript/React/Next.js
- Precisa de debugging em tempo real (use debugger skill)
- Precisa de testes unitários (use test-engineer skill)

---

## Fluxo de Análise

### FASE 1: Verificações Base (OBRIGATÓRIO)

Execute SEMPRE nesta ordem:

```bash
# 1. TypeScript - erros de tipos
npx tsc --noEmit 2>&1

# 2. Lint - problemas de código
npm run lint 2>&1

# 3. Dependencies outdated
npm outdated 2>&1
```

### FASE 2: Análise de Bugs (OBRIGATÓRIO)

Execute os seguintes padrões de busca:

| Bug | Como Detectar | Severidade |
|-----|---------------|------------|
| `any` implícito | `grep -r ": any" --include="*.ts*"` | 🔴 high |
| `as any` | `grep -r " as any" --include="*.ts*"` | 🔴 high |
| `console.log` | `grep -r "console.log" --include="*.ts*"` | 🟡 medium |
| `console.error` | `grep -r "console.error" --include="*.ts*"` | 🟡 medium |
| `TODO`/`FIXME` | `grep -r "TODO\|FIXME\|HACK" --include="*.ts*"` | 🟡 medium |
| `debugger` | `grep -r "debugger" --include="*.ts*"` | 🔴 high |
| `alert(` | `grep -r "alert(" --include="*.ts*"` | 🟡 medium |
| `eval(` | `grep -r "eval(" --include="*.ts*"` | 🔴 critical |
| `dangerouslySetInnerHTML` sem sanitização | `grep -r "dangerouslySetInnerHTML"` + verificar DOMPurify | 🔴 critical |
| `innerHTML` | `grep -r "\.innerHTML\s*=" --include="*.ts*"` | 🔴 critical |

### FASE 3: Análise React/Next.js

Execute para projetos React:

| Padrão | Como Detectar | Severidade |
|--------|---------------|------------|
| use client faltando | Arquivos com hooks sem `'use client'` | 🔴 high |
| useEffect sem cleanup | Analisar useEffect sem return | 🟡 medium |
| map sem key | `.map(` sem `key=` | 🔴 high |
| setState em loop | `forEach`/`map` com setState | 🔴 high |
| memory leak | event listeners sem cleanup | 🔴 high |
| hydration mismatch | `Math.random()` ou `Date.now()` no render | 🟡 medium |
| large bundle import | dynamic import sem lazy | 🟡 medium |

### FASE 4: Análise de Segurança

Execute para vulnerabilidades:

| Vulnerabilidade | Como Detectar | Severidade |
|-----------------|---------------|------------|
| Secrets no código | `grep -r "api[_-]key\|password\|secret\|token" --include="*.ts*"` | 🔴 critical |
| Hardcoded URLs | `grep -r "http://" --include="*.ts*"` | 🟡 medium |
| SQL Injection raw | `grep -r "sql\`\|execute(" --include="*.ts*"` | 🔴 critical |
| XSS | Verificar dangerouslySetInnerHTML | 🔴 critical |
| Insecure random | `Math.random()` para segurança | 🟡 medium |

### FASE 5: Análise de Performance

Execute para problemas de performance:

| Problema | Como Detectar | Severidade |
|----------|---------------|------------|
| Large re-renders | componentes sem memo | 🟡 medium |
| Unnecessary useEffect | useEffect com deps[] grandes | 🟡 medium |
| Blocking render | useState em componente pai | 🟡 medium |
| Large images | img sem lazy loading | 🟡 medium |

---

## Formatação da Saída

```
╔════════════════════════════════════════════════════════════╗
║           DIAGNÓSTICO DO PROJETO                            ║
╚════════════════════════════════════════════════════════════╝

📊 RESUMO
├── Errors: X
├── Warnings: Y  
├── Security: Z
└── Performance: W

═══════════════════════════════════════════════════════════════

🔴 CRÍTICO (X encontradas)
├── [ARQUIVO:linha] - DESCRIÇÃO
│   → CORREÇÃO: snippet de código
└── ...

═══════════════════════════════════════════════════════════════

🔴 HIGH (X encontradas)
├── [ARQUIVO:linha] - DESCRIÇÃO
└── ...

═══════════════════════════════════════════════════════════════

🟡 MEDIUM (X encontradas)
├── [ARQUIVO:linha] - DESCRIÇÃO
└── ...

═══════════════════════════════════════════════════════════════

🟢 SUGESTÕES DE MELHORIA
├── [ARQUIVO:linha] - DESCRIÇÃO
└── ...

═══════════════════════════════════════════════════════════════

⚠️ DEPENDÊNCIAS ATUALIZAR
├── [pacote]: [versão] → [nova versão] (severidade)
└── ...

═══════════════════════════════════════════════════════════════

✅ VERIFICAÇÕES PASSADAS
├── TypeScript sem erros
├── Lint sem erros críticos
└── ...
```

---

## Ferramentas Disponíveis

- **Bash** - executar npm, npx, node
- **Grep** - buscar padrões no código
- **glob** - encontrar arquivos por padrão
- **Read** - analisar arquivos problemáticos
- **codesearch** - buscar soluções na documentação

---

## Exemplos de Correção

### Exemplo 1: any type
```typescript
// ❌ Ruim
const data: any = fetchData();

// ✅ Bom
interface DataType {
  id: string;
  name: string;
}
const data: DataType = fetchData();
```

### Exemplo 2: console.log
```typescript
// ❌ Ruim
console.log('debug', data);

// ✅ Bom (ambiente dev)
import { logger } from '@/lib/logger';
logger.debug('data', data);
```

### Exemplo 3: useEffect sem cleanup
```typescript
// ❌ Ruim
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []);

// ✅ Bom
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## Referências

- TypeScript Handbook: https://www.typescriptlang.org/docs/
- React Hooks: https://react.dev/reference/react
- OWASP: https://owasp.org/www-community/Injection_Flaws
- Ver `.Skills/skills/project-analyzer/SKILL.md` para análise básica