---
name: analizador-repos-skills
description: "Analiza repositorios externos de skills AI y propone integraciones con el ecosistema local. Busca en GitHub, compara estructuras (SKILL.md, data/, scripts/), detecta duplicaciones, identifica mejoras y genera implementation plans. Use cuando: analizar skill externa, github skill, integrar conocimiento externo, comparar skills, skill repository analysis."
---

# Analizador de Repositorios de Skills

Especialista en análisis de repositorios externos de skills para AI coding assistants e integración de conocimiento externo en el ecosistema local.

## Cuándo Usar Esta Skill

Actívala cuando necesites:

- Analizar un repositorio GitHub de skills/prompts para AI
- Comparar skills externas con las locales
- Identificar mejoras o features faltantes
- Generar plan de integración
- Detectar duplicaciones de funcionalidad
- Actualizar knowledge base con nuevo conocimiento

## Capacidades

### 1. Búsqueda y Análisis Web

- Búsqueda de repositorios en GitHub
- Lectura de README, SKILL.md, y documentación
- Análisis de estructura de directorios
- Extracción de metadatos clave

### 2. Comparación Estructural

Compara:
- **Frontmatter**: name, description, triggers
- **Contenido**: workflows, ejemplos, knowledge base
- **Datos**: archivos CSV, JSON, YAML
- **Scripts**: Python, Bash, JavaScript helpers
- **Documentación**: calidad y completitud

### 3. Detección de Mejoras

Identifica:
- Features presentes en repo externo pero ausentes localmente
- Versiones más recientes de skills existentes
- Optimizaciones de workflow
- Mejoras en knowledge base (más datos, mejor estructura)
- Anti-patterns o bad practices a evitar

### 4. Generación de Implementation Plans

Crea planes detallados con:
- Hallazgos clave
- Componentes a actualizar
- Nuevas skills a crear
- Cambios propuestos con diff
- Plan de verificación
- User review checkpoints

## Workflow de Análisis

### Paso 1: Obtener URL del Repositorio

```yaml
input:
  url: "https://github.com/user/repo"
  type: "skill" | "prompt" | "knowledge-base"
```

### Paso 2: Explorar Estructura

```bash
# Opción 1: Usar read_url_content (sin JavaScript)
read_url_content(github_url)

# Opción 2: Usar web search para metadata
search_web("github repo_name skill AI")

# Opción 3: Si browser funciona, usar browser_subagent
browser_subagent -> navegar y extraer archivos
```

**Estructura típica a buscar:**

```
repo/
├── SKILL.md           # Archivo principal
├── README.md          # Documentación
├── data/              # Knowledge base (CSV, JSON)
├── scripts/           # Helpers automatizados
├── examples/          # Casos de uso
└── .cursorrules       # Reglas de activación
```

### Paso 3: Comparar con Skill Local

Si existe skill similar localmente:

```python
local_skill_path = f"d:/Projects/AI/Skill Agents/.agent/skills/{skill_name}/SKILL.md"

comparison = {
    "frontmatter": compare_yaml_frontmatter(local, external),
    "content_length": len(local) vs len(external),
    "features": extract_features(local) vs extract_features(external),
    "data_files": list_data_files(local) vs list_data_files(external),
    "scripts": list_scripts(local) vs list_scripts(external)
}
```

### Paso 4: Identificar Mejoras

```yaml
improvements:
  new_features:
    - "Design System Generator con 100 reasoning rules"
    - "Multi-domain search architecture"
    - "Persistencia con Master + Overrides pattern"

  data_expansions:
    - "ui-reasoning.csv: 100 reglas (vs 0 local)"
    - "styles.csv: 67 estilos (vs 50 local)"
    - "colors.csv: 96 paletas (vs 21 local)"

  workflow_improvements:
    - "CLI con --design-system flag para generación automática"
    - "BM25 ranking algorithm para mejor relevancia"

  missing_locally:
    - "scripts/design_system.py - Reasoning engine"
    - "scripts/search.py - CLI principal"
    - "scripts/core.py - BM25 search"
```

### Paso 5: Generar Implementation Plan

Crear artifact `implementation_plan.md` con:

1. **Executive Summary**: Hallazgos principales
2. **User Review Required**: Decisiones críticas, breaking changes
3. **Proposed Changes**: Por componente
   - Skills a actualizar
   - Skills nuevas a crear
   - Skills relacionadas a optimizar
4. **Verification Plan**: Pruebas automatizadas y manuales
5. **Consideraciones**: Versiones, performance, mantenimiento

### Paso 6: Solicitar Aprobación del Usuario

```markdown
notify_user(
  paths_to_review=["implementation_plan.md"],
  blocked_on_user=True,
  message="Plan de integración listo para revisión",
  should_auto_proceed=False  # Cambios significativos requieren aprobación
)
```

## Patrones de Integración

### Patrón 1: Actualización Simple

**Cuándo:** Skill existe localmente, repo externo tiene mejoras menores

```yaml
action: UPDATE
target: "local_skill/SKILL.md"
changes:
  - "Añadir nueva sección 'What's New in v2.0'"
  - "Actualizar frontmatter description"
  - "Agregar ejemplos de output"
```

### Patrón 2: Fusión de Knowledge Base

**Cuándo:** Ambos tienen data/, necesitamos fusionar CSV/JSON

```yaml
action: MERGE_DATA
target: "local_skill/data/"
strategy:
  - "Comparar columnas de CSV"
  - "Fusionar filas únicas"
  - "Resolver conflictos (priorizar externo si más completo)"
  - "Validar integridad post-merge"
```

### Patrón 3: Nueva Skill Derivada

**Cuándo:** Funcionalidad nueva que merece skill propia

```yaml
action: CREATE_NEW_SKILL
name: "nueva-skill-derivada"
source: "external_repo"
integration:
  - "Referencia a skill base"
  - "Comparte data/ si aplica"
  - "Workflow orquestador"
```

### Patrón 4: Optimización de Skills Relacionadas

**Cuándo:** Mejoras impactan múltiples skills

```yaml
action: OPTIMIZE_RELATED
targets:
  - "frontend-design"
  - "tailwind-design-system"
  - "react-patterns"
changes:
  - "Añadir referencias a diseñador-sistemas-visuales"
  - "Integrar anti-patterns del reasoning engine"
  - "Usar pre-delivery checklist"
```

## Ejemplo Completo: ui-ux-pro-max v2.0

### Input

```
Usuario: "Analiza https://github.com/nextlevelbuilder/ui-ux-pro-max-skill y actualiza mi conocimiento"
```

### Análisis

```yaml
repo_analysis:
  url: "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill"
  version: "v2.0"

  structure:
    SKILL.md: "✓ Presente"
    data/: "✓ 13 archivos CSV"
    scripts/: "✓ 3 archivos Python"
    README.md: "✓ Bien documentado"

  key_features:
    - "Design System Generator"
    - "100 industry-specific reasoning rules"
    - "Multi-domain search (5 parallel)"
    - "BM25 ranking algorithm"
    - "Master + Overrides persistence"

  comparison_with_local:
    version_local: "v1.0"
    missing_features: [
      "Design System Generator",
      "Reasoning engine",
      "Persistencia de design systems"
    ]
    data_gaps: [
      "ui-reasoning.csv (100 rules) - NO EXISTE LOCALMENTE",
      "styles.csv - 67 vs 50 localmente",
      "colors.csv - 96 vs 21 localmente"
    ]
    scripts_gaps: [
      "search.py - CLI principal",
      "design_system.py - Reasoning engine",
      "core.py - BM25 search"
    ]
```

### Implementation Plan Generado

```markdown
# Componente 1: ui-ux-pro-max (ACTUALIZAR)
- Actualizar SKILL.md con v2.0 features
- Añadir sección "What's New in v2.0"
- Modificar workflow para enfatizar --design-system

# Componente 2: diseñador-sistemas-visuales (CREAR)
- Nueva skill orquestadora
- Wrapper sobre ui-ux-pro-max
- Generación de MASTER.md + overrides

# Componente 3: analizador-repos-skills (CREAR)
- Esta misma skill
- Patrón reutilizable para futuros análisis

# Componente 4: Skills relacionadas (OPTIMIZAR)
- frontend-design: integrar anti-patterns
- tailwind-design-system: usar color palettes
- arquitecto-agents-skills: añadir patrón de análisis
```

### Validation

```bash
# Test 1: Verificar Design System Generation
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "test" --design-system

# Test 2: Verificar skill activation
# Prompt: "Build a landing page for fintech"
# Expected: ui-ux-pro-max auto-activates y ejecuta --design-system

# Test 3: Test de integración con frontend-design
# Prompt: "Create glassmorphism button"
# Expected: Referencia ui-ux-pro-max para valores
``

## Outputs Generados

### 1. Implementation Plan Artifact

**Ubicación:** `brain/{conversation-id}/implementation_plan.md`

**Contenido:**
- Executive summary
- User review required
- Proposed changes por componente
- Verification plan
- Consideraciones especiales

### 2. Task Breakdown Artifact

**Ubicación:** `brain/{conversation-id}/task.md`

**Fases:**
- [ ] Investigación y Análisis
- [ ] Planificación de Actualizaciones
- [ ] Implementación
- [ ] Validación

### 3. Hallazgos Document (Opcional)

**Ubicación:** `brain/{conversation-id}/findings.md`

**Contenido:**
- Análisis detallado de diferencias
- Tablas comparativas
- Código de ejemplo del repo externo
- Recomendaciones técnicas

## Integración con Otras Skills

### Con arquitecto-agents-skills

```yaml
when: "Después de integrar conocimiento externo"
action: "Activar arquitecto-agents-skills"
purpose: "Refinar y pulir todo el ecosistema de skills"
```

### Con skill-developer

```yaml
when: "Al crear nuevas skills"
action: "Usar skill-developer para estructura correcta"
purpose: "Asegurar YAML frontmatter y formatting correctos"
```

### Con verificador-riguroso

```yaml
when: "Antes de finalizar integración"
action: "Validar lógica y completitud"
purpose: "Evitar bugs y asegurar calidad"
```

## Limitaciones y Consideraciones

### Limitaciones Técnicas

1. **Browser limitations**: Si Playwright no está configurado, usar alternativas (read_url_content, web search)
2. **Private repos**: No puede acceder a repositorios privados sin autenticación
3. **Large repos**: Análisis completo puede ser costoso en tokens

### Best Practices

1. **Priorizar búsquedas específicas**: No analizar todo el repo, enfocarse en archivos clave
2. ** Validar antes de merge**: Siempre revisar cambios propuestos
3. **Mantener versiones**: Crear backup antes de cambios mayores
4. **Documentar origen**: Añadir comentarios indicando fuente externa

### Future Improvements

- [ ] Cacheo de análisis de repos frecuentes
- [ ] Comparación semántica de contenido (embeddings)
- [ ] Auto-sync con repos upstream
- [ ] Detección automática de breaking changes
- [ ] Métricas de calidad de skills (coverage, ejemplos, tests)

## Comandos Quick Reference

```bash
# Analizar repo externo
"Analiza https://github.com/user/repo-skill y actualiza conocimiento"

# Comparar con local
"Compara la skill X local con https://github.com/user/x-skill"

# Generar plan solamente (no ejecutar)
"Genera un plan para integrar https://github.com/user/skill pero no implementes aún"

# Fusionar knowledge base
"Fusiona los datos CSV de https://github.com/user/skill con mi skill local"
```
