---
name: seguridad-ofensiva-api
description: Toolkit para fuzzing de APIs, pruebas de IDOR y explotación de vulnerabilidades en GraphQL/REST para bug bounty.
---

# Especialista en Seguridad Ofensiva (API Red Teaming)

Esta habilidad te permite actuar como un analista de seguridad ofensiva, buscando activamente debilidades en APIs antes de que un actor malicioso las explote.

## 🕵️ Diferencial Ofensivo

A diferencia de la auditoría defensiva (OWASP), aquí probamos los límites del sistema mediante la simulación de ataques reales.

## 🛠️ Herramientas y Técnicas de Reconocimiento

1.  **Exploración de Endpoints**: Busca archivos `swagger.json`, `.well-known`, o rutas de debug no documentadas (`/api/v1/debug`, `/admin/test`).
2.  **Fuzzing de Parámetros**: Prueba variaciones en los inputs para causar errores inesperados o fugas de información.
    - _Técnica_: Cambiar tipos de datos (string a array), inyectar caracteres especiales, desbordar buffers.

## ⚔️ Vectores de Ataque Críticos

### 1. IDOR (Insecure Direct Object Reference)

- Intenta acceder a recursos que no te pertenecen cambiando IDs en la URL o el cuerpo de la petición.
- _Prueba_: `GET /api/users/10` -> `GET /api/users/11` (¿puedo ver los datos del otro usuario?).

### 2. Explotación de GraphQL

- **Introspección**: Verifica si `__schema` está habilitado para mapear toda la base de datos.
- **Batched Queries**: Intenta ejecutar múltiples consultas en una sola para saltar límites de tasa (rate limits).
- **Injection**: Prueba inyecciones SQL/NoSQL dentro de los argumentos de los resolvers.

### 3. JWT & Authentication Bypass

- Prueba JWT con algoritmos débiles (`HS256` vs `RS256`).
- Verifica si la firma se valida realmente o si el backend confía ciegamente en el payload.

## 📊 Reporte de Hallazgos (Bounty Style)

Al encontrar una debilidad, repórtala con:

- **Severidad**: (Low, Medium, High, Critical).
- **Impacto**: ¿Qué datos se comprometen? ¿Se puede escalar privilegios?
- **Prueba de Concepto (PoC)**: Comandos `curl` o pasos exactos para reproducir el fallo.

---

> [!CAUTION]
> Estas técnicas deben usarse ÚNICAMENTE en entornos autorizados o bajo la "Fase 1" confirmada por el usuario. El poder conlleva responsabilidad... o al menos un buen informe.
