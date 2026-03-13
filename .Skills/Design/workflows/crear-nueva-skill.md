---
description: Cómo crear una nueva habilidad (skill) para el agente
---

# Workflow: Crear Nueva Skill

Este workflow guía la expansión segura del repertorio del agente.

1. **Investigación**: Analiza si la funcionalidad ya existe en otra skill o si merece una propia.
2. **Estructura**: Crea una carpeta en `.agent/skills/{nombre-skill}`.
3. **Contenido**: Crea un archivo `SKILL.md` con el siguiente template:
   ```yaml
   ---
   name: {nombre-skill}
   description: {una-linea-descriptiva}
   ---
   # {Nombre Legible}
   ... instrucciones detalladas ...
   ```
4. **Validación**: Verifica que no haya conflictos con `perfil-usuario-userlg`.
5. **Registro**: Actualiza `ACTIVITY_LOG.md` notificando la nueva capacidad.
6. **Auto-Auditoría**: Invoca a `arquitecto-agents-skills` para integrar la nueva skill en el ecosistema.
