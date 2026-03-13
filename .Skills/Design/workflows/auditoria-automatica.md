---
description: Auditoría de salud y consistencia del ecosistema de skills
---

# Workflow: Auditoría Automática

Mantiene el sistema libre de redundancias y errores.

1. **Escaneo**: Listar todos los archivos en `.agent/skills`.
2. **Consistencia**: Verificar que todos los `SKILL.md` tengan el frontmatter válido.
3. **Redundancia**: Cruzar descripciones para detectar skills que hagan lo mismo.
4. **Actualización**: Buscar menciones a versiones obsoletas de software (ej. Laravel 10) y proponer la actualización.
5. **Memoria**: Sincronizar lecciones aprendidas en `PROJECT_CONTEXT.md` hacia `GLOBAL_LEARNINGS.md`.
