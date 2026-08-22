/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE FUSIÓN
 * [SEC-06] Motor de Fusión & Resolución de Conflictos
 * ============================================================================
 */

import { utils } from './utils.js';
import { getState, setState, setDb } from './data.js';
import { ui } from './ui.js';
import { backup } from './backup.js';

// Margen de tiempo (ms) para considerar dos modified_at como "iguales"
const TIMESTAMP_TOLERANCE_MS = 5000;

export const mergeEngine = {
    /**
     * Devuelve true si hay un conflicto real entre local e incoming.
     * Si ambos tienen modified_at válidos y la diferencia supera el margen,
     * la versión más reciente gana (no hay conflicto).
     */
    detectSessionConflict: (localS, incomingS) => {
        if (!localS || !incomingS) return false;
        const localSetsDone = (localS.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter(s => s.reps > 0).length || 0), 0);
        const incomingSetsDone = (incomingS.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter(s => s.reps > 0).length || 0), 0);

        if (localSetsDone === 0 && incomingSetsDone > 0) return false;
        if (incomingSetsDone === 0 && localSetsDone > 0) return false;
        if (localSetsDone === 0 && incomingSetsDone === 0) return false;

        // Comparar timestamps si ambos los tienen: latest wins evita conflicto falso
        const localTs = localS.modified_at ? new Date(localS.modified_at).getTime() : NaN;
        const incomingTs = incomingS.modified_at ? new Date(incomingS.modified_at).getTime() : NaN;
        if (!isNaN(localTs) && !isNaN(incomingTs)) {
            const diff = Math.abs(localTs - incomingTs);
            if (diff > TIMESTAMP_TOLERANCE_MS) return false; // latest wins, no conflict
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
    startDataMerge: async (importedData, actions, toastFn) => {
        // Backup pre-destrutivo antes de cualquier fusión
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

        Object.values(importedData.weeks || {}).forEach(incomingWeek => {
            const weekId = incomingWeek.week.week_id;
            const existingWeek = mergedWeeks[weekId];

            if (!existingWeek) {
                mergedWeeks[weekId] = incomingWeek;
            } else {
                const mergedSessions = [...existingWeek.sessions];
                const existingSessionMap = new Map();
                mergedSessions.forEach((s, idx) => existingSessionMap.set(s.session_id, { session: s, index: idx }));

                incomingWeek.sessions.forEach(incomingSession => {
                    const existing = existingSessionMap.get(incomingSession.session_id);
                    if (!existing) {
                        mergedSessions.push(incomingSession);
                    } else {
                        const isConflict = mergeEngine.detectSessionConflict(existing.session, incomingSession);
                        if (isConflict) {
                            conflicts.push({
                                type: 'session',
                                weekId: weekId,
                                weekNumber: existingWeek.week.week_number,
                                sessionId: incomingSession.session_id,
                                local: existing.session,
                                incoming: incomingSession
                            });
                        } else {
                            const incomingSets = (incomingSession.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter(s => s.reps > 0).length || 0), 0);
                            const localSets = (existing.session.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter(s => s.reps > 0).length || 0), 0);

                            // Nunca reemplazar una sesión registrada por una vacía.
                            if (localSets === 0 && incomingSets > 0) {
                                mergedSessions[existing.index] = incomingSession;
                            } else if (incomingSets === 0 && localSets > 0) {
                                mergedSessions[existing.index] = existing.session;
                            } else {
                                // Latest wins por timestamp; si no se puede, usar lógica de series.
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
            const state = getState();
            setState({
                ...state,
                pendingMergeData: mergedWeeks,
                pendingMergeSeasons: mergedSeasons,
                conflictQueue: conflicts,
                currentConflictIndex: 0,
                modal: 'conflict'
            });
            await ui.render();
        } else {
            currentData.weeks = mergedWeeks;
            currentData.seasons = mergedSeasons;
            utils.save(currentData, backup.auto);
            setDb(currentData);
            toastFn('✓ Datos fusionados sin conflictos');
            const state = getState();
            setState({ ...state, modal: null });
            await actions.goHome();
        }
    }
};
