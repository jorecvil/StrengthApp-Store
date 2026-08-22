# Especificación: analítica de fuerza y temporadas

> Estado: implementada en el worktree; pendiente de validación manual y commit/release.
>
> Alcance: corrección del e1RM con RIR, panel de análisis, filtros temporales y temporadas. Esta especificación no incluye INOL, RPE de sesión, bienestar/sueño, ACWR ni entrenamiento basado en velocidad.

## 1. Objetivo

Convertir el historial de sesiones completadas de Strength Tracker en un seguimiento fiable y comprensible de la progresión de fuerza y carga. La aplicación deberá:

1. Estimar la fuerza evitando tratar como fallo una serie que terminó con RIR.
2. Mantener separados los rendimientos de variantes o máquinas distintas.
3. Mostrar evolución, carga y esfuerzo dentro de periodos comparables.
4. Permitir agrupar el entrenamiento en temporadas que se puedan cerrar y comparar.

La analítica es informativa: no debe diagnosticar sobreentrenamiento, riesgo de lesión ni prescribir cambios de carga automáticamente.

## 2. Decisiones de producto

### 2.1 Ubicación

`Análisis de Esfuerzo` será una vista propia, no un alias de Historial.

- La pantalla principal de Análisis muestra el selector temporal, el resumen global y el análisis del ejercicio/variante seleccionado.
- Las temporadas se crean, activan, consultan y cierran desde el selector situado en la cabecera de Análisis.
- Ajustes tendrá un acceso secundario de gestión de temporadas, pensado para renombrar, editar o consultar temporadas cerradas.
- Historial conserva su función de lista y exportación de series; puede enlazar a Análisis para profundizar en un ejercicio.

### 2.2 Periodos disponibles

El mismo filtro temporal se usará en todas las gráficas y tarjetas:

| Id | Etiqueta | Inicio | Fin |
| --- | --- | --- | --- |
| `active_season` | Temporada | Inicio de la temporada activa | Hoy o cierre de la temporada |
| `last_30_days` | Último mes | Hoy - 30 días | Hoy |
| `last_3_months` | 3 meses | Hoy - 3 meses naturales | Hoy |
| `last_6_months` | 6 meses | Hoy - 6 meses naturales | Hoy |
| `last_year` | 1 año | Hoy - 1 año natural | Hoy |
| `all_time` | Toda la vida | Sin límite | Hoy |
| `season:<id>` | Temporada cerrada | Inicio de la temporada | Fecha de cierre |

Los límites son inclusivos y se calculan usando la fecha de finalización de sesión. Si no existe, se empleará la fecha de inicio. Las sesiones sin fecha válida se excluyen de agregados y gráficas, pero nunca se borran.

## 3. Modelo de datos

### 3.1 Serie ejecutada

Se amplía el objeto existente `execution.sets[]`.

```js
{
  set_index: 0,
  reps: 8,
  load: 80,
  rir: 2,                    // 0..4 o null
  rir_is_open_ended: false,  // true solo cuando el usuario eligió "4+"
  notes: "",
  completed_at: "2026-08-21T10:30:00.000Z",
  is_extra: false
}
```

Reglas:

- `rir: null`: no se registró RIR.
- `rir: 0..3` con `rir_is_open_ended: false`: RIR exacto y apto para e1RM ajustado.
- `rir: 4` con `rir_is_open_ended: false`: RIR exacto; se muestra, pero no se utiliza como serie de alta confianza.
- `rir: 4` con `rir_is_open_ended: true`: representa `4+`; no se interpreta como cuatro repeticiones exactas.
- El botón visual `4+` deberá guardar `{ rir: 4, rir_is_open_ended: true }`.

#### Migración de históricos

Los sets anteriores no contienen `rir_is_open_ended`.

- Se conservará su valor original de `rir`.
- Se añadirá `rir_is_open_ended: false` para mantener compatibilidad.
- La UI marcará el RIR histórico igual a 4 como "4 (histórico)" cuando sea relevante; no afirmará que fue `4+`.
- La migración se ejecutará al cargar/sanitizar datos y deberá ser idempotente.

### 3.2 Clave de variante analítica

El progreso no se debe combinar entre implementos distintos. Cada registro analítico tendrá:

```js
{
  exercise_key: "press_pecho-hammer_strength",
  exercise_id: "press_pecho-hammer_strength",
  display_name: "Press de pecho",
  equipment_name: "Hammer Strength"
}
```

Construcción de `exercise_key`:

1. Usar `exercise_id` si existe y es estable.
2. Añadir `equipment_csv_name`; si falta, usar `machine_name`.
3. Para datos históricos donde la clave no sea suficiente, usar una clave de reserva formada por `name` normalizado y máquina normalizada.

No se hará agrupación semántica automática de nombres diferentes. La variante y la máquina son la unidad de récord, e1RM y tendencia.

### 3.3 Temporada

La base de datos raíz se ampliará con `seasons`:

```js
{
  schema_version: 3,
  weeks: { /* existente */ },
  seasons: {
    "season_abc": {
      season_id: "season_abc",
      name: "Fuerza otoño 2026",
      start_date: "2026-09-01",
      end_date: null,
      objective: "strength",
      priority_exercise_keys: ["sentadilla-barra", "press_banca-barra"],
      notes: "Bloque de fuerza base.",
      created_at: "2026-08-21T10:30:00.000Z",
      modified_at: "2026-08-21T10:30:00.000Z"
    }
  }
}
```

Valores permitidos para `objective`:

- `strength`
- `hypertrophy`
- `maintenance`
- `return`

Reglas:

- Solo puede existir una temporada activa (`end_date: null`).
- La fecha de inicio es obligatoria y debe ser válida.
- La fecha de cierre, si existe, no puede ser anterior al inicio.
- Cerrar una temporada establece `end_date`; no edita semanas, sesiones ni series.
- Borrar una temporada requiere confirmación y borra solo sus metadatos, nunca entrenamientos.

## 4. Métricas

### 4.1 e1RM bruto

Se conserva el cálculo existente para compatibilidad y exportación:

```text
e1RM bruto = carga × (1 + repeticiones / 30)
```

Si las repeticiones son 1, el resultado es la carga. Si carga o repeticiones no son positivas, el resultado es `null`.

### 4.2 e1RM ajustado por RIR

Solo para RIR exacto entre 0 y 3:

```text
repeticiones efectivas = repeticiones + RIR
e1RM ajustado = carga × (1 + repeticiones efectivas / 30)
```

No se utilizará una corrección exacta para `4+`, porque el margen real es desconocido.

### 4.3 Elegibilidad y confianza

| Condición | Resultado | Uso en récord/tendencia |
| --- | --- | --- |
| Sesión completada, 1–8 reps, RIR 0–3 | `high` | Sí |
| Sesión completada, 9–10 reps, RIR 0–3 | `low` | Visible; no genera récord automático |
| RIR 4 exacto | `low` | Visible; no genera récord automático |
| RIR 4+ o RIR nulo | `informational` | Solo histórico y tonelaje |
| Más de 10 reps | `informational` | Solo histórico y tonelaje |
| Carga/reps no positivas o sesión no completada | `invalid` | Excluido |

El usuario podrá consultar el e1RM bruto de cualquier serie válida, pero el "mejor e1RM" de Análisis se calcula usando solo observaciones `high`.

### 4.4 Métricas de carga

Todas se calculan sobre sesiones completadas y dentro del periodo seleccionado.

| Métrica | Fórmula | Notas |
| --- | --- | --- |
| Tonelaje | `Σ(carga × reps)` | Por variante y total; no mezcla unidades distintas. |
| Repeticiones | `Σ reps` | Incluye todas las series válidas de carga positiva. |
| Series registradas | Número de sets con carga y reps positivas | No equivale a series duras. |
| Series duras | Sets con RIR exacto 0–3 | `4+` y RIR ausente no cuentan. |
| RIR medio | Media de RIR exacto 0–3 | Mostrar número de sets que contribuyen. |
| Intensidad relativa | `carga / e1RM referencia × 100` | Solo cuando existe e1RM de referencia de alta confianza. |
| Adherencia | `sesiones completadas / sesiones planificadas × 100` | Dentro del periodo y limitado a 100% para la tarjeta principal. |

El e1RM de referencia será el último e1RM de alta confianza anterior o igual a la fecha de cada sesión. Si no existe, esa serie no aparecerá en la gráfica de intensidad relativa.

### 4.5 Agregación temporal

- El punto de rendimiento diario es la mejor serie `high` de cada variante y fecha de sesión.
- La tendencia móvil utiliza las tres últimas exposiciones válidas, no tres días naturales.
- Las barras de carga se agrupan por semana ISO, con inicio en lunes.
- Si una semana no tiene sesiones, se muestra como hueco, no como cero si está dentro de una serie temporal continua.

## 5. Interfaz

### 5.1 Entrada desde inicio

El mosaico `Análisis de Esfuerzo` debe abrir `view: 'analytics'`. Actualmente no debe redirigir a `history`.

### 5.2 Cabecera de Análisis

```text
← Inicio      Análisis de Esfuerzo         tema
[ Temporada activa: Fuerza otoño 2026 ▾ ]
[ Temporada ] [ Último mes ] [ 3 meses ] [ 6 meses ] [ 1 año ] [ Toda la vida ]
```

Comportamiento del selector de temporadas:

- Muestra la activa primero y después las cerradas, ordenadas por fecha de inicio descendente.
- Incluye acciones: `Crear temporada`, `Cerrar temporada activa` y `Gestionar temporadas`.
- Si no hay temporada activa, el chip `Temporada` estará deshabilitado y explicará cómo crearla.

### 5.3 Crear temporada

Formulario modal o vista dedicada:

- Nombre, obligatorio, máximo 80 caracteres.
- Fecha de inicio, obligatoria; valor inicial: hoy.
- Objetivo, obligatorio; valor inicial: fuerza.
- Ejercicios prioritarios, opcional, selección múltiple de variantes existentes.
- Notas, opcionales, máximo 500 caracteres.
- Acción principal: `Crear y activar`.

Si existe una temporada activa, la app debe pedir confirmación antes de cerrarla en el día anterior a la nueva fecha de inicio. La alternativa es cancelar y cerrar la anterior manualmente.

### 5.4 Resumen del periodo

Tarjetas superiores:

- `e1RM de referencia`: último valor de alta confianza de la variante seleccionada; indicar fecha.
- `Cambio`: diferencia y porcentaje frente al primer e1RM de alta confianza del periodo.
- `Tonelaje`: suma del periodo.
- `Series duras`: suma y RIR medio cuando exista muestra.
- `Adherencia`: sesiones completadas frente a planificadas.

Cada tarjeta deberá mostrar `—` y una explicación breve si no hay datos suficientes; nunca deberá mostrar `0` cuando el valor sea desconocido.

### 5.5 Selector de variante

- Lista las variantes con al menos una serie completada.
- Etiqueta: nombre legible + máquina entre paréntesis cuando aplique.
- No añade ni fusiona variantes desde la pantalla de analítica.
- La selección se conserva durante la navegación de la sesión actual, no necesariamente entre reinicios.

### 5.6 Gráficas

Las gráficas se renderizarán con SVG y HTML nativos para evitar añadir una dependencia de gráficos en esta fase.

#### Rendimiento

- Línea: mejor e1RM `high` por exposición.
- Línea secundaria: tendencia móvil de tres exposiciones.
- Punto destacado: récord histórico si está dentro del periodo.
- Tooltip/leyenda: fecha, carga × reps, RIR, e1RM y confianza.

#### Volumen y esfuerzo

- Barras semanales apiladas o yuxtapuestas: tonelaje y series duras.
- La unidad de tonelaje siempre se muestra en kg.
- Mostrar semanas sin datos como hueco visual.

#### Distribución de intensidad

- Barras por zonas: `<60%`, `60–69%`, `70–79%`, `80–89%`, `≥90%` del e1RM de referencia.
- Métrica: repeticiones acumuladas; no tonelaje.
- Ocultar la gráfica con explicación si no hay e1RM de referencia suficiente.

#### RIR a carga comparable

- Agrupa exposiciones de la misma variante cuya carga esté dentro de una tolerancia del 2,5%.
- Requiere tres observaciones exactas o más.
- Muestra el RIR medio por exposición, no una predicción fisiológica.
- Si no se alcanza la muestra mínima, mostrar "Aún no hay suficientes series comparables".

### 5.7 Accesibilidad y estados vacíos

- Cada gráfica incluye título, descripción de texto y tabla/resumen alternativo accesible.
- Los colores no serán el único medio de comunicar subida, bajada o confianza.
- La interfaz debe funcionar a 320 px de ancho, con desplazamiento horizontal controlado solo en tablas.
- Tema claro y oscuro deben mantener contraste legible.

## 6. Comparación de temporadas

La vista de una temporada cerrada mostrará:

1. Fechas, objetivo y ejercicios prioritarios.
2. Sesiones completadas y adherencia.
3. Tonelaje, repeticiones y series duras acumuladas.
4. Por cada ejercicio prioritario con datos:
   - primer e1RM de alta confianza de la temporada;
   - último e1RM de alta confianza;
   - cambio absoluto y porcentual;
   - mejor e1RM de alta confianza;
   - fecha de la mejor marca.
5. Comparación contra la temporada cerrada anterior que contenga la misma `exercise_key`, si existe.

No se compararán variantes distintas aunque tengan nombres similares.

## 7. Arquitectura y archivos

| Archivo | Responsabilidad |
| --- | --- |
| `www/js/validate.js` | Sanitizar `rir_is_open_ended`, temporadas y migración de esquema. |
| `www/js/data.js` | Estado de vista, periodo seleccionado, variante seleccionada y temporada seleccionada. |
| `www/js/analytics.js` | Normalizar histórico, cálculos e1RM, métricas, filtros y datos de gráficas. |
| `www/js/seasons.js` | CRUD de temporadas, validación de reglas de temporada activa y resúmenes comparativos. |
| `www/js/logic.js` | Persistencia y mutaciones seguras de sets/temporadas. |
| `www/js/actions.js` | Navegación a Análisis y manejadores de filtros, temporadas y exportación. |
| `www/js/ui.js` | Render de Análisis, formularios, tarjetas, SVG y estados vacíos. |
| `www/css/styles.css` | Diseño responsive de chips, gráficas, leyendas y comparativas. |
| `tests/test_analytics.js` | Pruebas unitarias de cálculo, agrupación y filtros. |
| `tests/test_seasons.js` | Pruebas de CRUD, cierre y comparativas de temporadas. |

## 8. Exportaciones

### 8.1 CSV por variante

Se añadirán columnas sin eliminar las existentes:

```text
Fecha,Variante,Máquina,Set,Reps,Carga,RIR,RIR_Abierto,e1RM_Bruto,e1RM_Ajustado,Confianza,Tonelaje,Notas
```

### 8.2 JSON por variante

Incluirá `exercise_key`, definición del periodo aplicado, métricas agregadas y el histórico de sets.

### 8.3 JSON de temporada

```js
{
  export_type: "season_summary",
  exported_at: "...",
  season: { /* temporada */ },
  summary: { /* métricas del periodo */ },
  exercises: [ /* comparación por variante */ ]
}
```

## 9. Criterios de aceptación

### Datos y cálculo

- [ ] Una serie de `80 kg × 8 @2 RIR` calcula e1RM ajustado con 10 repeticiones efectivas.
- [ ] Una serie marcada `4+` no se procesa como RIR exactamente igual a 4.
- [ ] Los históricos existentes siguen cargando y no pierden series.
- [ ] Dos máquinas/variantes distintas no comparten récord, tendencia ni tonelaje de variante.
- [ ] El mejor e1RM mostrado procede solo de una serie `high`.
- [ ] Las métricas de tonelaje siguen incluyendo series sin RIR cuando tienen peso y repeticiones válidos.

### Análisis

- [ ] Análisis de Esfuerzo abre una vista independiente de Historial.
- [ ] Cada filtro temporal actualiza todas las tarjetas y gráficas de forma coherente.
- [ ] El panel muestra estados vacíos útiles y no divide por cero ni muestra valores engañosos.
- [ ] Las gráficas se pueden interpretar mediante texto sin depender exclusivamente del color.
- [ ] La interfaz es usable en móvil y en tema oscuro.

### Temporadas

- [ ] La temporada se crea desde Análisis y queda activa inmediatamente.
- [ ] No se puede crear una segunda temporada activa sin cerrar o confirmar el cierre de la anterior.
- [ ] Cerrar/eliminar temporada nunca modifica sesiones ni series.
- [ ] Una temporada cerrada puede seleccionarse como periodo y compararse con otra anterior.
- [ ] Ajustes permite gestionar temporadas sin duplicar la lógica de Análisis.

### Regresión

- [ ] Importación de semanas, backups, fusión y exportaciones existentes siguen funcionando.
- [ ] Las pruebas de seguridad y analítica existentes continúan pasando.

## 10. Fuera de alcance

No se implementará en esta iteración:

- INOL, Prilepin, ACWR ni alertas de lesión/fatiga.
- RPE global de sesión o cuestionarios de bienestar, sueño, nutrición o dolor.
- Captura de velocidad de barra, perfiles VBT o pérdida de velocidad.
- Sugerencias automáticas de carga o cambios programáticos en planes.
- Fusión automática de ejercicios/variantes por similitud semántica.

## 11. Orden de implementación

1. Sanitización/migración de datos y clave de variante.
2. Motor de e1RM, confianza y métricas con pruebas unitarias.
3. Nueva vista de Análisis, filtros y tarjetas.
4. Gráficas de rendimiento, carga, intensidad y RIR comparable.
5. Módulo y flujos de temporadas desde Análisis.
6. Comparativa de temporadas, ajustes y exportaciones.
7. Validación de regresión, accesibilidad y comportamiento móvil.
