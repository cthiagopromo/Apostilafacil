---
name: mcp-hub-global
description: Centraliza y gestiona el acceso a servidores MCP (Model Context Protocol) activos. Permite al agente usar herramientas externas de Notion, GitHub, Upstash y TestSprite.
---

# MCP Hub Global: Conectividad Universal

Esta habilidad actúa como el registro maestro de servidores MCP activos en el entorno de Userlg. Permite al agente recordar, configurar e invocar herramientas externas de forma consistente.

## 🛠️ Servidores Activos y Configuración

Los siguientes servidores están configurados y deben ser accesibles:

### 1. Notion MCP (Remoto)

- **Propósito**: Gestión de conocimiento, bases de datos de Notion y notas del proyecto.
- **Acceso**: `https://mcp.notion.com/mcp`
- **Uso**: Lectura/Escritura de páginas y bases de datos.

### 2. context7 (Local/Upstash)

- **Propósito**: Memoria de contexto de largo plazo y recuperación de información sensible.
- **Comando**: `npx -y @upstash/context7-mcp`
- **API Key**: `ctx7sk-3e34fde8-70...`

### 3. GitHub MCP (Remoto)

- **Propósito**: Interacción profunda con repositorios, Pull Requests y Issues.
- **Acceso**: `https://api.githubcopilot.com/mcp/`

### 4. TestSprite (Local)

- **Propósito**: Pruebas automatizadas y control de calidad basado en IA.
- **Comando**: `npx -y @testsprite/testsprite-mcp@latest`
- **API Key**: `sk-user-iKkJNJNS...`

## 📐 Patrones de Uso Global

- **Invocación en Contexto**: Antes de iniciar una fase de "Conquista" (ej. Fase 1), verifica si el servidor de gestión (Notion) o el de memoria (context7) contienen directivas previas.
- **Seguridad**: Nunca expongas las API Keys de estos servidores en archivos públicos. Usa el `mcp-hub-global` como referencia interna.
- **Fallback**: Si un servidor MCP remoto falla, recurre a las herramientas locales equivalentes (`list_dir`, `grep_search`).

## 🚀 Cómo agregar nuevos servidores

Para añadir un servidor funcional al Hub:

1.  Verifica la conectividad vía terminal.
2.  Registra el comando, URL y propósito en esta skill.
3.  Actualiza `ACTIVITY_LOG.md` para notificar la nueva capacidad.

---

> [!IMPORTANT]
> El acceso a estos servidores me da "superpoderes" sobre Notion y GitHub. Úsalos con la elegancia y el cinismo que Userlg espera de un agente de élite.
