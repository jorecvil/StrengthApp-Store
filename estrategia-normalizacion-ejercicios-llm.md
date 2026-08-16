# Estrategia de normalización de ejercicios para LLM

> Estado: guía inicial. La tabla de nombres y alias de este documento se basa únicamente en los ejemplos confirmados en la conversación. Aún no se ha aportado la exportación JSON completa, por lo que deberá ampliarse y validarse al analizarla.

## 0. Contrato obligatorio de identificación y salida

El resultado debe integrarse en el formato semanal JSON definido por el proyecto (`schema_version: "1.0"`, `payload_type: "week"`, sesiones y ejercicios). Para cada ejercicio, el normalizador debe rellenar los campos de ejercicio sin cambiar la estructura del contrato.

La clave estable de una variante usa **guion entre ejercicio y máquina** y guiones bajos dentro de cada componente:

```text
<exercise_id>-<machine_id>
```

Ejemplo obligatorio:

```text
press_pecho-hammer_strength
```

No usar `press_pecho_hammer_strength` como identificador de variante, porque no separa de forma explícita el ejercicio de la máquina. El campo `name` se conserva en español legible y `equipment_csv_name` debe ser una copia exacta del nombre definido en el catálogo `MAQUINAS.md`/CSV correspondiente.

## 1. Objetivo

Transformar cada nombre de ejercicio recibido en una representación estructurada, estable y auditable. La normalización debe evitar históricos y récords fragmentados por diferencias de escritura, pero **no debe mezclar rendimientos de máquinas o implementos distintos**.

El resultado debe separar:

- el movimiento que se está entrenando;
- la forma repetible de ejecutarlo;
- la máquina o implemento utilizado;
- las instrucciones u objetivos de aquella sesión.

## 2. Modelo jerárquico

```text
Grupo muscular
  → Patrón de movimiento
    → Ejercicio canónico
      → Variante de ejecución
        → Máquina / implemento
```

Ejemplo conceptual:

```text
Pecho → Empuje horizontal → Press de pecho
  → Press de pecho en selector → Máquina de selector
  → Press de pecho Hammer Strength → Máquina Hammer Strength
  → Press de pecho Pure Strength → Máquina Pure Strength
```

La jerarquía ayuda a entender la relación biomecánica. Sin embargo, la unidad de histórico, carga y RM es la combinación concreta `ExerciseVariant + Machine`, no el ejercicio canónico completo.

## 3. Entidades y responsabilidades

| Entidad | Qué representa | Ejemplo | No representa |
|---|---|---|---|
| `Exercise` | Movimiento canónico, con nombre puro y estable. | `Curl de bíceps` | Una marca de máquina, una intención de sesión o un peso. |
| `ExerciseVariant` | Forma estable, repetible y medible de ejecutar un `Exercise`; está vinculada a una máquina/implemento. | `Curl de bíceps en polea` | Un texto libre como `volumen`. |
| `Machine` | Tipo de máquina, estación o implemento físico. | `Barra ondulada`, `Selector`, `Hammer Strength` | El ejercicio por sí mismo. |
| Metadatos de objetivo | Instrucciones o intención de esa prescripción/sesión. | `volumen`, `ajustado`, `descarga` | Un nombre canónico, variante o máquina. |

Un modelo mínimo debe permitir que `ExerciseVariant` tenga `exercise_id` y `machine_id`. Si existe más de una configuración estable en la misma máquina que cambie materialmente la ejecución y el rendimiento, puede existir una variante adicional explícita, siempre tras revisión humana.

## 4. Principios no negociables

1. El nombre canónico nunca incorpora el nombre de máquina: `Curl de bíceps`, no `Curl de bíceps (Selector)`.
2. La máquina o implemento sí es parte de la variante concreta.
3. `Volumen` y `ajustado` son objetivos/instrucciones: se extraen a metadatos y se eliminan del nombre estructural.
4. `Barra ondulada` es un implemento/máquina, no un objetivo ni una nota.
5. Los pesos, series, históricos y RMs se conservan por variante y máquina. No se combinan ni se sustituyen entre máquinas distintas.
6. Las equivalencias de carga entre máquinas se aprenden del histórico individual, con confianza; nunca se hardcodean.
7. Una máquina cargada con discos puede declarar opcionalmente `base_weight_kg`. Este valor describe el peso estructural a sumar a los discos introducidos; es especialmente relevante en Pure Strength y no se pide de nuevo en cada serie.
8. Si falta información para elegir máquina o variante, el LLM no debe inventarla: debe marcar el resultado como ambiguo y solicitar revisión.

## 5. Tabla inicial de nombres usados y transformación

| Nombre de entrada / expresión detectada | `Exercise` canónico | `ExerciseVariant` normalizada | `Machine` / implemento | Metadatos extraídos | Explicación |
|---|---|---|---|---|---|
| `Curl de Bíceps (Selector)` | `Curl de bíceps` | `Curl de bíceps en selector` | `Selector` | — | El paréntesis identifica la máquina. No pertenece al canónico. |
| `Curl de Bíceps Polea` | `Curl de bíceps` | `Curl de bíceps en polea` | `Polea` | — | `Polea` es el medio de ejecución. |
| `Curl de Bíceps Barra Ondulada` | `Curl de bíceps` | `Curl de bíceps con barra ondulada` | `Barra ondulada` | — | La barra ondulada es un implemento distinto y medible. |
| `Press pecho (volumen)` | `Press de pecho` | `Sin especificar` | `Sin especificar` | `objetivo: volumen` | `Volumen` no crea variante. Se debe asignar la máquina real si se conoce por el contexto o el JSON. |
| `Press pecho (ajustado)` | `Press de pecho` | `Sin especificar` | `Sin especificar` | `instrucción: ajustado` | `Ajustado` va en descripción/protocolo, no en nombre de máquina o variante. |
| `Press banca` | `Press de pecho`* | `Sin especificar` | `Sin especificar` | — | Alias inicial sujeto a revisión: solo unificar si el proyecto usa `Press de pecho` como canónico para ese patrón. Si significa barra libre específicamente, la máquina debe ser `Barra recta` y la variante debe reflejarlo. |
| `Press pecho selector` / `Press banca selector` | `Press de pecho` | `Press de pecho en selector` | `Selector` | — | `selector` resuelve la máquina. No mezclar el RM con otros tipos. |
| `Press pecho Hammer Strength` | `Press de pecho` | `Press de pecho Hammer Strength` | `Hammer Strength` | — | Máquina cargada con discos; su carga no equivale automáticamente a selector. |
| `Press pecho Pure Strength` / `Press pecho Perestrength` | `Press de pecho` | `Press de pecho Pure Strength` | `Pure Strength` | — | `Perestrength` se trata como alias ortográfico inicial de `Pure Strength`, pendiente de confirmar marca/modelo. Puede tener peso base propio. |
| `peso propio` / `peso corporal` | Depende del movimiento | Variante del movimiento con peso corporal | `Peso corporal` | — | Es un tipo de resistencia/implemento. La carga puede calcularse desde el peso corporal registrado si el ejercicio lo requiere. |

\* La relación `Press banca` → `Press de pecho` es una decisión provisional de este diccionario. Debe revisarse al ver los datos reales para diferenciar, si procede, press de banca con barra, máquinas convergentes y otros movimientos que no sean el mismo canónico.

## 6. Diccionario de normalización y alias

Mantener un diccionario versionado, editable y revisable. Cada entrada debe conservar el texto original y la decisión tomada.

```json
{
  "alias": "curl de biceps (selector)",
  "normalized_text": "curl de bíceps selector",
  "exercise_canonical_id": "curl_biceps",
  "machine_id": "selector",
      "variant_id": "curl_biceps-selector",
  "metadata_tokens": [],
  "confidence": 1.0,
  "decision_source": "regla_confirmada",
  "needs_human_review": false
}
```

Reglas del diccionario:

- Conservar acentos, mayúsculas y texto original en `raw_name`; comparar tras pasar a minúsculas y eliminar diacríticos para el matching.
- Un alias solo puede aplicarse automáticamente si conduce a una única interpretación confirmada.
- Los alias con contexto insuficiente deben tener `confidence` baja y requerir revisión.
- No convertir una corrección ortográfica en una equivalencia biomecánica sin evidencia.
- Registrar cada decisión humana nueva para reutilizarla en importaciones futuras.

## 7. Orden determinista de decisión

Aplicar siempre esta secuencia. No saltar directamente de texto libre a un nombre final.

1. **Preservar la entrada.** Guardar `raw_name` sin cambios.
2. **Preparar el texto para comparar.** Pasar a minúsculas, normalizar espacios, puntuación, acentos y paréntesis sin perder el original.
3. **Extraer metadatos de objetivo.** Detectar términos como `volumen` y `ajustado`; moverlos a `metadata` y retirarlos de los tokens estructurales.
4. **Detectar máquina/implemento.** Buscar primero expresiones específicas de varias palabras (`hammer strength`, `pure strength`, `barra ondulada`) y luego genéricas (`selector`, `polea`, `peso propio`).
5. **Resolver el ejercicio canónico.** Usar alias confirmados, patrones de movimiento y el diccionario. El canónico no incorpora tokens de máquina ni objetivo.
6. **Resolver la variante.** Construirla a partir de la pareja canónico + máquina/implemento. Solo añadir una técnica estable si existe una regla confirmada.
7. **Validar coherencia.** Comprobar que la combinación está permitida y que no quedan tokens sustantivos sin clasificar.
8. **Calcular confianza.** Alta para reglas exactas confirmadas; media para coincidencia fuerte; baja para inferencias.
9. **Decidir salida.** Automatizar solo si la confianza alcanza el umbral configurado y no hay conflicto. En caso contrario, emitir propuesta con revisión humana.

Prioridad de resolución de conflictos: coincidencia exacta de alias confirmado > máquina/implemento específico > máquina genérica > objetivo/metadato > inferencia semántica.

## 8. Algoritmo paso a paso

1. Recibir un registro con al menos `name` y, si existe, contexto de sesión, descripción, equipo y carga.
2. Normalizar únicamente una copia de `name` para comparar.
3. Dividir los calificadores entre: máquina/implemento, técnica estable, objetivo/instrucción, y texto desconocido.
4. Extraer `volumen` y `ajustado` como metadatos. No crear identificadores nuevos por ellos.
5. Detectar la máquina usando el diccionario ordenado por la coincidencia más específica.
6. Eliminar del texto de trabajo los tokens de máquina y metadatos.
7. Resolver el nombre restante a un `Exercise` canónico conocido; si hay dos candidatos, no elegir por intuición.
8. Buscar o crear la variante únicamente para `(exercise_id, machine_id)` con una clave estable. Si falta máquina, no crear una variante ficticia.
9. Convertir la carga a `added_weight_kg` y `total_weight_kg` cuando proceda. `total_weight_kg = base_weight_kg + added_weight_kg`; si no hay base conocido, no inventar un valor.
10. Guardar trazabilidad: reglas usadas, tokens extraídos, confianza y necesidad de revisión.

## 9. Pseudocódigo

```text
function normalizar(registro, diccionario, catalogo):
    raw = registro.name
    texto = preparar_para_matching(raw)

    metadata = extraer_objetivos(texto, ["volumen", "ajustado"])
    texto = quitar_tokens(texto, metadata.tokens)

    machine = resolver_machine_mas_especifica(texto, diccionario.machine_aliases)
    if machine existe:
        texto = quitar_tokens(texto, machine.matched_tokens)

    exercise = resolver_exercise(texto, diccionario.exercise_aliases, catalogo)
    if exercise es ambiguo o no existe:
        return propuesta_revision(raw, exercise, machine, metadata)

    if machine no existe:
        return propuesta_revision(raw, exercise, null, metadata,
                                 motivo="máquina/implemento sin especificar")

    variant = obtener_o_crear_variante(exercise.id, machine.id)
    carga = calcular_carga(registro, machine.base_weight_kg)

    confianza = evaluar_confianza(raw, exercise, machine, metadata)
    return salida_estructurada(raw, exercise, variant, machine, metadata,
                              carga, confianza,
                              needs_human_review=(confianza < UMBRAL))
```

## 10. Esquema de salida JSON

### 10.1 Salida obligatoria dentro del plan semanal

La representación interna puede conservar trazabilidad adicional, pero el ejercicio entregado al plan semanal debe respetar este contrato. `exercise_id` identifica la combinación normalizada de canónico y máquina; por tanto, para un press de pecho en Hammer Strength será exactamente `press_pecho-hammer_strength`.

```json
{
  "schema_version": "1.0",
  "payload_type": "week",
  "week_ref": {
    "week_id": "2026-W32",
    "week_number": 32,
    "notes": "Estrategia S+1: ejemplo de normalización. [SALUD]: sin incidencias."
  },
  "sessions": [
    {
      "session_id": "A",
      "title": "Pecho",
      "goal_summary": "Fuerza máxima",
      "estimated_duration_min": 60,
      "exercises": [
        {
          "exercise_id": "press_pecho-hammer_strength",
          "name": "Press de pecho",
          "equipment_csv_name": "Hammer Strength",
          "machine_name": "Press de pecho Hammer Strength",
          "pattern": "empuje_horizontal",
          "recommendations": "Controlar la técnica; tempo 3-0-1.",
          "baseline": {
            "set_plan": [
              { "set_index": 1, "reps": 8, "load": 50, "unit": "kg" },
              { "set_index": 2, "reps": 12, "load": 45, "unit": "kg" }
            ]
          }
        }
      ]
    }
  ]
}
```

Reglas de campos del contrato:

| Campo | Regla de normalización |
|---|---|
| `exercise_id` | `<exercise_id>-<machine_id>`; ejemplo: `press_pecho-hammer_strength`. |
| `name` | Nombre español del ejercicio canónico, sin máquina ni objetivo: `Press de pecho`. |
| `equipment_csv_name` | Copia exacta del nombre oficial de la máquina/implemento en el catálogo CSV/`MAQUINAS.md`; nunca una reformulación del LLM. |
| `machine_name` | Detalle específico de la máquina o implementación. |
| `pattern` | Patrón normalizado, por ejemplo `empuje_horizontal`, `core` o `isolation`. |
| `recommendations` | Técnicas, tempo, instrucciones y objetivos como `volumen` o `ajustado`, si procede. |
| `baseline` | Plan de series y carga. `load` es la carga prescrita; los cálculos internos de peso base se mantienen trazables. |

No usar el campo `name` para incluir `volumen`, `ajustado`, `Hammer Strength`, `selector` o cualquier otra máquina.

### 10.2 Representación interna de trazabilidad

```json
{
  "raw_name": "Press pecho (volumen) - Hammer Strength",
  "normalized": {
    "muscle_group": "pecho",
    "movement_pattern": "empuje_horizontal",
    "exercise": {
      "id": "press_pecho",
      "name_canonical": "Press de pecho"
    },
    "variant": {
      "id": "press_pecho-hammer_strength",
      "name": "Press de pecho Hammer Strength"
    },
    "machine": {
      "id": "hammer_strength",
      "name": "Hammer Strength",
      "base_weight_kg": null
    },
    "metadata": {
      "objective": "volumen",
      "execution_notes": []
    }
  },
  "load": {
    "added_weight_kg": 40.0,
    "base_weight_kg": null,
    "total_weight_kg": null,
    "calculation_status": "base_weight_unknown"
  },
  "normalization": {
    "rules_applied": ["objective.volumen", "machine.hammer_strength", "exercise.press_pecho"],
    "confidence": 0.98,
    "needs_human_review": false,
    "unclassified_tokens": []
  }
}
```

`total_weight_kg` puede ser `null` cuando no se conoce el peso base o el sistema de carga no permite calcularlo de forma fiable. Nunca sustituirlo por una estimación silenciosa.

## 11. Cargas, RMs y equivalencias entre máquinas

- Cada `ExerciseVariant + Machine` tiene su propio histórico, RM y progresión.
- Mover 90 kg en selector no significa mover 90 kg —ni una proporción fija— en Hammer Strength, Pure Strength o polea.
- La relación entre variantes solo puede almacenarse como una estimación aprendida del histórico individual: ratio, método, número de observaciones, intervalo/variabilidad y confianza.
- Las estimaciones sirven para sugerir una carga inicial, nunca para reescribir la carga registrada ni fusionar RMs.

Ejemplo de estructura para equivalencias aprendidas:

```json
{
  "exercise_id": "press_pecho",
  "from_variant_id": "press_pecho-selector",
  "to_variant_id": "press_pecho-hammer_strength",
  "estimated_ratio": 0.81,
  "observations": 9,
  "confidence": 0.62,
  "source": "learned_from_user_history",
  "hardcoded": false
}
```

## 12. Ejemplos completos antes/después

### Ejemplo A: selector

**Antes**

```json
{ "name": "Curl de Bíceps (Selector)", "weight_kg": 35 }
```

**Después**

```json
{
  "raw_name": "Curl de Bíceps (Selector)",
  "exercise": "Curl de bíceps",
  "variant": "Curl de bíceps en selector",
  "machine": "Selector",
  "metadata": {},
  "load": { "added_weight_kg": 35, "total_weight_kg": 35 },
  "confidence": 1.0
}
```

### Ejemplo B: objetivo, sin máquina informada

**Antes**

```json
{ "name": "Press pecho (volumen)", "weight_kg": 60 }
```

**Después**

```json
{
  "raw_name": "Press pecho (volumen)",
  "exercise": "Press de pecho",
  "variant": null,
  "machine": null,
  "metadata": { "objective": "volumen" },
  "normalization": {
    "needs_human_review": true,
    "reason": "No se indicó la máquina/implemento; no se debe inferir."
  }
}
```

### Ejemplo C: implemento

**Antes**

```json
{ "name": "Curl de Bíceps Barra Ondulada", "weight_kg": 20 }
```

**Después**

```json
{
  "raw_name": "Curl de Bíceps Barra Ondulada",
  "exercise": "Curl de bíceps",
  "variant": "Curl de bíceps con barra ondulada",
  "machine": "Barra ondulada",
  "metadata": {},
  "confidence": 1.0
}
```

### Ejemplo D: Pure Strength con peso estructural

**Antes**

```json
{ "name": "Press pecho Perestrength", "plates_weight_kg": 40 }
```

**Después, si la máquina tiene `base_weight_kg = 15` confirmado**

```json
{
  "exercise": "Press de pecho",
  "variant": "Press de pecho Pure Strength",
  "machine": { "name": "Pure Strength", "base_weight_kg": 15 },
  "load": { "added_weight_kg": 40, "total_weight_kg": 55 },
  "normalization": { "confidence": 0.85, "needs_human_review": false }
}
```

Si no se conoce ese peso base, conservar `added_weight_kg: 40`, dejar el total como `null` y solicitar la configuración de la máquina una sola vez.

## 13. Reglas negativas

El LLM no debe:

- añadir `selector`, `polea`, `Hammer Strength`, `Pure Strength` o `barra ondulada` al `name_canonical`;
- tratar `volumen` o `ajustado` como máquina, variante, alias del ejercicio o parte del canónico;
- asumir que `Press banca` y `Press de pecho` son equivalentes sin una regla confirmada para ese conjunto de datos;
- inventar una máquina cuando el nombre no la incluye;
- sumar un peso base desconocido;
- unir series, RMs o cargas de máquinas distintas;
- aplicar ratios universales o fijos entre máquinas;
- ocultar texto no clasificado ni ambigüedades;
- destruir el nombre original ni la trazabilidad de la decisión.

## 14. Confianza, ambigüedad y revisión humana

Usar, como orientación, estos niveles:

| Situación | Confianza orientativa | Acción |
|---|---:|---|
| Alias exacto confirmado y máquina explícita | 0.95–1.00 | Normalización automática. |
| Alias del ejercicio confirmado, máquina inferida de contexto estructurado | 0.80–0.94 | Normalizar y registrar la inferencia; revisión opcional. |
| Ejercicio probable pero máquina no indicada | <0.80 | No crear variante; revisión obligatoria. |
| Varios ejercicios o máquinas plausibles | <0.60 | No elegir; presentar candidatos. |
| Token nuevo no clasificado | variable | Mantener token, marcar revisión y pedir clasificación. |

La revisión humana debe poder elegir el ejercicio, la máquina y el tipo de token; la elección aprobada se añade al diccionario con fecha, fuente y confianza.

## 15. Checklist de validación por registro

- [ ] Se conserva `raw_name` sin modificar.
- [ ] El `Exercise` tiene un nombre canónico puro, sin objetivo ni máquina.
- [ ] Se ha identificado el grupo muscular y patrón, o se han marcado como desconocidos.
- [ ] La máquina/implemento se ha resuelto explícitamente o se ha marcado como ausente.
- [ ] La variante corresponde exactamente a un ejercicio y una máquina.
- [ ] `volumen`, `ajustado` y objetivos similares están en metadatos, no en la variante.
- [ ] Los tokens sustantivos desconocidos se muestran en `unclassified_tokens`.
- [ ] No se han mezclado pesos ni RMs entre variantes.
- [ ] `base_weight_kg` solo se ha aplicado si está registrado para esa máquina.
- [ ] Cualquier equivalencia entre variantes se identifica como aprendida, con evidencia y confianza, nunca como regla fija.
- [ ] La salida incluye reglas aplicadas, confianza y `needs_human_review`.

## 16. Mantenimiento tras recibir la exportación JSON completa

Al disponer de la exportación completa, ejecutar una auditoría antes de automatizar cambios masivos:

1. Extraer todos los nombres originales y sus frecuencias.
2. Agrupar por coincidencia exacta normalizada, sin fusionar todavía semánticamente.
3. Proponer canónicos, máquinas, objetivos y alias utilizando esta guía.
4. Revisar manualmente los grupos ambiguos y los términos nuevos.
5. Añadir las decisiones al diccionario versionado.
6. Reprocesar el JSON conservando un informe de cambios y de elementos pendientes.
7. Validar que cada serie conserva su fecha, carga original, variante concreta y trazabilidad.

Esta guía es deliberadamente conservadora: es preferible enviar un caso incierto a revisión humana que fragmentar o, peor, fusionar incorrectamente el histórico de entrenamiento.
