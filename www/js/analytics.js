/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE ANALÍTICA
 * [SEC-07] Analítica & Métricas de Fuerza
 * ============================================================================
 */

import { utils } from './utils.js';
import { getDb } from './data.js';

export const analytics = {
    estimate1RM: (weight, reps) => {
        if (!weight || !reps) return null;
        if (reps === 1) return weight;
        return Math.round(weight * (1 + reps / 30) * 10) / 10;
    },
    getExerciseHistory: (exerciseName) => {
        const sessions = [];
        const db = getDb();
        Object.values(db.weeks).forEach(w => {
            w.sessions.forEach(s => {
                if (s.session_completion.status !== 'completed') return;
                s.exercises.filter(e => e.name === exerciseName).forEach(e => {
                    e.execution.sets.forEach((set, idx) => {
                        if (set.load && set.reps) {
                            sessions.push({
                                date: s.session_completion.completed_at || s.session_completion.started_at,
                                weekNum: w.week.week_number,
                                sessionId: s.session_id,
                                setIndex: idx + 1,
                                reps: set.reps,
                                load: set.load,
                                estimated1RM: analytics.estimate1RM(set.load, set.reps),
                                rir: set.rir !== undefined ? set.rir : null,
                                notes: set.notes || ""
                            });
                        }
                    });
                });
            });
        });
        return sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    getBest1RM: (exerciseName) => {
        const history = analytics.getExerciseHistory(exerciseName);
        if (history.length === 0) return null;
        return history.reduce((best, curr) => (curr.estimated1RM > best) ? curr.estimated1RM : best, 0);
    },
    get1RMRecords: (exerciseName) => {
        const history = analytics.getExerciseHistory(exerciseName);
        if (history.length === 0) return [];
        const records = [];
        let currentBest = 0;
        history.reverse().forEach(session => {
            if (session.estimated1RM > currentBest) {
                records.push({
                    date: session.date,
                    value: session.estimated1RM,
                    improvement: currentBest > 0 ? session.estimated1RM - currentBest : 0,
                    reps: session.reps,
                    load: session.load
                });
                currentBest = session.estimated1RM;
            }
        });
        return records.reverse();
    },
    get1RMMonthlySummary: (exerciseName) => {
        const history = analytics.getExerciseHistory(exerciseName);
        if (history.length === 0) return [];
        const monthlyBest = {};
        history.forEach(session => {
            const date = new Date(session.date);
            if (isNaN(date.getTime())) return;
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyBest[monthKey] || session.estimated1RM > monthlyBest[monthKey].value) {
                monthlyBest[monthKey] = { month: monthKey, value: session.estimated1RM, date: session.date, reps: session.reps, load: session.load };
            }
        });
        return Object.values(monthlyBest).sort((a, b) => b.month.localeCompare(a.month));
    },
    getRecentSets: (exerciseName, days = 30) => {
        const history = analytics.getExerciseHistory(exerciseName);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return history.filter(s => new Date(s.date) >= cutoffDate);
    },
    getAllExercises: () => {
        const db = getDb();
        const exercises = new Set();
        Object.values(db.weeks).forEach(w => {
            w.sessions.forEach(s => {
                s.exercises.forEach(e => exercises.add(e.name));
            });
        });
        return Array.from(exercises).sort();
    },
    exportToCSV: (exerciseName) => {
        const history = analytics.getExerciseHistory(exerciseName);
        if (history.length === 0) return null;
        let csv = 'Fecha,Ejercicio,Set,Reps,Carga,1RM_Estimado,RIR,Notas\n';
        history.forEach(h => {
            const date = utils.formatDate(h.date);
            const rir = h.rir !== null ? h.rir : '-';
            const notes = (h.notes || '').replace(/"/g, '""');
            csv += `"${date}","${exerciseName.replace(/"/g, '""')}",${h.setIndex},${h.reps},${h.load},${h.estimated1RM || '-'},${rir},"${notes}"\n`;
        });
        return csv;
    },
    exportToJSON: (exerciseName) => {
        const history = analytics.getExerciseHistory(exerciseName);
        return {
            exercise: exerciseName,
            exported_at: new Date().toISOString(),
            best_1rm: analytics.getBest1RM(exerciseName),
            total_sets: history.length,
            history: history
        };
    },
    exportAll1RMs: () => {
        const exercises = analytics.getAllExercises();
        const all1RMs = [];
        exercises.forEach(exName => {
            const best1RM = analytics.getBest1RM(exName);
            const records = analytics.get1RMRecords(exName);
            const monthlySummary = analytics.get1RMMonthlySummary(exName);
            all1RMs.push({
                exercise: exName,
                best_1rm: best1RM,
                total_records: records.length,
                records: records,
                monthly_summary: monthlySummary
            });
        });
        return {
            exported_at: new Date().toISOString(),
            total_exercises: exercises.length,
            exercises: all1RMs
        };
    },
    exportAll1RMsCSV: () => {
        const exercises = analytics.getAllExercises();
        let csv = 'Ejercicio,Mejor 1RM (kg),Fecha Mejor,Histórico Récords\n';
        exercises.forEach(exName => {
            const best1RM = analytics.getBest1RM(exName);
            const records = analytics.get1RMRecords(exName);
            const bestRecord = records.length > 0 ? records[0] : null;
            const recordHistory = records.map(r => `${r.value}kg (${utils.formatDate(r.date)})`).join(' → ');
            csv += `"${exName.replace(/"/g, '""')}",${best1RM || '-'},${bestRecord ? utils.formatDate(bestRecord.date) : '-'},"${recordHistory.replace(/"/g, '""')}"\n`;
        });
        return csv;
    }
};
