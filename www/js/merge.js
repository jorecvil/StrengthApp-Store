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

export const mergeEngine = {
    detectSessionConflict: (localS, incomingS) => {
        if (!localS || !incomingS) return false;
        const localSetsDone = (localS.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter(s => s.reps > 0).length || 0), 0);
        const incomingSetsDone = (incomingS.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter(s => s.reps > 0).length || 0), 0);
        
        if (localSetsDone === 0 && incomingSetsDone > 0) return false;
        if (incomingSetsDone === 0 && localSetsDone > 0) return false;
        if (localSetsDone === 0 && incomingSetsDone === 0) return false;

        const localJSON = JSON.stringify(localS.exercises || []);
        const incomingJSON = JSON.stringify(incomingS.exercises || []);
        return localJSON !== incomingJSON;
    },

    startDataMerge: async (importedData, actions, toastFn) => {
        const currentData = utils.load();
        const conflicts = [];
        const mergedWeeks = { ...currentData.weeks };

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
                            if (incomingSets >= localSets) {
                                mergedSessions[existing.index] = incomingSession;
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
                conflictQueue: conflicts,
                currentConflictIndex: 0,
                modal: 'conflict'
            });
            await ui.render();
        } else {
            currentData.weeks = mergedWeeks;
            utils.save(currentData, backup.auto);
            setDb(currentData);
            toastFn('✓ Datos fusionados sin conflictos');
            const state = getState();
            setState({ ...state, modal: null });
            await actions.goHome();
        }
    }
};
