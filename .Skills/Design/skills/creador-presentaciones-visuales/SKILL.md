ñ---
name: creadador-presentaciones-visuales
description: Crea presentaciones sorprendentes y visuales en Google Slides a partir de una entrada de blog. Úsalo cuando el usuario proporcione un link o contenido de un blog y necesite convertirlo en una presentación profesional.
---

# Creador de Presentaciones Visuales (Blog a Slides)

Esta habilidad te permite transformar contenido denso de un blog en una presentación de Google Slides estructurada, visual y lista para presentar.

## Flujo de Trabajo

### 1. Análisis de Contenido

- Lee la entrada del blog proporcionada.
- Divide el contenido en 5 a 8 diapositivas lógicas:
  - **Portada**: Título impactante y autor/blog.
  - **Introducción**: El "por qué" del tema.
  - **Puntos Clave**: 3-5 diapositivas con las ideas principales (puntos breves).
  - **Conclusión**: Resumen o llamado a la acción.

### 2. Diseño Visual

- **Paleta de Colores**: Identifica los colores principales del blog o usa una paleta moderna (ej. Azul oscuro y Dorado, o Verde Minimalista).
- **Imágenes**: Usa `generate_image` para crear una imagen de fondo o decorativa para la portada.

### 3. Automatización en Google Slides

Utiliza el `browser_subagent` para realizar los siguientes pasos:

1. Navega a `https://slides.new`.
2. **Configuración Inicial**: Ponle un nombre a la presentación haciendo clic en el campo de título del archivo.
3. **Diapositiva de Portada**:
   - Escribe el título en el cuadro de texto principal.
   - Escribe el subtítulo o fuente en el cuadro secundario.
4. **Agregar Diapositivas**:
   - Usa el botón "+" o el atajo de teclado para añadir nuevas diapositivas.
   - Elige diseños de "Título y Cuerpo" para el contenido.
5. **Estilo**:
   - Si es posible, selecciona un "Tema" del panel lateral derecho para mejorar la estética rápidamente.

## Instrucciones para el Agente

- **Concisión**: No copies párrafos enteros. Convierte el texto en "bullet points" fáciles de leer.
- **Feedback**: Informa al usuario sobre el progreso (ej. "Analizando el blog...", "Creando diapositivas en Google Slides...").
- **Enlace Final**: Al terminar, asegúrate de proporcionar el enlace de la presentación creada.

## Ejemplo de Comando

"Crea una presentación basada en este blog: https://ejemplo.com/ia-futuro"
