---
name: diseñador-sistemas-visuales
description: "Orquestador de generación de sistemas de diseño completos usando el reasoning engine de ui-ux-pro-max. Genera sistemas de diseño con Pattern, Style, Colors, Typography, Effects y Anti-patterns. Crea archivos MASTER.md y page-specific overrides. Valida contra anti-patterns y exporta en múltiples formatos. Use cuando: generar design system, crear sistema de diseño, diseño completo, design system generator, paleta de colores + tipografía + estilo."
---

# Diseñador de Sistemas Visuales

Orquestador especializado en la generación automatizada de sistemas de diseño completos usando el **Design System Generator** de ui-ux-pro-max v2.0.

## Cuándo Usar Esta Skill

Actívala cuando necesites:

- Generar un sistema de diseño completo para un proyecto
- Crear paletas de colores, tipografía y estilos coherentes
- Obtener recomendaciones basadas en industria específica
- Validar diseños contra anti-patterns
- Persistir design systems con patrón Master + Overrides

## Capacidades

### 1. Generación Automática de Design Systems

Usa el reasoning engine con 100 reglas específicas por industria para generar:

- **Pattern**: Estructura de landing page optimizada
- **Style**: Estilos UI recomendados (Glassmorphism, Minimalism, etc.)
- **Colors**: Paleta de colores con mood apropiado
- **Typography**: Pares de fuentes con personalidad matching
- **Key Effects**: Animaciones e interacciones
- **Anti-Patterns**: Qué evitar absolutamente
- **Pre-delivery Checklist**: Validaciones de calidad

### 2. Formato Multi-Output

- **ASCII Box**: Para display en terminal
- **Markdown**: Para documentación
- **Persistencia**: Archivos MASTER.md + page overrides

### 3. Validación de Anti-Patterns

Detecta y previene errores comunes por industria:
- "AI purple/pink gradients" para banca/finanzas
- "Dark mode by default" para healthcare
- "Bright neon colors" para wellness
- Y 97+ anti-patterns más

## Workflow

### Paso 1: Analizar Requisitos del Usuario

Extrae información clave:

```yaml
product_type: "SaaS", "e-commerce", "portfolio", etc.
industry: "healthcare", "fintech", "gaming", etc.
keywords: "minimal", "elegant", "professional", "dark mode", etc.
project_name: Nombre del proyecto (opcional)
```

### Paso 2: Generar Design System

Ejecuta el Design System Generator:

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system -p "<project_name>"
```

**Ejemplo:**

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech crypto trading" --design-system -p "CryptoTrade"
```

### Paso 3: Persistir (Opcional)

Si el proyecto requiere múltiples páginas, persiste el design system:

```bash
# Crear MASTER.md
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "SaaS dashboard" --design-system --persist -p "MyApp"

# Crear override para página específica
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "checkout payment" --design-system --persist -p "MyApp" --page "checkout"
```

### Paso 4: Validar y Sintetizar

1. **Revisar anti-patterns**: Confirmar que el diseño no incluye anti-patterns para la industria
2. **Verificar pre-delivery checklist**: Asegurar que cumple con estándares de calidad
3. **Sintetizar recomendaciones**: Consolidar todas las recomendaciones en un plan ejecutable

## Formato de Salida

### ASCII Box (Por Defecto)

```
+----------------------------------------------------------------------------+
| TARGET: <Project Name> - RECOMMENDED DESIGN SYSTEM                         |
+----------------------------------------------------------------------------+
| PATTERN: <Pattern Name>                                                    |
| Conversion: <Strategy>                                                     |
| Sections: 1. Hero  2. Features  3. Social Proof  4. CTA                    |
|                                                                            |
| STYLE: <Style Name>                                                        |
| Keywords: <Keywords>                                                       |
| Best For: <Use Cases>                                                      |
|                                                                            |
| COLORS:                                                                    |
| Primary: #XXXXXX (<Color Name>)                                            |
| Secondary: #XXXXXX (<Color Name>)                                          |
| ...                                                                        |
|                                                                            |
| TYPOGRAPHY: <Heading Font> / <Body Font>                                   |
| Mood: <Typography Mood>                                                    |
| Google Fonts: <Link>                                                       |
|                                                                            |
| KEY EFFECTS:                                                               |
| <Effect 1> + <Effect 2> + <Effect 3>                                       |
|                                                                            |
| AVOID (Anti-patterns):                                                     |
| <Anti-pattern 1> + <Anti-pattern 2>                                        |
|                                                                            |
| PRE-DELIVERY CHECKLIST:                                                    |
| [ ] <Item 1>                                                               |
| [ ] <Item 2>                                                               |
+----------------------------------------------------------------------------+
```

### Markdown Format

Use flag `-f markdown` para exportar en formato Markdown estructurado.

## Integración con Otras Skills

Se integra perfectamente con:

- **frontend-design**: Para implementación de componentes UI
- **tailwind-design-system**: Para tradución a design tokens de Tailwind
- **react-patterns**: Para componentes React con el design system
- **ui-ux-pro-max**: Skill base que provee el motor de búsqueda

## Ejemplos de Uso

### Ejemplo 1: SaaS Dashboard

```
Usuario: "Necesito un design system para mi dashboard de analytics SaaS"

Agente:
1. Extrae: product_type="SaaS Dashboard", industry="analytics", keywords="data-dense"
2. Ejecuta: search.py "SaaS dashboard analytics data-dense" --design-system -p "Analytics Pro"
3. Recibe: Pattern=Data-Dense Dashboard, Style=Glassmorphism+Data-Dense, Colors=Cool→Hot gradients
4. Valida: No anti-patterns para SaaS
5. Entrega: Design system completo con checklist
```

### Ejemplo 2: Beauty Spa Website

```
Usuario: "Crea un sistema de diseño para mi spa de lujo"

Agente:
1. Extrae: product_type="Beauty/Spa", industry="wellness", keywords="luxury elegant"
2. Ejecuta: search.py "beauty spa wellness luxury elegant" --design-system -p "Luxury Spa"
3. Recibe: Pattern=Hero+Social Proof, Style=Soft UI Evolution, Colors=Soft pastels+Gold
4. Valida anti-patterns: ✓ No bright neon ✓ No harsh animations ✓ No dark mode
5. Persiste: --persist para crear MASTER.md
6. Entrega: Sistema completo con recomendaciones
```

## Anti-Patterns Críticos por Industria

### Finanzas/Banca
- ❌ AI purple/pink gradients
- ❌ Playful design
- ❌ Unclear fees
- ✅ Navy + Trust Blue + Gold
- ✅ Professional + Trustworthy typography

### Healthcare
- ❌ Bright neon colors
- ❌ Motion-heavy animations
- ❌ AI purple/pink gradients
- ✅ Calm blue + Health green
- ✅ WCAG AAA compliance

### E-commerce Luxury
- ❌ Vibrant & Block-based
- ❌ Playful colors
- ❌ Fast animations
- ✅ Liquid Glass + Glassmorphism
- ✅ Slow parallax (400-600ms)

## Notas Importantes

1. **Siempre ejecuta --design-system primero**: No intentes generar design systems manualmente
2. **Respeta anti-patterns**: Son críticos para credibilidad de marca
3. **Usa persistencia para proyectos multi-página**: Mantén consistencia con MASTER.md
4. **Valida pre-delivery checklist**: Asegura calidad profesional

## Limitaciones

- Requiere Python 3 instalado
- Depende de archivos CSV en ui-ux-pro-max/data/
- No genera código directamente (usa frontend-design para eso)
- Funciona mejor con descripciones específicas de industria

## Próximos Pasos Después de Generar el Design System

1. **Implementar con frontend-design**: Crear componentes UI basados en el sistema
2. **Aplicar a stack específico**: Usar --stack para guías de implementación
3. **Validar accesibilidad**: Usar ux guidelines para WCAG compliance
4. **Iterar si es necesario**: Ajustar keywords y re-generar si no es el mejor match
