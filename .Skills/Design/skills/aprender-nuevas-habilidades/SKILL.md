---
name: aprender-nuevas-habilidades
description: Guía detallada sobre cómo crear y organizar nuevas habilidades para el agente Antigravity AI. Úsalo cuando necesites entender la estructura de habilidades, los requisitos de YAML frontmatter o las mejores prácticas de documentación.
---

# Aprender Nuevas Habilidades

Esta habilidad proporciona instrucciones y plantillas para crear nuevas habilidades para el agente Antigravity AI, siguiendo la documentación oficial de [antigravity.google/docs/skills](https://antigravity.google/docs/skills).

## Estructura de Carpetas

Las habilidades se organizan en carpetas dentro de:

- **Espacio de trabajo**: `.agent/skills/<nombre-de-la-habilidad>/`
- **Globales**: `~/.gemini/antigravity/global_skills/<nombre-de-la-habilidad>/`

### Archivos Recomendados

- `SKILL.md` (Obligatorio): El archivo principal con metadatos e instrucciones.
- `scripts/`: Guiones de ayuda que el agente puede ejecutar.
- `examples/`: Implementaciones de referencia.
- `resources/`: Plantillas o datos adicionales.

## Cómo crear un archivo SKILL.md

Cada archivo `SKILL.md` debe comenzar con un bloque YAML frontmatter:

```yaml
---
name: nombre-de-la-habilidad
description: Breve explicación de qué hace la habilidad y cuándo usarla.
---
```

### Mejores Prácticas

1. **Descripción Clara**: El agente usa la descripción para decidir si activa la habilidad.
2. **Propósito Único**: Cada habilidad debe enfocarse en una tarea específica.
3. **Instrucciones en Markdown**: Proporciona pasos claros para que el agente los siga.
4. **Scripts de "Caja Negra"**: Si usas scripts, indica al agente que use `--help` para entender cómo funcionan.

## Ejemplo de Flujo de Trabajo

1. Crea la carpeta: `.agent/skills/mi-nueva-habilidad/`
2. Crea `SKILL.md` con el frontmatter adecuado.
3. Añade las instrucciones en Markdown debajo del frontmatter.
