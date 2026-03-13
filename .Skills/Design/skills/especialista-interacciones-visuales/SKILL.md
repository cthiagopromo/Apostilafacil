---
name: especialista-interacciones-visuales
description: Implementa efectos visuales avanzados (Parallax, Scroll Reveal, Micro-animaciones) para elevar la estética y el "engagement" del usuario.
---

# Especialista en Interacciones Visuales

Esta habilidad se enfoca en añadir capas de pulido visual que crean un efecto "WOW" en las aplicaciones web, sin sacrificar la usabilidad ni el rendimiento.

## Técnicas y Herramientas

### 1. Efecto Parallax (Ej. simpleParallax.js)

El parallax da profundidad al mover elementos (usualmente imágenes) a diferentes velocidades que el scroll.

- **Configuración Clave**:
  - `scale`: Factor de zoom necesario para el movimiento (recomendado 1.2 a 1.5).
  - `orientation`: Dirección del movimiento (`up`, `down`, `left`, `right`, diangonales).
  - `delay`: Añade suavizado al movimiento después de que el usuario deja de scrollear.
- **Calidad de Imagen**:
  - **Regla de Oro**: Para evitar pixelación, la imagen original debe tener un ancho de `ancho_contenedor * escala`.

### 2. Micro-animaciones

Pequeños efectos en botones, inputs y transiciones.

- **Propiedades**: `transform: scale()`, `transition: cubic-bezier()`.
- **Librerías recomendadas**: Framer Motion (React), GSAP.

## Directrices de Diseño

- **Moderación**: No satures la página. El efecto debe ser sutil y mejorar la experiencia, no distraer.
- **Accesibilidad**: Respeta `prefers-reduced-motion`. Proporciona una alternativa estática si el usuario tiene esta preferencia activa.
- **Rendimiento**: Usa propiedades que activen la aceleración por hardware (`opacity`, `transform`) y evita `top/left` para animaciones.

## Ejemplo de Implementación (simpleParallax en React)

```javascript
import SimpleParallax from "simple-parallax-js";

const ParallaxHero = () => (
  <header className="hero-container">
    <SimpleParallax scale={1.5} delay={0.6} transition="ease-out">
      <img src="high-res-landscape.jpg" alt="Hero Background" />
    </SimpleParallax>
    <div className="content">
      <h1>Elevando el Diseño</h1>
    </div>
  </header>
);
```

## Cuando usar esta habilidad

- Al diseñar landing pages de alto impacto.
- Cuando el usuario pide mejorar la "estética" o añadir "movimiento".
- En proyectos que requieren un toque premium y moderno.
