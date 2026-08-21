/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE ADAPTADOR CAPACITOR
 * [SEC-11] Integración Nativa
 * ============================================================================
 */

import { wakeLock } from './config.js';

export const initAppListeners = async () => {
    const appPlugin = window.Capacitor?.Plugins?.App;
    if (!appPlugin?.addListener) return;

    const { getState } = await import('./data.js');
    const { actions } = await import('./actions.js');

    await appPlugin.addListener('backButton', () => {
        const state = getState();
        if (state.modal || state.setModal) {
            actions.closeModal();
            actions.closeSetModal();
            return;
        }
        switch (state.view) {
            case 'exercise': actions.openSession(state.activeSessionId); break;
            case 'session': actions.openWeek(state.activeWeekId); break;
            case 'week': case 'history': actions.goHome(); break;
            case 'home': appPlugin.exitApp?.(); break;
            default: actions.goHome();
        }
    });
};
