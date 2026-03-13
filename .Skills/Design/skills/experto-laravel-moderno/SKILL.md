---
name: experto-laravel-moderno
description: Especialista en Laravel 11/12. Domina el minimalismo estructural, WebSockets con Reverb, bundling con Vite y herramientas AI-Native (Boost, MCP).
---

# Experto en Laravel Moderno (v11/v12)

Esta habilidad te posiciona en la vanguardia del ecosistema Laravel, optimizando aplicaciones para la era de la IA y el minimalismo estructural.

## Enfoque Tecnológico

### 1. Estructura Minimalista

Laravel 11+ ha simplificado drásticamente el boilerplate.

- **Bootstrap**: Todo el ruteo, middleware y excepciones se configuran en `bootstrap/app.php`.
- **Configuración**: Solo publica los archivos de config que necesites modificar (`php artisan config:publish`).
- **SQLite por defecto**: Úsalo para prototipado rápido y tests.

### 2. Capacidades AI-Native

Aprovecha las herramientas nativas para agentes IA:

- **Laravel Boost**: Utiliza `.ai/guidelines/` para proporcionar contexto específico a otros agentes o a ti mismo en futuras sesiones.
- **Laravel MCP**: Diseña y consume servidores MCP para que la IA pueda interactuar directamente con la lógica de negocio, base de datos y logs.
- **Artisan Boost**: Usa `php artisan boost:install` para preparar el entorno para la IA.

### 3. Ecosistema de Alto Rendimiento

- **Starter Kits**: Prefiere Laravel Breeze (minimalista) o Jetstream (robusto) con **Inertia.js v2**.
- **Asset Bundling**: Usa **Vite** con Hot Module Replacement (HMR).
- **WebSockets**: Usa **Laravel Reverb** para comunicación en tiempo real sin dependencias externas.
- **Monitoring**: Implementa **Laravel Pulse** para dashboards de salud en tiempo real.

## Patrones de Diseño Recomendados

- **Service Classes**: Mantén los controladores delgados (Thin Controllers) moviendo la lógica a servicios.
- **Action Classes**: Para procesos complejos y reutilizables.
- **API Resources**: Úsalos para estandarizar las respuestas, pero respeta el patrón de respuesta preferido por el usuario: `{ code, status, data }`.
- **Naming Conventions**: Pivot tables en `singular_singular` (ej. `book_category`).
- **Strict Typing**: Aplica tipado estricto de PHP 8.2+ en todas las firmas de métodos y propiedades.

## Checklist de Aplicación

1. ¿Se puede simplificar la configuración usando `bootstrap/app.php`?
2. ¿Estamos usando Vite para los assets?
3. ¿La autenticación de la API sigue los estándares de Sanctum o Passport?
4. ¿Podemos exponer herramientas vía MCP para facilitar el mantenimiento futuro?
