# AGENTS.md - Diretrizes para Agentes de IA

Este documento fornece orientações para agentes de IA que trabalham neste repositório.

---

## 1. Comandos de Build/Lint/Test

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build para produção
npm run start            # Inicia servidor de produção

# Verificação de código
npm run lint             # Executa linting (ESLint)
npm run typecheck        # Verificação TypeScript (tsc --noEmit)

# Não há framework de testes configurado (jest/vitest)
```

### Verificações manuais

```bash
# Verificar dependências desatualizadas
npm outdated

# Verificar erros TypeScript detalhados
npx tsc --noEmit --pretty
```

---

## 2. Code Style Guidelines

### 2.1 Importações

- **Não usar barrel files** (`index.ts` com re-exports). Importar diretamente:
  ```typescript
  // ❌ Ruim - carrega biblioteca inteira
  import { Button, Input } from '@/components/ui'

  // ✅ Bom - import direto
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  ```

- **Evitar wildcard imports** (`import * as`)

- **Ordem de imports:**
  1. External (react, next, etc)
  2. Internal (@/, ~/)
  3. Relative (./, ../)

### 2.2 Tipos (TypeScript)

- **Sempre tipar** objetos, parâmetros e retornos de funções
- **Evitar `any`** - usar `unknown` se necessário
- **Usar interfaces** para tipos de objetos
- **Usar types** para unions, intersections e aliases

```typescript
// ✅ Bom
interface User {
  id: string;
  name: string;
  email: string;
}

type Status = 'pending' | 'active' | 'inactive';

// ❌ Evitar
const data: any = fetchData();
```

### 2.3 Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Variáveis | camelCase | `userName`, `isActive` |
| Funções | camelCase | `getUserById()`, `handleClick()` |
| Componentes React | PascalCase | `UserProfile`, `LoginForm` |
| Constantes | SCREAMING_SNAKE | `MAX_RETRIES`, `API_BASE_URL` |
| Arquivos (componentes) | kebab-case | `user-profile.tsx`, `login-form.tsx` |
| Arquivos (utilities) | kebab-case | `date-utils.ts`, `api-client.ts` |

### 2.4 Componentes React

- **'use client'** para componentes que usam hooks (useState, useEffect, etc)
- **Props com tipagem** usando interface ou type
- **Arquivo único** para componente simples (`.tsx` com JSX + estilos se inline)
- **Separar** componentes complexos em arquivos próprios

```typescript
// ✅ Bom
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick} className={variant}>{children}</button>;
}
```

### 2.5 Zustand Store

O projeto usa Zustand com immer e zundo. Padrão:

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type State = {
  data: DataType[];
  isLoading: boolean;
};

type Actions = {
  fetchData: () => Promise<void>;
  updateData: (id: string, updates: Partial<DataType>) => void;
};

export const useStore = create<State & Actions>()(
  immer((set) => ({
    data: [],
    isLoading: false,
    fetchData: async () => {
      set({ isLoading: true });
      // fetch logic
    },
    updateData: (id, updates) =>
      set((state) => {
        const index = state.data.findIndex(d => d.id === id);
        if (index >= 0) Object.assign(state.data[index], updates);
      }),
  }))
);
```

### 2.6 Radix UI

O projeto usa Radix UI (componentes headless). Sempre usar os componentes existentes:

```typescript
// ✅ Usar componentes existentes
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';
```

### 2.7 Tratamento de Erros

- **Sempre usar try/catch** em operações async
- **Logar erros** com `console.error` ou logger
- **Nunca silenciar erros** semlogger
- **Tipar erros** quando possível

```typescript
// ✅ Bom
try {
  const data = await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
  throw new UserFriendlyError('Não foi possível carregar os dados');
}

// ❌ Ruim
try {
  await fetchData();
} catch {
  // silêncio total
}
```

### 2.8 CSS / Tailwind

- **Tailwind CSS** como padrão
- **Evitar estilos inline** (usar classes tailwind)
- **Componentes UI** em `/src/components/ui/`
- **Design System** seguir conventions de cores/spacing

---

## 3. Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── editor/            # Páginas de editor
│   └── print/             # Página de impressão
├── components/            # Componentes React
│   ├── ui/                # Componentes UI (Radix)
│   ├── BlockEditor.tsx    # Editor de blocos
│   ├── MainContent.tsx    # Área principal
│   └── Watermark*.tsx     # Componentes de marca d'água
├── hooks/                 # Custom hooks
├── lib/                   # Utilitários
│   ├── store.ts           # Zustand store
│   ├── types.ts           # Tipos TypeScript
│   └── utils.ts           # Funções utilities
└── styles/                # Estilos (se houver)
```

---

## 4. Referências Adicionais

- **React Best Practices**: ver `.Skills/Design/skills/react-best-practices/AGENTS.md`
- **Skill de Análise**: ver `.Skills/skills/project-analyzer/SKILL.md`
- **Tailwind**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/docs/primitives
- **Zustand**: https://zustand-demo.pmnd.rs/

---

## 5. Regras Importantes

1. **Verificar typecheck** antes decommitar (rode `npm run typecheck`)
2. **Evitar console.log** em código de produção
3. **Sempre adicionar key** em listas React
4. **Usar 'use client'** quando necessário
5. **Testar build** antes de fazer merge (`npm run build`)
