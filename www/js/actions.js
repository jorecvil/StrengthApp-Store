/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE ACCIONES
 * [SEC-10] Controladores de Eventos & Acciones
 * ============================================================================
 */

import { wakeLock } from './config.js';
import { utils } from './utils.js';
import { validate } from './validate.js';
import { backup } from './backup.js';
import { analytics } from './analytics.js';
import { mergeEngine } from './merge.js';
import { logic } from './logic.js';
import { getState, setState } from './data.js';

let lastRIR = null;

export const actions = {
    goHome: async () => {
        const state = getState();
        setState({
            ...state,
            view: 'home',
            activeWeekId: null,
            activeSessionId: null,
            activeExerciseId: null
        });
        await wakeLock.release();
        const { ui } = await import('./ui.js');
        ui.render();
    },
    openWeek: async (id) => {
        const state = getState();
        setState({
            ...state,
            activeWeekId: id,
            view: 'week'
        });
        const { ui } = await import('./ui.js');
        ui.render();
    },
    openSession: async (id) => {
        const state = getState();
        setState({
            ...state,
            activeSessionId: id,
            view: 'session'
        });
        await logic.startSession(state.activeWeekId, id);
        const { ui } = await import('./ui.js');
        ui.render();
    },
    openExercise: async (id) => {
        const state = getState();
        setState({
            ...state,
            activeExerciseId: id,
            view: 'exercise'
        });
        const { ui } = await import('./ui.js');
        ui.render();
    },
    openHistory: async () => {
        const state = getState();
        setState({ ...state, view: 'history' });
        const { ui } = await import('./ui.js');
        ui.render();
    },
    openExerciseHistory: async (exerciseName) => {
        const state = getState();
        setState({
            ...state,
            historyExercise: exerciseName,
            view: 'exercise_history'
        });
        const { ui } = await import('./ui.js');
        ui.render();
    },
    openImport: async () => {
        const state = getState();
        setState({ ...state, modal: 'import' });
        const { ui } = await import('./ui.js');
        ui.render();
    },
    openBackups: async () => {
        const state = getState();
        setState({ ...state, modal: 'backups' });
        const { ui } = await import('./ui.js');
        ui.render();
    },
    closeModal: async () => {
        const state = getState();
        setState({ ...state, modal: null });
        const { ui } = await import('./ui.js');
        ui.render();
    },
    openSetModal: async (wId, sId, exId, setIndex) => {
        const repsInput = document.getElementById(`reps_${setIndex}`);
        const loadInput = document.getElementById(`load_${setIndex}`);
        const currentReps = repsInput ? repsInput.value : undefined;
        const currentLoad = loadInput ? loadInput.value : undefined;

        const state = getState();
        setState({
            ...state,
            setModal: { wId, sId, exId, setIndex, currentReps, currentLoad }
        });
        const { ui } = await import('./ui.js');
        ui.render();
    },
    closeSetModal: async () => {
        const state = getState();
        setState({ ...state, setModal: null });
        const { ui } = await import('./ui.js');
        ui.render();
    },
    selectRIR: async (value) => {
        document.querySelectorAll('.rir-btn').forEach(btn => btn.classList.remove('selected'));
        if (event && event.target) event.target.classList.add('selected');
        const state = getState();
        setState({ ...state, selectedRIR: value });
        lastRIR = value; 
    },
    saveSetWithoutRIR: async () => {
        const state = getState();
        const { wId, sId, exId, setIndex } = state.setModal;
        const reps = document.getElementById('modal_reps').value;
        const load = document.getElementById('modal_load').value;
        const notes = document.getElementById('modal_notes').value;

        if (!reps || !load) {
            const { ui } = await import('./ui.js');
            ui.toast('⚠️ Completa reps y carga');
            return;
        }
        
        await logic.updateSet(wId, sId, exId, setIndex, {
            reps: parseFloat(reps),
            load: parseFloat(load),
            rir: null,
            notes: notes
        });
        setState({ ...state, setModal: null });
        const { ui } = await import('./ui.js');
        ui.toast('✓ Set guardado');
        ui.render();
    },
    saveSetWithRIR: async () => {
        const state = getState();
        const { wId, sId, exId, setIndex } = state.setModal;
        const reps = document.getElementById('modal_reps').value;
        const load = document.getElementById('modal_load').value;
        const notes = document.getElementById('modal_notes').value;
        const selectedBtn = document.querySelector('.rir-btn.selected');
        const rir = selectedBtn ? parseInt(selectedBtn.textContent, 10) : null;
        
        if (!reps || !load) {
            const { ui } = await import('./ui.js');
            ui.toast('⚠️ Completa reps y carga');
            return;
        }
        
        await logic.updateSet(wId, sId, exId, setIndex, {
            reps: parseFloat(reps),
            load: parseFloat(load),
            rir: rir,
            notes: notes
        });
        setState({ ...state, setModal: null });
        const { ui } = await import('./ui.js');
        ui.toast('✓ Set guardado');
        ui.render();
    },
    pasteFromClipboard: async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text || text.trim() === '') {
                const { ui } = await import('./ui.js');
                ui.toast('⚠️ Portapapeles vacío');
                return;
            }
            document.getElementById('jsonInput').value = text;
            const { ui } = await import('./ui.js');
            ui.toast('✓ Pegado');
        } catch(err) {
            console.warn('Error al leer portapapeles:', err);
            const { ui } = await import('./ui.js');
            ui.toast('⚠️ No se pudo acceder al portapapeles');
        }
    },
    pasteBackupFromClipboard: async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text || text.trim() === '') {
                const { ui } = await import('./ui.js');
                ui.toast('⚠️ Portapapeles vacío');
                return;
            }
            document.getElementById('backupJsonInput').value = text;
            const { ui } = await import('./ui.js');
            ui.toast('✓ Pegado');
        } catch(err) {
            console.warn('Error al leer portapapeles:', err);
            const { ui } = await import('./ui.js');
            ui.toast('⚠️ No se pudo acceder al portapapeles');
        }
    },
    handleFileSelect: async (input) => {
        const file = input.files[0];
        if(!file) return;
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (e) => {
                document.getElementById('jsonInput').value = e.target.result;
                const { ui } = await import('./ui.js');
                ui.toast("✓ Archivo cargado");
                resolve();
            };
            reader.onerror = async () => {
                const { ui } = await import('./ui.js');
                ui.toast("⚠️ Error al leer archivo");
                reject();
            };
            reader.readAsText(file);
        });
    },
    handleBackupFileSelect: async (input) => {
        const file = input.files[0];
        if(!file) return;
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = async (e) => {
                document.getElementById('backupJsonInput').value = e.target.result;
                const { ui } = await import('./ui.js');
                ui.toast("✓ Archivo cargado");
                resolve();
            };
            reader.onerror = async () => {
                const { ui } = await import('./ui.js');
                ui.toast("⚠️ Error al leer archivo");
                reject();
            };
            reader.readAsText(file);
        });
    },
    doImport: async () => {
        try {
            const val = document.getElementById('jsonInput').value;
            if(!val || !val.trim()) {
                const { ui } = await import('./ui.js');
                ui.toast("⚠️ Contenido vacío");
                return;
            }
            const cleanWeek = validate.json(val);
            await logic.createWeekFromImport(cleanWeek, actions);
            const state = getState();
            if (!state.modal) {
                // Navigation will be handled by createWeekFromImport
            }
        } catch(e) {
            console.error('Error durante importación:', e);
            const { ui } = await import('./ui.js');
            ui.toast(`⚠️ ${e.message}`);
        }
    },
    restoreFromBackupJSON: async (mode) => {
        const val = document.getElementById('backupJsonInput').value;
        if(!val || !val.trim()) {
            const { ui } = await import('./ui.js');
            ui.toast("⚠️ Contenido vacío");
            return;
        }
        
        const { ui } = await import('./ui.js');
        const { setDb } = await import('./data.js');
        
        try {
            const data = validate.backupJSON(val);
            if (mode === 'replace') {
                if (!confirm(`⚠️ ALERTA DE BORRADO\n\nVas a reemplazar TODA la base de datos con este backup. Se perderán los datos actuales no guardados.\n\n¿Continuar?`)) return;
                utils.save(data);
                const newDb = utils.load();
                setDb(newDb);
                ui.toast('✓ Base de datos reemplazada');
                await actions.goHome();
            } else {
                await mergeEngine.startDataMerge(data, actions, (msg) => ui.toast(msg));
            }
        } catch(e) {
            console.error('Error restaurando backup:', e);
            ui.toast(`⚠️ ${e.message}`);
        }
    },
    resolveConflictChoice: async (choice) => {
        const state = getState();
        const conflict = state.conflictQueue[state.currentConflictIndex];
        if (!conflict) return;

        const week = state.pendingMergeData[conflict.weekId];
        if (week) {
            const sessionIdx = week.sessions.findIndex(s => s.session_id === conflict.sessionId);
            if (choice === 'incoming' && sessionIdx !== -1) {
                week.sessions[sessionIdx] = conflict.incoming;
            } else if (choice === 'both') {
                const copySession = {
                    ...conflict.incoming,
                    session_id: `${conflict.incoming.session_id} (Importada)`,
                    title: `${conflict.incoming.title} (Copia)`,
                    modified_at: utils.isoNow()
                };
                week.sessions.push(copySession);
            }
        }

        const newIndex = state.currentConflictIndex + 1;
        if (newIndex >= state.conflictQueue.length) {
            await actions.finishConflictResolution();
        } else {
            setState({ ...state, currentConflictIndex: newIndex });
            const { ui } = await import('./ui.js');
            ui.render();
        }
    },
    resolveAllConflicts: async (choice) => {
        while (true) {
            const state = getState();
            if (state.currentConflictIndex >= state.conflictQueue.length) break;
            await actions.resolveConflictChoice(choice);
        }
    },
    finishConflictResolution: async () => {
        const state = getState();
        const { setDb } = await import('./data.js');
        const currentData = utils.load();
        currentData.weeks = state.pendingMergeData;
        utils.save(currentData, backup.auto);
        setDb(currentData);
        setState({
            ...state,
            conflictQueue: [],
            currentConflictIndex: 0,
            pendingMergeData: null,
            modal: null
        });
        const { ui } = await import('./ui.js');
        ui.toast('✓ Fusión completada con tus decisiones');
        await actions.goHome();
    },
    finishSession: async () => {
        const state = getState();
        const s = await logic.getSession(state.activeWeekId, state.activeSessionId);
        if (!s) return;
        const incomplete = s.exercises.filter(e => e.completion.status !== 'completed');
        if (incomplete.length > 0) {
            if (!confirm(`⚠️ Hay ${incomplete.length} ejercicio(s) sin completar.\n\n¿Finalizar?`)) return;
        }
        if(confirm("✓ ¿Finalizar sesión?")) {
            await logic.finishSession(state.activeWeekId, state.activeSessionId);
            await actions.viewReport();
        }
    },
    viewReport: async () => {
        const state = getState();
        const data = await logic.generateReport(state.activeWeekId, state.activeSessionId);
        await utils.download(data, `report_${state.activeSessionId}_${new Date().toISOString().split('T')[0]}.json`);
        const { ui } = await import('./ui.js');
        ui.toast("✓ Reporte descargado");
        await actions.goHome();
    },
    exportWeek: async () => {
        const state = getState();
        const w = await logic.getWeek(state.activeWeekId);
        if (!w) return;
        await utils.download(w, `week_${w.week.week_number}_${new Date().toISOString().split('T')[0]}.json`);
        const { ui } = await import('./ui.js');
        ui.toast("✓ Semana exportada");
    },
    exportExerciseCSV: async (exerciseName) => {
        const csv = analytics.exportToCSV(exerciseName);
        if (!csv) {
            const { ui } = await import('./ui.js');
            ui.toast('⚠️ No hay datos para exportar');
            return;
        }
        await utils.downloadCSV(csv, `${exerciseName.replace(/\s+/g, '_')}_history.csv`);
        const { ui } = await import('./ui.js');
        ui.toast('✓ CSV exportado');
    },
    exportExerciseJSON: async (exerciseName) => {
        const data = analytics.exportToJSON(exerciseName);
        await utils.download(data, `${exerciseName.replace(/\s+/g, '_')}_history.json`);
        const { ui } = await import('./ui.js');
        ui.toast('✓ JSON exportado');
    },
    exportAllRMs: async () => {
        const state = getState();
        setState({ ...state, modal: 'export_all_rms' });
        const { ui } = await import('./ui.js');
        ui.render();
    },
    downloadAll1RMsJSON: async () => {
        const data = analytics.exportAll1RMs();
        const today = new Date().toISOString().split('T')[0];
        await utils.download(data, `all_1RMs_${today}.json`);
        const { ui } = await import('./ui.js');
        ui.toast(`✓ ${data.total_exercises} ejercicios exportados`);
        await actions.closeModal();
    },
    downloadAll1RMsCSV: async () => {
        const csv = analytics.exportAll1RMsCSV();
        const today = new Date().toISOString().split('T')[0];
        await utils.downloadCSV(csv, `all_1RMs_summary_${today}.csv`);
        const { ui } = await import('./ui.js');
        ui.toast('✓ CSV exportado');
        await actions.closeModal();
    }
};
