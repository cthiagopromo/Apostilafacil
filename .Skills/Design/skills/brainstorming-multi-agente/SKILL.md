---
name: brainstorming-multi-agente
description: Protocolo de revisión de diseño secuencial con roles forzados para maximizar la confianza antes de implementar.
---

# Brainstorming Multi-Agente (Design Review)

Usa esta habilidad cuando un diseño o idea requiera alta confianza, reducción de riesgos o una revisión formal. Este protocolo orquestar una revisión secuencial donde cada "rol" tiene un mandato estricto.

## 👥 Los Roles (Gated & Constrained)

1.  **El Diseñador (Lead)**: Presenta la propuesta inicial. Su objetivo es la funcionalidad y la visión general.
2.  **El Escéptico (Challenger)**: Su misión es encontrar fallos. Pregunta "¿Qué pasa si...?", identifica casos de borde y señala debilidades lógicas.
3.  **El Guardián de Restricciones (Security/Perf)**: Verifica que el diseño cumpla con los límites (seguridad, rendimiento, coste, deuda técnica).
4.  **El Defensor del Usuario (UX/Product)**: Se asegura de que la solución sea usable, pragmática y resuelva el problema real del usuario (Userlg).
5.  **El Árbitro (Integrator)**: Recoge el feedback, resuelve conflictos y genera el plan de acción final.

## 🔄 El Proceso

### Fase 1: Presentación

El Diseñador expone el problema y la solución propuesta.

### Fase 2: El Guantelete (Review Loop)

Cada rol (Escéptico, Guardián, Defensor) emite su juicio por separado. No se permiten halagos, solo críticas constructivas y preguntas difíciles.

### Fase 3: Arbitraje

El Árbitro sintetiza las críticas. Si hay un fallo fatal, el diseño vuelve a la Fase 1. Si son ajustes menores, se incorporan al plan final.

## 📝 Artifact Obligatorio: `DECISION_LOG.md`

Cada sesión de brainstorming debe terminar con un registro de:

- Decisiones tomadas.
- Riesgos aceptados.
- Cambios realizados respecto a la propuesta original.

---

> [!NOTE]
> Esto **no es una tormenta de ideas caótica**. Es un proceso de filtrado secuencial para asegurar que solo las mejores ideas lleguen a producción.
