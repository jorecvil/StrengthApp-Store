# Reglas para generar nuevos ejercicios en planes semanales

## Objetivo

Generar ejercicios nuevos con una estructura única, predecible y reutilizable. Un mismo ejercicio realizado con la misma máquina o implemento debe tener siempre el mismo identificador y el mismo nombre canónico, independientemente de la semana, el objetivo de la sesión o cómo se haya descrito previamente.

La regla central es:

```text
Un movimiento canónico + una máquina/implemento = un único exercise_id estable.
```

Ejemplo:

```text
Press de pecho + Hammer Strength = press_pecho-hammer_strength
```

No se permite crear otro ID o cambiar el nombre para describir el mismo movimiento en la misma máquina.

## Formato obligatorio en el JSON

Cada ejercicio debe respetar el contrato de plan semanal:

```json
{
  "exercise_id": "press_pecho-hammer_strength",
  "name": "Press de pecho",
  "equipment_csv_name": "Hammer Strength",
  "machine_name": "Press de pecho Hammer Strength",
  "pattern": "empuje_horizontal",
  "recommendations": "Tempo 3-0-1. Objetivo: fuerza.",
  "baseline": {
    "set_plan": [
      { "set_index": 1, "reps": 8, "load": 50, "unit": "kg" }
    ]
  }
}
```

Reglas por campo:

| Campo | Regla |
|---|---|
| `exercise_id` | Siempre `<ejercicio_id>-<machine_id>`, en minúsculas, sin acentos y usando `_` dentro de cada parte. |
| `name` | Nombre español del movimiento canónico. No incluye máquina, objetivo ni particularidades. |
| `equipment_csv_name` | Copia exacta del nombre del catálogo oficial de máquinas. No inventar ni reformular. |
| `machine_name` | Descripción concreta de la ejecución con esa máquina/implemento. |
| `pattern` | Patrón de movimiento normalizado. |
| `recommendations` | Todas las indicaciones de ejecución, tempo, objetivo, salud, ajustes y condición voluntaria. |
| `baseline` | Series, repeticiones y carga prescrita. |

## Catálogo inicial de ejercicios canónicos

Esta lista es inicial. Antes de crear uno nuevo, buscar siempre si el movimiento ya existe en el catálogo/diccionario de normalización. Solo se crea un canónico nuevo cuando el movimiento sea realmente distinto.

| Nombre canónico (`name`) | ID de ejercicio | Grupo muscular | Patrón |
|---|---|---|---|
| Press de pecho | `press_pecho` | Pecho | `empuje_horizontal` |
| Curl de bíceps | `curl_biceps` | Bíceps | `flexion_codo` |
| Jalón al pecho | `jalon_pecho` | Espalda | `traccion_vertical` |
| Remo | `remo` | Espalda | `traccion_horizontal` |
| Press de hombro | `press_hombro` | Hombros | `empuje_vertical` |
| Extensión de tríceps | `extension_triceps` | Tríceps | `extension_codo` |
| Sentadilla | `sentadilla` | Pierna | `dominante_rodilla` |
| Prensa de piernas | `prensa_piernas` | Pierna | `dominante_rodilla` |
| Peso muerto rumano | `peso_muerto_rumano` | Pierna | `bisagra_cadera` |
| Elevación lateral | `elevacion_lateral` | Hombros | `abduccion_hombro` |
| Plancha | `plancha` | Core | `core` |

Los nombres son canónicos y se mantienen idénticos en futuros planes. Por ejemplo, no alternar entre `Press pecho`, `Press de pecho`, `Press pectoral` y `Pecho press`: se elige `Press de pecho` y se reutiliza siempre.

## Catálogo inicial de máquinas e implementos

`equipment_csv_name` debe coincidir exactamente con el nombre oficial del catálogo CSV/`MAQUINAS.md`. Esta tabla muestra las claves normalizadas; si el catálogo oficial usa otra etiqueta, se utiliza literalmente esa etiqueta en `equipment_csv_name` sin cambiar el `machine_id`.

| Máquina o implemento | `machine_id` | Uso |
|---|---|---|
| Selector | `selector` | Máquina con torre de placas y pasador. |
| Polea | `polea` | Estación de cable/polea. |
| Hammer Strength | `hammer_strength` | Máquina cargada con discos. |
| Pure Strength | `pure_strength` | Máquina cargada con discos; puede tener `base_weight_kg`. |
| Barra ondulada | `barra_ondulada` | Implemento EZ/barra ondulada. |
| Barra recta | `barra_recta` | Barra libre recta. |
| Mancuernas | `mancuernas` | Implemento de carga libre. |
| Peso corporal | `peso_corporal` | Resistencia basada en el propio peso. |

Para una máquina cargada con discos, `base_weight_kg` es un dato opcional de configuración de esa máquina. Se registra una vez cuando se conoce; no se añade manualmente a cada serie. Si se desconoce, no se inventa el peso total.

## Regla de composición

1. Elegir primero el ejercicio canónico existente.
2. Elegir la máquina/implemento existente y compatible.
3. Construir el ID exclusivamente como `<exercise_id>-<machine_id>`.
4. Usar el nombre canónico sin añadir calificadores.
5. Colocar todas las particularidades en `recommendations` o, si el esquema lo permite, en metadatos/notas de sesión.

Plantilla:

```text
exercise_id        = <id_ejercicio> + "-" + <id_maquina>
name               = <nombre canónico en español>
equipment_csv_name = <nombre exacto del catálogo de máquinas>
machine_name       = <nombre canónico> + " " + <máquina/implemento>
pattern            = <patrón establecido>
recommendations    = <técnica, tempo, objetivo, notas y particularidades>
```

## Ejemplos de composición correctos

| Movimiento | Máquina/implemento | `exercise_id` | `name` | `machine_name` |
|---|---|---|---|---|
| Press de pecho | Hammer Strength | `press_pecho-hammer_strength` | `Press de pecho` | `Press de pecho Hammer Strength` |
| Press de pecho | Selector | `press_pecho-selector` | `Press de pecho` | `Press de pecho en selector` |
| Curl de bíceps | Polea | `curl_biceps-polea` | `Curl de bíceps` | `Curl de bíceps en polea` |
| Curl de bíceps | Barra ondulada | `curl_biceps-barra_ondulada` | `Curl de bíceps` | `Curl de bíceps con barra ondulada` |
| Jalón al pecho | Selector | `jalon_pecho-selector` | `Jalón al pecho` | `Jalón al pecho en selector` |
| Plancha | Peso corporal | `plancha-peso_corporal` | `Plancha` | `Plancha con peso corporal` |

Ejemplo completo con particularidades:

```json
{
  "exercise_id": "press_pecho-hammer_strength",
  "name": "Press de pecho",
  "equipment_csv_name": "Hammer Strength",
  "machine_name": "Press de pecho Hammer Strength",
  "pattern": "empuje_horizontal",
  "recommendations": "Objetivo: volumen. Tempo 3-0-1. Mantener escápulas estables. Ejercicio voluntario si queda tiempo.",
  "baseline": {
    "set_plan": [
      { "set_index": 1, "reps": 12, "load": 40, "unit": "kg" },
      { "set_index": 2, "reps": 12, "load": 40, "unit": "kg" }
    ]
  }
}
```

## Particularidades: siempre en notas, nunca en el nombre

Las siguientes expresiones cambian la prescripción de esa sesión, pero no identifican un movimiento ni una máquina. Deben ir en `recommendations`, notas o metadatos permitidos por el esquema.

| Particularidad | Ubicación correcta | Ejemplo |
|---|---|---|
| Volumen | `recommendations` | `Objetivo: volumen.` |
| Ajustado | `recommendations` | `Configuración ajustada según comodidad.` |
| Voluntario / opcional | `recommendations` y, si el JSON lo admite, `is_optional: true` | `Ejercicio voluntario si queda tiempo.` |
| Descarga | `recommendations` | `Semana de descarga: dejar 3 repeticiones en recámara.` |
| Tempo | `recommendations` | `Tempo 3-0-1.` |
| Dolor, limitación o precaución | `recommendations`/notas de salud | `Detener si aparece molestia en hombro.` |
| Rango de repeticiones, RIR o técnica | `recommendations` | `Mantener 2 RIR y recorrido controlado.` |

Ejemplos prohibidos y su corrección:

| Incorrecto | Correcto |
|---|---|
| `exercise_id: "press_pecho_volumen-hammer_strength"` | `exercise_id: "press_pecho-hammer_strength"`; nota: `Objetivo: volumen.` |
| `name: "Press de pecho voluntario"` | `name: "Press de pecho"`; nota: `Ejercicio voluntario si queda tiempo.` |
| `exercise_id: "curl_biceps_ajustado-selector"` | `exercise_id: "curl_biceps-selector"`; nota: `Configuración ajustada...` |
| `name: "Curl de bíceps barra ondulada"` | `name: "Curl de bíceps"`; `machine_name: "Curl de bíceps con barra ondulada"`. |

## Reglas para no crear duplicados

Antes de generar un ejercicio, el LLM debe ejecutar esta comprobación:

```text
1. ¿Existe el mismo movimiento canónico?
   Sí → reutilizar su exercise_id base y su name exacto.
   No → proponer un nuevo canónico para revisión humana.

2. ¿Existe la misma máquina/implemento?
   Sí → reutilizar su machine_id y equipment_csv_name exacto.
   No → proponer una nueva máquina para revisión humana.

3. ¿Existe ya la combinación ejercicio + máquina?
   Sí → reutilizar exactamente su exercise_id completo.
   No → crearla con <exercise_id>-<machine_id>.

4. ¿El texto adicional es objetivo, técnica, estado o condición?
   Sí → añadirlo a recommendations/notas; jamás modificar ID ni name.
```

Ejemplos de duplicados que deben converger:

```text
"Press pecho Hammer", "Press de pecho Hammer Strength" y
"Press pecho en Hammer Strength"
→ press_pecho-hammer_strength

"Curl bíceps EZ", "Curl de bíceps barra Z" y
"Curl bíceps barra ondulada"
→ curl_biceps-barra_ondulada
```

Estas equivalencias solo se añaden al diccionario de alias una vez confirmadas. Si un término puede designar máquinas distintas, se exige revisión humana.

## Reglas negativas

Nunca:

- crear un nombre distinto para el mismo ejercicio por cambiar series, peso, repeticiones, objetivo o semana;
- incluir `volumen`, `ajustado`, `voluntario`, `opcional`, `descarga`, tempo, RIR o dolor en `exercise_id`, `name` o `machine_name`;
- cambiar un `exercise_id` histórico por un sinónimo más bonito;
- inventar un valor para `equipment_csv_name` cuando no coincide con el catálogo oficial;
- usar una equivalencia de kilos fija entre selector, polea, Hammer Strength o Pure Strength;
- fusionar el RM o histórico de dos máquinas distintas;
- asumir una máquina no indicada en la fuente;
- crear un nuevo canónico cuando solo cambia la máquina/implemento.

## Gestión de casos nuevos o ambiguos

Si aparece un ejercicio o una máquina que no están en los catálogos:

1. Conservar el texto original.
2. Proponer `name`, `exercise_id` base, máquina e ID compuesto.
3. Marcarlo como pendiente de revisión humana.
4. No reutilizar una variante existente si la equivalencia no es segura.
5. Tras confirmación, añadir el canónico, la máquina o el alias al diccionario central.

## Checklist antes de entregar un plan

- [ ] Cada `exercise_id` usa exactamente un guion entre ID de ejercicio e ID de máquina.
- [ ] El mismo par ejercicio-máquina usa siempre el mismo ID.
- [ ] `name` contiene solo el movimiento canónico en español.
- [ ] `equipment_csv_name` coincide de forma exacta con el catálogo oficial.
- [ ] La máquina/implemento está especificada en `machine_name`.
- [ ] Los objetivos, particularidades y el carácter voluntario están en notas/recomendaciones, nunca en el nombre.
- [ ] `is_optional: true` se utiliza cuando el formato del ejercicio permite expresar explícitamente que es opcional.
- [ ] No se han creado sinónimos ni duplicados por estilo de redacción.
- [ ] Cada carga y RM se mantiene asociado a su variante/máquina concreta.
