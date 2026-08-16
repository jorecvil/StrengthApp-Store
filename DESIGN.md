# Sistema de Diseño — Strength Tracker (Clean Native Athletics)

Especificación visual, componentes de interfaz y tokens de diseño para **Strength Tracker**. Diseñado para máxima legibilidad en gimnasio, respuesta táctil en móviles (Capacitor / Android / iOS) y presentación enmarcada en navegadores web. **100% Offline-First** sin dependencias de fuentes externas.

---

## 1. Filosofía de Diseño

1. **Claridad Inmediata (Gym-Ready):** Tipografía de alto contraste legible bajo luz brillante de gimnasio o en modo oscuro.
2. **Sensación Táctil Nativa:** Micro-interacciones de pulsación elástica (`scale(0.965)`) y áreas de toque mínimas de 48×48px optimizadas para uso a una mano con los pulgares.
3. **Offline Inquebrantable:** Pila tipográfica del sistema sin llamadas a CDN externos (`@import` de Google Fonts eliminado).
4. **Respeto a Áreas Seguras:** Integración nativa de `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)` para notch y barras de gestos.
5. **Enmarcado Móvil/Web:** Ancho máximo centralizado de `580px` que emula un marco nativo en pantallas de escritorio y se expande fluidamente en smartphones.

---

## 2. Tokens de Diseño (CSS Custom Properties)

### 2.1 Paleta de Colores

| Token | Modo Claro (Luz Slate) | Modo Oscuro (Obsidiana) | Propósito |
|---|---|---|---|
| `--bg-body` | `#f8fafc` (Slate 50) | `#0b0f19` (Azabache profundo) | Fondo principal de la aplicación |
| `--bg-card` | `#ffffff` | `#151c2c` | Superficie de tarjetas y modales |
| `--bg-card-hover` | `#f1f5f9` | `#1c263b` | Estado hover en tarjetas |
| `--bg-input` | `#f1f5f9` | `#1e283d` | Fondo de campos y botones secundarios |
| `--text-main` | `#0f172a` (Slate 900) | `#f8fafc` (Blanco nítido) | Títulos, números clave y texto primario |
| `--text-muted` | `#64748b` (Slate 500) | `#94a3b8` (Slate 400) | Subtítulos, etiquetas y descripciones |
| `--text-sub` | `#94a3b8` | `#64748b` | Texto deshabilitado o de menor jerarquía |
| `--primary` | `#0f172a` | `#f8fafc` | Fondo de botones primarios |
| `--primary-text` | `#ffffff` | `#0b0f19` | Texto sobre botón primario |
| `--accent` | `#10b981` (Esmeralda) | `#34d399` | Color de marca, completado y elementos activos |
| `--accent-hover` | `#059669` | `#10b981` | Hover sobre acentos |
| `--accent-light` | `#ecfdf5` | `rgba(52, 211, 153, 0.15)` | Fondos sutiles de éxito o destacados |
| `--border` | `#e2e8f0` | `#232d42` | Bordes de tarjetas e inputs |
| `--danger` | `#ef4444` | `#f87171` | Acciones destructivas y errores |
| `--warning` | `#f59e0b` | `#fbbf24` | Conflictos y alertas de divergencia |

### 2.2 Radios de Esquina y Sombras

```css
--radius-sm:   8px;     /* Badges, inputs compactos */
--radius:      14px;    /* Botones estándar, inputs */
--radius-lg:   18px;    /* Tarjetas principales, modales */
--radius-full: 9999px;  /* FAB, badges tipo píldora, toast */

--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
--shadow:    0 2px 8px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03);
--shadow-md: 0 4px 14px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04);
--shadow-lg: 0 10px 25px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05);
```

---

## 3. Tipografía

Pila tipográfica nativa de alto rendimiento:
```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

### Escala Tipográfica
* **H1 (Título de App / Pantalla):** `1.65rem` (26.4px) · `font-weight: 800` · `letter-spacing: -0.03em`.
* **H2 (Secciones principales):** `1.3rem` (20.8px) · `font-weight: 700` · `letter-spacing: -0.025em`.
* **H3 (Tarjetas y cabeceras de lista):** `1.1rem` (17.6px) · `font-weight: 700`.
* **Cuerpo de texto:** `0.95rem` (15.2px) · `line-height: 1.5`.
* **Texto Secundario (`.text-small`):** `0.875rem` (14px) · `color: var(--text-muted)`.
* **Números Monoespaciados (`.mono`):** `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.

---

## 4. Sistema de Botones (Elemento Principal)

Todos los botones comparten:
* Altura mínima: `48px` (estándar táctil WCAG / Android).
* Feedback táctil: `transform: scale(0.965)` al pulsar (`:active`).
* Anillo de foco accesible: `outline: 2.5px solid var(--accent); outline-offset: 2px;` (`:focus-visible`).
* Transición elástica: `0.18s cubic-bezier(0.2, 0.8, 0.2, 1)`.

### 4.1 Variantes de Botones

| Variante | Clase CSS | Uso |
|---|---|---|
| **Primario** | `button.primary` | Acción principal (Finalizar sesión, Guardar, Importar). Fondo oscuro en claro / blanco en oscuro. |
| **Secundario** | `button.secondary` | Acción alternativa o ad-hoc (Añadir Día, Exportar). Fondo tarjeta con borde 1.5px. |
| **Fantasma** | `button.ghost` | Navegación de retorno (`← Volver`, `← Semana`) o cancelar. Sin borde ni fondo fijo. |
| **Peligro** | `button.danger` | Borrado de semanas o sobreescritura destructiva. Contenedor rojo suave + texto rojo. |
| **Icono Redondo** | `button.icon-btn` | Selector de tema (☀️/🌙) y ayuda (`?`). Círculo 44×44px. |
| **Check de Serie** | `button.check-btn` | **Registro de series en gym:** 46×46px. Gris con borde al estar pendiente; verde esmeralda con check blanco (`✔`) al completarse (`.done`). |
| **Selector RIR** | `button.rir-btn` | Cápsulas de 48px para seleccionar repeticiones en reserva (0 a 4+). La seleccionada adquiere fondo esmeralda. |
| **FAB Flotante** | `button.fab` | Botón circular de 58×58px abajo a la derecha para crear semana vacía (`＋`). |

---

## 5. Patrones de Navegación y Vistas

### 5.1 Pantalla de Inicio (Home)
Estructurada en tarjetas verticales de navegación más cuadrícula inferior:

```
┌────────────────────────────────────────────────────────┐
│  Strength Tracker                               ?   🌙 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ▌ 📝 Mis Planes                                  │  │  ← .nav-tile.active
│  │    Gestiona tus semanas y entrenamientos         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │   📊 Historial de Ejercicios                     │  │  ← .nav-tile
│  │      Consulta tu progreso y récords (1RM)        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │   📈 Análisis de Esfuerzo                        │  │  ← .nav-tile
│  │      Métricas de volumen, RPE y carga            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ─────────────────── Configuración ───────────────────  │  ← .config-divider
│                                                        │
│  ┌────────────────────────┐  ┌───────────────────────┐ │
│  │           💾           │  │           📥          │ │  ← .settings-grid
│  │        Backups         │  │       Importar        │ │     .setting-tile
│  └────────────────────────┘  └───────────────────────┘ │
│                                                        │
│                                                  [ + ] │  ← button.fab
└────────────────────────────────────────────────────────┘
```

### 5.2 Estructura de Marcado de Tarjetas de Navegación

```html
<!-- Tarjeta Activa ("Mis Planes") -->
<button class="nav-tile active" onclick="actions.openPlanes()" aria-label="Abrir Mis Planes">
    <div class="nav-tile-icon" aria-hidden="true">📝</div>
    <div class="nav-tile-body">
        <div class="nav-tile-title">Mis Planes</div>
        <div class="nav-tile-desc">Gestiona tus semanas y entrenamientos</div>
    </div>
</button>

<!-- Cuadrícula de Configuración -->
<div class="settings-grid">
    <button class="setting-tile" onclick="actions.openBackups()" aria-label="Abrir Backups">
        <div class="setting-tile-icon" aria-hidden="true">💾</div>
        <div class="setting-tile-title">Backups</div>
    </button>
    <button class="setting-tile" onclick="actions.openImport()" aria-label="Importar Plan">
        <div class="setting-tile-icon" aria-hidden="true">📥</div>
        <div class="setting-tile-title">Importar</div>
    </button>
</div>
```

---

## 6. Formularios y Registro de Series

### 6.1 Fila de Serie (`.set-row`)
Diseño en cuadrícula de 4 columnas optimizado para entrada rápida:

| Columna | Ancho | Contenido |
|---|---|---|
| **#** | `36px` | Número de serie (1, 2, 3...) |
| **Plan** | `1fr` | Repeticiones y carga planificadas |
| **Real** | `1.6fr` | Inputs numéricos gemelos (`stat-input` para Reps y Kg) |
| **Check** | `50px` | Botón táctil `check-btn` para confirmar la serie |

---

## 7. Accesibilidad y Estándares WCAG 2.2 AA

1. **Ratio de Contraste:**
   - Texto normal contra fondo: > `12:1` (Modo claro `#0f172a` sobre `#f8fafc`; Modo oscuro `#f8fafc` sobre `#0b0f19`).
   - Contraste de componentes y bordes: > `3.5:1`.
2. **Navegación por Teclado:** Todas las tarjetas y botones son elementos `<button>` nativos con semántica `aria-label` y foco visible.
3. **Reducción de Movimiento:** Media query `@media (prefers-reduced-motion: reduce)` activa para anular transiciones si el usuario lo solicita en su sistema operativo.
4. **Semántica:** Sin enlaces rotos ni dependencias de Javascript para el cálculo visual de diseño.
