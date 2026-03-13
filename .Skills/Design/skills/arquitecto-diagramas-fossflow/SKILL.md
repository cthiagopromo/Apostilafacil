---
description: Analiza la arquitectura de sistemas y genera diagramas isométricos profesionales con FossFLOW. Extrae componentes, relaciones y flujos de datos de cualquier codebase o descripción arquitectónica.
---

# Skill: Arquitecto de Diagramas FossFLOW

## 🎯 Propósito

Esta skill te permite analizar la arquitectura de un sistema (desde código fuente, documentación o descripción) y generar diagramas isométricos profesionales usando **FossFLOW**, una herramienta open-source especializada en diagramas de infraestructura.

**Use cuando:**

- El usuario pida "analizar arquitectura", "diagrama de sistema", "visualizar infraestructura"
- Mencione "FossFLOW", "diagrama isométrico", "arquitectura visual"
- Quiera documentar la estructura de un proyecto
- Necesite exportar diagramas en formato JSON para FossFLOW

---

## 📚 ¿Qué es FossFLOW?

**FossFLOW** es una Progressive Web App (PWA) de código abierto que permite crear hermosos diagramas isométricos de infraestructura. Está construida con **React** y la librería [Isoflow](https://github.com/markmanx/isoflow) (ahora forkeada y publicada a NPM como `fossflow`), funcionando completamente en el navegador con soporte offline.

### Características principales:

- ✅ **Editor visual interactivo** con drag-and-drop
- ✅ **Componentes predefinidos** (servidores, bases de datos, servicios cloud, etc.)
- ✅ **Conectores visuales** entre componentes con dos modos:
  - **Click mode** (por defecto): Click en primer nodo, luego en segundo nodo
  - **Drag mode**: Click y arrastra desde primer nodo hasta segundo nodo
- ✅ **Exportación/Importación JSON** para automatización
- ✅ **Funciona offline** (PWA)
- ✅ **Auto-guardado** cada 5 segundos en sesión
- ✅ **Múltiples opciones de almacenamiento** (Session Storage, Export/Import, Server Storage)
- ✅ **Deploy rápido con Docker** (`stnsmith/fossflow:latest`)
- ✅ **Totalmente gratuito y open-source**

### Estructura del Proyecto (Monorepo):

- **`packages/fossflow-lib`**: Librería de componentes React para dibujar diagramas de red (construida con Webpack)
- **`packages/fossflow-app`**: Progressive Web App que envuelve la librería (construida con RSBuild)

**URL online:** https://stan-smith.github.io/FossFLOW/  
**Docker Hub:** `stnsmith/fossflow:latest`

---

## 🔬 Metodología de Análisis

### Fase 1: Descubrimiento de Arquitectura

Identifica los componentes del sistema mediante:

1. **Análisis de código fuente:**
   - Detecta frameworks y tecnologías (package.json, requirements.txt, Dockerfile, etc.)
   - Identifica servicios, APIs, bases de datos
   - Mapea dependencias entre módulos

2. **Análisis de infraestructura:**
   - Lee archivos de configuración (docker-compose.yml, kubernetes manifests)
   - Detecta servicios externos (AWS, Azure, GCP)
   - Identifica patrones arquitectónicos (microservicios, monolito, serverless)

3. **Análisis de documentación:**
   - Extrae información de README.md, ADRs, wikis
   - Identifica componentes mencionados en diagramas existentes

### Fase 2: Clasificación de Componentes

Clasifica cada componente detectado según su tipo:

| Categoría           | Ejemplos                           | Icono FossFLOW                |
| ------------------- | ---------------------------------- | ----------------------------- |
| **Frontend**        | React, Vue, Angular, HTML/CSS/JS   | `web-app`, `mobile-app`       |
| **Backend**         | Node.js, Django, FastAPI, Express  | `server`, `api-gateway`       |
| **Base de Datos**   | PostgreSQL, MongoDB, Redis, MySQL  | `database`, `cache`           |
| **Mensaje/Cola**    | RabbitMQ, Kafka, Redis Pub/Sub     | `message-queue`               |
| **Cloud Services**  | S3, Lambda, CloudFront, RDS        | `cloud-storage`, `serverless` |
| **Contenedores**    | Docker, Kubernetes, Docker Compose | `container`, `orchestrator`   |
| **Infraestructura** | Nginx, HAProxy, Load Balancer      | `load-balancer`, `proxy`      |
| **Monitoreo**       | Prometheus, Grafana, ELK           | `monitoring`, `logging`       |
| **CI/CD**           | GitHub Actions, Jenkins, GitLab CI | `pipeline`, `deployment`      |

### Fase 3: Mapeo de Relaciones

Define las conexiones entre componentes:

- **HTTP/REST:** Frontend ↔ Backend
- **Consultas DB:** Backend ↔ Database
- **Mensajes:** Backend ↔ Message Queue
- **Storage:** Backend ↔ Cloud Storage
- **Caché:** Backend ↔ Redis/Memcached
- **Orquestación:** Kubernetes ↔ Containers

### Fase 4: Generación del Diagrama

Estructura la información en formato JSON compatible con FossFLOW.

---

## 🐳 Deployment

### Docker (Recomendado)

**Con Docker Compose (incluye almacenamiento persistente):**

```bash
docker compose up
```

**O ejecutar directamente desde Docker Hub:**

```bash
# Con almacenamiento persistente (por defecto)
docker run -p 80:80 -v $(pwd)/diagrams:/data/diagrams stnsmith/fossflow:latest

# Sin almacenamiento persistente
docker run -p 80:80 -e ENABLE_SERVER_STORAGE=false stnsmith/fossflow:latest
```

### Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/stan-smith/FossFLOW
cd FossFLOW

# Instalar dependencias
npm install

# Construir la librería (requerido la primera vez)
npm run build:lib

# Iniciar servidor de desarrollo
npm run dev
```

**Comandos disponibles:**

- `npm run dev` - Iniciar servidor de desarrollo de la app
- `npm run dev:lib` - Watch mode para desarrollo de la librería
- `npm run build` - Construir librería y app
- `npm run build:lib` - Construir solo librería
- `npm run build:app` - Construir solo app
- `npm test` - Ejecutar tests unitarios
- `npm run lint` - Verificar errores de linting

---

## 📋 Flujo de Trabajo

### Paso 1: Analizar el Sistema

**Entrada del usuario:** "Analiza la arquitectura de este proyecto y crea un diagrama con FossFLOW"

**Acciones del agente:**

1. Escanear archivos clave:
   - package.json / requirements.txt → Tecnologías
   - docker-compose.yml → Servicios y contenedores
   - README.md → Descripción de componentes
   - /src, /api, /database → Estructura del código

2. Detectar patrones:
   - Microservicios vs Monolito
   - Serverless vs Traditional
   - Cloud-native vs On-premise

3. Listar componentes encontrados

### Paso 2: Crear el Diagrama JSON

Debes generar un archivo `.json` que respete estrictamente el siguiente esquema validado.

### 🧠 Estructura del Archivo JSON

```json
{
  "title": "Diagrama de Arquitectura",
  "icons": [
    // Array de definiciones de iconos (usualmente SVGs en base64)
    // Se recomienda reutilizar los iconos estándar de FossFLOW (server, desktop, user, etc.)
    {
      "id": "server",
      "name": "Server",
      "url": "data:image/svg+xml;base64,...",
      "isIsometric": true,
      "collection": "isoflow"
    }
  ],
  "items": [
    // INVENTARIO LÓGICO DE ELEMENTOS (Modelos)
    // Define QUÉ elementos existen en el diagrama, independientemente de su posición visual
    {
      "id": "uuid-server-db-prod",
      "name": "DB Production",
      "icon": "server" // Referencia al ID en 'icons'
    },
    {
      "id": "uuid-user-client",
      "name": "Usuario Final",
      "icon": "user"
    }
  ],
  "views": [
    {
      "id": "view-main",
      "name": "Vista Principal",
      "items": [
        // INSTANCIAS VISUALES
        // Posiciona los elementos del inventario en la rejilla isométrica
        {
          "id": "uuid-server-db-prod", // Debe coincidir con un ID en 'items' (inventario)
          "tile": {
            "x": 0, // Eje isométrico X (positivo = abajo-derecha)
            "y": 0  // Eje isométrico Y (positivo = abajo-izquierda)
          },
          "labelHeight": 80
        },
        {
          "id": "uuid-user-client",
          "tile": { "x": -2, "y": 2 }
        }
      ],
      "connectors": [
        {
          "id": "conn-1",
          "color": "blue", // Opciones: blue, red, green, orange, gray
          "anchors": [
            {
              "id": "anchor-start",
              "ref": { "item": "uuid-user-client" } // Conectar a un item
            },
            {
              "id": "anchor-end",
              "ref": { "item": "uuid-server-db-prod" }
            }
          ]
        }
      ],
      "rectangles": [
        // ZONAS / GRUPOS VISUALES
        {
          "id": "zone-backend",
          "color": "green",
          "from": { "x": -1, "y": -1 }, // Coordenada inicio (esquina superior)
          "to": { "x": 1, "y": 1 }      // Coordenada fin (esquina inferior)
        }
      ]
    }
  ]
}
```

### 📍 Coordenadas Isométricas (Tile System)
FossFLOW usa una rejilla de baldosas (`tile`) donde:
- **x**: Diagonal hacia abajo-derecha (↗️ ↙️)
- **y**: Diagonal hacia abajo-izquierda (↖️ ↘️)
- `labelHeight`: Altura del texto flotante sobre el icono (default ~80).

**Nota de Implementación:** Genera UUIDs únicos v4 para todos los campos `id`.

### Paso 3: Uso en FossFLOW

**Creando Diagramas:**

1. **Agregar componentes:**
   - Presiona el botón "+" en el menú superior derecho
   - Arrastra y suelta componentes desde la librería al canvas
   - O clic derecho en la cuadrícula → "Add node"

2. **Conectar componentes:**
   - Selecciona la herramienta Connector (presiona 'C' o clic en ícono)
   - **Modo Click** (por defecto): Click en primer nodo, luego en segundo
   - **Modo Drag** (opcional): Click y arrastra desde primer nodo hasta segundo
   - Cambia el modo en: Settings → Connectors tab

3. **Guardar trabajo:**
   - **Quick Save**: Guarda en sesión del navegador
   - **Export**: Descarga como archivo JSON
   - **Import**: Carga desde archivo JSON

**Opciones de Almacenamiento:**

- **Session Storage**: Guardado temporal (se borra al cerrar navegador)
- **Export/Import**: Almacenamiento permanente como archivos JSON
- **Auto-Save**: Guardado automático cada 5 segundos en sesión
- **Server Storage** (Docker): Almacenamiento persistente en `./diagrams` del host

---

## 📦 Componentes FossFLOW Disponibles

| Categoría           | Tipo de Nodo     | Uso Recomendado                                 |
| ------------------- | ---------------- | ----------------------------------------------- |
| **Aplicaciones**    | `web-app`        | Frontend web (React, Vue, Angular)              |
|                     | `mobile-app`     | Apps móviles (iOS, Android, React Native)       |
| **Backend**         | `server`         | Servidores backend (Node.js, Django, etc.)      |
|                     | `api-gateway`    | API Gateway (Kong, AWS API Gateway)             |
| **Datos**           | `database`       | Bases de datos relacionales (PostgreSQL, MySQL) |
|                     | `nosql-database` | Bases NoSQL (MongoDB, DynamoDB)                 |
|                     | `cache`          | Sistemas de caché (Redis, Memcached)            |
| **Cloud**           | `cloud-storage`  | Almacenamiento cloud (S3, Azure Blob)           |
|                     | `cdn`            | CDN (CloudFront, Cloudflare)                    |
|                     | `serverless`     | Funciones serverless (Lambda, Cloud Functions)  |
| **Infraestructura** | `load-balancer`  | Balanceadores de carga                          |
|                     | `proxy`          | Proxies reversos (Nginx, HAProxy)               |
|                     | `container`      | Contenedores Docker                             |
|                     | `orchestrator`   | Orquestadores (Kubernetes, ECS)                 |

---

## 🎨 Mejores Prácticas de Diseño

### Organización Visual

1. **Disposición horizontal:** Frontend (izquierda) → Backend (centro) → Database (derecha)
2. **Uso de capas (eje Z):**
   - `z = 0`: Componentes principales
   - `z = -1`: Servicios auxiliares
   - `z = -2`: Infraestructura

### Paleta de Colores Recomendada

```javascript
const techColors = {
  react: "#61DAFB",
  vue: "#42B883",
  nodejs: "#68A063",
  postgresql: "#336791",
  mongodb: "#47A248",
  redis: "#DC382D",
  aws: "#FF9900",
  docker: "#2496ED",
  kubernetes: "#326CE5",
};
```

---

## 🔧 Comandos de Activación

Esta skill se activa cuando detectas:

**Keywords:**

- "analiza arquitectura"
- "diagrama fossflow"
- "visualizar sistema"
- "crear diagrama isométrico"

**File patterns:**

- `docker-compose.yml` + request de diagrama
- `architecture.md` + request de visualización

---

## 📋 Checklist de Output

Asegúrate de entregar:

- [ ] Archivo JSON compatible con FossFLOW
- [ ] Documento Markdown con:
  - [ ] Lista de componentes
  - [ ] Descripción de relaciones
  - [ ] Instrucciones de importación
  - [ ] Guía de personalización
- [ ] Recomendaciones de mejora (opcional)

---

## 📚 Referencias

- **FossFLOW Web App:** https://stan-smith.github.io/FossFLOW/
- **GitHub Repository:** https://github.com/stan-smith/FossFLOW
- **Docker Image:** `stnsmith/fossflow:latest`

---

---

## 🎓 Recursos Adicionales

### Documentación Oficial:

- **README en Español:** https://github.com/stan-smith/FossFLOW/blob/master/docs/README.es.md
- **Guía de Contribución:** https://github.com/stan-smith/FossFLOW/blob/master/CONTRIBUTING.md
- **Tests E2E (Selenium):** Disponibles en `e2e-tests/` del repositorio

### Créditos:

FossFLOW está construido sobre la librería [Isoflow](https://github.com/markmanx/isoflow) creada por [@markmanx](https://github.com/markmanx).

---

**Mantenedor:** Antigravity AI Agent  
**Última actualización:** 2026-02-03  
**Estado:** ✅ Activa
