---
description: Procesa archivos EPUB para análisis literario y extracción de técnicas de escritura
---

# Procesador de EPUB Literario

**Extrae y analiza contenido de libros EPUB para aprendizaje de técnicas**

## Propósito

Esta skill permite **extraer contenido limpio de archivos EPUB** y prepararlo para análisis de estilo literario, sin dependencias problemáticas.

**Casos de uso:**
- Analizar estilo de autores (Ryan Holiday, Malcolm Gladwell, etc.)
- Extraer técnicas narrativas
- Generar corpus de entrenamiento
- Estudiar patrones de escritura

## Cuándo Usar

- Necesitas analizar libros en formato EPUB
- Quieres estudiar el estilo de un autor
- Preparar contenido para integrar en skills
- Extraer citas y ejemplos

**Triggers:**
- "extraer epub"
- "analizar libro"
- "procesar epub"
- "técnicas de [autor]"

## Código Reutilizable

### Extractor Básico

```python
"""
Extractor EPUB Simple - Sin dependencias problemáticas
Usa únicamente: zipfile, BeautifulSoup, re, pathlib
"""

import zipfile
from bs4 import BeautifulSoup
import re
from pathlib import Path

def extraer_epub_contenido(epub_path):
    """
    Extrae todo el contenido textual de un EPUB
    
    Args:
        epub_path: Ruta al archivo .epub
    
    Returns:
        str: Texto completo extraído y limpio
    """
    print("Extrayendo contenido del EPUB...")
    
    all_text = []
    
    with zipfile.ZipFile(epub_path, 'r') as zip_ref:
        # Buscar archivos HTML/XHTML en OEBPS (formato estándar EPUB)
        file_list = [f for f in zip_ref.namelist() 
                    if (f.endswith('.html') or f.endswith('.xhtml'))
                    and 'OEB PS' in f]
        
        print(f"Archivos encontrados: {len(file_list)}")
        
        for filename in sorted(file_list):
            try:
                with zip_ref.open(filename) as file:
                    content = file.read().decode('utf-8', errors='ignore')
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # Eliminar scripts y estilos
                    for script in soup(["script", "style"]):
                        script.decompose()
                    
                    # Extraer texto
                    text = soup.get_text()
                    
                    # Limpiar espacios excesivos
                    text = re.sub(r'\\n\\s*\\n+', '\\n\\n', text)
                    text = re.sub(r' +', ' ', text)
                    
                    # Solo agregar si tiene contenido sustancial
                    if len(text.strip()) > 100:
                        all_text.append(text.strip())
                        
            except Exception as e:
                print(f"Error en {filename}: {e}")
                continue
    
    return '\\n\\n'.join(all_text)

def guardar_texto_extraido(texto, output_path):
    """Guarda texto extraído en archivo .txt"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(texto)
    print(f"✓ Texto guardado en: {Path(output_path).name}")

def analizar_estadisticas_basicas(texto):
    """Análisis estadístico básico del texto extraído"""
    paragraphs = [p.strip() for p in texto.split('\\n\\n') if len(p.strip()) > 20]
    words = texto.split()
    sentences = re.split(r'[.!?]+', texto)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 5]
    
    stats = {
        'caracteres': len(texto),
        'palabras': len(words),
        'parrafos': len(paragraphs),
        'oraciones': len(sentences),
        'palabras_por_parrafo': len(words) // len(paragraphs) if paragraphs else 0,
        'palabras_por_oracion': len(words) // len(sentences) if sentences else 0
    }
    
    return stats

# Ejemplo de uso completo
def procesar_epub(epub_path, output_txt):
    """Pipeline completo de procesamiento EPUB"""
    print("="*70)
    print(" PROCESADOR EPUB LITERARIO")
    print("="*70)
    print()
    
    # Extraer
    texto = extraer_epub_contenido(epub_path)
    
    # Guardar
    guardar_texto_extraido(texto, output_txt)
    
    # Estadísticas
    stats = analizar_estadisticas_basicas(texto)
    
    print(f"\\n📊 Estadísticas:")
    print(f"   - Caracteres: {stats['caracteres']:,}")
    print(f"   - Palabras: {stats['palabras']:,}")
    print(f"   - Párrafos: {stats['parrafos']:,}")
    print(f"   - Oraciones: {stats['oraciones']:,}")
    print(f"   - Promedio palabras/párrafo: {stats['palabras_por_parrafo']}")
    print(f"   - Promedio palabras/oración: {stats['palabras_por_oracion']}")
    
    return texto, stats
```

### Analizador de Estilo (Ryan Holiday focus)

```python
"""
Analiza patrones de estilo específicos de un autor
"""

def analizar_estilo_ryan_holiday(texto):
    """
    Analiza técnicas específicas de Ryan Holiday:
    - Párrafos cortos de impacto
    - Uso de preguntas
    - Citas históricas
    - Estructura Historia→Lección
    """
    paragraphs = [p.strip() for p in texto.split('\\n\\n') if len(p.strip()) > 20]
    
    # Análisis de longitud de párrafos
    palabras_por_parrafo = [len(p.split()) for p in paragraphs]
    parrafos_cortos = sum(1 for p in palabras_por_parrafo if p < 30)
    porcentaje_cortos = (parrafos_cortos / len(paragraphs) * 100) if paragraphs else 0
    
    # Análisis de preguntas
    total_sentences = len(re.findall(r'[.!?]+', texto))
    preguntas = len(re.findall(r'\\?', texto))
    porcentaje_preguntas = (preguntas / total_sentences * 100) if total_sentences > 0 else 0
    
    # Detección de citas (texto entre comillas)
    citas = re.findall(r'[""].*?[""]', texto)
    
    # Patrones de storytelling
    inicios_historia = [
        r'En [0-9]{3,4}',  # "En 1940..."
        r'Cuando .* era',   # "Cuando Churchill era..."
        r'.* cuenta que',   # "Ryan Holiday cuenta que..."
    ]
    historias_detectadas = sum(len(re.findall(patron, texto)) for patron in inicios_historia)
    
    analisis = {
        'estilo': 'Ryan Holiday',
        'total_parrafos': len(paragraphs),
        'promedio_palabras_parrafo': sum(palabras_por_parrafo) / len(palabras_por_parrafo) if palabras_por_parrafo else 0,
        'parrafos_cortos_pct': porcentaje_cortos,
        'uso_preguntas_pct': porcentaje_preguntas,
        'citas_encontradas': len(citas),
        'historias_detectadas': historias_detectadas
    }
    
    return analisis

def generar_reporte_estilo(analisis):
    """Genera reporte legible del análisis"""
    print("\\n📖 ANÁLISIS DE ESTILO:")
    print("-" * 70)
    print(f"Autor/Estilo: {analisis['estilo']}")
    print(f"\\nMétricas clave:")
    print(f"  • Promedio palabras/párrafo: {analisis['promedio_palabras_parrafo']:.0f}")
    print(f"  • Párrafos cortos (<30 palabras): {analisis['parrafos_cortos_pct']:.1f}%")
    print(f"  • Uso de preguntas: {analisis['uso_preguntas_pct']:.1f}%")
    print(f"  • Citas históricas: {analisis['citas_encontradas']}")
    print(f"  • Historias detectadas: {analisis['historias_detectadas']}")
    
    print("\\n💡 Técnicas identificadas:")
    if analisis['parrafos_cortos_pct'] > 25:
        print("  ✓ Uso frecuente de párrafos cortos de impacto")
    if analisis['uso_preguntas_pct'] > 3:
        print("  ✓ Preguntas retóricas para engagement")
    if analisis['citas_encontradas'] > 10:
        print("  ✓ Abundante uso de citas para autoridad")
    if analisis['historias_detectadas'] > 5:
        print("  ✓ Estructura Historia→Lección")
```

## Workflow Completo

### Paso 1: Extraer EPUB

```python
epub_path = "ruta/al/libro.epub"
output_txt = "autor_texto_extraido.txt"

texto, stats = procesar_epub(epub_path, output_txt)
```

### Paso 2: Analizar Estilo

```python
analisis = analizar_estilo_ryan_holiday(texto)
generar_reporte_estilo(analisis)
```

### Paso 3: Extraer Técnicas Específicas

```python
# Extraer citas para banco de recursos
citas = re.findall(r'[""].*?[""]', texto)
citas_unicas = list(set(citas))[:20]  # Top 20

# Extraer historias (párrafos que empiezan con patrón histórico)
patrones_historia = [
    r'En [0-9]{3,4}.*?\n\n',
    r'Cuando .* era.*?\n\n'
]
historias = []
for patron in patrones_historia:
    matches = re.findall(patron, texto, re.DOTALL)
    historias.extend(matches[:5])

# Guardar en skill
with open('.agent/skills/escritor-experto-evolutivo/banco_citas.md', 'w') as f:
    f.write("# Banco de Citas (Extraídas)\\n\\n")
    for cita in citas_unicas:
        f.write(f"- {cita}\\n")
```

### Paso 4: Integrar en Skill

```python
# Actualizar escritor-experto-evolutivo/SKILL.md
# con técnicas específicas detectadas

tecnicas_aprendidas = f\"\"\"
### Técnicas de {analisis['estilo']} (Detectadas Automáticamente)

**Métricas:**
- Promedio palabras/párrafo: {analisis['promedio_palabras_parrafo']:.0f}
- Párrafos cortos: {analisis['parrafos_cortos_pct']:.1f}%
- Uso de preguntas: {analisis['uso_preguntas_pct']:.1f}%

**Aplicar:**
- Mantener 30-35% de párrafos <30 palabras
- Usar preguntas en 4-6% de oraciones
- Incluir 2-3 historias históricas por capítulo
\"\"\"

# Agregar al EVOLUTION_LOG.md
```

## Casos de Uso Reales

### Caso 1: Analizar "Courage is Calling" (Ryan Holiday)

```python
epub = "La llamada del coraje - Ryan Holiday.epub"
texto, stats = procesar_epub(epub, "ryan_holiday_coraje.txt")
analisis = analizar_estilo_ryan_holiday(texto)
generar_reporte_estilo(analisis)

# Output esperado:
# Promedio palabras/párrafo: 68
# Párrafos cortos: 32%
# Uso preguntas: 5.2%
# → Integrar estos números en escritor-experto-evolutivo
```

### Caso 2: Comparar estilos (Malcolm Gladwell vs Ryan Holiday)

```python
# Procesar ambos autores
texto_gladwell = procesar_epub("gladwell.epub", "gladwell.txt")[0]
texto_holiday = procesar_epub("holiday.epub", "holiday.txt")[0]

# Analizar diferencias
stats_g = analizar_estadisticas_basicas(texto_gladwell)
stats_h = analizar_estadisticas_basicas(texto_holiday)

# Comparar
print(f"Gladwell: {stats_g['palabras_por_parrafo']} palabras/párrafo")
print(f"Holiday: {stats_h['palabras_por_parrafo']} palabras/párrafo")
# → Decidir qué estilo usar según objetivo
```

### Caso 3: Extracción de banco de recursos

```python
# Extraer todas las citas para skill
texto = procesar_epub("estoicismo_compilado.epub", "estoicos.txt")[0]
citas = re.findall(r'[""].*?[""]', texto)

# Agrupar por filósofo
citas_marco_aurelio = [c for c in citas if 'Aurrelius' in texto[texto.find(c)-200:texto.find(c)]]
citas_seneca = [c for c in citas if 'Seneca' in texto[texto.find(c)-200:texto.find(c)]]

# Integrar en banco de metáforas/citas
```

## Integración con Otras Skills

Esta skill alimenta:

- **`escritor-experto-evolutivo`**: Técnicas detectadas de autores
- **`generador-capitulos-literarios`**: Banco de citas para integrar
- **`seo-literario-optimizador`**: Análisis de keywords en libros exitosos

## Dependencias

**Mínimas (incluidas en Python standard library + BeautifulSoup):**
```bash
pip install beautifulsoup4
```

**NO requiere:**
- `ebooklib` (problemático)
- `lxml` (pesado)
- Librerías propietarias

## Notas Finales

**Principio clave:**
> "No copies el estilo. Aprende los principios subyacentes."

Esta skill extrae **métricas cuantitativas** del estilo de un autor, pero la aplicación creativa sigue siendo humana.

---

**Versión:** 1.0  
**Última actualización:** 2026-02-02  
**Base:** Script extraer_epub_simple.py  
**Mantenedor:** Skills Ecosystem
