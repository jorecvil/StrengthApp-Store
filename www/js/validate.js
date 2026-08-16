/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE VALIDACIÓN
 * [SEC-04] Validación Exhaustiva & Sanitización de Entrada
 * ============================================================================
 */

import { MAX_IMPORT_BYTES } from './config.js';
import { utils } from './utils.js';

export const validate = {
    number: (value, min, max, name) => {
        const num = parseFloat(value);
        if (isNaN(num)) throw new Error(`${name} debe ser un número válido`);
        if (num < min || num > max) throw new Error(`${name} debe estar entre ${min} y ${max}`);
        return num;
    },
    string: (value, maxLength = 500, name = 'Campo', defaultVal = '') => {
        if (value === null || value === undefined) return defaultVal;
        const str = String(value).trim();
        if (str.length > maxLength) return str.substring(0, maxLength);
        return str;
    },
    json: (str) => {
        if (!str || typeof str !== 'string') throw new Error("Entrada vacía o no es texto");
        if (str.length > MAX_IMPORT_BYTES) throw new Error("El archivo excede el tamaño máximo permitido (5 MB)");
        
        let obj;
        try {
            obj = JSON.parse(str);
        } catch(e) {
            throw new Error(`JSON malformado: ${e.message}`);
        }
        
        if (!obj || typeof obj !== 'object') throw new Error("El JSON debe contener un objeto");
        if (!obj.week_ref && !obj.week) throw new Error("Falta el campo 'week_ref' o 'week'");
        
        const weekObj = obj.week_ref || obj.week;
        if (typeof weekObj !== 'object') throw new Error("'week_ref' debe ser un objeto");
        
        const sessions = obj.sessions;
        if (!sessions || !Array.isArray(sessions)) throw new Error("'sessions' debe ser una lista");
        if (sessions.length > 50) throw new Error("La semana contiene demasiadas sesiones (máximo 50)");

        return validate.sanitizeWeekObject({
            week: weekObj,
            sessions: sessions,
            generated_at: obj.generated_at || utils.isoNow()
        });
    },
    backupJSON: (str) => {
        if (!str || typeof str !== 'string') throw new Error("Entrada de backup vacía");
        if (str.length > MAX_IMPORT_BYTES * 2) throw new Error("El archivo de backup supera el límite permitido");
        
        let obj;
        try {
            obj = JSON.parse(str);
        } catch(e) {
            throw new Error(`Backup JSON malformado: ${e.message}`);
        }
        
        if (!obj || typeof obj !== 'object') throw new Error("Formato de backup inválido");
        
        let extractedData = null;
        if (obj.backup_meta && obj.data) {
            extractedData = obj.data;
        } else if (obj.weeks && typeof obj.weeks === 'object') {
            extractedData = obj;
        } else if (obj.export_meta && Array.isArray(obj.backups) && obj.backups.length > 0) {
            extractedData = obj.backups[0].data;
        }
        
        if (!extractedData || !extractedData.weeks || typeof extractedData.weeks !== 'object') {
            throw new Error("El archivo no contiene semanas válidas");
        }
        
        const cleanWeeks = {};
        Object.entries(extractedData.weeks).forEach(([key, w]) => {
            if (w && typeof w === 'object') {
                try {
                    const cleanWeek = validate.sanitizeWeekObject(w);
                    cleanWeeks[cleanWeek.week.week_id] = cleanWeek;
                } catch (err) {
                    console.warn(`Semana ignorada por error de validación: ${key}`, err);
                }
            }
        });
        
        return {
            schema_version: 2,
            weeks: cleanWeeks,
            modified_at: utils.isoNow()
        };
    },
    sanitizeWeekObject: (raw) => {
        const rawWeek = raw.week || raw.week_ref || {};
        const weekId = validate.string(rawWeek.week_id, 64, 'week_id', utils.uuid());
        let weekNum = parseInt(rawWeek.week_number, 10);
        if (isNaN(weekNum) || weekNum < 1) weekNum = 1;
        
        const cleanWeekRef = {
            week_id: weekId,
            week_number: weekNum,
            source: validate.string(rawWeek.source, 50, 'source', 'Importado'),
            notes: validate.string(rawWeek.notes, 1000, 'notes', ''),
            modified_at: rawWeek.modified_at || raw.generated_at || utils.isoNow()
        };

        const rawSessions = Array.isArray(raw.sessions) ? raw.sessions : [];
        const cleanSessions = rawSessions.slice(0, 50).map((s, sIdx) => {
            const sId = validate.string(s.session_id, 64, 'session_id', `Día ${sIdx + 1}`);
            const completion = s.session_completion || {};
            const validStatus = ['pending', 'in_progress', 'completed'].includes(completion.status) ? completion.status : 'pending';
            
            const rawExercises = Array.isArray(s.exercises) ? s.exercises : [];
            const cleanExercises = rawExercises.slice(0, 50).map((e, eIdx) => {
                const exId = validate.string(e.exercise_id, 64, 'exercise_id', utils.uuid());
                const exName = validate.string(e.name, 100, 'name', `Ejercicio ${eIdx + 1}`);
                
                let baseline = null;
                if (e.baseline && typeof e.baseline === 'object') {
                    if (Array.isArray(e.baseline.set_plan)) {
                        baseline = {
                            set_plan: e.baseline.set_plan.slice(0, 50).map((sp, spIdx) => ({
                                set_index: parseInt(sp.set_index, 10) || (spIdx + 1),
                                reps: Math.min(200, Math.max(1, parseInt(sp.reps, 10) || 10)),
                                load: Math.min(2000, Math.max(0, parseFloat(sp.load) || 0)),
                                unit: validate.string(sp.unit, 10, 'unit', 'kg')
                            }))
                        };
                    } else {
                        baseline = {
                            planned_sets: Math.min(50, Math.max(1, parseInt(e.baseline.planned_sets, 10) || 3)),
                            planned_reps: Math.min(200, Math.max(1, parseInt(e.baseline.planned_reps, 10) || 10)),
                            planned_load: Math.min(2000, Math.max(0, parseFloat(e.baseline.planned_load) || 0))
                        };
                    }
                }
                
                let override = null;
                if (e.override && typeof e.override === 'object') {
                    override = {
                        planned_sets: Math.min(50, Math.max(1, parseInt(e.override.planned_sets, 10) || 3)),
                        planned_reps: Math.min(200, Math.max(1, parseInt(e.override.planned_reps, 10) || 10)),
                        planned_load: Math.min(2000, Math.max(0, parseFloat(e.override.planned_load) || 0))
                    };
                }

                const rawSets = e.execution && Array.isArray(e.execution.sets) ? e.execution.sets : [];
                const cleanSets = rawSets.slice(0, 50).map((st, stIdx) => {
                    const reps = st.reps !== null && st.reps !== undefined && st.reps !== '' ? Math.min(999, Math.max(0, parseFloat(st.reps))) : null;
                    const load = st.load !== null && st.load !== undefined && st.load !== '' ? Math.min(9999, Math.max(0, parseFloat(st.load))) : null;
                    let rir = st.rir !== null && st.rir !== undefined && st.rir !== '' ? parseInt(st.rir, 10) : null;
                    if (rir !== null && (isNaN(rir) || rir < 0 || rir > 4)) rir = null;

                    return {
                        set_index: stIdx,
                        reps: reps,
                        load: load,
                        rir: rir,
                        notes: validate.string(st.notes, 500, 'set_notes', ''),
                        completed_at: st.completed_at || null,
                        is_extra: Boolean(st.is_extra)
                    };
                });

                const exCompletion = e.completion || {};
                return {
                    exercise_id: exId,
                    name: exName,
                    machine_name: validate.string(e.machine_name || e.equipment_csv_name, 100, 'machine_name', 'General'),
                    equipment_csv_name: validate.string(e.equipment_csv_name, 100, 'equipment_csv_name', ''),
                    recommendations: validate.string(e.recommendations, 500, 'recommendations', ''),
                    baseline: baseline,
                    override: override,
                    execution: { sets: cleanSets },
                    completion: {
                        status: exCompletion.status === 'completed' ? 'completed' : 'pending',
                        completed_at: exCompletion.completed_at || null
                    },
                    notes: validate.string(e.notes, 2000, 'notes', ''),
                    modified_at: e.modified_at || utils.isoNow()
                };
            });

            return {
                session_id: sId,
                title: validate.string(s.title, 100, 'title', 'Entreno'),
                goal_summary: validate.string(s.goal_summary, 500, 'goal_summary', ''),
                estimated_duration_min: parseInt(s.estimated_duration_min, 10) || 45,
                session_completion: {
                    status: validStatus,
                    started_at: completion.started_at || null,
                    completed_at: completion.completed_at || null
                },
                session_notes: validate.string(s.session_notes, 2000, 'session_notes', ''),
                exercises: cleanExercises,
                modified_at: s.modified_at || utils.isoNow()
            };
        });

        return {
            week: cleanWeekRef,
            sessions: cleanSessions,
            generated_at: raw.generated_at || utils.isoNow()
        };
    }
};
