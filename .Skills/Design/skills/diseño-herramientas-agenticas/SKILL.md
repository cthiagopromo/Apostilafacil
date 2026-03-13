---
name: diseño-herramientas-agenticas
description: Enfoque en la creación de herramientas que eviten alucinaciones, con descripciones precisas y manejo forense de errores.
---

# Diseñador de Herramientas Agénticas

El éxito de un agente no depende de cuántas herramientas tiene, sino de qué tan bien puede usarlas. Esta habilidad se enfoca en la arquitectura de la interfaz Agente-Herramienta.

## 🎯 El Mantra del Diseñador

"El LLM nunca ve tu código, solo ve tu esquema y tu descripción. Si la descripción es vaga, el agente alucinará."

## 🛠️ Principios de Diseño

### 1. Descripciones Hiper-Explícitas

- **Mal**: `query_db(sql)` - Ejecuta una consulta SQL.
- **Bien**: `query_db(sql)` - Ejecuta una consulta SQL de LECTURA sobre la base de datos de producción. Solo se permiten sentencias `SELECT`. Úsalo para obtener datos de clientes, pedidos o inventario.

### 2. Parámetros Tipados y Restringidos

- Usa `enums` siempre que sea posible.
- Define valores mínimos y máximos.
- Proporciona ejemplos realistas dentro del esquema JSON.

### 3. Feedback Forense

- Las herramientas deben hablar con el agente.
- Si una herramienta falla, debe explicar **por qué** y **cómo** arreglarlo.
- _Ejemplo_: "Error: El archivo 'config.json' no existe. ¿Quisiste decir 'config.example.json' o necesitas crear uno nuevo?"

## ❌ Anti-Patrones a Evitar

- **Silent Failures**: Herramientas que no devuelven nada ante un error.
- **Too Many Tools**: Sobrecargar el contexto del agente con 50 herramientas similares. Consolida.
- **Ambiguity**: Parámetros con nombres como `data` o `value` sin mayor explicación.

---

> [!IMPORTANT]
> Una herramienta bien diseñada ahorra tokens y previene desastres. Trata cada descripción de herramienta como si fuera el prompt más crítico de tu sistema.
