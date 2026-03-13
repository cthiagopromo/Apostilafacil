---
name: detective-debugging
description: Soluciona problemas complejos usando el Método Científico (Observación, Hipótesis, Experimento, Conclusión). Absorbe y unifica la lógica de Systematic Debugging.
---

# Detective del Debugging (Unified)

Esta habilidad es el protocolo definitivo para abordar errores técnicos. Evita el "ensayo y error" aleatorio y se centra en la evidencia empírica.

## 🔴 La Ley de Hierro

> **NO HAY SOLUCIONES SIN INVESTIGACIÓN DE CAUSA RAÍZ PRIMERO.**

Si no has completado la Fase 1, no puedes proponer arreglos. El parche rápido es el enemigo de la estabilidad.

## 💀 MANDATO GLOBAL (Prime Directives)

1.  **Personalidad**: Usa **[personalidad-sarcasmo-negro](file:///d:/Projects/AI/Skill%20Agents/.agent/skills/personalidad-sarcasmo-negro/SKILL.md)**. El código es basura hasta que se demuestre lo contrario.
2.  **Bitácora**: Registra el bug y la autopsia en `ACTIVITY_LOG.md`.
3.  **Optimización**: Si no entiendes el error, procesa el stack trace con **[optimizador-prompts-maestro](file:///d:/Projects/AI/Skill%20Agents/.agent/skills/optimizador-prompts-maestro/SKILL.md)** para hallar claridad.

## 🕵️ El Protocolo de Investigación

### Fase 1: Investigación de Causa Raíz (Root Cause)

1. **Lectura Crítica de Errores**: No ignores ni resumas los errores. Lee los stack traces completos. Anota líneas, rutas y códigos de error.
2. **Reproducción Consistente**: ¿Puedes activarlo de forma fiable? Define los pasos exactos. Si no es reproducible, necesitas más logs, no una hipótesis.
3. **Diferencial de Cambios**: ¿Qué ha cambiado recientemente? (Git diff, dependencias, actualizaciones de config).
4. **Instrumentación de Diagnóstico**:
   - En sistemas multicomponente, añade logs en cada frontera.
   - Rastrea el flujo de datos hacia atrás (backward tracing) desde el síntoma hasta el origen.
   - **Arregla en el origen, no en el síntoma.**
5. **Aislamiento de Rutas Hardware**:
   - En sistemas con múltiples drivers (ej. NVIDIA HDMI y Realtek Onboard), verifica si el destino físico coincide con el origen de captura.
   - **Loopback Validation**: En Windows (WASAPI), confirma si el dispositivo de captura es un "Loopback Analogue". El software (Stereo Mix) a menudo no puede "puentear" señales entre dispositivos de hardware distintos fuera de WASAPI.
   - **Limitación**: El software estándar a menudo falla al capturar audio de dispositivos Bluetooth o HDMI sin el parche WASAPI adecuado.
   - **Prueba**: Cambia la salida física para confirmar si el problema persiste.

### Fase 2: Análisis de Patrones e Hipótesis

1. **Búsqueda de Ejemplos Funcionales**: Localiza código similar que sí funcione. Compara cada detalle, por pequeño que parezca.
2. **Formulación Científica**: "Creo que el problema es X porque observo Y". Enuncia tu hipótesis antes de tocar el código.
3. **Experimento Mínimo**: Haz el cambio más pequeño posible para validar la hipótesis. Una variable a la vez.

### Fase 3: Implementación y Validación

1. **Test de Fallo (TDD)**: Crea una prueba (o script mínimo) que falle debido al bug identificado.
2. **Corrección de Raíz**: Aplica la solución basándote en la validación de la fase anterior.
3. **Limpieza Forense**: Elimina todos los logs y código temporal de debugging.

## 🚩 Señales de Alerta (Red Flags)

- **AUDCLNT_E_DEVICE_INVALIDATED**: Error crítico en WASAPI. Indica que el dispositivo dejó de estar disponible o cambió el formato. Requiere reinicializar todo el subsistema de audio.
- **Formato No Soportado**: WASAPI es extremadamente rígido con `sample_rate` y `channels`. Siempre usa los valores predeterminados (`defaultSampleRate`) obtenidos del diccionario del dispositivo.

## 📝 Registro y Persistencia (User-Triggered Closure)

No asumas el éxito hasta que el usuario confirme. Una vez validada la solución:

1. **Invocación de Memoria**: Usa **[gestor-memoria-proyecto](file:///d:/Projects/AI/Skill%20Agents/.agent/skills/gestor-memoria-proyecto/SKILL.md)**.
2. **Registro Dual Obligatorio**:
   - **Local**: Registra el binomio Problema/Solución en `PROJECT_CONTEXT.md`.
   - **Global**: Registra la lección aprendida en **[GLOBAL_LEARNINGS.md](file:///d:/Projects/AI/Skill%20Agents/GLOBAL_LEARNINGS.md)**.
3. **Evolución**: Invoca a **[arquitecto-agents-skills](file:///d:/Projects/AI/Skill%20Agents/.agent/skills/arquitecto-agents-skills/SKILL.md)** para ver si el bug revela una debilidad en otra skill o una oportunidad de automatización.

## 🚩 Señales de Alerta (Red Flags)

Si te encuentras diciendo:

- "Voy a probar este cambio rápido a ver si funciona".
- "Es parecido a un bug que vi, así que la solución debe ser la misma".
- "Voy a aplicar 3 cambios a la vez para ahorrar tiempo".

**DETENTE.** Vuelve a la Fase 1. Estás adivinando, no investigando.
