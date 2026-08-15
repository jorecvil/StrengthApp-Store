/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE DATOS Y ESTADO
 * [SEC-02] Modelo de Datos & Estado Reactivo
 * ============================================================================
 */

import { utils } from './utils.js';

let db = utils.load();
let state = {
    view: 'home',
    activeWeekId: null,
    activeSessionId: null,
    activeExerciseId: null,
    historyExercise: null,
    modal: null,
    setModal: null,
    conflictQueue: [],
    currentConflictIndex: 0,
    pendingMergeData: null,
    selectedRIR: null
};

export const getDb = () => db;
export const setDb = (newDb) => { db = newDb; };
export const getState = () => state;
export const setState = (newState) => { state = newState; };
