(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // www/js/config.js
  var config_exports = {};
  __export(config_exports, {
    BACKUP_KEEP_COUNT: () => BACKUP_KEEP_COUNT,
    BACKUP_PREFIX: () => BACKUP_PREFIX,
    DB_SCHEMA_VERSION: () => DB_SCHEMA_VERSION,
    ID_PATTERN: () => ID_PATTERN,
    LLM_PROMPT_TEMPLATE: () => LLM_PROMPT_TEMPLATE,
    LOCALSTORAGE_QUOTA_MAX: () => LOCALSTORAGE_QUOTA_MAX,
    LOCALSTORAGE_QUOTA_WARN: () => LOCALSTORAGE_QUOTA_WARN,
    MAX_ID_LENGTH: () => MAX_ID_LENGTH,
    MAX_IMPORT_BYTES: () => MAX_IMPORT_BYTES,
    STORE_KEY: () => STORE_KEY,
    THEME_KEY: () => THEME_KEY,
    lastRIR: () => lastRIR,
    wakeLock: () => wakeLock
  });
  var STORE_KEY, THEME_KEY, BACKUP_PREFIX, DB_SCHEMA_VERSION, MAX_IMPORT_BYTES, ID_PATTERN, MAX_ID_LENGTH, BACKUP_KEEP_COUNT, LOCALSTORAGE_QUOTA_WARN, LOCALSTORAGE_QUOTA_MAX, LLM_PROMPT_TEMPLATE, lastRIR, wakeLock;
  var init_config = __esm({
    "www/js/config.js"() {
      STORE_KEY = "strength_app_v6_data";
      THEME_KEY = "strength_app_theme";
      BACKUP_PREFIX = "strength_app_backup_";
      DB_SCHEMA_VERSION = 3;
      MAX_IMPORT_BYTES = 5 * 1024 * 1024;
      ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
      MAX_ID_LENGTH = 64;
      BACKUP_KEEP_COUNT = 10;
      LOCALSTORAGE_QUOTA_WARN = 4 * 1024 * 1024;
      LOCALSTORAGE_QUOTA_MAX = 5 * 1024 * 1024;
      LLM_PROMPT_TEMPLATE = `Act\xFAa como un entrenador personal y metod\xF3logo de fuerza de \xE9lite. Dise\xF1a un plan de entrenamiento semanal estructurado y devu\xE9lvelo \xDANICAMENTE como un bloque de c\xF3digo JSON v\xE1lido, sin texto introductorio ni explicaciones fuera del JSON, siguiendo estrictamente esta estructura:

{
  "schema_version": "1.0",
  "payload_type": "week",
  "week_ref": {
    "week_id": "2026-W34",
    "week_number": 1,
    "notes": "Estrategia S+1: [Foco Metodol\xF3gico]. [SALUD]: Estado."
  },
  "sessions": [
    {
      "session_id": "A",
      "title": "Titulo Sesi\xF3n",
      "goal_summary": "Objetivo (ej: Fuerza m\xE1xima o Estr\xE9s metab\xF3lico)",
      "estimated_duration_min": 60,
      "exercises": [
        {
          "exercise_id": "press_pecho-hammer_strength",
          "name": "Press de Pecho en M\xE1quina",
          "equipment_csv_name": "press_pecho-hammer_strength",
          "machine_name": "Hammer Strength Iso-Lateral Chest Press",
          "pattern": "push_horizontal",
          "recommendations": "Tips t\xE9cnicos (incluir Tempo si aplica, ej: 3-0-1)",
          "baseline": {
            "set_plan": [
              { "set_index": 1, "reps": 8, "load": 50, "unit": "kg" },
              { "set_index": 2, "reps": 12, "load": 45, "unit": "kg" }
            ]
          }
        },
        {
          "exercise_id": "core_1",
          "name": "Plancha Abdominal",
          "equipment_csv_name": "colchoneta",
          "pattern": "core",
          "baseline": { "planned_sets": 3, "planned_reps": 15, "planned_load": 0 }
        },
        {
          "exercise_id": "opt_1",
          "name": "[OPCIONAL] Elevaciones Laterales",
          "equipment_csv_name": "mancuernas",
          "pattern": "isolation",
          "is_optional": true,
          "baseline": { "planned_sets": 2, "planned_reps": 15, "planned_load": 0 }
        }
      ]
    }
  ]
}`;
      lastRIR = null;
      wakeLock = {
        lock: null,
        request: async () => {
          if ("wakeLock" in navigator) {
            try {
              wakeLock.lock = await navigator.wakeLock.request("screen");
            } catch (err) {
              console.warn("Wake Lock no disponible:", err);
            }
          }
        },
        release: async () => {
          if (wakeLock.lock) {
            try {
              await wakeLock.lock.release();
            } catch (err) {
              console.warn("Error al liberar WakeLock:", err);
            }
            wakeLock.lock = null;
          }
        }
      };
    }
  });

  // www/js/utils.js
  var utils;
  var init_utils = __esm({
    "www/js/utils.js"() {
      init_config();
      utils = {
        esc: (str) => {
          if (str === null || str === void 0) return "";
          return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/`/g, "&#96;");
        },
        /**
         * Estima el consumo de localStorage y limpia backups antiguos si se acerca al límite.
         * Devuelve { ok, used, freed } para que el llamador pueda actuar.
         */
        quotaCheck: (cleanupBackups = true) => {
          try {
            let total = 0;
            const keys = Object.keys(localStorage);
            const backupKeys = keys.filter((k) => k.startsWith(BACKUP_PREFIX)).sort();
            for (const k of keys) {
              const v = localStorage.getItem(k);
              if (v !== null) total += v.length * 2;
            }
            if (total < LOCALSTORAGE_QUOTA_WARN) {
              return { ok: true, used: total, freed: 0 };
            }
            let freed = 0;
            if (cleanupBackups && backupKeys.length > 2) {
              const toRemove = backupKeys.slice(0, backupKeys.length - 2);
              for (const k of toRemove) {
                const v = localStorage.getItem(k);
                if (v !== null) freed += v.length * 2;
                localStorage.removeItem(k);
              }
            }
            const after = total - freed;
            return {
              ok: after < LOCALSTORAGE_QUOTA_MAX,
              used: after,
              freed,
              total
            };
          } catch (e) {
            console.warn("quotaCheck error:", e);
            return { ok: false, used: 0, freed: 0, error: e.message };
          }
        },
        encodeParam: (str) => {
          return encodeURIComponent(String(str === null || str === void 0 ? "" : str)).replace(/'/g, "%27").replace(/"/g, "%22").replace(/\\/g, "%5C");
        },
        decodeParam: (str) => {
          try {
            return decodeURIComponent(str || "");
          } catch (e) {
            console.warn("Error al decodificar par\xE1metro:", e);
            return str || "";
          }
        },
        uuid: () => Date.now().toString(36) + Math.random().toString(36).substring(2, 10),
        isoNow: () => (/* @__PURE__ */ new Date()).toISOString(),
        formatDate: (isoString) => {
          if (!isoString) return "-";
          try {
            const d = new Date(isoString);
            if (isNaN(d.getTime())) return "-";
            return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
          } catch (e) {
            console.warn("Error al formatear fecha:", e);
            return "-";
          }
        },
        formatMonth: (monthKey) => {
          try {
            if (!monthKey || typeof monthKey !== "string") return "-";
            const [year, month] = monthKey.split("-");
            const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
            const idx = parseInt(month, 10) - 1;
            if (idx >= 0 && idx < 12) {
              return `${months[idx]} ${year}`;
            }
            return monthKey;
          } catch (e) {
            console.warn("Error formateando mes:", e);
            return monthKey || "-";
          }
        },
        save: (data, backupAuto) => {
          try {
            data.schema_version = DB_SCHEMA_VERSION;
            data.modified_at = utils.isoNow();
            const quota = utils.quotaCheck(true);
            if (!quota.ok) {
              console.warn("Cuota de localStorage casi agotada; se limpiaron backups antiguos.");
            }
            localStorage.setItem(STORE_KEY, JSON.stringify(data));
            if (backupAuto) backupAuto();
            return true;
          } catch (e) {
            console.error("Error al guardar en localStorage:", e);
            try {
              const keys = Object.keys(localStorage).filter((k) => k.startsWith(BACKUP_PREFIX)).sort();
              if (keys.length > 2) {
                keys.slice(0, keys.length - 2).forEach((k) => localStorage.removeItem(k));
              }
              localStorage.setItem(STORE_KEY, JSON.stringify(data));
              return true;
            } catch (retryErr) {
              console.error("Reintento de guardado fallido:", retryErr);
              return false;
            }
          }
        },
        load: () => {
          const raw = localStorage.getItem(STORE_KEY);
          if (!raw) {
            return { schema_version: DB_SCHEMA_VERSION, weeks: {}, seasons: {}, created_at: utils.isoNow(), modified_at: utils.isoNow() };
          }
          try {
            const data = JSON.parse(raw);
            return utils.migrateSchema(data);
          } catch (e) {
            console.error("Datos corruptos en localStorage:", e);
            return { schema_version: DB_SCHEMA_VERSION, weeks: {}, seasons: {}, created_at: utils.isoNow(), modified_at: utils.isoNow() };
          }
        },
        migrateSchema: (data) => {
          if (!data || typeof data !== "object") {
            return { schema_version: DB_SCHEMA_VERSION, weeks: {}, seasons: {}, created_at: utils.isoNow(), modified_at: utils.isoNow() };
          }
          if (!data.weeks || typeof data.weeks !== "object") {
            data.weeks = {};
          }
          if (!data.schema_version || data.schema_version < 2) {
            data.schema_version = 2;
            data.created_at = data.created_at || utils.isoNow();
            data.modified_at = utils.isoNow();
            Object.values(data.weeks).forEach((w) => {
              if (!w.week) w.week = { week_id: utils.uuid(), week_number: 1 };
              w.week.modified_at = w.week.modified_at || w.generated_at || utils.isoNow();
              if (!Array.isArray(w.sessions)) w.sessions = [];
              w.sessions.forEach((s) => {
                s.modified_at = s.modified_at || utils.isoNow();
                if (!Array.isArray(s.exercises)) s.exercises = [];
                s.exercises.forEach((e) => {
                  e.modified_at = e.modified_at || utils.isoNow();
                  if (!e.execution) e.execution = { sets: [] };
                  if (!Array.isArray(e.execution.sets)) e.execution.sets = [];
                });
              });
            });
            try {
              localStorage.setItem(STORE_KEY, JSON.stringify(data));
            } catch (err) {
              console.warn("No se pudo guardar la migraci\xF3n inmediatamente:", err);
            }
          }
          const needsV3Migration = data.schema_version < 3;
          data.seasons = data.seasons && typeof data.seasons === "object" ? data.seasons : {};
          const activeSeasons = Object.values(data.seasons).filter((season) => season && !season.end_date).sort((a, b) => {
            const timestamp = (value) => Number.isNaN(new Date(value).getTime()) ? -Infinity : new Date(value).getTime();
            return timestamp(b.modified_at) - timestamp(a.modified_at) || timestamp(b.created_at) - timestamp(a.created_at) || String(b.season_id).localeCompare(String(a.season_id));
          });
          if (activeSeasons.length > 1) {
            const winner = activeSeasons[0];
            activeSeasons.slice(1).forEach((season) => {
              const close = /* @__PURE__ */ new Date(`${winner.start_date}T12:00:00`);
              close.setDate(close.getDate() - 1);
              const date = `${close.getFullYear()}-${String(close.getMonth() + 1).padStart(2, "0")}-${String(close.getDate()).padStart(2, "0")}`;
              season.end_date = date >= season.start_date ? date : season.start_date;
            });
          }
          Object.values(data.weeks).forEach((w) => (w.sessions || []).forEach((s) => {
            if (s.scheduled_date === void 0) s.scheduled_date = null;
            (s.exercises || []).forEach((e) => (e.execution?.sets || []).forEach((set) => {
              if (set.rir_is_open_ended === void 0) set.rir_is_open_ended = false;
              if (set.rir !== 4) set.rir_is_open_ended = false;
            }));
          }));
          if (needsV3Migration) {
            data.schema_version = 3;
            data.modified_at = utils.isoNow();
            try {
              localStorage.setItem(STORE_KEY, JSON.stringify(data));
            } catch (err) {
              console.warn("No se pudo guardar la migraci\xF3n v3:", err);
            }
          }
          if (!data.seasons || typeof data.seasons !== "object") data.seasons = {};
          return data;
        },
        download: async (data, filename) => {
          const text = JSON.stringify(data, null, 2);
          if (window.Capacitor && Capacitor.isNativePlatform()) {
            const { Filesystem, Share } = Capacitor.Plugins;
            try {
              await Filesystem.writeFile({ path: filename, data: text, directory: "CACHE", encoding: "utf8" });
              const uriResult = await Filesystem.getUri({ directory: "CACHE", path: filename });
              await Share.share({ title: "Backup Strength Tracker", files: [uriResult.uri] });
            } catch (e) {
              console.warn("Error en Filesystem/Share nativo:", e);
              navigator.clipboard.writeText(text);
            }
          } else {
            const blob = new Blob([text], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        },
        downloadCSV: async (csv, filename) => {
          if (window.Capacitor && Capacitor.isNativePlatform()) {
            const { Filesystem, Share } = Capacitor.Plugins;
            try {
              await Filesystem.writeFile({ path: filename, data: csv, directory: "CACHE", encoding: "utf8" });
              const uriResult = await Filesystem.getUri({ directory: "CACHE", path: filename });
              await Share.share({ title: "Exportar CSV", files: [uriResult.uri] });
            } catch (e) {
              console.warn("Error al exportar CSV nativo:", e);
            }
          } else {
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        },
        initTheme: () => {
          const saved = localStorage.getItem("strength_app_theme");
          if (saved) {
            document.body.className = saved;
          } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
            document.body.className = "light";
          } else {
            document.body.className = "dark";
          }
        },
        toggleTheme: () => {
          const current = document.body.className;
          const next = current === "dark" ? "light" : "dark";
          document.body.className = next;
          localStorage.setItem("strength_app_theme", next);
        }
      };
    }
  });

  // www/js/data.js
  var data_exports = {};
  __export(data_exports, {
    getDb: () => getDb,
    getState: () => getState,
    setDb: () => setDb,
    setState: () => setState
  });
  var db, state, getDb, setDb, getState, setState;
  var init_data = __esm({
    "www/js/data.js"() {
      init_utils();
      db = utils.load();
      state = {
        view: "home",
        activeWeekId: null,
        activeSessionId: null,
        activeExerciseId: null,
        historyExercise: null,
        modal: null,
        setModal: null,
        conflictQueue: [],
        currentConflictIndex: 0,
        pendingMergeData: null,
        pendingMergeSeasons: null,
        selectedRIR: null,
        selectedRIRIsOpenEnded: false,
        analyticsPeriod: "active_season",
        analyticsExerciseKey: null,
        analyticsSeasonId: null
      };
      getDb = () => db;
      setDb = (newDb) => {
        db = newDb;
      };
      getState = () => state;
      setState = (newState) => {
        state = newState;
      };
    }
  });

  // www/js/validate.js
  var validate;
  var init_validate = __esm({
    "www/js/validate.js"() {
      init_config();
      init_utils();
      validate = {
        /**
         * Valida un identificador (week_id / session_id / exercise_id).
         * Si no cumple el formato seguro, genera uno nuevo con utils.uuid().
         * Nunca rechaza la importación por un ID malo; siempre devuelve un ID seguro.
         */
        id: (value, name = "id", defaultVal = null) => {
          const str = validate.string(value, MAX_ID_LENGTH, name, "");
          if (str === "") return defaultVal || utils.uuid();
          if (ID_PATTERN.test(str)) return str;
          console.warn(`[SEC-04] ID "${str.slice(0, 40)}" de "${name}" tiene formato inseguro; reemplazado por UUID seguro.`);
          return utils.uuid();
        },
        number: (value, min, max, name) => {
          const num = parseFloat(value);
          if (isNaN(num)) throw new Error(`${name} debe ser un n\xFAmero v\xE1lido`);
          if (num < min || num > max) throw new Error(`${name} debe estar entre ${min} y ${max}`);
          return num;
        },
        string: (value, maxLength = 500, name = "Campo", defaultVal = "") => {
          if (value === null || value === void 0) return defaultVal;
          const str = String(value).replace(/\[span_\d+\]\((?:start_span|end_span)\)/g, "").trim();
          if (str.length > maxLength) return str.substring(0, maxLength);
          return str;
        },
        json: (str) => {
          if (!str || typeof str !== "string") throw new Error("Entrada vac\xEDa o no es texto");
          if (str.length > MAX_IMPORT_BYTES) throw new Error("El archivo excede el tama\xF1o m\xE1ximo permitido (5 MB)");
          let obj;
          try {
            obj = JSON.parse(str);
          } catch (e) {
            throw new Error(`JSON malformado: ${e.message}`, { cause: e });
          }
          if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("El JSON debe contener un objeto");
          const weekObj = obj.week_ref || obj.week;
          if (weekObj !== void 0 && (typeof weekObj !== "object" || Array.isArray(weekObj))) {
            throw new Error("'week_ref' debe ser un objeto");
          }
          if (!weekObj) throw new Error("Falta el campo 'week_ref' o 'week'");
          const sessions = obj.sessions;
          if (!sessions || !Array.isArray(sessions)) throw new Error("'sessions' debe ser una lista");
          if (sessions.length > 50) throw new Error("La semana contiene demasiadas sesiones (m\xE1ximo 50)");
          const schemaVersion = parseInt(obj.schema_version, 10) || 1;
          return validate.sanitizeWeekObject({
            week: weekObj,
            sessions,
            generated_at: obj.generated_at || utils.isoNow(),
            schema_version: schemaVersion
          });
        },
        backupJSON: (str) => {
          if (!str || typeof str !== "string") throw new Error("Entrada de backup vac\xEDa");
          if (str.length > MAX_IMPORT_BYTES * 2) throw new Error("El archivo de backup supera el l\xEDmite permitido");
          let obj;
          try {
            obj = JSON.parse(str);
          } catch (e) {
            throw new Error(`Backup JSON malformado: ${e.message}`, { cause: e });
          }
          if (!obj || typeof obj !== "object") throw new Error("Formato de backup inv\xE1lido");
          let extractedData = null;
          if (obj.backup_meta && obj.data) {
            extractedData = obj.data;
          } else if (obj.weeks && typeof obj.weeks === "object") {
            extractedData = obj;
          } else if (obj.export_meta && Array.isArray(obj.backups) && obj.backups.length > 0) {
            extractedData = obj.backups[0].data;
          }
          if (!extractedData || !extractedData.weeks || typeof extractedData.weeks !== "object") {
            throw new Error("El archivo no contiene semanas v\xE1lidas");
          }
          const cleanWeeks = {};
          Object.entries(extractedData.weeks).forEach(([key, w]) => {
            if (w && typeof w === "object") {
              try {
                const cleanWeek = validate.sanitizeWeekObject(w);
                cleanWeeks[cleanWeek.week.week_id] = cleanWeek;
              } catch (err) {
                console.warn(`Semana ignorada por error de validaci\xF3n: ${key}`, err);
              }
            }
          });
          return {
            schema_version: DB_SCHEMA_VERSION,
            weeks: cleanWeeks,
            seasons: validate.sanitizeSeasons(extractedData.seasons),
            modified_at: utils.isoNow()
          };
        },
        sanitizeWeekObject: (raw) => {
          const rawWeek = raw.week || raw.week_ref || {};
          const weekId = validate.id(rawWeek.week_id, "week_id");
          let weekNum = parseInt(rawWeek.week_number, 10);
          if (isNaN(weekNum) || weekNum < 1) weekNum = 1;
          const cleanWeekRef = {
            week_id: weekId,
            week_number: weekNum,
            source: validate.string(rawWeek.source, 50, "source", "Importado"),
            notes: validate.string(rawWeek.notes, 1e3, "notes", ""),
            modified_at: rawWeek.modified_at || raw.generated_at || utils.isoNow()
          };
          const rawSessions = Array.isArray(raw.sessions) ? raw.sessions : [];
          const cleanSessions = rawSessions.slice(0, 50).map((s, sIdx) => {
            const sId = validate.id(s.session_id, "session_id", `D\xEDa ${sIdx + 1}`);
            const completion = s.session_completion || {};
            const validStatus = ["pending", "in_progress", "completed"].includes(completion.status) ? completion.status : "pending";
            const rawExercises = Array.isArray(s.exercises) ? s.exercises : [];
            const cleanExercises = rawExercises.slice(0, 50).map((e, eIdx) => {
              const exId = validate.id(e.exercise_id, "exercise_id");
              const exName = validate.string(e.name, 100, "name", `Ejercicio ${eIdx + 1}`);
              let baseline = null;
              if (e.baseline && typeof e.baseline === "object") {
                if (Array.isArray(e.baseline.set_plan)) {
                  baseline = {
                    set_plan: e.baseline.set_plan.slice(0, 50).map((sp, spIdx) => ({
                      set_index: parseInt(sp.set_index, 10) || spIdx + 1,
                      reps: Math.min(200, Math.max(1, parseInt(sp.reps, 10) || 10)),
                      load: Math.min(2e3, Math.max(0, parseFloat(sp.load) || 0)),
                      unit: validate.string(sp.unit, 10, "unit", "kg")
                    }))
                  };
                } else {
                  baseline = {
                    planned_sets: Math.min(50, Math.max(1, parseInt(e.baseline.planned_sets, 10) || 3)),
                    planned_reps: Math.min(200, Math.max(1, parseInt(e.baseline.planned_reps, 10) || 10)),
                    planned_load: Math.min(2e3, Math.max(0, parseFloat(e.baseline.planned_load) || 0))
                  };
                }
              }
              let override = null;
              if (e.override && typeof e.override === "object") {
                override = {
                  planned_sets: Math.min(50, Math.max(1, parseInt(e.override.planned_sets, 10) || 3)),
                  planned_reps: Math.min(200, Math.max(1, parseInt(e.override.planned_reps, 10) || 10)),
                  planned_load: Math.min(2e3, Math.max(0, parseFloat(e.override.planned_load) || 0))
                };
              }
              let target_1rm = null;
              if (e.target_1rm && typeof e.target_1rm === "object") {
                const t1 = e.target_1rm;
                const val = parseFloat(t1.value);
                if (!isNaN(val) && val >= 0 && val <= 1e3) {
                  target_1rm = {
                    value: val,
                    date: t1.date ? validate.string(t1.date, 20, "date", null) : null
                  };
                }
              }
              const rawSets = e.execution && Array.isArray(e.execution.sets) ? e.execution.sets : [];
              const cleanSets = rawSets.slice(0, 50).map((st, stIdx) => {
                const reps = st.reps !== null && st.reps !== void 0 && st.reps !== "" ? Math.min(999, Math.max(0, parseFloat(st.reps))) : null;
                const load = st.load !== null && st.load !== void 0 && st.load !== "" ? Math.min(9999, Math.max(0, parseFloat(st.load))) : null;
                let rir = st.rir !== null && st.rir !== void 0 && st.rir !== "" ? parseInt(st.rir, 10) : null;
                if (rir !== null && (isNaN(rir) || rir < 0 || rir > 4)) rir = null;
                return {
                  set_index: stIdx,
                  reps,
                  load,
                  rir,
                  rir_is_open_ended: rir === 4 && Boolean(st.rir_is_open_ended),
                  notes: validate.string(st.notes, 500, "set_notes", ""),
                  completed_at: st.completed_at || null,
                  is_extra: Boolean(st.is_extra)
                };
              });
              const exCompletion = e.completion || {};
              return {
                exercise_id: exId,
                name: exName,
                machine_name: validate.string(e.machine_name || e.equipment_csv_name, 100, "machine_name", "General"),
                equipment_csv_name: validate.string(e.equipment_csv_name, 100, "equipment_csv_name", ""),
                recommendations: validate.string(e.recommendations, 500, "recommendations", ""),
                baseline,
                override,
                target_1rm,
                execution: { sets: cleanSets },
                completion: {
                  status: exCompletion.status === "completed" ? "completed" : "pending",
                  completed_at: exCompletion.completed_at || null
                },
                notes: validate.string(e.notes, 2e3, "notes", ""),
                modified_at: e.modified_at || utils.isoNow()
              };
            });
            return {
              session_id: sId,
              title: validate.string(s.title, 100, "title", "Entreno"),
              goal_summary: validate.string(s.goal_summary, 500, "goal_summary", ""),
              estimated_duration_min: parseInt(s.estimated_duration_min, 10) || 45,
              session_completion: {
                status: validStatus,
                started_at: completion.started_at || null,
                completed_at: completion.completed_at || null
              },
              scheduled_date: validate.date(s.scheduled_date),
              session_notes: validate.string(s.session_notes, 2e3, "session_notes", ""),
              exercises: cleanExercises,
              modified_at: s.modified_at || utils.isoNow()
            };
          });
          return {
            week: cleanWeekRef,
            sessions: cleanSessions,
            generated_at: raw.generated_at || utils.isoNow(),
            schema_version: raw.schema_version || DB_SCHEMA_VERSION
          };
        },
        date: (value) => {
          if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
          const [year, month, day2] = value.split("-").map(Number);
          const date = new Date(year, month - 1, day2);
          return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day2 ? value : null;
        },
        sanitizeSeasons: (rawSeasons) => {
          if (!rawSeasons || typeof rawSeasons !== "object" || Array.isArray(rawSeasons)) return {};
          const seasons2 = {};
          Object.values(rawSeasons).forEach((season) => {
            if (!season || typeof season !== "object") return;
            const seasonId = validate.id(season.season_id, "season_id");
            const startDate = validate.date(season.start_date);
            const endDate = season.end_date === null || season.end_date === void 0 ? null : validate.date(season.end_date);
            if (!startDate || endDate && endDate < startDate) return;
            const objective = ["strength", "hypertrophy", "maintenance", "return"].includes(season.objective) ? season.objective : "strength";
            seasons2[seasonId] = {
              season_id: seasonId,
              name: validate.string(season.name, 80, "season_name", "Temporada"),
              start_date: startDate,
              end_date: endDate,
              objective,
              priority_exercise_keys: Array.isArray(season.priority_exercise_keys) ? season.priority_exercise_keys.slice(0, 30).map((key) => validate.string(key, 200)).filter(Boolean) : [],
              notes: validate.string(season.notes, 500, "season_notes", ""),
              created_at: season.created_at || utils.isoNow(),
              modified_at: season.modified_at || utils.isoNow()
            };
          });
          const timestamp = (value) => {
            const parsed = new Date(value).getTime();
            return Number.isNaN(parsed) ? null : parsed;
          };
          const active = Object.values(seasons2).filter((season) => !season.end_date).sort((a, b) => {
            const modified = (timestamp(b.modified_at) ?? -Infinity) - (timestamp(a.modified_at) ?? -Infinity);
            if (modified) return modified;
            const created = (timestamp(b.created_at) ?? -Infinity) - (timestamp(a.created_at) ?? -Infinity);
            return created || b.season_id.localeCompare(a.season_id);
          });
          if (active.length > 1) {
            const winner = active[0];
            active.slice(1).forEach((season) => {
              const beforeWinner = /* @__PURE__ */ new Date(`${winner.start_date}T12:00:00`);
              beforeWinner.setDate(beforeWinner.getDate() - 1);
              const candidate = `${beforeWinner.getFullYear()}-${String(beforeWinner.getMonth() + 1).padStart(2, "0")}-${String(beforeWinner.getDate()).padStart(2, "0")}`;
              season.end_date = candidate >= season.start_date ? candidate : season.start_date;
              season.modified_at = winner.modified_at;
            });
          }
          return seasons2;
        }
      };
    }
  });

  // www/js/backup.js
  var backup_exports = {};
  __export(backup_exports, {
    backup: () => backup
  });
  var backup;
  var init_backup = __esm({
    "www/js/backup.js"() {
      init_config();
      init_utils();
      backup = {
        auto: () => {
          try {
            const data = utils.load();
            const ts = utils.isoNow();
            const backupKey = `${BACKUP_PREFIX}${ts}`;
            localStorage.setItem(backupKey, JSON.stringify(data));
            const allKeys = Object.keys(localStorage);
            const backupKeys = allKeys.filter((k) => k.startsWith(BACKUP_PREFIX)).sort().reverse();
            backupKeys.slice(BACKUP_KEEP_COUNT).forEach((k) => localStorage.removeItem(k));
          } catch (e) {
            console.error("Error backup:", e);
          }
        },
        list: () => Object.keys(localStorage).filter((k) => k.startsWith(BACKUP_PREFIX)).map((k) => k.replace(BACKUP_PREFIX, "")).sort().reverse(),
        get: (timestamp) => {
          const data = localStorage.getItem(`${BACKUP_PREFIX}${timestamp}`);
          if (!data) return null;
          try {
            return JSON.parse(data);
          } catch (e) {
            console.warn("Backup corrupto:", e);
            return null;
          }
        },
        getLatest: () => {
          const timestamps = backup.list();
          if (timestamps.length === 0) return null;
          return backup.get(timestamps[0]);
        },
        /**
         * Valida la integridad de un backup antes de restaurarlo.
         * Lanza error si el backup es corrupto o no tiene schema_version válido.
         */
        validateIntegrity: (data) => {
          if (!data || typeof data !== "object") throw new Error("Backup corrupto: no es un objeto");
          if (!data.weeks || typeof data.weeks !== "object") throw new Error("Backup corrupto: falta weeks");
          const schemaVersion = parseInt(data.schema_version, 10);
          if (isNaN(schemaVersion) || schemaVersion < 1) throw new Error("Backup corrupto: schema_version inv\xE1lido");
          return true;
        },
        download: async (timestamp) => {
          const data = backup.get(timestamp);
          if (!data) return false;
          const backupFile = { backup_meta: { timestamp, created_at: (/* @__PURE__ */ new Date()).toISOString(), version: String(DB_SCHEMA_VERSION) }, data };
          await utils.download(backupFile, `strength_backup_${timestamp.replace(/[:.]/g, "-")}.json`);
          return true;
        },
        downloadAll: async () => {
          const timestamps = backup.list();
          if (timestamps.length === 0) return false;
          const allBackups = timestamps.map((timestamp) => ({ timestamp, data: backup.get(timestamp) }));
          const exportFile = { export_meta: { created_at: (/* @__PURE__ */ new Date()).toISOString(), version: String(DB_SCHEMA_VERSION), total_backups: allBackups.length }, backups: allBackups };
          await utils.download(exportFile, `strength_backups_all_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`);
          return true;
        },
        restore: async (timestamp, actions2, toastFn) => {
          const data = backup.get(timestamp);
          if (!data) {
            toastFn("\u26A0\uFE0F Backup no encontrado");
            return false;
          }
          if (!confirm(`\xBFRestaurar backup del ${utils.formatDate(timestamp)}?`)) return false;
          try {
            backup.validateIntegrity(data);
          } catch (e) {
            toastFn(`\u26A0\uFE0F ${e.message}`);
            return false;
          }
          const { setDb: setDb2 } = await Promise.resolve().then(() => (init_data(), data_exports));
          backup.auto();
          utils.save(data);
          const newDb = utils.load();
          setDb2(newDb);
          toastFn("\u2713 Backup restaurado");
          await actions2.goHome();
          return true;
        }
      };
    }
  });

  // www/js/analytics.js
  function subtractNaturalMonths(now, months) {
    const targetMonth = now.getMonth() - months;
    const year = now.getFullYear() + Math.floor(targetMonth / 12);
    const month = (targetMonth % 12 + 12) % 12;
    const lastDay = new Date(year, month + 1, 0).getDate();
    return new Date(year, month, Math.min(now.getDate(), lastDay));
  }
  var round, valid, day, sessionKey, analytics;
  var init_analytics = __esm({
    "www/js/analytics.js"() {
      init_utils();
      init_data();
      round = (value) => Math.round(value * 10) / 10;
      valid = (value) => Number.isFinite(Number(value)) && Number(value) > 0;
      day = (value) => {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      };
      sessionKey = (weekId, sessionId) => `${weekId}:${sessionId}`;
      analytics = {
        exerciseKey: (exercise) => {
          const id = String(exercise.exercise_id || "").trim();
          const equipment = String(exercise.equipment_csv_name || exercise.machine_name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
          return id ? equipment && !id.toLowerCase().includes(equipment) ? `${id}-${equipment}` : id : `${String(exercise.name || "ejercicio").toLowerCase().replace(/[^a-z0-9]+/g, "_")}-${equipment || "general"}`;
        },
        estimate1RM: (load, reps) => {
          if (!valid(load) || !valid(reps)) return null;
          return round(Number(reps) === 1 ? Number(load) : Number(load) * (1 + Number(reps) / 30));
        },
        estimateAdjusted1RM: (load, reps, rir, openEnded = false) => openEnded || !Number.isInteger(rir) || rir < 0 || rir > 3 ? null : analytics.estimate1RM(load, Number(reps) + rir),
        classifyObservation: (set, completed) => {
          if (!completed || !valid(set.load) || !valid(set.reps)) return "invalid";
          if (set.rir_is_open_ended || set.rir === null || set.rir === void 0 || Number(set.reps) > 10) return "informational";
          if (set.rir === 4 || Number(set.reps) >= 9) return "low";
          return Number.isInteger(set.rir) && set.rir >= 0 && set.rir <= 3 ? "high" : "informational";
        },
        getObservations: (db2 = getDb()) => {
          const result = [];
          Object.entries(db2.weeks || {}).forEach(([weekId, week]) => (week.sessions || []).forEach((session) => {
            const completed = session.session_completion?.status === "completed";
            const date = completed ? day(session.session_completion.completed_at || session.session_completion.started_at) : null;
            (session.exercises || []).forEach((exercise) => (exercise.execution?.sets || []).forEach((set, index) => {
              const confidence = analytics.classifyObservation(set, completed);
              if (!date || confidence === "invalid") return;
              result.push({
                week_id: weekId,
                session_id: session.session_id,
                session_key: sessionKey(weekId, session.session_id),
                date,
                exercise_key: analytics.exerciseKey(exercise),
                exercise_id: exercise.exercise_id || null,
                display_name: exercise.name || "Ejercicio",
                equipment_name: exercise.equipment_csv_name || exercise.machine_name || "General",
                set_index: set.set_index ?? index,
                reps: Number(set.reps),
                load: Number(set.load),
                rir: set.rir ?? null,
                rir_is_open_ended: Boolean(set.rir_is_open_ended),
                notes: set.notes || "",
                raw_e1rm: analytics.estimate1RM(set.load, set.reps),
                adjusted_e1rm: analytics.estimateAdjusted1RM(set.load, set.reps, set.rir, set.rir_is_open_ended),
                confidence
              });
            }));
          }));
          return result.sort((a, b) => a.date.localeCompare(b.date) || a.session_key.localeCompare(b.session_key));
        },
        getVariants: (db2 = getDb()) => [...new Map(analytics.getObservations(db2).map((item) => [item.exercise_key, { exercise_key: item.exercise_key, display_name: item.display_name, equipment_name: item.equipment_name }])).values()].sort((a, b) => `${a.display_name}${a.equipment_name}`.localeCompare(`${b.display_name}${b.equipment_name}`)),
        exposures: (db2 = getDb(), exerciseKey = null, bounds = null) => {
          const best = /* @__PURE__ */ new Map();
          analytics.filterPeriod(analytics.getObservations(db2), bounds).filter((item) => (!exerciseKey || item.exercise_key === exerciseKey) && item.confidence === "high").forEach((item) => {
            const key = `${item.exercise_key}:${item.session_key}:${item.date}`;
            if (!best.has(key) || best.get(key).adjusted_e1rm < item.adjusted_e1rm) best.set(key, item);
          });
          return [...best.values()].sort((a, b) => a.date.localeCompare(b.date) || a.session_key.localeCompare(b.session_key));
        },
        movingTrend: (exposures) => exposures.map((item, index) => ({ ...item, trend: round(exposures.slice(Math.max(0, index - 2), index + 1).reduce((sum, value) => sum + value.adjusted_e1rm, 0) / Math.min(3, index + 1)), consolidated: index >= 2 })),
        periodBounds: (period, seasons2 = {}, now = /* @__PURE__ */ new Date()) => {
          const today = day(now);
          if (period === "active_season") {
            const active = Object.values(seasons2).find((item) => !item.end_date);
            return active ? { start: active.start_date, end: today } : null;
          }
          if (period?.startsWith("season:")) {
            const season = seasons2[period.slice(7)];
            return season ? { start: season.start_date, end: season.end_date || today } : null;
          }
          if (period === "last_30_days") return { start: day(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)), end: today };
          const months = { last_3_months: 3, last_6_months: 6, last_year: 12 }[period];
          return months ? { start: day(subtractNaturalMonths(now, months)), end: today } : { start: null, end: today };
        },
        filterPeriod: (items, bounds) => bounds === null ? [] : items.filter((item) => (!bounds.start || item.date >= bounds.start) && (!bounds.end || item.date <= bounds.end)),
        completedSessions: (db2, bounds) => {
          const entries = [];
          Object.entries(db2.weeks || {}).forEach(([weekId, week]) => (week.sessions || []).forEach((session) => {
            const date = day(session.session_completion?.completed_at || session.session_completion?.started_at);
            if (session.session_completion?.status === "completed" && date && analytics.filterPeriod([{ date }], bounds).length) entries.push({ key: sessionKey(weekId, session.session_id), date });
          }));
          return entries;
        },
        summarize: (db2 = getDb(), exerciseKey = null, bounds = analytics.periodBounds("all_time", db2.seasons)) => {
          const observations = analytics.filterPeriod(analytics.getObservations(db2), bounds).filter((item) => !exerciseKey || item.exercise_key === exerciseKey);
          const exposures = analytics.exposures(db2, exerciseKey, bounds);
          const hard = observations.filter((item) => item.rir !== null && !item.rir_is_open_ended && item.rir >= 0 && item.rir <= 3);
          const planned = Object.entries(db2.weeks || {}).flatMap(([weekId, week]) => (week.sessions || []).filter((session) => session.scheduled_date && (!bounds?.start || session.scheduled_date >= bounds.start) && (!bounds?.end || session.scheduled_date <= bounds.end)).map((session) => sessionKey(weekId, session.session_id)));
          const completed = analytics.completedSessions(db2, bounds);
          const first = exposures[0] || null;
          const last = exposures.at(-1) || null;
          const best = exposures.reduce((winner, item) => !winner || item.adjusted_e1rm > winner.adjusted_e1rm ? item : winner, null);
          const actualCompleted = completed.length;
          return {
            observations,
            exposures,
            reference_e1rm: last?.adjusted_e1rm ?? null,
            reference_date: last?.date ?? null,
            first_e1rm: first?.adjusted_e1rm ?? null,
            last_e1rm: last?.adjusted_e1rm ?? null,
            change: first && last ? round(last.adjusted_e1rm - first.adjusted_e1rm) : null,
            change_percent: first && last ? round((last.adjusted_e1rm - first.adjusted_e1rm) / first.adjusted_e1rm * 100) : null,
            best_e1rm: best?.adjusted_e1rm ?? null,
            best_date: best?.date ?? null,
            tonnage: round(observations.reduce((sum, item) => sum + item.load * item.reps, 0)),
            reps: observations.reduce((sum, item) => sum + item.reps, 0),
            registered_sets: observations.length,
            hard_sets: hard.length,
            average_rir: hard.length ? round(hard.reduce((sum, item) => sum + item.rir, 0) / hard.length) : null,
            adherence: planned.length ? Math.min(100, round(actualCompleted / planned.length * 100)) : null,
            completed_sessions: actualCompleted,
            planned_sessions: planned.length,
            completed_session_keys: completed.map((item) => item.key)
          };
        },
        isoWeek: (text) => {
          const date = /* @__PURE__ */ new Date(`${text}T12:00:00`);
          date.setDate(date.getDate() - (date.getDay() + 6) % 7);
          return day(date);
        },
        weeklyLoad: (db2 = getDb(), exerciseKey = null, bounds) => {
          if (!bounds) return [];
          const buckets = /* @__PURE__ */ new Map();
          const observations = analytics.filterPeriod(analytics.getObservations(db2), bounds).filter((item) => !exerciseKey || item.exercise_key === exerciseKey);
          if (!observations.length) return [];
          const start = bounds.start || observations[0].date;
          const end = bounds.end || observations.at(-1).date;
          for (let cursor = /* @__PURE__ */ new Date(`${analytics.isoWeek(start)}T12:00:00`); cursor <= /* @__PURE__ */ new Date(`${analytics.isoWeek(end)}T12:00:00`); cursor.setDate(cursor.getDate() + 7)) buckets.set(analytics.isoWeek(day(cursor)), { week: analytics.isoWeek(day(cursor)), tonnage: 0, hard_sets: 0, sets: 0, reps: 0 });
          observations.forEach((item) => {
            const bucket = buckets.get(analytics.isoWeek(item.date));
            if (bucket) {
              bucket.tonnage += item.load * item.reps;
              bucket.sets += 1;
              bucket.reps += item.reps;
              if (item.rir !== null && !item.rir_is_open_ended && item.rir >= 0 && item.rir <= 3) bucket.hard_sets += 1;
            }
          });
          return [...buckets.values()];
        },
        intensityReferences: (db2 = getDb(), exerciseKey = null, bounds) => {
          const sessions = /* @__PURE__ */ new Map();
          analytics.filterPeriod(analytics.getObservations(db2), bounds).filter((item) => !exerciseKey || item.exercise_key === exerciseKey).forEach((item) => sessions.set(`${item.exercise_key}:${item.session_key}`, item));
          const references = /* @__PURE__ */ new Map();
          const prior = /* @__PURE__ */ new Map();
          [...sessions.values()].sort((a, b) => a.date.localeCompare(b.date) || a.session_key.localeCompare(b.session_key)).forEach((session) => {
            const key = session.exercise_key;
            const current = analytics.exposures(db2, key, { start: session.date, end: session.date }).filter((item) => item.session_key === session.session_key).at(-1);
            references.set(`${key}:${session.session_key}`, prior.get(key) || current?.adjusted_e1rm || null);
            if (current) prior.set(key, current.adjusted_e1rm);
          });
          return references;
        },
        intensityDistribution: (db2 = getDb(), exerciseKey = null, bounds) => {
          const zones = ["<60%", "60\u201369%", "70\u201379%", "80\u201389%", "\u226590%"].map((label) => ({ label, reps: 0 }));
          const references = analytics.intensityReferences(db2, exerciseKey, bounds);
          analytics.filterPeriod(analytics.getObservations(db2), bounds).filter((item) => !exerciseKey || item.exercise_key === exerciseKey).forEach((item) => {
            const reference = references.get(`${item.exercise_key}:${item.session_key}`);
            if (!reference) return;
            const ratio = item.load / reference * 100;
            zones[ratio < 60 ? 0 : ratio < 70 ? 1 : ratio < 80 ? 2 : ratio < 90 ? 3 : 4].reps += item.reps;
          });
          return zones;
        },
        comparableRir: (db2 = getDb(), exerciseKey = null, bounds) => {
          const exact = analytics.filterPeriod(analytics.getObservations(db2), bounds).filter((item) => (!exerciseKey || item.exercise_key === exerciseKey) && item.rir !== null && !item.rir_is_open_ended && item.rir >= 0 && item.rir <= 3);
          const groups = [];
          [...exact].sort((a, b) => a.date.localeCompare(b.date) || a.session_key.localeCompare(b.session_key) || b.load - a.load).forEach((item) => {
            let group = groups.find((candidate) => Math.abs(item.load - candidate.load) / candidate.load <= 0.025);
            if (!group) {
              group = { load: item.load, items: [], latest: item.date };
              groups.push(group);
            }
            group.items.push(item);
            if (item.date > group.latest) group.latest = item.date;
          });
          const candidates = groups.map((group) => {
            const perSession = /* @__PURE__ */ new Map();
            group.items.forEach((item) => {
              const values = perSession.get(item.session_key) || [];
              values.push(item);
              perSession.set(item.session_key, values);
            });
            const observations = [...perSession.values()].map((items) => ({ ...items[0], load: round(items.reduce((sum, item) => sum + item.load, 0) / items.length), rir: round(items.reduce((sum, item) => sum + item.rir, 0) / items.length) })).sort((a, b) => a.date.localeCompare(b.date) || a.session_key.localeCompare(b.session_key));
            return { load: group.load, latest: group.latest, observations };
          }).filter((group) => group.observations.length >= 3).sort((a, b) => b.latest.localeCompare(a.latest) || b.observations.length - a.observations.length || b.load - a.load);
          if (!candidates.length) return null;
          const selected = candidates[0];
          return { load: selected.load, observations: selected.observations, average_rir: round(selected.observations.reduce((sum, item) => sum + item.rir, 0) / selected.observations.length) };
        },
        getExerciseHistory: (exerciseKey) => analytics.getObservations().filter((item) => item.exercise_key === exerciseKey).reverse(),
        getAllExercises: (db2 = getDb()) => analytics.getVariants(db2),
        getBest1RM: (exerciseKey) => analytics.exposures(getDb(), exerciseKey).reduce((best, item) => Math.max(best, item.adjusted_e1rm), null),
        get1RMRecords: (exerciseKey) => {
          let best = null;
          return analytics.exposures(getDb(), exerciseKey).filter((item) => {
            if (best !== null && item.adjusted_e1rm <= best) return false;
            best = item.adjusted_e1rm;
            return true;
          }).map((item, index, records) => ({ ...item, value: item.adjusted_e1rm, improvement: index ? round(item.adjusted_e1rm - records[index - 1].adjusted_e1rm) : 0 })).reverse();
        },
        get1RMMonthlySummary: (exerciseKey) => [...analytics.exposures(getDb(), exerciseKey).reduce((months, item) => {
          const key = item.date.slice(0, 7);
          if (!months.has(key) || months.get(key).value < item.adjusted_e1rm) months.set(key, { month: key, value: item.adjusted_e1rm, date: item.date, reps: item.reps, load: item.load });
          return months;
        }, /* @__PURE__ */ new Map()).values()].reverse(),
        getRecentSets: (exerciseKey, days = 30) => {
          const cutoff = /* @__PURE__ */ new Date();
          cutoff.setDate(cutoff.getDate() - days);
          return analytics.getExerciseHistory(exerciseKey).filter((item) => /* @__PURE__ */ new Date(`${item.date}T12:00:00`) >= cutoff).map((item) => ({ ...item, estimated1RM: item.raw_e1rm }));
        },
        exportToCSV: (exerciseKey, period = "all_time", db2 = getDb()) => {
          const history = analytics.filterPeriod(analytics.getObservations(db2).filter((item) => item.exercise_key === exerciseKey), analytics.periodBounds(period, db2.seasons));
          if (!history.length) return null;
          const esc = (value) => {
            const text = String(value ?? "");
            return `"${(/^[=+\-@]/.test(text) ? "'" : "") + text.replace(/"/g, '""')}"`;
          };
          return `Fecha,Variante,M\xE1quina,Set,Reps,Carga,RIR,RIR_Abierto,e1RM_Bruto,e1RM_Ajustado,Confianza,Tonelaje,Notas
${history.map((item) => [item.date, item.exercise_key, item.equipment_name, item.set_index + 1, item.reps, item.load, item.rir ?? "", item.rir_is_open_ended, item.raw_e1rm ?? "", item.adjusted_e1rm ?? "", item.confidence, item.load * item.reps, item.notes].map(esc).join(",")).join("\n")}
`;
        },
        exportToJSON: (exerciseKey, period = "all_time", db2 = getDb()) => {
          const bounds = analytics.periodBounds(period, db2.seasons);
          return { exercise_key: exerciseKey, period: bounds, metrics: analytics.summarize(db2, exerciseKey, bounds), history: analytics.filterPeriod(analytics.getObservations(db2).filter((item) => item.exercise_key === exerciseKey), bounds) };
        },
        exportAll1RMs: (db2 = getDb()) => ({ exported_at: utils.isoNow(), total_exercises: analytics.getVariants(db2).length, exercises: analytics.getVariants(db2).map((item) => ({ ...item, best_1rm: analytics.summarize(db2, item.exercise_key).best_e1rm, records: analytics.get1RMRecords(item.exercise_key) })) }),
        exportAll1RMsCSV: (db2 = getDb()) => `Variante,M\xE1quina,Mejor e1RM (kg)
${analytics.getVariants(db2).map((item) => `"${item.exercise_key.replace(/"/g, '""')}","${item.equipment_name.replace(/"/g, '""')}",${analytics.summarize(db2, item.exercise_key).best_e1rm ?? ""}`).join("\n")}
`
      };
    }
  });

  // www/js/seasons.js
  var seasons_exports = {};
  __export(seasons_exports, {
    seasons: () => seasons
  });
  var seasons;
  var init_seasons = __esm({
    "www/js/seasons.js"() {
      init_utils();
      init_validate();
      init_analytics();
      seasons = {
        active: (db2) => Object.values(db2.seasons || {}).find((season) => !season.end_date) || null,
        list: (db2) => Object.values(db2.seasons || {}).sort((a, b) => b.start_date.localeCompare(a.start_date)),
        normalizeActiveSeasons: (rawSeasons) => validate.sanitizeSeasons(rawSeasons),
        prepareCreate: (db2, input) => {
          const start = validate.date(input.start_date);
          if (!start) throw new Error("La fecha de inicio es obligatoria y v\xE1lida");
          const current = seasons.active(db2);
          const seasonId = utils.uuid();
          const season = validate.sanitizeSeasons({ [seasonId]: { ...input, season_id: seasonId, start_date: start, end_date: null, created_at: utils.isoNow(), modified_at: utils.isoNow() } })[seasonId];
          if (!season) throw new Error("Temporada inv\xE1lida");
          let proposedCloseDate = null;
          if (current) {
            const closeDate = /* @__PURE__ */ new Date(`${start}T12:00:00`);
            closeDate.setDate(closeDate.getDate() - 1);
            proposedCloseDate = `${closeDate.getFullYear()}-${String(closeDate.getMonth() + 1).padStart(2, "0")}-${String(closeDate.getDate()).padStart(2, "0")}`;
            if (proposedCloseDate < current.start_date) throw new Error("La nueva temporada debe comenzar despu\xE9s de la activa");
          }
          return { season, activeSeason: current, proposedCloseDate, requiresConfirmation: Boolean(current) };
        },
        applyCreate: (db2, prepared) => {
          if (!prepared?.season) throw new Error("Creaci\xF3n de temporada inv\xE1lida");
          db2.seasons = db2.seasons || {};
          if (prepared.activeSeason) {
            const active = db2.seasons[prepared.activeSeason.season_id];
            if (!active || active.end_date || prepared.proposedCloseDate < active.start_date) throw new Error("La temporada activa cambi\xF3; revisa la creaci\xF3n");
            active.end_date = prepared.proposedCloseDate;
            active.modified_at = utils.isoNow();
          }
          db2.seasons[prepared.season.season_id] = prepared.season;
          db2.seasons = seasons.normalizeActiveSeasons(db2.seasons);
          return prepared.season;
        },
        create: (db2, input) => {
          const prepared = seasons.prepareCreate(db2, input);
          if (prepared.requiresConfirmation) throw new Error("Confirma el cierre de la temporada activa antes de crear otra");
          return seasons.applyCreate(db2, prepared);
        },
        close: (db2, seasonId, endDate) => {
          const season = db2.seasons?.[seasonId];
          const end = validate.date(endDate);
          if (!season || !end || end < season.start_date) throw new Error("Fecha de cierre inv\xE1lida");
          season.end_date = end;
          season.modified_at = utils.isoNow();
          return season;
        },
        update: (db2, seasonId, input) => {
          const season = db2.seasons?.[seasonId];
          if (!season) throw new Error("Temporada no encontrada");
          const candidate = validate.sanitizeSeasons({ [seasonId]: { ...season, ...input, season_id: seasonId, modified_at: utils.isoNow() } })[seasonId];
          if (!candidate) throw new Error("Temporada inv\xE1lida");
          if (!candidate.end_date && Object.values(db2.seasons || {}).some((item) => item.season_id !== seasonId && !item.end_date)) throw new Error("Ya existe una temporada activa");
          db2.seasons[seasonId] = candidate;
          return candidate;
        },
        remove: (db2, seasonId) => {
          if (db2.seasons) delete db2.seasons[seasonId];
        },
        summary: (db2, seasonId) => {
          const season = db2.seasons?.[seasonId];
          if (!season) return null;
          const bounds = analytics.periodBounds(`season:${seasonId}`, db2.seasons);
          return {
            season,
            summary: analytics.summarize(db2, null, bounds),
            exercises: season.priority_exercise_keys.map((key) => {
              const current = analytics.summarize(db2, key, bounds);
              const previous = seasons.list(db2).filter((item) => item.end_date && item.end_date < season.start_date && item.priority_exercise_keys.includes(key)).at(0);
              const previousMetrics = previous ? analytics.summarize(db2, key, analytics.periodBounds(`season:${previous.season_id}`, db2.seasons)) : null;
              return { exercise_key: key, metrics: current, previous: previousMetrics ? { season_id: previous.season_id, first_e1rm: previousMetrics.first_e1rm, last_e1rm: previousMetrics.last_e1rm, best_e1rm: previousMetrics.best_e1rm, best_date: previousMetrics.best_date, change: previousMetrics.change, change_percent: previousMetrics.change_percent, tonnage: previousMetrics.tonnage, reps: previousMetrics.reps, hard_sets: previousMetrics.hard_sets, completed_sessions: previousMetrics.completed_sessions, planned_sessions: previousMetrics.planned_sessions, adherence: previousMetrics.adherence } : null };
            })
          };
        }
      };
    }
  });

  // www/js/logic.js
  async function getLogicDeps() {
    if (!logicModule) {
      const data = await Promise.resolve().then(() => (init_data(), data_exports));
      logicModule = {
        getDb: data.getDb,
        setDb: data.setDb,
        getState: data.getState,
        setState: data.setState
      };
    }
    return logicModule;
  }
  var logicModule, logic;
  var init_logic = __esm({
    "www/js/logic.js"() {
      init_utils();
      init_validate();
      init_config();
      init_backup();
      logicModule = null;
      logic = {
        createManualWeek: async () => {
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const db2 = getDb2();
          const weekNum = Object.keys(db2.weeks).length + 1;
          const weekId = utils.uuid();
          const newWeek = {
            week: { week_id: weekId, week_number: weekNum, source: "Manual", modified_at: utils.isoNow() },
            sessions: [],
            generated_at: utils.isoNow()
          };
          db2.weeks[weekId] = newWeek;
          utils.save(db2, backup.auto);
          const { setDb: sd } = await getLogicDeps();
          sd(db2);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 Semana creada");
          const { getState: getState2, setState: setState2 } = await getLogicDeps();
          const state2 = getState2();
          setState2({ ...state2, activeWeekId: weekId });
          const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
          actions2.openWeek(weekId);
        },
        addSessionToWeek: async (weekId) => {
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const db2 = getDb2();
          const week = db2.weeks[weekId];
          if (!week) return;
          const nextSessionNum = week.sessions.length + 1;
          const sessionId = `D\xEDa ${nextSessionNum}`;
          const newSession = {
            session_id: sessionId,
            title: "Nueva Sesi\xF3n Ad-Hoc",
            goal_summary: "Sesi\xF3n a\xF1adida manualmente",
            estimated_duration_min: 45,
            session_completion: { status: "pending", started_at: null, completed_at: null },
            scheduled_date: null,
            session_notes: "",
            exercises: [],
            modified_at: utils.isoNow()
          };
          week.sessions.push(newSession);
          week.modified_at = utils.isoNow();
          utils.save(db2, backup.auto);
          setDb2(db2);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 Sesi\xF3n a\xF1adida");
          ui2.render();
        },
        createWeekFromImport: async (cleanWeekObj, actions2) => {
          const weekId = cleanWeekObj.week.week_id;
          const { mergeEngine: mergeEngine2 } = await Promise.resolve().then(() => (init_merge(), merge_exports));
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          await mergeEngine2.startDataMerge({
            weeks: { [weekId]: cleanWeekObj }
          }, actions2, (msg) => ui2.toast(msg));
          return weekId;
        },
        getWeek: async (id) => {
          const { getDb: getDb2 } = await getLogicDeps();
          const db2 = getDb2();
          return db2.weeks[id];
        },
        getSession: async (wId, sId) => {
          const { getDb: getDb2 } = await getLogicDeps();
          const db2 = getDb2();
          return db2.weeks[wId]?.sessions.find((s) => s.session_id === sId);
        },
        getExercise: async (wId, sId, exId) => {
          const session = await logic.getSession(wId, sId);
          return session?.exercises.find((e) => e.exercise_id === exId);
        },
        getResolvedPlan: (ex) => {
          if (!ex) return [];
          if (ex.override) {
            const sets = [];
            for (let i = 0; i < ex.override.planned_sets; i++) {
              sets.push({ set_index: i, reps: ex.override.planned_reps, load: ex.override.planned_load, unit: "kg", source: "override" });
            }
            return sets;
          }
          if (ex.baseline && ex.baseline.set_plan && Array.isArray(ex.baseline.set_plan)) {
            return ex.baseline.set_plan.map((s) => ({ ...s, source: "baseline" }));
          }
          if (ex.baseline && ex.baseline.planned_sets) {
            const sets = [];
            for (let i = 0; i < ex.baseline.planned_sets; i++) {
              sets.push({ set_index: i, reps: ex.baseline.planned_reps, load: ex.baseline.planned_load, unit: "kg", source: "baseline_flat" });
            }
            return sets;
          }
          return [];
        },
        startSession: async (wId, sId) => {
          const s = await logic.getSession(wId, sId);
          if (s && s.session_completion.status === "pending") {
            s.session_completion.status = "in_progress";
            s.session_completion.started_at = utils.isoNow();
            s.modified_at = utils.isoNow();
            const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
            const db2 = getDb2();
            utils.save(db2, backup.auto);
            setDb2(db2);
            await wakeLock.request();
          }
        },
        finishSession: async (wId, sId) => {
          const s = await logic.getSession(wId, sId);
          if (!s) return null;
          s.session_completion.status = "completed";
          s.session_completion.completed_at = utils.isoNow();
          s.modified_at = utils.isoNow();
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const db2 = getDb2();
          utils.save(db2, backup.auto);
          setDb2(db2);
          await wakeLock.release();
          return logic.generateReport(wId, sId);
        },
        updateSet: async (wId, sId, exId, setIndex, data) => {
          const ex = await logic.getExercise(wId, sId, exId);
          if (!ex) return;
          while (ex.execution.sets.length <= setIndex) {
            ex.execution.sets.push({ reps: null, load: null, rir: null, rir_is_open_ended: false, notes: "" });
          }
          const set = ex.execution.sets[setIndex];
          if (data.reps !== void 0) set.reps = data.reps !== null && data.reps !== "" ? parseFloat(data.reps) : null;
          if (data.load !== void 0) set.load = data.load !== null && data.load !== "" ? parseFloat(data.load) : null;
          if (data.rir !== void 0) {
            const rir = data.rir === null || data.rir === "" ? null : Number(data.rir);
            if (rir !== null && (!Number.isInteger(rir) || rir < 0 || rir > 4)) throw new Error("RIR inv\xE1lido");
            set.rir = rir;
            set.rir_is_open_ended = rir === 4 && Boolean(data.rir_is_open_ended);
          } else if (data.rir_is_open_ended !== void 0) {
            set.rir_is_open_ended = set.rir === 4 && Boolean(data.rir_is_open_ended);
          }
          if (data.notes !== void 0) set.notes = validate.string(data.notes, 500);
          set.completed_at = utils.isoNow();
          ex.modified_at = utils.isoNow();
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const db2 = getDb2();
          utils.save(db2, backup.auto);
          setDb2(db2);
        },
        updateExerciseNote: async (wId, sId, exId, text) => {
          const ex = await logic.getExercise(wId, sId, exId);
          if (!ex) return;
          ex.notes = validate.string(text, 2e3);
          ex.modified_at = utils.isoNow();
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const db2 = getDb2();
          utils.save(db2, backup.auto);
          setDb2(db2);
        },
        updateSessionNote: async (wId, sId, text) => {
          const s = await logic.getSession(wId, sId);
          if (!s) return;
          s.session_notes = validate.string(text, 2e3);
          s.modified_at = utils.isoNow();
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const db2 = getDb2();
          utils.save(db2, backup.auto);
          setDb2(db2);
        },
        updateScheduledDate: async (wId, sId, date) => {
          const session = await logic.getSession(wId, sId);
          const cleanDate = validate.date(date);
          if (!session || !cleanDate) throw new Error("Fecha programada inv\xE1lida");
          session.scheduled_date = cleanDate;
          session.modified_at = utils.isoNow();
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const db2 = getDb2();
          utils.save(db2, backup.auto);
          setDb2(db2);
        },
        addSet: async (wId, sId, exId) => {
          const ex = await logic.getExercise(wId, sId, exId);
          if (!ex) return;
          ex.execution.sets.push({ reps: 0, load: 0, rir: null, rir_is_open_ended: false, notes: "", is_extra: true, completed_at: utils.isoNow() });
          ex.modified_at = utils.isoNow();
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const db2 = getDb2();
          utils.save(db2, backup.auto);
          setDb2(db2);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        applyFlatOverride: async (wId, sId, exId, sets, reps, load) => {
          try {
            const ex = await logic.getExercise(wId, sId, exId);
            if (!ex) return;
            const validSets = validate.number(sets, 1, 50, "Sets");
            const validReps = validate.number(reps, 1, 200, "Reps");
            const validLoad = validate.number(load, 0, 2e3, "Carga");
            ex.override = { planned_sets: validSets, planned_reps: validReps, planned_load: validLoad };
            ex.modified_at = utils.isoNow();
            const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
            const db2 = getDb2();
            utils.save(db2, backup.auto);
            setDb2(db2);
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast("\u2713 Plan actualizado");
            ui2.render();
          } catch (e) {
            console.warn("Error al aplicar override:", e);
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast(`\u26A0\uFE0F ${e.message}`);
          }
        },
        toggleComplete: async (wId, sId, exId) => {
          const ex = await logic.getExercise(wId, sId, exId);
          if (!ex) return;
          ex.completion.status = ex.completion.status === "completed" ? "pending" : "completed";
          ex.completion.completed_at = ex.completion.status === "completed" ? utils.isoNow() : null;
          ex.modified_at = utils.isoNow();
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const db2 = getDb2();
          utils.save(db2, backup.auto);
          setDb2(db2);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        addNewExerciseToSession: async (wId, sId) => {
          const name = prompt("Nombre del nuevo ejercicio:");
          if (!name || name.trim() === "") return;
          const s = await logic.getSession(wId, sId);
          if (!s) return;
          const newEx = {
            exercise_id: utils.uuid(),
            name: validate.string(name, 100),
            machine_name: "Ad-hoc",
            equipment_csv_name: "",
            recommendations: "",
            baseline: { planned_sets: 3, planned_reps: 10, planned_load: 10 },
            override: null,
            execution: { sets: [] },
            completion: { status: "pending", completed_at: null },
            notes: "",
            modified_at: utils.isoNow()
          };
          s.exercises.push(newEx);
          s.modified_at = utils.isoNow();
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const db2 = getDb2();
          utils.save(db2, backup.auto);
          setDb2(db2);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
          ui2.toast("\u2713 Ejercicio a\xF1adido");
        },
        generateReport: async (wId, sId) => {
          const w = await logic.getWeek(wId);
          const s = await logic.getSession(wId, sId);
          return {
            schema_version: "2.0",
            week_ref: w ? w.week : null,
            session_result: s,
            export_meta: { date: utils.isoNow() }
          };
        },
        deleteWeek: async (id) => {
          const w = await logic.getWeek(id);
          if (!w) return;
          const hasCompleted = w.sessions.some((s) => s.session_completion.status === "completed");
          if (hasCompleted) {
            if (!confirm(`\u26A0\uFE0F La semana ${w.week.week_number} tiene sesiones completadas.

\xBFBorrar?`)) return;
          }
          if (confirm(`\xBFBorrar semana ${w.week.week_number}?`)) {
            const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
            const db2 = getDb2();
            delete db2.weeks[id];
            utils.save(db2, backup.auto);
            setDb2(db2);
            const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
            actions2.goHome();
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast("\u2713 Semana eliminada");
          }
        },
        getNextExercise: async (wId, sId, currentExId) => {
          const s = await logic.getSession(wId, sId);
          if (!s) return null;
          const currentIdx = s.exercises.findIndex((e) => e.exercise_id === currentExId);
          if (currentIdx === -1 || currentIdx === s.exercises.length - 1) return null;
          return s.exercises[currentIdx + 1];
        },
        createSeason: async (input) => {
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const { seasons: seasons2 } = await Promise.resolve().then(() => (init_seasons(), seasons_exports));
          const db2 = getDb2();
          const season = seasons2.create(db2, input);
          utils.save(db2, backup.auto);
          setDb2(db2);
          return season;
        },
        prepareSeasonCreate: async (input) => {
          const { getDb: getDb2 } = await getLogicDeps();
          const { seasons: seasons2 } = await Promise.resolve().then(() => (init_seasons(), seasons_exports));
          return seasons2.prepareCreate(getDb2(), input);
        },
        applySeasonCreate: async (prepared) => {
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const { seasons: seasons2 } = await Promise.resolve().then(() => (init_seasons(), seasons_exports));
          const db2 = getDb2();
          const season = seasons2.applyCreate(db2, prepared);
          utils.save(db2, backup.auto);
          setDb2(db2);
          return season;
        },
        closeSeason: async (seasonId, endDate) => {
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const { seasons: seasons2 } = await Promise.resolve().then(() => (init_seasons(), seasons_exports));
          const db2 = getDb2();
          const season = seasons2.close(db2, seasonId, endDate);
          utils.save(db2, backup.auto);
          setDb2(db2);
          return season;
        },
        updateSeason: async (seasonId, input) => {
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const { seasons: seasons2 } = await Promise.resolve().then(() => (init_seasons(), seasons_exports));
          const db2 = getDb2();
          const season = seasons2.update(db2, seasonId, input);
          utils.save(db2, backup.auto);
          setDb2(db2);
          return season;
        },
        deleteSeason: async (seasonId) => {
          const { getDb: getDb2, setDb: setDb2 } = await getLogicDeps();
          const { seasons: seasons2 } = await Promise.resolve().then(() => (init_seasons(), seasons_exports));
          const db2 = getDb2();
          seasons2.remove(db2, seasonId);
          utils.save(db2, backup.auto);
          setDb2(db2);
        }
      };
    }
  });

  // www/js/ui.js
  var ui_exports = {};
  __export(ui_exports, {
    ui: () => ui
  });
  async function getUiDeps() {
    if (!uiModule) {
      const data = await Promise.resolve().then(() => (init_data(), data_exports));
      uiModule = {
        getDb: data.getDb,
        setDb: data.setDb,
        getState: data.getState,
        setState: data.setState
      };
    }
    return uiModule;
  }
  var uiModule, ui;
  var init_ui = __esm({
    "www/js/ui.js"() {
      init_utils();
      init_logic();
      init_analytics();
      uiModule = null;
      ui = {
        app: document.getElementById("app"),
        toast: (msg) => {
          const t = document.getElementById("toast");
          t.innerText = msg;
          t.classList.add("show");
          setTimeout(() => t.classList.remove("show"), 3e3);
        },
        getThemeIcon: () => document.body.className === "dark" ? "\u2600\uFE0F" : "\u{1F319}",
        render: async () => {
          const { getState: getState2 } = await getUiDeps();
          const state2 = getState2();
          ui.app.innerHTML = "";
          if (state2.setModal) {
            await ui.renderSetModal();
            return;
          }
          if (state2.modal) {
            await ui.renderModal();
            return;
          }
          switch (state2.view) {
            case "home":
              await ui.renderHome();
              break;
            case "planes":
              await ui.renderPlanes();
              break;
            case "week":
              await ui.renderWeek();
              break;
            case "session":
              await ui.renderSession();
              break;
            case "exercise":
              await ui.renderExercise();
              break;
            case "history":
              await ui.renderHistory();
              break;
            case "exercise_history":
              await ui.renderExerciseHistory();
              break;
            case "analytics":
              await ui.renderAnalytics();
              break;
            default:
              await ui.renderHome();
          }
        },
        renderHome: async () => {
          ui.app.innerHTML = `
            <header>
                <h1>Strength Tracker</h1>
                <div class="flex gap-s">
                    <button type="button" class="icon-btn ghost" data-action="openHelp" title="Ayuda" aria-label="Abrir ayuda" style="color: var(--danger); font-size: 1.35rem; font-weight: 800;">?</button>
                    <button type="button" class="icon-btn ghost" data-action="toggleTheme" title="Cambiar tema" aria-label="Cambiar tema" style="font-size: 1.35rem;">${ui.getThemeIcon()}</button>
                </div>
            </header>
            <div class="container">
                <button type="button" class="nav-tile active" data-action="openPlanes" aria-label="Abrir Mis Planes">
                    <div class="nav-tile-icon" aria-hidden="true">\u{1F4DD}</div>
                    <div class="nav-tile-body">
                        <div class="nav-tile-title">Mis Planes</div>
                        <div class="nav-tile-desc">Gestiona tus semanas y entrenamientos</div>
                    </div>
                </button>

                <button type="button" class="nav-tile" data-action="openHistory" aria-label="Abrir Historial de Ejercicios">
                    <div class="nav-tile-icon" aria-hidden="true">\u{1F4CA}</div>
                    <div class="nav-tile-body">
                        <div class="nav-tile-title">Historial de Ejercicios</div>
                        <div class="nav-tile-desc">Consulta tu progreso y r\xE9cords (1RM)</div>
                    </div>
                </button>

                <button type="button" class="nav-tile" data-action="openAnalytics" aria-label="Abrir An\xE1lisis de Esfuerzo">
                    <div class="nav-tile-icon" aria-hidden="true">\u{1F4C8}</div>
                    <div class="nav-tile-body">
                        <div class="nav-tile-title">An\xE1lisis de Esfuerzo</div>
                        <div class="nav-tile-desc">M\xE9tricas de volumen, RPE y carga</div>
                    </div>
                </button>

                <div class="config-divider" role="separator" aria-label="Configuraci\xF3n">Configuraci\xF3n</div>

                <div class="settings-grid">
                    <button type="button" class="setting-tile" data-action="openBackups" aria-label="Abrir Backups">
                        <div class="setting-tile-icon" aria-hidden="true">\u{1F4BE}</div>
                        <div class="setting-tile-title">Backups</div>
                    </button>
                    <button type="button" class="setting-tile" data-action="openImport" aria-label="Importar Plan">
                        <div class="setting-tile-icon" aria-hidden="true">\u{1F4E5}</div>
                        <div class="setting-tile-title">Importar</div>
                    </button>
                </div>
            </div>
            <button type="button" class="fab" data-action="createManualWeek" aria-label="Crear nueva semana vac\xEDa" title="Crear semana">\uFF0B</button>
        `;
        },
        renderPlanes: async () => {
          const { getDb: getDb2 } = await getUiDeps();
          const db2 = getDb2();
          const weeks = Object.values(db2.weeks).sort((a, b) => b.week.week_number - a.week.week_number);
          ui.app.innerHTML = `
            <header>
                <button type="button" class="ghost" data-action="goHome" aria-label="Volver al inicio">\u2190 Volver</button>
                <h3>Mis Planes</h3>
                <div class="flex gap-s">
                    <button type="button" class="icon-btn ghost" data-action="toggleTheme" aria-label="Cambiar tema">${ui.getThemeIcon()}</button>
                </div>
            </header>
            <div class="container">
                <div class="flex justify-between align-center mb-m">
                    <span class="text-small text-muted">${weeks.length} ${weeks.length === 1 ? "semana registrada" : "semanas registradas"}</span>
                    <button type="button" class="primary small" data-action="createManualWeek" aria-label="Crear nueva semana">+ Nueva Semana</button>
                </div>
                <div class="flex-col gap-m">
                    ${weeks.length === 0 ? '<div class="card text-center text-muted" style="padding: 36px 16px;">No hay planes todav\xEDa.<br><span class="text-small mt-s display-block">Pulsa "+ Nueva Semana" o importa un archivo JSON.</span></div>' : ""}
                    ${weeks.map((w) => {
            const allDone = w.sessions.length > 0 && w.sessions.every((s) => s.session_completion.status === "completed");
            return `
                        <div class="card ${allDone ? "active" : ""}" data-action="openWeek" data-week-id="${utils.esc(w.week.week_id)}" role="button" tabindex="0" aria-label="Abrir semana ${utils.esc(w.week.week_number)}" style="cursor: pointer;">
                            <div class="flex justify-between align-center mb-s">
                                <h3>Semana ${utils.esc(w.week.week_number)}</h3>
                                <span class="badge ${allDone ? "completed" : ""}">${utils.esc(w.week.source || "Manual")}</span>
                            </div>
                            <p class="text-small">${utils.esc(w.week.notes || "Sin notas")}</p>
                            <div class="text-small text-muted mt-s">
                                ${w.sessions.length} ${w.sessions.length === 1 ? "sesi\xF3n" : "sesiones"}
                            </div>
                        </div>`;
          }).join("")}
                </div>
            </div>
            <button type="button" class="fab" data-action="createManualWeek" aria-label="Crear nueva semana vac\xEDa" title="Crear semana">\uFF0B</button>
        `;
        },
        renderWeek: async () => {
          const { getState: getState2 } = await getUiDeps();
          const state2 = getState2();
          const w = await logic.getWeek(state2.activeWeekId);
          if (!w) {
            const { actions: actions3 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
            actions3.goHome();
            return;
          }
          const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
          ui.app.innerHTML = `
            <header>
                <button type="button" class="ghost" data-action="goHome">\u2190 Volver</button>
                <h3>S ${utils.esc(w.week.week_number)}</h3>
                <div class="flex gap-s">
                    <button type="button" class="icon-btn ghost" data-action="toggleTheme">${ui.getThemeIcon()}</button>
                    <button class="secondary small" data-action="exportWeek">JSON</button>
                </div>
            </header>
            <div class="container">
                <div class="flex justify-between mb-m">
                    <span class="text-small text-muted">ID: ${utils.esc(String(w.week.week_id).slice(0, 8))}...</span>
                    <button class="danger small" data-action="deleteWeek" data-week-id="${utils.esc(w.week.week_id)}">Borrar</button>
                </div>
                ${w.sessions.length === 0 ? '<div class="card text-center text-muted">Semana vac\xEDa</div>' : ""}
                ${w.sessions.map((s) => {
            const st = s.session_completion.status;
            return `
                    <div class="card ${st === "in_progress" ? "active" : ""}">
                        <div class="flex justify-between mb-m">
                            <h3>${utils.esc(s.session_id)} \u2022 ${utils.esc(s.title || "Entreno")}</h3>
                            <span class="badge ${st}">${utils.esc(st.replace("_", " "))}</span>
                        </div>
                        <p class="text-small note-text mb-m">${utils.esc(s.goal_summary || "")}</p>
                        <button class="primary w-full" data-action="openSession" data-session-id="${utils.esc(s.session_id)}">
                            ${st === "completed" ? "Ver Resultados" : "Abrir Sesi\xF3n"}
                        </button>
                    </div>`;
          }).join("")}
                <button class="secondary w-full mt-m" data-action="addSessionToWeek" data-week-id="${utils.esc(w.week.week_id)}">
                    + A\xF1adir D\xEDa (Ad-hoc)
                </button>
            </div>
        `;
        },
        renderSession: async () => {
          const { getState: getState2 } = await getUiDeps();
          const state2 = getState2();
          const wId = state2.activeWeekId;
          const sId = state2.activeSessionId;
          const s = await logic.getSession(wId, sId);
          if (!s) {
            const { actions: actions3 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
            actions3.openWeek(wId);
            return;
          }
          const locked = s.session_completion.status === "completed";
          const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
          ui.app.innerHTML = `
            <header>
                <button class="ghost" data-action="openWeek" data-week-id="${utils.esc(wId)}">\u2190 Semana</button>
                <h3>Sesi\xF3n ${utils.esc(sId)}</h3>
                <button type="button" class="icon-btn ghost" data-action="toggleTheme">${ui.getThemeIcon()}</button>
            </header>
            <div class="container">
                <div class="mb-m">
                    <h2>${utils.esc(s.title || "Sin T\xEDtulo")}</h2>
                    <p class="text-small text-muted">Duraci\xF3n: ~${utils.esc(s.estimated_duration_min || "?")} min</p>
                    <label class="text-small text-muted display-block">Fecha programada
                        <input type="date" value="${utils.esc(s.scheduled_date || "")}" data-change-action="updateScheduledDate">
                    </label>
                </div>
                ${s.exercises.map((ex) => {
            const plan = logic.getResolvedPlan(ex);
            const setsDone = ex.execution.sets.filter((x) => x.reps > 0).length;
            const totalSets = plan.length;
            const done = ex.completion.status === "completed";
            return `
                    <div class="card" style="border-left: 4px solid ${done ? "var(--accent)" : "transparent"}">
                        <div class="flex justify-between">
                            <h3 style="${done ? "opacity:0.6" : ""}">${utils.esc(ex.name)}</h3>
                            ${ex.target_1rm ? `<span class="badge">1RM: ${utils.esc(ex.target_1rm.value)}</span>` : ""}
                        </div>
                        <div class="text-small text-muted mt-m mb-m">
                            ${utils.esc(ex.equipment_csv_name || ex.machine_name || "General")}
                        </div>
                        <div class="flex justify-between align-center">
                            <span class="text-small font-bold">${setsDone} / ${totalSets} Sets</span>
                            <button class="primary small" data-action="openExercise" data-exercise-id="${utils.esc(ex.exercise_id)}">
                                ${done ? "Revisar" : "Entrenar"}
                            </button>
                        </div>
                    </div>`;
          }).join("")}
                ${!locked ? `
                    <button class="secondary w-full mb-m" data-action="addNewExerciseToSession" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}">
                        + A\xF1adir Ejercicio Extra
                    </button>
                ` : ""}
                ${!locked ? `
                    <div class="card">
                        <label class="text-small text-muted mb-m display-block">Notas de la sesi\xF3n</label>
                        <textarea rows="3" placeholder="C\xF3mo te sentiste..."
                            data-change-action="updateSessionNote" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}">${utils.esc(s.session_notes || "")}</textarea>
                    </div>
                ` : s.session_notes ? `
                    <div class="card">
                        <label class="text-small text-muted mb-m display-block">Notas de la sesi\xF3n</label>
                        <p class="text-small note-text">${utils.esc(s.session_notes)}</p>
                    </div>
                ` : ""}
                <div class="mt-m pt-m" style="border-top:1px solid var(--border)">
                    ${locked ? `<button type="button" class="secondary w-full" data-action="viewReport">Ver Reporte JSON</button>` : `<button type="button" class="primary w-full" data-action="finishSession">Finalizar Sesi\xF3n</button>`}
                </div>
            </div>
        `;
        },
        renderExercise: async () => {
          const { getState: getState2 } = await getUiDeps();
          const state2 = getState2();
          const wId = state2.activeWeekId;
          const sId = state2.activeSessionId;
          const exId = state2.activeExerciseId;
          const ex = await logic.getExercise(wId, sId, exId);
          const session = await logic.getSession(wId, sId);
          if (!ex || !session) {
            const { actions: actions3 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
            actions3.openSession(sId);
            return;
          }
          const locked = session.session_completion.status === "completed";
          const planArr = logic.getResolvedPlan(ex);
          const execArr = ex.execution.sets;
          const totalRows = Math.max(planArr.length, execArr.length);
          const lastPlan = planArr.length > 0 ? planArr[planArr.length - 1] : { reps: 10, load: 20 };
          const nextEx = await logic.getNextExercise(wId, sId, exId);
          const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
          ui.app.innerHTML = `
            <header>
                <button class="ghost" data-action="openSession" data-session-id="${utils.esc(sId)}">\u2190 Volver</button>
                <button class="${ex.completion.status === "completed" ? "secondary" : "ghost"}" data-action="toggleComplete" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}">
                    ${ex.completion.status === "completed" ? "\u2714 Hecho" : "Marcar Fin"}
                </button>
            </header>
            <div class="container">
                <div class="flex justify-between align-center mb-m">
                    <h2>${utils.esc(ex.name)}</h2>
                    <button class="secondary small" data-action="openExerciseHistory" data-ex-key="${utils.esc(analytics.exerciseKey(ex))}">
                        \u{1F4CA} Historial
                    </button>
                </div>
                ${ex.recommendations ? `<p class="text-small note-text card mb-m" style="background: var(--bg-input); padding: 12px;">${utils.esc(ex.recommendations)}</p>` : ""}
                ${!locked ? `
                <details class="mb-m">
                    <summary class="text-small text-muted" style="cursor:pointer; padding: 10px 0;">\u2699\uFE0F Ajustar Plan</summary>
                    <div class="card mt-m">
                        <div class="flex gap-s">
                            <input id="ov_sets" type="number" inputmode="numeric" placeholder="Sets" value="${utils.esc(planArr.length)}">
                            <input id="ov_reps" type="number" inputmode="numeric" placeholder="Reps" value="${utils.esc(lastPlan.reps)}">
                            <input id="ov_load" type="number" inputmode="decimal" placeholder="Kg" value="${utils.esc(lastPlan.load)}" step="0.5">
                        </div>
                        <button type="button" class="primary w-full mt-m" data-action="applyFlatOverride" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}">Aplicar Nuevo Plan</button>
                    </div>
                </details>` : ""}
                
                <div class="card">
                    <div class="set-row header">
                        <div class="text-center">#</div>
                        <div class="text-center" style="border-right:1px solid var(--border)">Plan</div>
                        <div class="text-center">Real (Reps/Kg)</div>
                        <div class="text-center"></div>
                    </div>
                    ${Array.from({ length: totalRows }).map((_, i) => {
            const p = planArr[i] || { reps: "-", load: "-", unit: "" };
            const e = execArr[i] || { reps: null, load: null };
            const showReps = e.reps !== null && e.reps !== "" ? e.reps : p.reps !== "-" ? p.reps : "";
            const showLoad = e.load !== null && e.load !== "" ? e.load : p.load !== "-" ? p.load : "";
            const isDone = e.reps !== null;
            return `
                        <div class="set-row">
                            <div class="text-center font-bold text-muted">${i + 1}</div>
                            <div class="plan-col">
                                <span style="font-size:1.1rem; font-weight:700">${utils.esc(p.reps)}</span>
                                <span class="text-small text-muted">${utils.esc(p.load)}</span>
                            </div>
                            <div class="flex gap-s">
                                <input type="number" inputmode="numeric" id="reps_${i}" class="stat-input" placeholder="Reps"
                                    value="${utils.esc(showReps)}" ${locked ? "disabled" : ""}
                                    data-change-action="updateSetReps" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}" data-set-idx="${i}">
                                <input type="number" inputmode="decimal" step="0.5" id="load_${i}" class="stat-input" placeholder="Kg"
                                    value="${utils.esc(showLoad)}" ${locked ? "disabled" : ""}
                                    data-change-action="updateSetLoad" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}" data-set-idx="${i}">
                            </div>
                            <div class="flex justify-center">
                                <button class="icon-btn check-btn ${isDone ? "done" : ""}" 
                                    data-action="openSetModal" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}" data-set-idx="${i}">
                                    ${isDone ? "\u2714" : "\u25CB"}
                                </button>
                            </div>
                        </div>`;
          }).join("")}
                    ${!locked ? `<button class="ghost w-full mt-m" data-action="addSet" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}">+ Set Extra</button>` : ""}
                </div>
                
                <div class="card">
                    <label class="text-small text-muted mb-m display-block">Notas del Ejercicio</label>
                    <textarea rows="3" placeholder="Sensaciones, ajustes..." ${locked ? "disabled" : ""}
                        data-change-action="updateExerciseNote" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}">${utils.esc(ex.notes || "")}</textarea>
                </div>
                
                ${!locked && nextEx ? `
                    <button class="primary w-full mt-m" data-action="openExercise" data-exercise-id="${utils.esc(nextEx.exercise_id)}">
                        Siguiente: ${utils.esc(nextEx.name)} \u2192
                    </button>
                ` : ""}
                ${!locked && !nextEx ? `
                    <button class="secondary w-full mt-m" data-action="openSession" data-session-id="${utils.esc(sId)}">
                        \u2190 Volver a Sesi\xF3n
                    </button>
                ` : ""}
            </div>
        `;
        },
        renderAnalytics: async () => {
          const { getDb: getDb2, getState: getState2 } = await getUiDeps();
          const db2 = getDb2();
          const state2 = getState2();
          const variants = analytics.getVariants(db2);
          const selected = state2.analyticsExerciseKey || variants[0]?.exercise_key || null;
          const bounds = analytics.periodBounds(state2.analyticsPeriod, db2.seasons);
          const metrics = analytics.summarize(db2, selected, bounds);
          const activeSeason = Object.values(db2.seasons || {}).find((season) => !season.end_date);
          const display = (value, suffix = "") => value === null || value === void 0 ? "\u2014" : `${value}${suffix}`;
          const periods = [["active_season", "Temporada", !activeSeason], ["last_30_days", "\xDAltimo mes"], ["last_3_months", "3 meses"], ["last_6_months", "6 meses"], ["last_year", "1 a\xF1o"], ["all_time", "Toda la vida"], ...Object.values(db2.seasons || {}).filter((season) => season.end_date).sort((a, b) => b.start_date.localeCompare(a.start_date)).map((season) => [`season:${season.season_id}`, season.name])];
          const performance = analytics.movingTrend(metrics.exposures);
          const values = performance.map((item) => item.adjusted_e1rm);
          const y = (value) => 90 - (value - Math.min(...values)) / (Math.max(...values) - Math.min(...values) || 1) * 70;
          const x = (index) => performance.length === 1 ? 150 : 10 + index * 280 / (performance.length - 1);
          const polyline = performance.length > 1 ? performance.map((item, index) => `${x(index)},${y(item.adjusted_e1rm)}`).join(" ") : "";
          const trendLine = performance.length > 1 ? performance.map((item, index) => `${x(index)},${y(item.trend)}`).join(" ") : "";
          const weekly = analytics.weeklyLoad(db2, selected, bounds);
          const intensity = analytics.intensityDistribution(db2, selected, bounds);
          const comparable = analytics.comparableRir(db2, selected, bounds);
          const maxLoad = Math.max(...weekly.map((item) => item.tonnage), 1);
          const selectedSeasonId = state2.analyticsPeriod?.startsWith("season:") ? state2.analyticsPeriod.slice(7) : null;
          const seasonReport = selectedSeasonId ? (await Promise.resolve().then(() => (init_seasons(), seasons_exports))).seasons.summary(db2, selectedSeasonId) : null;
          ui.app.innerHTML = `
            <header><button type="button" class="ghost" data-action="goHome">\u2190 Inicio</button><h3>An\xE1lisis de Esfuerzo</h3><button type="button" class="icon-btn ghost" data-action="toggleTheme">${ui.getThemeIcon()}</button></header>
            <main class="container analytics-view">
                <section class="card"><div class="flex justify-between align-center"><strong>${activeSeason ? utils.esc(activeSeason.name) : "Sin temporada activa"}</strong><div class="flex gap-s"><button type="button" class="secondary small" data-action="createSeason">${activeSeason ? "Nueva" : "Crear"} temporada</button>${activeSeason ? '<button type="button" class="ghost small" data-action="closeActiveSeason">Cerrar</button>' : ""}<button type="button" class="ghost small" data-action="manageSeasons">Gestionar</button></div></div>${activeSeason ? `<button type="button" class="ghost small mt-m" data-action="exportSeasonJSON" data-season-id="${utils.esc(activeSeason.season_id)}">Exportar resumen</button>` : ""}</section>
                <label class="text-small text-muted">Periodo<select data-change-action="selectAnalyticsPeriod">${periods.map(([id, label, disabled]) => `<option value="${utils.esc(id)}" ${disabled ? "disabled" : ""} ${id === state2.analyticsPeriod && !disabled ? "selected" : ""}>${utils.esc(label)}${disabled ? " (crea una temporada)" : ""}</option>`).join("")}</select></label>
                <label class="text-small text-muted">Variante<select data-change-action="selectAnalyticsVariant">${variants.length ? variants.map((item) => `<option value="${utils.esc(item.exercise_key)}" ${item.exercise_key === selected ? "selected" : ""}>${utils.esc(item.display_name)}${item.equipment_name !== "General" ? ` (${utils.esc(item.equipment_name)})` : ""}</option>`).join("") : "<option>Sin series completadas</option>"}</select></label>
                <section class="analytics-grid" aria-label="Resumen del periodo">
                    <article class="card"><span class="text-small text-muted">e1RM referencia</span><strong>${display(metrics.reference_e1rm, " kg")}</strong></article>
                    <article class="card"><span class="text-small text-muted">Cambio</span><strong>${display(metrics.change, " kg")}</strong></article>
                    <article class="card"><span class="text-small text-muted">Tonelaje</span><strong>${display(metrics.tonnage, " kg")}</strong></article>
                    <article class="card"><span class="text-small text-muted">Series duras / RIR</span><strong>${metrics.hard_sets} / ${display(metrics.average_rir)}</strong></article>
                    <article class="card"><span class="text-small text-muted">Adherencia</span><strong>${display(metrics.adherence, "%")}</strong><small>${metrics.completed_sessions}/${metrics.planned_sessions} sesiones</small></article>
                </section>
                <section class="card"><h3>Rendimiento</h3>${performance.length ? `<svg class="analytics-chart" viewBox="0 0 300 100" role="img" aria-label="Evoluci\xF3n por mejor e1RM de cada sesi\xF3n">${polyline ? `<polyline fill="none" stroke="var(--accent)" stroke-width="3" points="${polyline}"/>` : ""}${trendLine ? `<polyline fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="4" points="${trendLine}"/>` : ""}${performance.map((item, index) => `<circle cx="${x(index)}" cy="${y(item.adjusted_e1rm)}" r="4" fill="var(--accent)"><title>${utils.esc(`${item.date}: ${item.load} kg \xD7 ${item.reps}, RIR ${item.rir}, e1RM ${item.adjusted_e1rm} kg`)}</title></circle>`).join("")}</svg><div class="table-scroll"><table class="progress-table"><thead><tr><th>Fecha</th><th>Serie</th><th>e1RM</th><th>Tendencia</th></tr></thead><tbody>${performance.map((item) => `<tr><td>${utils.esc(item.date)}</td><td>${item.load} \xD7 ${item.reps} @${item.rir}</td><td>${item.adjusted_e1rm} kg</td><td>${item.consolidated ? `${item.trend} kg` : "En formaci\xF3n"}</td></tr>`).join("")}</tbody></table></div>` : '<p class="text-muted">A\xFAn no hay exposiciones de alta confianza.</p>'}<p class="text-small text-muted">Cada punto es la mejor serie v\xE1lida de una sesi\xF3n. La l\xEDnea discontinua es la media de las tres \xFAltimas exposiciones.</p></section>
                <section class="card"><h3>Volumen semanal</h3>${weekly.length ? `<div class="bar-chart" role="img" aria-label="Tonelaje y series duras por semana">${weekly.map((item) => `<div><div class="bar" style="height:${item.tonnage ? Math.max(3, item.tonnage / maxLoad * 100) : 0}px"></div><small>${utils.esc(item.week.slice(5))}</small></div>`).join("")}</div><div class="table-scroll"><table class="progress-table"><thead><tr><th>Semana</th><th>Tonelaje</th><th>Series duras</th><th>Reps</th></tr></thead><tbody>${weekly.map((item) => `<tr><td>${utils.esc(item.week)}</td><td>${item.tonnage} kg</td><td>${item.hard_sets}</td><td>${item.reps}</td></tr>`).join("")}</tbody></table></div>` : '<p class="text-muted">No hay volumen registrado en este periodo.</p>'}<p class="text-small text-muted">Las semanas sin carga conservan su espacio y se muestran con cero.</p></section>
                <section class="card"><h3>Distribuci\xF3n de intensidad</h3>${intensity.some((item) => item.reps) ? `<ul class="metric-list">${intensity.map((item) => `<li>${item.label}: <strong>${item.reps} reps</strong></li>`).join("")}</ul>` : '<p class="text-muted">No hay e1RM de referencia suficiente para clasificar intensidad.</p>'}</section>
                <section class="card"><h3>RIR a carga comparable</h3>${comparable ? `<p>${comparable.load} kg: RIR medio <strong>${comparable.average_rir}</strong> (${comparable.observations.length} series exactas)</p>` : '<p class="text-muted">A\xFAn no hay suficientes series comparables.</p>'}</section>
                ${seasonReport ? `<section class="card"><h3>Comparativa de temporada</h3><p class="text-small text-muted">${utils.esc(seasonReport.season.objective)} \xB7 ${utils.esc(seasonReport.season.start_date)} a ${utils.esc(seasonReport.season.end_date || "")}</p>${seasonReport.exercises.length ? `<ul class="metric-list">${seasonReport.exercises.map((item) => `<li><span>${utils.esc(item.exercise_key)}</span><span>${display(item.metrics.best_e1rm, " kg")} ${item.previous?.best_e1rm !== null && item.previous?.best_e1rm !== void 0 ? `vs ${item.previous.best_e1rm} kg` : ""}</span></li>`).join("")}</ul>` : '<p class="text-muted">Esta temporada no tiene variantes prioritarias.</p>'}</section>` : ""}
                <section class="card"><h3>Hist\xF3rico del periodo</h3>${metrics.observations.length ? `<div class="table-scroll"><table class="progress-table"><thead><tr><th>Fecha</th><th>Carga</th><th>RIR</th><th>e1RM</th><th>Confianza</th></tr></thead><tbody>${metrics.observations.map((item) => `<tr><td>${utils.esc(item.date)}</td><td>${item.load} \xD7 ${item.reps}</td><td>${item.rir_is_open_ended ? "4+" : item.rir ?? "\u2014"}</td><td>${display(item.adjusted_e1rm, " kg")}</td><td>${utils.esc(item.confidence)}</td></tr>`).join("")}</tbody></table></div>` : '<p class="text-muted">No hay series completadas para este periodo.</p>'}</section>
            </main>`;
        },
        renderHistory: async () => {
          const exercises = analytics.getAllExercises();
          const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
          ui.app.innerHTML = `
            <header>
                <button type="button" class="ghost" data-action="goHome">\u2190 Volver</button>
                <h3>Historial</h3>
                <button type="button" class="icon-btn ghost" data-action="toggleTheme">${ui.getThemeIcon()}</button>
            </header>
            <div class="container">
                <div class="flex justify-between align-center mb-m">
                    <h2 class="mb-m">Progreso</h2>
                    <button type="button" class="secondary small" data-action="exportAllRMs">\u{1F4E5} Exportar Todo</button>
                </div>
                ${exercises.length === 0 ? `
                    <div class="card text-center text-muted">
                        No hay datos de ejercicios completados.
                    </div>
                ` : ""}
                ${exercises.map((variant) => {
            const best1RM = analytics.getBest1RM(variant.exercise_key);
            const history = analytics.getExerciseHistory(variant.exercise_key);
            const lastSession = history[0];
            return `
                        <div class="card" data-action="openExerciseHistory" data-ex-key="${utils.esc(variant.exercise_key)}" role="button" tabindex="0">
                            <div class="flex justify-between align-center mb-m">
                                <h3>${utils.esc(variant.display_name)}${variant.equipment_name !== "General" ? ` (${utils.esc(variant.equipment_name)})` : ""}</h3>
                                ${best1RM ? `<span class="rm-badge">${utils.esc(best1RM)} kg</span>` : ""}
                            </div>
                            <div class="text-small text-muted">
                                ${lastSession ? `\xDAltimo: ${utils.formatDate(lastSession.date)} - ${utils.esc(lastSession.load)}kg \xD7 ${utils.esc(lastSession.reps)}` : "Sin datos"}
                            </div>
                            <div class="text-small text-muted mt-m">
                                ${history.length} ${history.length === 1 ? "serie" : "series"} registradas
                            </div>
                        </div>
                    `;
          }).join("")}
            </div>
        `;
        },
        renderExerciseHistory: async () => {
          const { getState: getState2 } = await getUiDeps();
          const state2 = getState2();
          const exName = state2.historyExercise;
          const variant = analytics.getVariants().find((item) => item.exercise_key === exName);
          const records = analytics.get1RMRecords(exName);
          const monthlySummary = analytics.get1RMMonthlySummary(exName);
          const recentSets = analytics.getRecentSets(exName, 30);
          const best1RM = analytics.getBest1RM(exName);
          const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
          ui.app.innerHTML = `
            <header>
                <button type="button" class="ghost" data-action="openHistory">\u2190 Historial</button>
                <h3>Progreso</h3>
                <button type="button" class="icon-btn ghost" data-action="toggleTheme">${ui.getThemeIcon()}</button>
            </header>
            <div class="container">
                <div class="card">
                    <h2 class="mb-m">${utils.esc(variant ? `${variant.display_name} (${variant.equipment_name})` : exName)}</h2>
                    ${best1RM ? `
                        <div class="flex justify-between align-center mb-m">
                            <span class="text-small text-muted">Mejor 1RM Estimado</span>
                            <span class="rm-badge" style="font-size: 1.1rem;">${utils.esc(best1RM)} kg</span>
                        </div>
                    ` : ""}
                </div>
                
                <details class="mb-m" open>
                    <summary>\u{1F4C8} Evoluci\xF3n de 1RM (R\xE9cords)</summary>
                    <div class="card mt-m">
                        ${records.length === 0 ? '<p class="text-small text-muted text-center">Sin r\xE9cords a\xFAn</p>' : ""}
                        ${records.map((r, idx) => `
                            <div class="flex justify-between align-center" style="padding: 12px 0; ${idx < records.length - 1 ? "border-bottom: 1px solid var(--border);" : ""}">
                                <div>
                                    <div class="font-bold">${utils.esc(r.value)} kg</div>
                                    <div class="text-small text-muted">${utils.formatDate(r.date)}</div>
                                </div>
                                <div class="text-small">
                                    ${utils.esc(r.load)}kg \xD7 ${utils.esc(r.reps)}
                                    ${r.improvement > 0 ? `<span style="color: var(--accent)"> (+${utils.esc(r.improvement.toFixed(1))})</span>` : ""}
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </details>
                
                <details class="mb-m">
                    <summary>\u{1F4C5} Resumen Mensual (Mejor 1RM)</summary>
                    <div class="card mt-m">
                        ${monthlySummary.length === 0 ? '<p class="text-small text-muted text-center">Sin datos mensuales</p>' : ""}
                        ${monthlySummary.map((m, idx) => `
                            <div class="flex justify-between align-center" style="padding: 12px 0; ${idx < monthlySummary.length - 1 ? "border-bottom: 1px solid var(--border);" : ""}">
                                <div>
                                    <div class="font-bold">${utils.formatMonth(m.month)}</div>
                                    <div class="text-small text-muted">${utils.formatDate(m.date)}</div>
                                </div>
                                <div class="text-small">
                                    <span class="rm-badge">${utils.esc(m.value)} kg</span>
                                    <div class="text-muted">${utils.esc(m.load)}kg \xD7 ${utils.esc(m.reps)}</div>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </details>

                <details class="mb-m" open>
                    <summary>\u{1F5D3}\uFE0F Sets Recientes (\xFAltimo mes)</summary>
                    <div class="card mt-m">
                        ${recentSets.length === 0 ? '<p class="text-small text-muted text-center">Sin sets recientes</p>' : ""}
                        <table class="progress-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Set</th>
                                    <th>Reps</th>
                                    <th>Kg</th>
                                    <th>1RM</th>
                                    <th>RIR</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentSets.map((h) => `
                                    <tr>
                                        <td class="text-small">${utils.formatDate(h.date)}</td>
                                        <td>${utils.esc(h.setIndex)}</td>
                                        <td><strong>${utils.esc(h.reps)}</strong></td>
                                        <td><strong>${utils.esc(h.load)}</strong></td>
                                        <td class="text-small text-muted">${utils.esc(h.estimated1RM || "-")}</td>
                                        <td class="text-small">${h.rir !== null ? utils.esc(h.rir_is_open_ended ? "4+" : h.rir === 4 ? "4 (hist\xF3rico)" : h.rir) : "-"}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </details>

                <div class="card">
                    <h3 class="mb-m">Exportar Hist\xF3rico Completo</h3>
                    <div class="export-row">
                        <button class="secondary" data-action="exportExerciseCSV" data-ex-key="${utils.esc(exName)}">
                            \u{1F4CA} CSV
                        </button>
                        <button class="secondary" data-action="exportExerciseJSON" data-ex-key="${utils.esc(exName)}">
                            \u{1F4C4} JSON
                        </button>
                    </div>
                </div>
            </div>
        `;
        },
        renderModal: async () => {
          const { getState: getState2 } = await getUiDeps();
          const state2 = getState2();
          const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
          if (state2.modal === "season_form") {
            const { getDb: getDb2 } = await getUiDeps();
            const variants = analytics.getVariants(getDb2());
            const now = /* @__PURE__ */ new Date();
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
            ui.app.innerHTML = `<div class="modal-overlay"><form class="modal-content" role="dialog" aria-modal="true" aria-labelledby="season_form_title" data-submit-action="submitSeasonForm"><h3 id="season_form_title">Crear temporada</h3><label>Nombre<input id="season_name" required maxlength="80"></label><label>Inicio<input id="season_start" type="date" value="${today}" required></label><label>Objetivo<select id="season_objective"><option value="strength">Fuerza</option><option value="hypertrophy">Hipertrofia</option><option value="maintenance">Mantenimiento</option><option value="return">Vuelta</option></select></label><fieldset><legend>Variantes prioritarias</legend>${variants.map((item) => `<label><input type="checkbox" name="season_priority" value="${utils.esc(item.exercise_key)}"> ${utils.esc(item.display_name)} (${utils.esc(item.equipment_name)})</label>`).join("")}</fieldset><label>Notas<textarea id="season_notes" maxlength="500"></textarea></label><div class="flex gap-s"><button class="primary" type="submit">Crear y activar</button><button class="ghost" type="button" data-action="closeModal">Cancelar</button></div></form></div>`;
            document.getElementById("season_name")?.focus();
            return;
          }
          if (state2.modal === "season_confirm") {
            const prepared = state2.seasonPrepared;
            ui.app.innerHTML = `<div class="modal-overlay"><div class="modal-content" role="dialog" aria-modal="true"><h3>Confirmar cierre</h3><p>Se cerrar\xE1 ${utils.esc(prepared.activeSeason.name)} el ${utils.esc(prepared.proposedCloseDate)} antes de crear ${utils.esc(prepared.season.name)}.</p><div class="flex gap-s"><button type="button" class="primary" data-action="confirmSeasonCreate">Confirmar</button><button type="button" class="ghost" data-action="closeModal">Cancelar</button></div></div></div>`;
            return;
          }
          if (state2.modal === "season_manage") {
            const { getDb: getDb2 } = await getUiDeps();
            const { seasons: seasons2 } = await Promise.resolve().then(() => (init_seasons(), seasons_exports));
            const list = seasons2.list(getDb2());
            ui.app.innerHTML = `<div class="modal-overlay"><div class="modal-content" role="dialog" aria-modal="true"><h3>Gestionar temporadas</h3>${list.map((season) => `<article class="card"><strong>${utils.esc(season.name)}</strong><p class="text-small">${utils.esc(season.start_date)}${season.end_date ? ` \u2013 ${utils.esc(season.end_date)}` : " \xB7 activa"}</p><button type="button" class="secondary" data-action="exportSeasonJSON" data-season-id="${utils.esc(season.season_id)}">Exportar</button><button type="button" class="danger" data-action="deleteSeasonFromManage" data-season-id="${utils.esc(season.season_id)}">Borrar metadatos</button></article>`).join("") || "<p>Sin temporadas.</p>"}<button type="button" class="ghost" data-action="closeModal">Cerrar</button></div></div>`;
            return;
          }
          const { backup: backup2 } = await Promise.resolve().then(() => (init_backup(), backup_exports));
          if (state2.modal === "help") {
            const { LLM_PROMPT_TEMPLATE: LLM_PROMPT_TEMPLATE2 } = await Promise.resolve().then(() => (init_config(), config_exports));
            ui.app.innerHTML = `
                <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="help-title">
                    <div class="modal-content">
                        <h2 id="help-title" style="margin-bottom: 12px;">\xBFC\xF3mo usar Strength Tracker?</h2>
                        <div class="flex-col gap-m">
                            <p><strong>\u{1F4DD} Mis Planes</strong> \u2014 Gestiona y consulta tus semanas de entrenamiento o crea una nueva.</p>
                            <p><strong>\u{1F4CA} Historial</strong> \u2014 Consulta tu progreso y los r\xE9cords de 1RM estimados.</p>
                            <p><strong>\u{1F4C8} An\xE1lisis</strong> \u2014 M\xE9tricas de volumen, esfuerzo RIR/RPE y carga total.</p>
                            <p><strong>\u{1F4BE} Backups</strong> \u2014 Crea copias de seguridad autom\xE1ticas o restaura versiones anteriores.</p>
                            <p><strong>\u{1F4E5} Importar</strong> \u2014 Carga rutinas generadas manualmente o por Inteligencia Artificial.</p>
                        </div>

                        <div class="card mt-m" style="border: 1.5px solid var(--accent); background: var(--bg-input);">
                            <div class="flex justify-between align-center mb-s">
                                <h3 style="font-size: 1.05rem;">\u{1F916} Crear Rutinas con IA</h3>
                                <span class="badge completed">Prompt LLM</span>
                            </div>
                            <p class="text-small text-muted mb-m">
                                P\xEDdele a ChatGPT, Claude o Gemini que dise\xF1e tu semana en el formato exacto de Strength Tracker.
                            </p>
                            <button type="button" class="primary w-full" data-action="copyLLMPrompt">
                                \u{1F4CB} Copiar Prompt y Plantilla para IA
                            </button>
                            
                            <details class="mt-m">
                                <summary class="text-small font-bold" style="cursor: pointer; padding: 6px 0;">Ver estructura JSON</summary>
                                <pre class="text-small mono" style="background: var(--bg-card); padding: 12px; border-radius: 8px; overflow-x: auto; max-height: 200px; border: 1px solid var(--border); margin-top: 8px; font-size: 0.78rem; line-height: 1.4;">${utils.esc(LLM_PROMPT_TEMPLATE2)}</pre>
                            </details>
                        </div>

                        <p class="text-small text-muted mt-s">Tus datos se guardan 100% localmente en este dispositivo.</p>
                        <button type="button" class="secondary w-full mt-m" data-action="closeModal" aria-label="Cerrar ayuda">Entendido</button>
                    </div>
                </div>
            `;
            return;
          }
          if (state2.modal === "import") {
            ui.app.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <h3>Importar Plan JSON</h3>
                        <p class="text-small mb-m">Elige c\xF3mo cargar tu rutina semanal:</p>
                        
                        <div class="card mb-m" style="background: var(--bg-input); padding: 12px 14px; border: 1px solid var(--border);">
                            <div class="flex justify-between align-center">
                                <span class="text-small font-bold">\u{1F916} \xBFUsas ChatGPT o Claude?</span>
                                <button type="button" class="ghost small" data-action="openHelp" style="padding: 4px 8px; color: var(--accent); font-weight: 700;">Ver Prompt \u2192</button>
                            </div>
                        </div>

                        <button type="button" class="primary w-full mb-m" data-action="pasteFromClipboard">
                            \u{1F4CB} Pegar desde portapapeles
                        </button>
                        <div class="divider">o</div>
                        <div class="file-input-wrapper">
                            <div class="text-small">\u{1F4C2} Seleccionar archivo .json</div>
                            <input type="file" accept="*/*" id="fileUpload" data-change-action="handleFileSelect">
                        </div>
                        <div class="divider">o</div>
                        <textarea id="jsonInput" rows="4" placeholder='Pegar JSON aqu\xED...'></textarea>
                        <div class="flex gap-s mt-m">
                            <button type="button" class="ghost w-full" data-action="closeModal">Cancelar</button>
                            <button type="button" class="primary w-full" data-action="doImport">Importar</button>
                        </div>
                    </div>
                </div>`;
          }
          if (state2.modal === "backups") {
            const backupList = backup2.list();
            ui.app.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <h3>Gesti\xF3n de Backups</h3>
                        <p class="text-small mb-m">Backups autom\xE1ticos (\xFAltimos 5):</p>
                        ${backupList.length === 0 ? `
                            <div class="card text-center text-muted">
                                No hay backups disponibles.
                            </div>
                        ` : `
                            <button type="button" class="secondary w-full mb-m" data-action="downloadAllBackups">
                                \u{1F4E5} Descargar TODOS los backups
                            </button>
                            <div class="flex-col gap-s mb-m">
                                ${backupList.map((date) => `
                                    <div class="card">
                                        <div class="flex justify-between align-center mb-m">
                                            <span class="font-bold">${utils.formatDate(date)}</span>
                                        </div>
                                        <div class="flex gap-s">
                                            <button class="secondary w-full" data-action="restoreBackup" data-timestamp="${utils.esc(date)}">
                                                Restaurar
                                            </button>
                                            <button class="primary w-full" data-action="downloadBackup" data-timestamp="${utils.esc(date)}">
                                                \u{1F4E5} Bajar
                                            </button>
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        `}
                        <div class="section-header">Restaurar desde archivo</div>
                        <button type="button" class="primary w-full mb-m" data-action="pasteBackupFromClipboard">
                            \u{1F4CB} Pegar backup desde portapapeles
                        </button>
                        <div class="divider">o</div>
                        <div class="file-input-wrapper">
                            <div class="text-small">\u{1F4C2} Seleccionar archivo backup</div>
                            <input type="file" accept="*/*" id="backupFileUpload" data-change-action="handleBackupFileSelect">
                        </div>
                        <div class="divider">o</div>
                        <textarea id="backupJsonInput" rows="4" placeholder='Pegar JSON del backup...'></textarea>
                        <div class="flex-col gap-s mt-m mb-m">
                            <button type="button" class="primary w-full" data-action="restoreFromBackupJSON" data-mode="merge">
                                \u{1F504} Fusionar con Datos Actuales
                                <div class="text-small" style="font-weight:normal; margin-top:2px; opacity:0.9">Compara y resuelve conflictos si los hay.</div>
                            </button>
                            <button type="button" class="danger w-full" data-action="restoreFromBackupJSON" data-mode="replace">
                                \u26A0\uFE0F Sobrescribir Todo
                                <div class="text-small" style="font-weight:normal; margin-top:2px; opacity:0.9">Borra datos actuales y pone el backup.</div>
                            </button>
                        </div>
                        <button type="button" class="ghost w-full" data-action="closeModal">Cerrar</button>
                    </div>
                </div>`;
          }
          if (state2.modal === "conflict") {
            const conflict = state2.conflictQueue[state2.currentConflictIndex];
            const totalConflicts = state2.conflictQueue.length;
            const currentNum = state2.currentConflictIndex + 1;
            if (!conflict) {
              await actions2.finishConflictResolution();
              return;
            }
            const localSets = (conflict.local.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter((s) => s.reps > 0).length || 0), 0);
            const incomingSets = (conflict.incoming.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter((s) => s.reps > 0).length || 0), 0);
            ui.app.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="flex justify-between align-center mb-m">
                            <h3>\u26A0\uFE0F Conflicto (${currentNum} de ${totalConflicts})</h3>
                            <span class="badge warning">Divergencia</span>
                        </div>
                        <p class="text-small mb-m">
                            Existe informaci\xF3n diferente para <strong>Semana ${utils.esc(conflict.weekNumber)} \u2014 ${utils.esc(conflict.sessionId)} (${utils.esc(conflict.local.title || "Sesi\xF3n")})</strong>:
                        </p>
                        
                        <div class="comparison-box">
                            <div class="flex justify-between align-center mb-m">
                                <strong>\u{1F3E0} En este dispositivo (Local)</strong>
                                <span class="badge ${conflict.local.session_completion.status}">${utils.esc(conflict.local.session_completion.status)}</span>
                            </div>
                            <div class="text-small text-muted">
                                \u2022 Series completadas: <strong>${localSets}</strong><br>
                                \u2022 Modificado: ${utils.formatDate(conflict.local.modified_at)}<br>
                                \u2022 Notas: ${utils.esc(conflict.local.session_notes || "Sin notas")}
                            </div>
                        </div>

                        <div class="comparison-box">
                            <div class="flex justify-between align-center mb-m">
                                <strong>\u{1F4E5} Archivo importado</strong>
                                <span class="badge ${conflict.incoming.session_completion.status}">${utils.esc(conflict.incoming.session_completion.status)}</span>
                            </div>
                            <div class="text-small text-muted">
                                \u2022 Series completadas: <strong>${incomingSets}</strong><br>
                                \u2022 Modificado: ${utils.formatDate(conflict.incoming.modified_at)}<br>
                                \u2022 Notas: ${utils.esc(conflict.incoming.session_notes || "Sin notas")}
                            </div>
                        </div>

                        <p class="text-small font-bold mt-m mb-m">\xBFQu\xE9 versi\xF3n deseas conservar?</p>
                        <div class="flex-col gap-s mb-m">
                            <button type="button" class="secondary w-full" data-action="resolveConflictChoice" data-choice="local">
                                \u{1F3E0} Conservar Mi Versi\xF3n (Local)
                            </button>
                            <button type="button" class="primary w-full" data-action="resolveConflictChoice" data-choice="incoming">
                                \u{1F4E5} Usar Versi\xF3n Importada
                            </button>
                            <button type="button" class="ghost w-full" data-action="resolveConflictChoice" data-choice="both">
                                \u2795 Conservar Ambas (Crear copia con nuevo ID)
                            </button>
                        </div>
                        
                        ${totalConflicts > 1 ? `
                            <div class="divider">aplicar a todos</div>
                            <div class="flex gap-s">
                                <button type="button" class="ghost small w-full" data-action="resolveAllConflicts" data-choice="local">Todas Local</button>
                                <button type="button" class="ghost small w-full" data-action="resolveAllConflicts" data-choice="incoming">Todas Importada</button>
                            </div>
                        ` : ""}
                    </div>
                </div>`;
          }
          if (state2.modal === "export_all_rms") {
            const exercises = analytics.getAllExercises();
            const totalExercises = exercises.length;
            const { actions: actions3 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
            ui.app.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <h3>Exportar Todos los 1RM</h3>
                        <p class="text-small mb-m">${totalExercises} ejercicios encontrados</p>
                        <div class="card">
                            <h3 class="mb-m">Formato</h3>
                            <div class="flex-col gap-s">
                                <button type="button" class="primary w-full" data-action="downloadAll1RMsJSON">
                                    \u{1F4C4} JSON Completo
                                    <div class="text-small" style="font-weight: normal; margin-top: 4px;">
                                        Incluye todos los r\xE9cords y resumen mensual
                                    </div>
                                </button>
                                <button type="button" class="secondary w-full" data-action="downloadAll1RMsCSV">
                                    \u{1F4CA} CSV Resumen
                                    <div class="text-small" style="font-weight: normal; margin-top: 4px;">
                                        Tabla con mejores marcas por ejercicio
                                    </div>
                                </button>
                            </div>
                        </div>
                        <button type="button" class="ghost w-full mt-m" data-action="closeModal">
                            Cancelar
                        </button>
                    </div>
                </div>`;
          }
        },
        renderSetModal: async () => {
          const { getState: getState2 } = await getUiDeps();
          const state2 = getState2();
          const { wId, sId, exId, setIndex, currentReps, currentLoad } = state2.setModal;
          const ex = await logic.getExercise(wId, sId, exId);
          if (!ex) {
            const { actions: actions3 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
            actions3.closeSetModal();
            return;
          }
          const set = ex.execution.sets[setIndex] || { reps: null, load: null, rir: null, notes: "" };
          const planArr = logic.getResolvedPlan(ex);
          const totalSets = planArr.length;
          const reps = currentReps !== void 0 ? currentReps : set.reps || "";
          const load = currentLoad !== void 0 ? currentLoad : set.load || "";
          const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
          const { getState: gs } = await getUiDeps();
          const s = gs();
          const selectedRIR = s.selectedRIR;
          const selectedRIRIsOpenEnded = s.selectedRIRIsOpenEnded;
          ui.app.innerHTML = `
            <div class="modal-overlay" data-action="closeSetModalOnOverlay">
                <div class="modal-content">
                    <h3>\u2713 Guardar Set ${setIndex + 1} de ${totalSets}</h3>
                    <div class="card mt-m">
                        <div class="flex gap-s mb-m">
                            <div class="flex-col w-full">
                                <label class="text-small text-muted mb-m">Reps</label>
                                <input id="modal_reps" type="number" inputmode="numeric" value="${utils.esc(reps)}">
                            </div>
                            <div class="flex-col w-full">
                                <label class="text-small text-muted mb-m">Carga (kg)</label>
                                <input id="modal_load" type="number" inputmode="decimal" step="0.5" value="${utils.esc(load)}">
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <label class="text-small text-muted mb-m display-block">\xBFCu\xE1ntas repeticiones te quedaban? (RIR)</label>
                        <div class="rir-selector">
                            <button type="button" class="rir-btn ${set.rir !== null && set.rir !== void 0 ? set.rir === 0 && !set.rir_is_open_ended ? "selected" : "" : selectedRIR === 0 && !selectedRIRIsOpenEnded ? "selected" : ""}" data-action="selectRIR" data-rir="0">0</button>
                            <button type="button" class="rir-btn ${set.rir !== null && set.rir !== void 0 ? set.rir === 1 ? "selected" : "" : selectedRIR === 1 ? "selected" : ""}" data-action="selectRIR" data-rir="1">1</button>
                            <button type="button" class="rir-btn ${set.rir !== null && set.rir !== void 0 ? set.rir === 2 ? "selected" : "" : selectedRIR === 2 ? "selected" : ""}" data-action="selectRIR" data-rir="2">2</button>
                            <button type="button" class="rir-btn ${set.rir !== null && set.rir !== void 0 ? set.rir === 3 ? "selected" : "" : selectedRIR === 3 ? "selected" : ""}" data-action="selectRIR" data-rir="3">3</button>
                            <button type="button" class="rir-btn ${set.rir_is_open_ended || (set.rir === null || set.rir === void 0) && selectedRIR === 4 && selectedRIRIsOpenEnded ? "selected" : ""}" data-action="selectRIR" data-rir="4" data-rir-open-ended="true">4+</button>
                        </div>
                        ${set.rir === 4 && !set.rir_is_open_ended ? '<p class="text-small text-muted">RIR 4 (hist\xF3rico). Pulsa 4+ solo si deseas cambiar su significado.</p>' : ""}
                        <div class="flex justify-between text-small text-muted" style="margin-top: 8px;">
                            <span>Fallo</span>
                            <span>Reserva</span>
                        </div>
                    </div>
                    <div class="card">
                        <label class="text-small text-muted mb-m display-block">Nota (opcional)</label>
                        <textarea id="modal_notes" rows="2" placeholder="T\xE9cnica, sensaciones...">${utils.esc(set.notes || "")}</textarea>
                    </div>
                    <div class="flex-col gap-s mt-m">
                        <button type="button" class="primary w-full" data-action="saveSetWithRIR">
                            \u2713 Guardar
                        </button>
                        <button type="button" class="ghost w-full" data-action="saveSetWithoutRIR">
                            Guardar sin RIR
                        </button>
                    </div>
                </div>
            </div>
        `;
        },
        /**
         * Sistema de delegated listeners para evitar XSS por atributos inline (onclick).
         * Los datos del usuario se pasan como data-attributes (escapados) y se leen
         * en el handler, eliminando la necesidad de interpolar JS en atributos HTML.
         */
        bindDelegated: () => {
          if (ui._delegatedBound) return;
          ui._delegatedBound = true;
          document.addEventListener?.("keydown", async (event) => {
            const { getState: getState2 } = await getUiDeps();
            const state2 = getState2();
            if (!state2.modal && !state2.setModal) return;
            if (event.key === "Escape") {
              const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
              actions2.closeModal();
              actions2.closeSetModal();
              return;
            }
            if (event.key !== "Tab") return;
            const focusable = [...document.querySelectorAll(".modal-content button, .modal-content input, .modal-content select, .modal-content textarea")].filter((element) => !element.disabled);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          });
          ui.app.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            const target = event.target.closest('[role="button"][data-action]');
            if (!target) return;
            event.preventDefault();
            target.click();
          });
          ui.app.addEventListener("click", async (e) => {
            const target = e.target.closest("[data-action]");
            if (!target) return;
            const action = target.getAttribute("data-action");
            const get = (name) => {
              const attribute = `data-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
              const v = target.getAttribute(attribute);
              return v === null ? null : v;
            };
            const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
            const { backup: backup2 } = await Promise.resolve().then(() => (init_backup(), backup_exports));
            switch (action) {
              case "goHome":
                actions2.goHome();
                break;
              case "toggleTheme":
                utils.toggleTheme();
                break;
              case "openHelp":
                actions2.openHelp();
                break;
              case "openPlanes":
                actions2.openPlanes();
                break;
              case "openHistory":
                actions2.openHistory();
                break;
              case "openAnalytics":
                actions2.openAnalytics();
                break;
              case "openBackups":
                actions2.openBackups();
                break;
              case "openImport":
                actions2.openImport();
                break;
              case "closeModal":
                actions2.closeModal();
                break;
              case "confirmSeasonCreate":
                actions2.confirmSeasonCreate();
                break;
              case "deleteSeasonFromManage":
                actions2.deleteSeasonFromManage(get("seasonId"));
                break;
              case "copyLLMPrompt":
                actions2.copyLLMPrompt();
                break;
              case "pasteFromClipboard":
                actions2.pasteFromClipboard();
                break;
              case "doImport":
                actions2.doImport();
                break;
              case "downloadAllBackups":
                backup2.downloadAll();
                break;
              case "pasteBackupFromClipboard":
                actions2.pasteBackupFromClipboard();
                break;
              case "restoreFromBackupJSON":
                actions2.restoreFromBackupJSON(get("mode"));
                break;
              case "applyFlatOverride":
                logic.applyFlatOverride(get("weekId"), get("sessionId"), get("exerciseId"), document.getElementById("ov_sets")?.value, document.getElementById("ov_reps")?.value, document.getElementById("ov_load")?.value);
                break;
              case "downloadAll1RMsJSON":
                actions2.downloadAll1RMsJSON();
                break;
              case "downloadAll1RMsCSV":
                actions2.downloadAll1RMsCSV();
                break;
              case "createManualWeek":
                logic.createManualWeek();
                break;
              case "createSeason":
                actions2.createSeason();
                break;
              case "closeActiveSeason":
                actions2.closeActiveSeason();
                break;
              case "manageSeasons":
                actions2.manageSeasons();
                break;
              case "exportSeasonJSON":
                actions2.exportSeasonJSON(get("seasonId"));
                break;
              case "viewReport":
                actions2.viewReport();
                break;
              case "finishSession":
                actions2.finishSession();
                break;
              case "exportAllRMs":
                actions2.exportAllRMs();
                break;
              case "selectRIR":
                actions2.selectRIR(parseInt(get("rir"), 10), get("rirOpenEnded") === "true", target);
                break;
              case "saveSetWithRIR":
                actions2.saveSetWithRIR();
                break;
              case "saveSetWithoutRIR":
                actions2.saveSetWithoutRIR();
                break;
              case "closeSetModalOnOverlay":
                if (e.target === target) actions2.closeSetModal();
                break;
              case "openWeek":
                actions2.openWeek(get("weekId"));
                break;
              case "openSession":
                actions2.openSession(get("sessionId"));
                break;
              case "openExercise":
                actions2.openExercise(get("exerciseId"));
                break;
              case "openExerciseHistory":
                actions2.openExerciseHistory(get("exKey") || get("exName"));
                break;
              case "deleteWeek":
                logic.deleteWeek(get("weekId"));
                break;
              case "addSessionToWeek":
                logic.addSessionToWeek(get("weekId"));
                break;
              case "addNewExerciseToSession":
                logic.addNewExerciseToSession(get("weekId"), get("sessionId"));
                break;
              case "toggleComplete":
                logic.toggleComplete(get("weekId"), get("sessionId"), get("exerciseId"));
                break;
              case "addSet":
                logic.addSet(get("weekId"), get("sessionId"), get("exerciseId"));
                break;
              case "openSetModal":
                actions2.openSetModal(get("weekId"), get("sessionId"), get("exerciseId"), parseInt(get("setIdx"), 10));
                break;
              case "exportWeek":
                actions2.exportWeek();
                break;
              case "exportExerciseCSV":
                actions2.exportExerciseCSV(get("exKey") || get("exName"));
                break;
              case "exportExerciseJSON":
                actions2.exportExerciseJSON(get("exKey") || get("exName"));
                break;
              case "resolveConflictChoice":
                actions2.resolveConflictChoice(get("choice"));
                break;
              case "resolveAllConflicts":
                actions2.resolveAllConflicts(get("choice"));
                break;
              case "restoreBackup":
                backup2.restore(get("timestamp"), actions2, ui.toast);
                break;
              case "downloadBackup":
                backup2.download(get("timestamp"), ui.toast);
                break;
              default:
                break;
            }
          });
          ui.app.addEventListener("change", async (e) => {
            const target = e.target.closest("[data-change-action]");
            if (!target) return;
            const action = target.getAttribute("data-change-action");
            const get = (name) => {
              const attribute = `data-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
              return target.getAttribute(attribute);
            };
            const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
            switch (action) {
              case "selectAnalyticsPeriod":
                actions2.selectAnalyticsPeriod(target.value);
                break;
              case "selectAnalyticsVariant":
                actions2.selectAnalyticsVariant(target.value);
                break;
              case "updateScheduledDate":
                actions2.updateScheduledDate(target.value);
                break;
              case "handleFileSelect":
                actions2.handleFileSelect(target);
                break;
              case "handleBackupFileSelect":
                actions2.handleBackupFileSelect(target);
                break;
              case "updateSessionNote":
                logic.updateSessionNote(get("weekId"), get("sessionId"), target.value);
                break;
              case "updateExerciseNote":
                logic.updateExerciseNote(get("weekId"), get("sessionId"), get("exerciseId"), target.value);
                break;
              case "updateSetReps":
                logic.updateSet(get("weekId"), get("sessionId"), get("exerciseId"), parseInt(get("setIdx"), 10), { reps: target.value });
                break;
              case "updateSetLoad":
                logic.updateSet(get("weekId"), get("sessionId"), get("exerciseId"), parseInt(get("setIdx"), 10), { load: target.value });
                break;
              default:
                break;
            }
          });
          ui.app.addEventListener("submit", async (e) => {
            const form = e.target.closest("[data-submit-action]");
            if (!form) return;
            e.preventDefault();
            if (form.getAttribute("data-submit-action") === "submitSeasonForm") {
              const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
              await actions2.submitSeasonForm();
            }
          });
        }
      };
    }
  });

  // www/js/merge.js
  var merge_exports = {};
  __export(merge_exports, {
    mergeEngine: () => mergeEngine
  });
  var TIMESTAMP_TOLERANCE_MS, mergeEngine;
  var init_merge = __esm({
    "www/js/merge.js"() {
      init_utils();
      init_data();
      init_ui();
      init_backup();
      TIMESTAMP_TOLERANCE_MS = 5e3;
      mergeEngine = {
        /**
         * Devuelve true si hay un conflicto real entre local e incoming.
         * Si ambos tienen modified_at válidos y la diferencia supera el margen,
         * la versión más reciente gana (no hay conflicto).
         */
        detectSessionConflict: (localS, incomingS) => {
          if (!localS || !incomingS) return false;
          const localSetsDone = (localS.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter((s) => s.reps > 0).length || 0), 0);
          const incomingSetsDone = (incomingS.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter((s) => s.reps > 0).length || 0), 0);
          if (localSetsDone === 0 && incomingSetsDone > 0) return false;
          if (incomingSetsDone === 0 && localSetsDone > 0) return false;
          if (localSetsDone === 0 && incomingSetsDone === 0) return false;
          const localTs = localS.modified_at ? new Date(localS.modified_at).getTime() : NaN;
          const incomingTs = incomingS.modified_at ? new Date(incomingS.modified_at).getTime() : NaN;
          if (!isNaN(localTs) && !isNaN(incomingTs)) {
            const diff = Math.abs(localTs - incomingTs);
            if (diff > TIMESTAMP_TOLERANCE_MS) return false;
          }
          const localJSON = JSON.stringify(localS.exercises || []);
          const incomingJSON = JSON.stringify(incomingS.exercises || []);
          return localJSON !== incomingJSON;
        },
        /**
         * Devuelve la versión "ganadora" de una sessions según modified_at (latest wins).
         * Si no se puede decidir, devuelve null (usa la lógica actual).
         */
        pickLatest: (localS, incomingS) => {
          const localTs = localS?.modified_at ? new Date(localS.modified_at).getTime() : NaN;
          const incomingTs = incomingS?.modified_at ? new Date(incomingS.modified_at).getTime() : NaN;
          if (!isNaN(localTs) && !isNaN(incomingTs)) {
            return incomingTs >= localTs ? incomingS : localS;
          }
          return null;
        },
        startDataMerge: async (importedData, actions2, toastFn) => {
          backup.auto();
          const currentData = utils.load();
          const conflicts = [];
          const mergedWeeks = { ...currentData.weeks };
          const mergedSeasons = { ...currentData.seasons };
          Object.values(importedData.seasons || {}).forEach((incomingSeason) => {
            const localSeason = mergedSeasons[incomingSeason.season_id];
            if (!localSeason || new Date(incomingSeason.modified_at).getTime() >= new Date(localSeason.modified_at).getTime()) {
              mergedSeasons[incomingSeason.season_id] = incomingSeason;
            }
          });
          Object.values(importedData.weeks || {}).forEach((incomingWeek) => {
            const weekId = incomingWeek.week.week_id;
            const existingWeek = mergedWeeks[weekId];
            if (!existingWeek) {
              mergedWeeks[weekId] = incomingWeek;
            } else {
              const mergedSessions = [...existingWeek.sessions];
              const existingSessionMap = /* @__PURE__ */ new Map();
              mergedSessions.forEach((s, idx) => existingSessionMap.set(s.session_id, { session: s, index: idx }));
              incomingWeek.sessions.forEach((incomingSession) => {
                const existing = existingSessionMap.get(incomingSession.session_id);
                if (!existing) {
                  mergedSessions.push(incomingSession);
                } else {
                  const isConflict = mergeEngine.detectSessionConflict(existing.session, incomingSession);
                  if (isConflict) {
                    conflicts.push({
                      type: "session",
                      weekId,
                      weekNumber: existingWeek.week.week_number,
                      sessionId: incomingSession.session_id,
                      local: existing.session,
                      incoming: incomingSession
                    });
                  } else {
                    const incomingSets = (incomingSession.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter((s) => s.reps > 0).length || 0), 0);
                    const localSets = (existing.session.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter((s) => s.reps > 0).length || 0), 0);
                    if (localSets === 0 && incomingSets > 0) {
                      mergedSessions[existing.index] = incomingSession;
                    } else if (incomingSets === 0 && localSets > 0) {
                      mergedSessions[existing.index] = existing.session;
                    } else {
                      const latest = mergeEngine.pickLatest(existing.session, incomingSession);
                      if (latest) {
                        mergedSessions[existing.index] = latest;
                      } else if (incomingSets >= localSets) {
                        mergedSessions[existing.index] = incomingSession;
                      }
                    }
                  }
                }
              });
              mergedWeeks[weekId] = {
                ...existingWeek,
                sessions: mergedSessions,
                modified_at: utils.isoNow()
              };
            }
          });
          if (conflicts.length > 0) {
            const state2 = getState();
            setState({
              ...state2,
              pendingMergeData: mergedWeeks,
              pendingMergeSeasons: mergedSeasons,
              conflictQueue: conflicts,
              currentConflictIndex: 0,
              modal: "conflict"
            });
            await ui.render();
          } else {
            currentData.weeks = mergedWeeks;
            currentData.seasons = mergedSeasons;
            utils.save(currentData, backup.auto);
            setDb(currentData);
            toastFn("\u2713 Datos fusionados sin conflictos");
            const state2 = getState();
            setState({ ...state2, modal: null });
            await actions2.goHome();
          }
        }
      };
    }
  });

  // www/js/actions.js
  var actions_exports = {};
  __export(actions_exports, {
    actions: () => actions
  });
  var lastRIR2, actions;
  var init_actions = __esm({
    "www/js/actions.js"() {
      init_config();
      init_utils();
      init_validate();
      init_backup();
      init_analytics();
      init_merge();
      init_logic();
      init_data();
      lastRIR2 = null;
      actions = {
        goHome: async () => {
          const state2 = getState();
          setState({
            ...state2,
            view: "home",
            activeWeekId: null,
            activeSessionId: null,
            activeExerciseId: null
          });
          await wakeLock.release();
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        openWeek: async (id) => {
          const state2 = getState();
          setState({
            ...state2,
            activeWeekId: id,
            view: "week"
          });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        openSession: async (id) => {
          const state2 = getState();
          setState({
            ...state2,
            activeSessionId: id,
            view: "session"
          });
          await logic.startSession(state2.activeWeekId, id);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        openExercise: async (id) => {
          const state2 = getState();
          setState({
            ...state2,
            activeExerciseId: id,
            view: "exercise"
          });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        openPlanes: async () => {
          const state2 = getState();
          setState({ ...state2, activeWeekId: null, view: "planes" });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        openAnalytics: async () => {
          const state2 = getState();
          setState({ ...state2, view: "analytics" });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        selectAnalyticsPeriod: async (period) => {
          const state2 = getState();
          setState({ ...state2, analyticsPeriod: period });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        selectAnalyticsVariant: async (exerciseKey) => {
          const state2 = getState();
          setState({ ...state2, analyticsExerciseKey: exerciseKey || null });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        updateScheduledDate: async (date) => {
          const state2 = getState();
          try {
            await logic.updateScheduledDate(state2.activeWeekId, state2.activeSessionId, date);
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast("\u2713 Fecha programada actualizada");
          } catch (error) {
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast(`\u26A0\uFE0F ${error.message}`);
          }
        },
        createSeason: async () => {
          const state2 = getState();
          setState({ ...state2, modal: "season_form", seasonForm: null });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        submitSeasonForm: async () => {
          const name = document.getElementById("season_name")?.value;
          const start_date = document.getElementById("season_start")?.value;
          const objective = document.getElementById("season_objective")?.value;
          const notes = document.getElementById("season_notes")?.value;
          const priority_exercise_keys = [...document.querySelectorAll('[name="season_priority"]:checked')].map((input) => input.value);
          try {
            const prepared = await logic.prepareSeasonCreate({ name, start_date, objective, notes, priority_exercise_keys });
            if (prepared.requiresConfirmation) {
              const state3 = getState();
              setState({ ...state3, seasonPrepared: prepared, modal: "season_confirm" });
              const { ui: ui3 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
              ui3.render();
              return;
            }
            await logic.applySeasonCreate(prepared);
            const state2 = getState();
            setState({ ...state2, analyticsPeriod: "active_season", modal: null, seasonPrepared: null });
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast("\u2713 Temporada creada y activada");
            ui2.render();
          } catch (error) {
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast(`\u26A0\uFE0F ${error.message}`);
          }
        },
        confirmSeasonCreate: async () => {
          const state2 = getState();
          if (!state2.seasonPrepared) return;
          await logic.applySeasonCreate(state2.seasonPrepared);
          setState({ ...state2, analyticsPeriod: "active_season", modal: null, seasonPrepared: null });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 Temporada creada y activada");
          ui2.render();
        },
        closeActiveSeason: async () => {
          const { getDb: getDb2 } = await Promise.resolve().then(() => (init_data(), data_exports));
          const { seasons: seasons2 } = await Promise.resolve().then(() => (init_seasons(), seasons_exports));
          const active = seasons2.active(getDb2());
          if (!active || !confirm(`\xBFCerrar ${active.name}?`)) return;
          const now = /* @__PURE__ */ new Date();
          const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
          await logic.closeSeason(active.season_id, today);
          const state2 = getState();
          setState({ ...state2, analyticsPeriod: `season:${active.season_id}`, analyticsSeasonId: active.season_id });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 Temporada cerrada");
          ui2.render();
        },
        manageSeasons: async () => {
          const state2 = getState();
          setState({ ...state2, modal: "season_manage" });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        openHelp: async () => {
          const state2 = getState();
          setState({ ...state2, modal: "help" });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        copyLLMPrompt: async () => {
          const { LLM_PROMPT_TEMPLATE: LLM_PROMPT_TEMPLATE2 } = await Promise.resolve().then(() => (init_config(), config_exports));
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(LLM_PROMPT_TEMPLATE2);
              ui2.toast("\u2713 Prompt copiado al portapapeles");
            } else {
              const ta = document.createElement("textarea");
              ta.value = LLM_PROMPT_TEMPLATE2;
              ta.style.position = "fixed";
              ta.style.opacity = "0";
              document.body.appendChild(ta);
              ta.select();
              document.execCommand("copy");
              document.body.removeChild(ta);
              ui2.toast("\u2713 Prompt copiado al portapapeles");
            }
          } catch (_e) {
            ui2.toast("\u26A0\uFE0F No se pudo acceder al portapapeles");
          }
        },
        openHistory: async () => {
          const state2 = getState();
          setState({ ...state2, view: "history" });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        openExerciseHistory: async (exerciseKey) => {
          const state2 = getState();
          setState({
            ...state2,
            historyExercise: exerciseKey,
            view: "exercise_history"
          });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        openImport: async () => {
          const state2 = getState();
          setState({ ...state2, modal: "import" });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        openBackups: async () => {
          const state2 = getState();
          setState({ ...state2, modal: "backups" });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        closeModal: async () => {
          const state2 = getState();
          setState({ ...state2, modal: null });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        openSetModal: async (wId, sId, exId, setIndex) => {
          const repsInput = document.getElementById(`reps_${setIndex}`);
          const loadInput = document.getElementById(`load_${setIndex}`);
          const currentReps = repsInput ? repsInput.value : void 0;
          const currentLoad = loadInput ? loadInput.value : void 0;
          const exercise = await logic.getExercise(wId, sId, exId);
          const set = exercise?.execution?.sets?.[setIndex];
          const selectedRIR = set?.rir === null || set?.rir === void 0 ? null : set.rir;
          const selectedRIRIsOpenEnded = Boolean(set?.rir_is_open_ended);
          const state2 = getState();
          setState({
            ...state2,
            setModal: { wId, sId, exId, setIndex, currentReps, currentLoad },
            selectedRIR,
            selectedRIRIsOpenEnded
          });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        closeSetModal: async () => {
          const state2 = getState();
          setState({ ...state2, setModal: null, selectedRIR: null, selectedRIRIsOpenEnded: false });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        selectRIR: async (value, isOpenEnded = false, source = null) => {
          document.querySelectorAll(".rir-btn").forEach((btn) => btn.classList.remove("selected"));
          if (source) source.classList.add("selected");
          const state2 = getState();
          setState({ ...state2, selectedRIR: value, selectedRIRIsOpenEnded: isOpenEnded });
          lastRIR2 = value;
        },
        saveSetWithoutRIR: async () => {
          const state2 = getState();
          const { wId, sId, exId, setIndex } = state2.setModal;
          const reps = document.getElementById("modal_reps").value;
          const load = document.getElementById("modal_load").value;
          const notes = document.getElementById("modal_notes").value;
          if (!reps || !load) {
            const { ui: ui3 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui3.toast("\u26A0\uFE0F Completa reps y carga");
            return;
          }
          await logic.updateSet(wId, sId, exId, setIndex, {
            reps: parseFloat(reps),
            load: parseFloat(load),
            rir: null,
            rir_is_open_ended: false,
            notes
          });
          setState({ ...state2, setModal: null, selectedRIR: null, selectedRIRIsOpenEnded: false });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 Set guardado");
          ui2.render();
        },
        saveSetWithRIR: async () => {
          const state2 = getState();
          const { wId, sId, exId, setIndex } = state2.setModal;
          const reps = document.getElementById("modal_reps").value;
          const load = document.getElementById("modal_load").value;
          const notes = document.getElementById("modal_notes").value;
          const rir = state2.selectedRIR;
          if (!reps || !load) {
            const { ui: ui3 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui3.toast("\u26A0\uFE0F Completa reps y carga");
            return;
          }
          if (rir === null || rir === void 0) {
            const { ui: ui3 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui3.toast("\u26A0\uFE0F Selecciona RIR o usa \u201CGuardar sin RIR\u201D");
            return;
          }
          await logic.updateSet(wId, sId, exId, setIndex, {
            reps: parseFloat(reps),
            load: parseFloat(load),
            rir,
            rir_is_open_ended: Boolean(state2.selectedRIRIsOpenEnded),
            notes
          });
          setState({ ...state2, setModal: null, selectedRIR: null, selectedRIRIsOpenEnded: false });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 Set guardado");
          ui2.render();
        },
        pasteFromClipboard: async () => {
          try {
            const text = await navigator.clipboard.readText();
            if (!text || text.trim() === "") {
              const { ui: ui3 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
              ui3.toast("\u26A0\uFE0F Portapapeles vac\xEDo");
              return;
            }
            document.getElementById("jsonInput").value = text;
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast("\u2713 Pegado");
          } catch (err) {
            console.warn("Error al leer portapapeles:", err);
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast("\u26A0\uFE0F No se pudo acceder al portapapeles");
          }
        },
        pasteBackupFromClipboard: async () => {
          try {
            const text = await navigator.clipboard.readText();
            if (!text || text.trim() === "") {
              const { ui: ui3 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
              ui3.toast("\u26A0\uFE0F Portapapeles vac\xEDo");
              return;
            }
            document.getElementById("backupJsonInput").value = text;
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast("\u2713 Pegado");
          } catch (err) {
            console.warn("Error al leer portapapeles:", err);
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast("\u26A0\uFE0F No se pudo acceder al portapapeles");
          }
        },
        handleFileSelect: async (input) => {
          const file = input.files[0];
          if (!file) return;
          if (file.size > MAX_IMPORT_BYTES) {
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast(`\u26A0\uFE0F El archivo excede el tama\xF1o m\xE1ximo (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
            return;
          }
          const reader = new FileReader();
          return new Promise((resolve, reject) => {
            reader.onload = async (e) => {
              document.getElementById("jsonInput").value = e.target.result;
              const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
              ui2.toast("\u2713 Archivo cargado");
              resolve();
            };
            reader.onerror = async () => {
              const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
              ui2.toast("\u26A0\uFE0F Error al leer archivo");
              reject();
            };
            reader.readAsText(file);
          });
        },
        handleBackupFileSelect: async (input) => {
          const file = input.files[0];
          if (!file) return;
          if (file.size > MAX_IMPORT_BYTES * 2) {
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast(`\u26A0\uFE0F El archivo de backup excede el tama\xF1o m\xE1ximo (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
            return;
          }
          const reader = new FileReader();
          return new Promise((resolve, reject) => {
            reader.onload = async (e) => {
              document.getElementById("backupJsonInput").value = e.target.result;
              const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
              ui2.toast("\u2713 Archivo cargado");
              resolve();
            };
            reader.onerror = async () => {
              const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
              ui2.toast("\u26A0\uFE0F Error al leer archivo");
              reject();
            };
            reader.readAsText(file);
          });
        },
        doImport: async () => {
          try {
            const val = document.getElementById("jsonInput").value;
            if (!val || !val.trim()) {
              const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
              ui2.toast("\u26A0\uFE0F Contenido vac\xEDo");
              return;
            }
            const cleanWeek = validate.json(val);
            await logic.createWeekFromImport(cleanWeek, actions);
            const state2 = getState();
            if (!state2.modal) {
            }
          } catch (e) {
            console.error("Error durante importaci\xF3n:", e);
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.toast(`\u26A0\uFE0F ${e.message}`);
          }
        },
        restoreFromBackupJSON: async (mode) => {
          const val = document.getElementById("backupJsonInput").value;
          if (!val || !val.trim()) {
            const { ui: ui3 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui3.toast("\u26A0\uFE0F Contenido vac\xEDo");
            return;
          }
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          const { setDb: setDb2 } = await Promise.resolve().then(() => (init_data(), data_exports));
          try {
            const data = validate.backupJSON(val);
            if (mode === "replace") {
              if (!confirm(`\u26A0\uFE0F ALERTA DE BORRADO

Vas a reemplazar TODA la base de datos con este backup. Se perder\xE1n los datos actuales no guardados.

\xBFContinuar?`)) return;
              backup.auto();
              utils.save(data);
              const newDb = utils.load();
              setDb2(newDb);
              ui2.toast("\u2713 Base de datos reemplazada");
              await actions.goHome();
            } else {
              await mergeEngine.startDataMerge(data, actions, (msg) => ui2.toast(msg));
            }
          } catch (e) {
            console.error("Error restaurando backup:", e);
            ui2.toast(`\u26A0\uFE0F ${e.message}`);
          }
        },
        resolveConflictChoice: async (choice) => {
          const state2 = getState();
          const conflict = state2.conflictQueue[state2.currentConflictIndex];
          if (!conflict) return;
          const week = state2.pendingMergeData[conflict.weekId];
          if (week) {
            const sessionIdx = week.sessions.findIndex((s) => s.session_id === conflict.sessionId);
            if (choice === "incoming" && sessionIdx !== -1) {
              week.sessions[sessionIdx] = conflict.incoming;
            } else if (choice === "both") {
              const copySession = {
                ...conflict.incoming,
                session_id: `${conflict.incoming.session_id} (Importada)`,
                title: `${conflict.incoming.title} (Copia)`,
                modified_at: utils.isoNow()
              };
              week.sessions.push(copySession);
            }
          }
          const newIndex = state2.currentConflictIndex + 1;
          if (newIndex >= state2.conflictQueue.length) {
            await actions.finishConflictResolution();
          } else {
            setState({ ...state2, currentConflictIndex: newIndex });
            const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui2.render();
          }
        },
        resolveAllConflicts: async (choice) => {
          while (true) {
            const state2 = getState();
            if (state2.currentConflictIndex >= state2.conflictQueue.length) break;
            await actions.resolveConflictChoice(choice);
          }
        },
        finishConflictResolution: async () => {
          const state2 = getState();
          const { setDb: setDb2 } = await Promise.resolve().then(() => (init_data(), data_exports));
          const currentData = utils.load();
          currentData.weeks = state2.pendingMergeData;
          currentData.seasons = state2.pendingMergeSeasons || currentData.seasons;
          utils.save(currentData, backup.auto);
          setDb2(currentData);
          setState({
            ...state2,
            conflictQueue: [],
            currentConflictIndex: 0,
            pendingMergeData: null,
            pendingMergeSeasons: null,
            modal: null
          });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 Fusi\xF3n completada con tus decisiones");
          await actions.goHome();
        },
        finishSession: async () => {
          const state2 = getState();
          const s = await logic.getSession(state2.activeWeekId, state2.activeSessionId);
          if (!s) return;
          const incomplete = s.exercises.filter((e) => e.completion.status !== "completed");
          if (incomplete.length > 0) {
            if (!confirm(`\u26A0\uFE0F Hay ${incomplete.length} ejercicio(s) sin completar.

\xBFFinalizar?`)) return;
          }
          if (confirm("\u2713 \xBFFinalizar sesi\xF3n?")) {
            await logic.finishSession(state2.activeWeekId, state2.activeSessionId);
            await actions.viewReport();
          }
        },
        viewReport: async () => {
          const state2 = getState();
          const data = await logic.generateReport(state2.activeWeekId, state2.activeSessionId);
          await utils.download(data, `report_${state2.activeSessionId}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 Reporte descargado");
          await actions.goHome();
        },
        exportWeek: async () => {
          const state2 = getState();
          const w = await logic.getWeek(state2.activeWeekId);
          if (!w) return;
          await utils.download(w, `week_${w.week.week_number}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 Semana exportada");
        },
        exportExerciseCSV: async (exerciseKey) => {
          const csv = analytics.exportToCSV(exerciseKey);
          if (!csv) {
            const { ui: ui3 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
            ui3.toast("\u26A0\uFE0F No hay datos para exportar");
            return;
          }
          await utils.downloadCSV(csv, `${exerciseKey.replace(/\s+/g, "_")}_history.csv`);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 CSV exportado");
        },
        exportExerciseJSON: async (exerciseKey) => {
          const data = analytics.exportToJSON(exerciseKey);
          await utils.download(data, `${exerciseKey.replace(/\s+/g, "_")}_history.json`);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 JSON exportado");
        },
        exportSeasonJSON: async (seasonId) => {
          const { getDb: getDb2 } = await Promise.resolve().then(() => (init_data(), data_exports));
          const { seasons: seasons2 } = await Promise.resolve().then(() => (init_seasons(), seasons_exports));
          const report = seasons2.summary(getDb2(), seasonId);
          if (report) await utils.download({ export_type: "season_summary", exported_at: utils.isoNow(), ...report }, `season_${seasonId}.json`);
        },
        deleteSeasonFromManage: async (seasonId) => {
          if (!confirm("\xBFBorrar solo los metadatos de esta temporada?")) return;
          await logic.deleteSeason(seasonId);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        exportAllRMs: async () => {
          const state2 = getState();
          setState({ ...state2, modal: "export_all_rms" });
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.render();
        },
        downloadAll1RMsJSON: async () => {
          const data = analytics.exportAll1RMs();
          const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          await utils.download(data, `all_1RMs_${today}.json`);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast(`\u2713 ${data.total_exercises} ejercicios exportados`);
          await actions.closeModal();
        },
        downloadAll1RMsCSV: async () => {
          const csv = analytics.exportAll1RMsCSV();
          const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          await utils.downloadCSV(csv, `all_1RMs_summary_${today}.csv`);
          const { ui: ui2 } = await Promise.resolve().then(() => (init_ui(), ui_exports));
          ui2.toast("\u2713 CSV exportado");
          await actions.closeModal();
        }
      };
    }
  });

  // www/js/app.js
  init_config();
  init_utils();

  // www/js/capacitor-adapter.js
  init_config();
  var initAppListeners = async () => {
    const appPlugin = window.Capacitor?.Plugins?.App;
    if (!appPlugin?.addListener) return;
    const { getState: getState2 } = await Promise.resolve().then(() => (init_data(), data_exports));
    const { actions: actions2 } = await Promise.resolve().then(() => (init_actions(), actions_exports));
    await appPlugin.addListener("backButton", () => {
      const state2 = getState2();
      if (state2.modal || state2.setModal) {
        actions2.closeModal();
        actions2.closeSetModal();
        return;
      }
      switch (state2.view) {
        case "exercise":
          actions2.openSession(state2.activeSessionId);
          break;
        case "session":
          actions2.openWeek(state2.activeWeekId);
          break;
        case "week":
        case "history":
          actions2.goHome();
          break;
        case "home":
          appPlugin.exitApp?.();
          break;
        default:
          actions2.goHome();
      }
    });
  };

  // www/js/app.js
  init_ui();
  init_actions();
  init_logic();
  init_backup();
  var init = async () => {
    try {
      await initAppListeners();
    } catch (error) {
      console.error("No se pudo inicializar la integraci\xF3n nativa:", error);
    }
    utils.initTheme();
    ui.bindDelegated();
    await ui.render();
    console.log("%c Strength Tracker v6.7 (Integridad + Fusi\xF3n Segura)", "background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;");
  };
  init();
})();
