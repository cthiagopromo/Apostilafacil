---
name: mcp-server-expert
description: Guía técnica para construir servidores MCP (Model Context Protocol) de alta calidad en Python y Node.js.
---

# Experto en Servidores MCP

Esta habilidad te permite extender las capacidades de cualquier LLM mediante la creación de servidores MCP que exponen herramientas y recursos del mundo real.

## 🛠️ Stack de Implementación

### Python (FastMCP)

- Ideal para integración con ciencia de datos, scripts de automatización y herramientas rápidas.
- Uso de `fastmcp` para una definición declarativa de herramientas.

### Node.js / TypeScript (MCP SDK)

- Recomendado para herramientas de alta concurrencia, integraciones web y servicios empresariales.
- Uso del SDK oficial de Anthropic.

## 📐 Patrones de Diseño de Herramientas

1.  **Descripciones Semánticas**: Las descripciones son para el LLM, no para humanos. Sé excesivamente descriptivo sobre qué hace la herramienta y qué significan sus parámetros.
2.  **Validación de Esquema**: Usa JSON Schema estricto. Si un parámetro es un enum, oblígalo.
3.  **Manejo de Errores Descriptivo**: No devuelvas solo "Error 500". Devuelve "Fallo al conectar con la DB: el usuario 'admin' no tiene permisos de lectura en la tabla 'users'". Esto permite que el agente intente auto-corregirse.

## 🚀 Flujo de Desarrollo

1.  **Definir Capabilidades**: ¿Necesitas Herramientas (Tools), Recursos (Resources) o Prompts?
2.  **Implementar Lógica**: Código limpio y desacoplado del protocolo MCP.
3.  **Probar Localmente**: Usa el `mcp-inspector` para validar que el servidor responde correctamente.
4.  **Desplegar**: Configuración en el cliente (Claude Desktop, IDE, etc.).

---

> [!TIP]
> Un buen servidor MCP es invisible. El agente debería sentir que las herramientas son parte de sus capacidades nativas.
