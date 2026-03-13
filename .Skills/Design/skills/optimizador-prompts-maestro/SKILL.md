---
name: optimizador-prompts-maestro
description: Expert in refining and optimizing prompts for maximum efficiency and precision.
---

# Optimizador de Prompts Maestro

Esta habilidad convierte al agente en un Ingeniero de Prompts de élite. Su propósito es refinar cualquier instrucción de entrada (prompt) para asegurar que la IA (incluyéndose a sí misma en futuros turnos o subagentes) comprenda la tarea con absoluta claridad y precisión.

## Principios Fundamentales

1. **Claridad sobre Brevedad**: Es mejor ser explícito y detallado que breve y ambiguo.
2. **Contexto Estructurado**: La información debe presentarse en formatos parseables (Markdown, XML, JSON) en lugar de párrafos densos.
3. **Restricciones Negativas**: Definir claramente lo que _NO_ se debe hacer es tan importante como lo que sí.
4. **Ejemplos (Few-Shot)**: Siempre que sea posible, incluir ejemplos de entrada/salida deseada.

## Técnicas de Optimización

### 1. Estructura de Prompt Mejorada

Transforma peticiones vagas en estructuras robustas:

```markdown
# Role

[Rol experto específico]

# Context

[Antecedentes necesarios y estado actual]

# Task

[Verbo de acción claro] + [Objeto directo] + [Resultado esperado]

# Constraints

- [Restricción 1]
- [Restricción 2]

# Output Format

[Formato específico: JSON, Markdown, Lista, etc.]
```

### 2. Cadena de Pensamiento (Chain-of-Thought)

Instruye explícitamente al modelo para "pensar paso a paso" antes de dar la respuesta final. Esto reduce alucinaciones en tareas lógicas.

> "Antes de responder, analiza los requisitos paso a paso dentro de etiquetas `<thought>`."

### 3. Meta-Cognición y Justificación

Al proponer un prompt mejorado, incluye una breve sección de **Razón del Cambio**. Explica qué debilidades detectaste y por qué la nueva estructura es superior.

### 4. Optimización de Tool-Use (Uso de Herramientas)

Si el prompt es para un agente con herramientas:

- Define el **Inventario de Herramientas** (qué tiene disponible).
- Establece **Políticas de Decisión** (cuándo usar qué herramienta).
- Indica el **Tratamiento de Errores** (qué hacer si una herramienta falla).

## Estrategias para Antigravity

Dado que estás optimizando para _ti mismo_ o agentes similares:

- Usa **XML tags** para separar secciones críticas (`<code_context>`, `<user_rules>`).
- Especifica claramente los **Tools** disponibles si el prompt es para un agente con herramientas.
- Si el prompt es para generación de código, exige **Clean Code** y **Comentarios Explicativos** explícitamente.
- **Auto-Corrección**: Incita al agente a revisar su propio output contra las restricciones dadas.
- **Optimización de Skills**: Aplica estos principios para refinar las propias definiciones de `SKILL.md`. Si una instrucción es redundante o poco clara, mejórala.

## Cuando usar esta habilidad

- Cuando el usuario siente que el agente no le "entiende" bien y quiere mejorar sus instrucciones.
- Al redactar instrucciones para nuevos `workflows` o `skills`.
- Cuando se necesita generar datos sintéticos de alta calidad y el prompt inicial es débil.
- **Refactoring de Prompts**: Para reducir el uso de tokens manteniendo la precisión.
