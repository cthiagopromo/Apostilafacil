---
name: asimilador-conocimiento-ia
description: Absorbe y destila conocimientos de URLs o carpetas de proyectos para crear o mejorar habilidades.
---

# Asimilador de Conocimiento IA

Esta habilidad te permite "subir de nivel" analizando fuentes de información de alta calidad y transformándolas en habilidades accionables dentro de tu repertorio.

## Protocolo de Absorción

### 1. Ingesta (Ingestion)

- **Fuentes Externas**: Usa `read_url_content` para leer documentación, artículos o blogs.
- **Fuentes Locales**: Usa `list_dir` y `view_file` para analizar un proyecto.
- **Protocolos de Contexto**: Identifica y utiliza servidores **MCP** (Model Context Protocol) o recursos de **Laravel Boost** (`.ai/guidelines`) para obtener conocimiento profundo y específico de la aplicación.

### 2. Destilación (Distillation)

Analiza el contenido buscando:

- **Patrones de Diseño**: ¿Cómo resuelven los problemas en esta fuente? (Ej: Downmixing multicanal ponderado, Filtros Integrales + Fall-off para señales continuas).
- **Nuevas Herramientas**: ¿Qué librerías o comandos usan que yo no conocía?
- **Mejores Prácticas**: ¿Qué estándares de seguridad o performance mencionan?
- **Manejo de Errores**: ¿Cómo lidian con los fallos? (Ej: Detección forense de dispositivos WASAPI en Windows).

### 3. Síntesis y Optimización Transversal (Synthesis)

Compara la información nueva con **todo** tu repertorio actual para maximizar el impacto:

- **Refactorización de Skills**: No te limites a habilidades similares. Si el conocimiento nuevo puede optimizar la eficiencia, seguridad o alcance de _cualquier_ otra habilidad (ej. una nueva técnica de testing que mejore al `arquitecto-software-senior`), aplícalo inmediatamente.
- **Detección de Sinergias**: Identifica cómo la nueva información puede conectar dos habilidades existentes para crear un flujo de trabajo más potente.
- **Evolución de Estándares**: Si descubres una mejor práctica "estándar de la industria", actualiza todas tus habilidades maestras para que la sigan por defecto.
- **Nueva Habilidad**: Si es un área huérfana, diseña un nuevo `SKILL.md`.

### 4. Integración (Integration)

Sigue el protocolo de `aprender-nuevas-habilidades` para escribir o modificar los archivos en `.agent/skills/`.

### 5. Auto-Evolución (Trigger)

Inmediatamente después de integrar conocimiento nuevo, invoca a la skill **[arquitecto-agents-skills](file:///d:/Projects/AI/Skill%20Agents/.agent/skills/arquitecto-agents-skills/SKILL.md)** para auditar y optimizar el resto del ecosistema basándose en la nueva información.

## Directrices para el Agente

- **Impacto Total**: Tu objetivo no es solo saber más, sino ser **más eficiente**. Cada asimilación debe dejar tu repertorio global en un estado mejor que el anterior.
- **Recursive Optimization**: Cada vez que actualices una habilidad, pregúntate: "¿Esta mejora requiere actualizar otra?". Mantén la coherencia en todo el ecosistema.
- **Calidad sobre Cantidad**: No agregues habilidades redundantes. Solo "asimila" lo que realmente aporte valor real y práctico.
- **Justificación**: Explica al usuario cómo esta nueva información mejora no solo una habilidad, sino el **alcance y eficiencia** de tu trabajo general.

## Cuando usar esta habilidad

- Cuando el usuario te pase un link a una documentación nueva.
- Al interactuar con un repositorio que usa tecnologías que desconoces.
- Cuando quieras optimizar tu propio flujo de trabajo basado en nuevas tendencias (ej. **Laravel MCP** o **Inertia.js v2**).
