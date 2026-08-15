/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE LÓGICA DE NEGOCIO
 * [SEC-08] Lógica de Negocio & Mutaciones
 * ============================================================================
 */

import { utils } from './utils.js';
import { validate } from './validate.js';
import { wakeLock } from './config.js';
import { backup } from './backup.js';

let logicModule = null;

async function getLogicDeps() {
    if (!logicModule) {
        const data = await import('./data.js');
        logicModule = {
            getDb: data.getDb,
            setDb: data.setDb,
            getState: data.getState,
            setState: data.setState
        };
    }
    return logicModule;
}

export const logic = {
    createManualWeek: async () => {
        const { getDb, setDb } = await getLogicDeps();
        const db = getDb();
        const weekNum = Object.keys(db.weeks).length + 1;
        const weekId = utils.uuid();
        const newWeek = {
            week: { week_id: weekId, week_number: weekNum, source: "Manual", modified_at: utils.isoNow() },
            sessions: [],
            generated_at: utils.isoNow()
        };
        db.weeks[weekId] = newWeek;
        utils.save(db, backup.auto);
        const { setDb: sd } = await getLogicDeps();
        sd(db);
        const { ui } = await import('./ui.js');
        ui.toast("✓ Semana creada");
        const { getState, setState } = await getLogicDeps();
        const state = getState();
        setState({ ...state, activeWeekId: weekId });
        const { actions } = await import('./actions.js');
        actions.openWeek(weekId);
    },
    addSessionToWeek: async (weekId) => {
        const { getDb, setDb } = await getLogicDeps();
        const db = getDb();
        const week = db.weeks[weekId];
        if (!week) return;
        const nextSessionNum = week.sessions.length + 1;
        const sessionId = `Día ${nextSessionNum}`;
        const newSession = {
            session_id: sessionId,
            title: "Nueva Sesión Ad-Hoc",
            goal_summary: "Sesión añadida manualmente",
            estimated_duration_min: 45,
            session_completion: { status: 'pending', started_at: null, completed_at: null },
            session_notes: "",
            exercises: [],
            modified_at: utils.isoNow()
        };
        week.sessions.push(newSession);
        week.modified_at = utils.isoNow();
        utils.save(db, backup.auto);
        setDb(db);
        const { ui } = await import('./ui.js');
        ui.toast("✓ Sesión añadida");
        ui.render();
    },
    createWeekFromImport: async (cleanWeekObj, actions) => {
        const weekId = cleanWeekObj.week.week_id;
        const { mergeEngine } = await import('./merge.js');
        const { ui } = await import('./ui.js');
        await mergeEngine.startDataMerge({
            weeks: { [weekId]: cleanWeekObj }
        }, actions, (msg) => ui.toast(msg));
        return weekId;
    },
    getWeek: async (id) => {
        const { getDb } = await getLogicDeps();
        const db = getDb();
        return db.weeks[id];
    },
    getSession: async (wId, sId) => {
        const { getDb } = await getLogicDeps();
        const db = getDb();
        return db.weeks[wId]?.sessions.find(s => s.session_id === sId);
    },
    getExercise: async (wId, sId, exId) => {
        const session = await logic.getSession(wId, sId);
        return session?.exercises.find(e => e.exercise_id === exId);
    },
    getResolvedPlan: (ex) => {
        if (!ex) return [];
        if (ex.override) {
            const sets = [];
            for (let i = 0; i < ex.override.planned_sets; i++) {
                sets.push({ set_index: i, reps: ex.override.planned_reps, load: ex.override.planned_load, unit: 'kg', source: 'override' });
            }
            return sets;
        }
        if (ex.baseline && ex.baseline.set_plan && Array.isArray(ex.baseline.set_plan)) {
            return ex.baseline.set_plan.map(s => ({ ...s, source: 'baseline' }));
        }
        if (ex.baseline && ex.baseline.planned_sets) {
            const sets = [];
            for(let i=0; i<ex.baseline.planned_sets; i++) {
                sets.push({ set_index: i, reps: ex.baseline.planned_reps, load: ex.baseline.planned_load, unit: 'kg', source: 'baseline_flat'});
            }
            return sets;
        }
        return [];
    },
    startSession: async (wId, sId) => {
        const s = await logic.getSession(wId, sId);
        if (s && s.session_completion.status === 'pending') {
            s.session_completion.status = 'in_progress';
            s.session_completion.started_at = utils.isoNow();
            s.modified_at = utils.isoNow();
            const { getDb, setDb } = await getLogicDeps();
            const db = getDb();
            utils.save(db, backup.auto);
            setDb(db);
            await wakeLock.request();
        }
    },
    finishSession: async (wId, sId) => {
        const s = await logic.getSession(wId, sId);
        if (!s) return null;
        s.session_completion.status = 'completed';
        s.session_completion.completed_at = utils.isoNow();
        s.modified_at = utils.isoNow();
        const { getDb, setDb } = await getLogicDeps();
        const db = getDb();
        utils.save(db, backup.auto);
        setDb(db);
        await wakeLock.release();
        return logic.generateReport(wId, sId);
    },
    updateSet: async (wId, sId, exId, setIndex, data) => {
        const ex = await logic.getExercise(wId, sId, exId);
        if (!ex) return;
        while(ex.execution.sets.length <= setIndex) {
            ex.execution.sets.push({ reps: null, load: null, rir: null, notes: "" });
        }
        const set = ex.execution.sets[setIndex];
        if (data.reps !== undefined) set.reps = data.reps !== null && data.reps !== '' ? parseFloat(data.reps) : null;
        if (data.load !== undefined) set.load = data.load !== null && data.load !== '' ? parseFloat(data.load) : null;
        if (data.rir !== undefined) set.rir = data.rir;
        if (data.notes !== undefined) set.notes = validate.string(data.notes, 500);
        set.completed_at = utils.isoNow();
        ex.modified_at = utils.isoNow();
        const { getDb, setDb } = await getLogicDeps();
        const db = getDb();
        utils.save(db, backup.auto);
        setDb(db);
    },
    updateExerciseNote: async (wId, sId, exId, text) => {
        const ex = await logic.getExercise(wId, sId, exId);
        if (!ex) return;
        ex.notes = validate.string(text, 2000);
        ex.modified_at = utils.isoNow();
        const { getDb, setDb } = await getLogicDeps();
        const db = getDb();
        utils.save(db, backup.auto);
        setDb(db);
    },
    updateSessionNote: async (wId, sId, text) => {
        const s = await logic.getSession(wId, sId);
        if (!s) return;
        s.session_notes = validate.string(text, 2000);
        s.modified_at = utils.isoNow();
        const { getDb, setDb } = await getLogicDeps();
        const db = getDb();
        utils.save(db, backup.auto);
        setDb(db);
    },
    addSet: async (wId, sId, exId) => {
        const ex = await logic.getExercise(wId, sId, exId);
        if (!ex) return;
        ex.execution.sets.push({ reps: 0, load: 0, rir: null, notes: "", is_extra: true, completed_at: utils.isoNow() });
        ex.modified_at = utils.isoNow();
        const { getDb, setDb } = await getLogicDeps();
        const db = getDb();
        utils.save(db, backup.auto);
        setDb(db);
        const { ui } = await import('./ui.js');
        ui.render();
    },
    applyFlatOverride: async (wId, sId, exId, sets, reps, load) => {
        try {
            const ex = await logic.getExercise(wId, sId, exId);
            if (!ex) return;
            const validSets = validate.number(sets, 1, 50, 'Sets');
            const validReps = validate.number(reps, 1, 200, 'Reps');
            const validLoad = validate.number(load, 0, 2000, 'Carga');
            ex.override = { planned_sets: validSets, planned_reps: validReps, planned_load: validLoad };
            ex.modified_at = utils.isoNow();
            const { getDb, setDb } = await getLogicDeps();
            const db = getDb();
            utils.save(db, backup.auto);
            setDb(db);
            const { ui } = await import('./ui.js');
            ui.toast('✓ Plan actualizado');
            ui.render();
        } catch(e) {
            console.warn('Error al aplicar override:', e);
            const { ui } = await import('./ui.js');
            ui.toast(`⚠️ ${e.message}`);
        }
    },
    toggleComplete: async (wId, sId, exId) => {
        const ex = await logic.getExercise(wId, sId, exId);
        if (!ex) return;
        ex.completion.status = ex.completion.status === 'completed' ? 'pending' : 'completed';
        ex.completion.completed_at = ex.completion.status === 'completed' ? utils.isoNow() : null;
        ex.modified_at = utils.isoNow();
        const { getDb, setDb } = await getLogicDeps();
        const db = getDb();
        utils.save(db, backup.auto);
        setDb(db);
        const { ui } = await import('./ui.js');
        ui.render();
    },
    addNewExerciseToSession: async (wId, sId) => {
        const name = prompt("Nombre del nuevo ejercicio:");
        if(!name || name.trim() === '') return;
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
            completion: { status: 'pending', completed_at: null },
            notes: "",
            modified_at: utils.isoNow()
        };
        s.exercises.push(newEx);
        s.modified_at = utils.isoNow();
        const { getDb, setDb } = await getLogicDeps();
        const db = getDb();
        utils.save(db, backup.auto);
        setDb(db);
        const { ui } = await import('./ui.js');
        ui.render();
        ui.toast("✓ Ejercicio añadido");
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
        const hasCompleted = w.sessions.some(s => s.session_completion.status === 'completed');
        if (hasCompleted) {
            if (!confirm(`⚠️ La semana ${w.week.week_number} tiene sesiones completadas.\n\n¿Borrar?`)) return;
        }
        if(confirm(`¿Borrar semana ${w.week.week_number}?`)) {
            const { getDb, setDb } = await getLogicDeps();
            const db = getDb();
            delete db.weeks[id];
            utils.save(db, backup.auto);
            setDb(db);
            const { actions } = await import('./actions.js');
            actions.goHome();
            const { ui } = await import('./ui.js');
            ui.toast('✓ Semana eliminada');
        }
    },
    getNextExercise: async (wId, sId, currentExId) => {
        const s = await logic.getSession(wId, sId);
        if (!s) return null;
        const currentIdx = s.exercises.findIndex(e => e.exercise_id === currentExId);
        if (currentIdx === -1 || currentIdx === s.exercises.length - 1) return null;
        return s.exercises[currentIdx + 1];
    }
};
