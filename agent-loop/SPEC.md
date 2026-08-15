# Especificación Técnica — Prioridad 1: Integridad y Seguridad de Datos

## 1. Contexto y Objetivos
Strength Tracker es una PWA y aplicación móvil Capacitor (Android).
La versión actual (v6.6) presenta riesgos de seguridad en el renderizado de datos arbitrarios vía `innerHTML`, falta de validación exhaustiva al importar JSONs, fusión de datos simple sin resolución de conflictos, y ausencia de control de esquema/migraciones ante JSONs corruptos o cuotas excedidas.

El objetivo de esta fase (P1 Seguridad) es elevar la robustez de la aplicación a nivel de producción:
1. **Renderizado Seguro**: Sanitización contra XSS e inyección HTML/JS en cualquier interpolación de datos.
2. **Validación Exhaustiva**: Verificación estricta de límites de tamaño, tipos, rangos numéricos y estructura jerárquica de semanas, sesiones, ejercicios y series.
3. **Merge con Resolución de Conflictos**: Fusión basada en identificadores únicos y `modified_at`. Ante colisiones reales con divergencia de datos, se solicita explícitamente la decisión al usuario mediante interfaz modal.
4. **Versionado de Esquema y Resiliencia**: Esquema v2 con migraciones automáticas y mecanismos de recuperación ante cuota de almacenamiento llena o JSON corrupto.

---

## 2. Criterios de Aceptación

### CA-1: Renderizado Seguro (Sanitización XSS)
- Toda cadena de texto provista por el usuario o importada (nombres de ejercicios, notas de sesión/ejercicio, títulos, IDs) debe ser sanitizada mediante `utils.esc()` antes de ser inyectada en `innerHTML` o atributos del DOM.
- Los caracteres especiales (`<`, `>`, `&`, `"`, `'`, backticks) deben ser escapados a sus respectivas entidades HTML seguras.
- Los identificadores pasados a controladores de eventos no deben permitir ruptura de cadenas ni ejecución de payloads JS.

### CA-2: Validación de Importación y Backups
- Tamaño máximo de JSON importado limitado (máximo 5 MB).
- Tipos de datos forzados y validados:
  - `week_id`: string alfanumérico no vacío.
  - `week_number`: entero >= 1.
  - `sessions`: array de sesiones válido.
  - `session_id`, `title`: strings válidos.
  - `exercises`: array de ejercicios válido.
  - `execution.sets`: array de objetos set con `reps` (0-999), `load` (0-9999), `rir` (0-4 o null), `unit` ("kg").
- Datos incompletos o mal formateados son normalizados con valores por defecto seguros o rechazados con mensajes claros de error sin colapsar la app.

### CA-3: Fusión Inteligente y Resolución de Conflictos
- Cada entidad (semana, sesión, ejercicio, set) registra timestamps `modified_at` / `created_at`.
- Al importar o fusionar backups:
  - Si una entidad existe en el origen pero no en destino, se añade.
  - Si una entidad es idéntica o no diverge, se mantiene.
  - Si existe divergencia entre la versión local y la importada, el sistema identifica el conflicto y activa un diálogo/modal de resolución interactivo que permite al usuario elegir qué versión conservar ("Conservar Local", "Usar Importada", "Conservar Ambas con nuevo ID").

### CA-4: Versionado de Esquema y Resiliencia de Almacenamiento
- Se define `DB_SCHEMA_VERSION = 2`.
- Las versiones anteriores (v1 / v6.6) se migran de forma transparente a la nueva estructura con `schema_version` y timestamps.
- Las llamadas a `localStorage.setItem` están protegidas contra `QuotaExceededError`. Si se alcanza la cuota, se informa al usuario y se ofrece exportar/limpiar backups antiguos.
- Si el JSON almacenado se corrompe, la aplicación no produce pantalla en blanco: atrapa el error, notifica y permite restaurar desde el último backup diario válido.

---

## 3. Estrategia de Pruebas y Verificación
1. **Tests Unitarios Automatizados**:
   - Pruebas de `utils.esc` con múltiples vectores de inyección XSS (`<script>`, `onerror=`, `javascript:`, quotes).
   - Pruebas de validación (`validate.json`, `validate.backupJSON`, `validate.sanitizeHierarchy`).
   - Pruebas del motor de merge con conflictos y resolución por decisión del usuario.
   - Pruebas de migraciones de esquema v1 -> v2 y recuperación ante errores.
2. **Verificación en Navegador / Chrome Headless**:
   - Verificación de carga y renderizado seguro con datos que contengan scripts maliciosos.
   - Verificación de que ningún script se ejecuta y que los textos se visualizan intactos.
