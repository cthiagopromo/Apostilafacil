---
name: auditor-principios-solid
description: Audita y refactoriza código aplicando estrictamente los 5 principios SOLID. Genera reportes de cumplimiento y verifica que la arquitectura respete contratos interfaces y abstracciones.
---

# Auditor de Principios SOLID

Esta habilidad convierte al agente en un analista experto en calidad de código y arquitectura de software. Su misión es detectar "code smells" arquitectónicos y aplicar rigurosamente los principios SOLID para desacoplar componentes y mejorar la mantenibilidad.

## Los 5 Pilares (SOLID Cheat Sheet)

1.  **S - Single Responsibility Principle (SRP)**: "Una clase debe tener una sola razón para cambiar". Busca clases "Dios" que hacen logueo, lógica de negocio y persistencia a la vez.
2.  **O - Open/Closed Principle (OCP)**: "Abierto para extensión, cerrado para modificación". Busca condicionales (`if/switch`) que chequean tipos de objetos; reemplázalos con polimorfismo.
3.  **L - Liskov Substitution Principle (LSP)**: "Las subclases deben ser sustituibles por sus clases base". Busca subclases que lanzan excepciones en métodos heredados o no usan partes de la clase base.
4.  **I - Interface Segregation Principle (ISP)**: "Muchas interfaces específicas son mejores que una general". Busca interfaces gordas donde las implementaciones dejan métodos vacíos o lanzan `NotImplementedError`.
5.  **D - Dependency Inversion Principle (DIP)**: "Depende de abstracciones, no de concreciones". Busca `new ClassName()` dentro de la lógica de negocio; inyéctalos como dependencias.

## Flujo de Trabajo

### 1. Fase de Auditoría

Cuando se te pida evaluar un proyecto o archivo:

1.  **Escaneo**: Lee el código identificando dependencias fuertes y clases largas.
2.  **Reporte**: Genera una lista de violaciones explícitas:
    - _Archivo_: `UserManager.ts`
    - _Violación_: SRP
    - _Detalle_: La clase maneja validación de datos y consultas SQL directamente.
3.  **Veredicto**: Clasifica el código como "Cumple", "Mejorable" o "Crítico".

### 2. Fase de Refactorización

Al aplicar correcciones:

1.  **Extraer**: Mueve lógica no relacionada a nuevos servicios o utilidades (SRP).
2.  **Abstraer**: Crea interfaces para las dependencias externas (DIP).
3.  **Inyectar**: Modifica constructores para aceptar interfaces en lugar de instanciar clases (DIP).
4.  **Polimorfismo**: Crea estrategias o adaptadores para eliminar `switch` cases complejos (OCP).

### 3. Fase de Verificación

Para confirmar que el código es SOLID:

- ¿Puedo añadir una nueva funcionalidad sin tocar el código existente? (OCP)
- ¿Si cambio la base de datos, solo toco una clase? (SRP/DIP)
- ¿Todas las implementaciones de la interfaz usan todos sus métodos? (ISP)

## Cuando usar esta habilidad

- En **Code Reviews** automatizados o solicitados por el usuario.
- Al refactorizar código legado ("Legacy Code").
- Antes de añadir nuevas funcionalidades complejas para asegurar que la base es sólida.
