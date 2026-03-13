# ⚙️ Guia de Configuração - Compressão de Imagens

## 📊 Configurações Atuais (Ajuste Fino Aplicado)

### DEFAULT_OPTIONS (Padrão Global)

```typescript
const DEFAULT_OPTIONS = {
  maxWidth: 1200,        // 1200px de largura máxima
  maxHeight: 1200,       // 1200px de altura máxima
  quality: 0.65,         // 65% de qualidade
  format: 'avif',        // Formato AVIF
  maxSizeBytes: 300 * 1024,  // 300KB máximo
};
```

---

## 🎯 Configurações por Tipo de Imagem

| Tipo | maxWidth | quality | maxSizeBytes | Economia Esperada |
|------|----------|---------|--------------|-------------------|
| **Capa** | 1200px | 0.65 | 300KB | -85-90% |
| **Contracapa** | 1200px | 0.65 | 300KB | -85-90% |
| **Imagens de conteúdo** | 1000px | 0.70 | 300KB | -80-85% |
| **Ícones/Gráficos** | 512px | 0.75 | 100KB | -70-80% |

---

## 📈 Impacto no Tamanho Final

### Cenário com Configurações Antigas (1600px, 0.75)

```
Capa 4000x3000:     8MB → 800KB  (-90%)
Contracapa:         8MB → 800KB  (-90%)
10 imagens 2000px: 20MB → 3MB    (-85%)
────────────────────────────────────
Total:             36MB → 4.6MB  (-87%)
```

### Cenário com Novas Configurações (1200px, 0.65)

```
Capa 4000x3000:     8MB → 500KB  (-94%)
Contracapa:         8MB → 500KB  (-94%)
10 imagens 2000px: 20MB → 2MB    (-90%)
────────────────────────────────────
Total:             36MB → 3MB    (-92%)
```

**Economia adicional:** ~35% vs configurações antigas

---

## 🔧 Como Ajustar

### Arquivo: `src/lib/image-compressor.ts`

#### 1. Ajustar Configuração Global

```typescript
// Linha ~21-27
const DEFAULT_OPTIONS: Required<ImageCompressionOptions> = {
  maxWidth: 1200,        // ← Altere aqui
  maxHeight: 1200,       // ← Altere aqui
  quality: 0.65,         // ← Altere aqui (0.5 = máx compressão, 0.9 = máx qualidade)
  format: 'avif',
  maxSizeBytes: 300 * 1024, // ← Altere aqui
};
```

#### 2. Ajustar por Tipo de Imagem

```typescript
// Linha ~263-279 (processHandbookImages)

// Para capa/contracapa
processed.theme.backCover = await compressImage(processed.theme.backCover, {
  maxWidth: 1200,    // ← Altere
  maxHeight: 1200,   // ← Altere
  quality: 0.65,     // ← Altere
  format: 'avif',
});

// Para imagens de conteúdo
block.content.url = await compressImage(block.content.url, {
  maxWidth: 1000,    // ← Altere
  maxHeight: 1000,   // ← Altere
  quality: 0.70,     // ← Altere
  format: 'avif',
});
```

---

## 🎛️ Presets de Configuração

### Máxima Compressão (HTML mínimo)

```typescript
const MAX_COMPRESSION = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.5,
  format: 'avif',
  maxSizeBytes: 200 * 1024,  // 200KB
};
```

**Uso:** Quando prioridade é tamanho mínimo (email, WhatsApp)

**Qualidade:** Aceitável para visualização em tela, não recomendada para impressão.

---

### Equilibrada (Padrão Atual)

```typescript
const BALANCED = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.65,
  format: 'avif',
  maxSizeBytes: 300 * 1024,  // 300KB
};
```

**Uso:** Uso geral, web e impressão básica.

**Qualidade:** Boa para maioria dos casos.

---

### Alta Qualidade (Impressão)

```typescript
const HIGH_QUALITY = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.85,
  format: 'avif',
  maxSizeBytes: 800 * 1024,  // 800KB
};
```

**Uso:** Quando qualidade é prioridade (impressão profissional).

**Qualidade:** Excelente, arquivo maior.

---

## 📊 Tabela de Referência Rápida

| maxWidth | quality | maxSizeBytes | Uso Recomendado |
|----------|---------|--------------|-----------------|
| 800px | 0.50 | 200KB | Email, WhatsApp |
| 1000px | 0.60 | 250KB | Web mobile |
| **1200px** | **0.65** | **300KB** | **Padrão (atual)** |
| 1400px | 0.75 | 500KB | Web desktop |
| 1600px | 0.85 | 800KB | Impressão |
| 2000px | 0.90 | 1MB | Alta qualidade |

---

## 🧪 Testando Configurações

### No Componente de Teste

```typescript
// src/components/ImageCompressionTester.tsx

// Ajuste os valores iniciais
const [quality, setQuality] = useState(0.65);      // ← Seu valor
const [maxWidth, setMaxWidth] = useState(1200);    // ← Seu valor
const [format, setFormat] = useState('avif');
```

1. Abra o componente de teste
2. Upload de uma imagem típica
3. Ajuste sliders
4. Compare qualidade vs tamanho
5. Encontre seu equilíbrio ideal

---

## 🎯 Cenários de Uso

### Cenário 1: Apostila com Muitas Imagens

**Problema:** 50+ imagens, HTML > 50MB

**Solução:**
```typescript
const MANY_IMAGES = {
  maxWidth: 1000,
  maxHeight: 1000,
  quality: 0.60,
  maxSizeBytes: 250 * 1024,
};
```

**Resultado esperado:** 50MB → 8-10MB

---

### Cenário 2: Apostila para Email

**Problema:** Limite de 25MB do Gmail

**Solução:**
```typescript
const EMAIL_SAFE = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.55,
  maxSizeBytes: 200 * 1024,
};
```

**Resultado esperado:** 30MB → 5-7MB

---

### Cenário 3: Apostila para Impressão

**Problema:** Qualidade precisa ser boa para imprimir

**Solução:**
```typescript
const PRINT_QUALITY = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.80,
  maxSizeBytes: 600 * 1024,
};
```

**Resultado esperado:** 30MB → 15-18MB (qualidade preservada)

---

## ⚠️ Limites e Recomendações

### Não Recomendado

```typescript
// ❌ Qualidade muito baixa
quality: 0.30  // Imagem pixelada

// ❌ Tamanho muito pequeno
maxWidth: 400  // Não serve para impressão

// ❌ Limite muito agressivo
maxSizeBytes: 50 * 1024  // 50KB pode degradar muito
```

### Recomendado

```typescript
// ✅ Mínimo aceitável
quality: 0.50
maxWidth: 800
maxSizeBytes: 200 * 1024

// ✅ Máximo recomendado
quality: 0.90
maxWidth: 2000
maxSizeBytes: 1024 * 1024
```

---

## 🔄 Workflow de Ajuste

1. **Comece com o preset equilibrado** (1200px, 0.65)
2. **Exporte uma apostila de teste**
3. **Avalie:**
   - Tamanho do HTML está ≤ 20MB? ✅
   - Qualidade está aceitável? ✅
   - Impressão está boa? ✅/❌

4. **Se qualidade ruim:** Aumente quality para 0.70-0.75
5. **Se arquivo grande:** Diminua maxWidth para 1000px ou quality para 0.60

6. **Repita** até encontrar equilíbrio ideal

---

## 📞 Suporte

### Problema: Qualidade muito baixa

**Solução:** Aumente `quality` em 0.05-0.10
```typescript
quality: 0.65 → 0.70 → 0.75
```

### Problema: Arquivo ainda grande

**Solução:** Diminua `maxWidth` e `quality`
```typescript
maxWidth: 1200 → 1000 → 800
quality: 0.65 → 0.60 → 0.55
```

### Problema: Lentidão na exportação

**Solução:** Diminua `maxSizeBytes` para processar menos
```typescript
maxSizeBytes: 300 * 1024 → 200 * 1024
```

---

## ✅ Checklist de Validação

Após ajustar configurações:

- [ ] Exporte apostila de teste
- [ ] Meça tamanho do HTML
- [ ] Verifique qualidade em tela
- [ ] Verifique qualidade na impressão
- [ ] Teste em 3 navegadores diferentes
- [ ] Valide com usuário final

---

**Última atualização:** 12 de março de 2026  
**Configuração atual:** 1200px, 0.65, 300KB (Ajuste Fino)
