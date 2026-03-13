---
name: audio-expert-windows
description: Experto en el ecosistema de audio de Windows (WASAPI) y captura de loopback (grabación de sistema). Ideal para visualizadores de música, grabadores de pantalla y herramientas de procesamiento de sonido en tiempo real.
---

# Audio Expert Windows (WASAPI & Loopback)

Esta habilidad permite al agente diseñar e implementar soluciones robustas de audio en Windows, aprovechando las capacidades nativas de WASAPI y la librería `PyAudioWPatch`.

## 🛠️ Conocimiento Técnico Core

### WASAPI (Windows Audio Session API)

- **IAudioClient**: Interfaz principal para configurar y gestionar streams de audio.
- **Loopback Mode**: Permite capturar el flujo de audio que se envía a un dispositivo de salida (parlantes/audífonos).
- **Shared vs Exclusive Mode**: Prioriza el modo compartido para máxima compatibilidad con el sistema.
- **Latencia**: WASAPI ofrece menor latencia que MME o DirectSound.

### PyAudioWPatch

Es el fork recomendado para Python que parcha PortAudio para soportar loopback en Windows de forma nativa.

- **Detección Automática**: Usa `get_default_wasapi_loopback()` para encontrar los altavoces predeterminados rápidamente.
- **Context Managers**: Soporta `with pyaudiowpatch.PyAudio() as p:` para evitar fugas de memoria y bloqueos de driver.
- **Filtros de Dispositivos**: Los dispositivos de loopback aparecen como dispositivos de **entrada** (input).

## 🚀 Patrones de Implementación

### 1. Captura de Loopback Robusta

Para capturar el audio del sistema sin configuraciones manuales complejas:

```python
import pyaudiowpatch as pyaudio

def start_system_capture():
    with pyaudio.PyAudio() as p:
        try:
            # Obtener el dispositivo de loopback predeterminado
            wasapi_info = p.get_host_api_info_by_type(pyaudio.paWASAPI)
            default_speakers = p.get_default_output_device_info()

            # El "analogue" loopback es lo que permite grabar el sistema
            loopback = p.get_wasapi_loopback_analogue_by_dict(default_speakers)

            stream = p.open(
                format=pyaudio.paInt16,
                channels=loopback["maxInputChannels"],
                rate=int(loopback["defaultSampleRate"]),
                input=True,
                input_device_index=loopback["index"]
            )
            # ... procesamiento de audio ...
        except OSError as e:
            # Manejar AUDCLNT_E_DEVICE_INVALIDATED u otros errores WASAPI
            print(f"Error de audio: {e}")
```

### 2. Manejo de Errores WASAPI

- **AUDCLNT_E_DEVICE_INVALIDATED**: Ocurre cuando se desconecta un dispositivo o cambia la configuración de Windows. Requiere reinicializar el stream.
- **Buffer Overflow**: Indica que el procesamiento es más lento que la captura. Usa NumPy para vectorizar el análisis (RMS, FFT).

## 🕵️ Diagnóstico Forense

Cuando el audio no se captura:

1. **Listar Dispositivos**: Ejecuta `python -m pyaudiowpatch` para ver si el driver WASAPI está activo.
2. **Device Index**: Asegúrate de que el `input_device_index` apunte a un dispositivo con `maxInputChannels > 0` y que el nombre incluya `[Loopback]`.
3. **Muestreo**: WASAPI es estricto. Usa `int(device_info['defaultSampleRate'])` en lugar de valores hardcoded como 44100.
