/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE ADAPTADOR CAPACITOR
 * [SEC-11] Integración Nativa
 * ============================================================================
 */

import { wakeLock } from './config.js';

export const initAppListeners = async () => {
    if (window.Capacitor) {
        const { App } = Capacitor.Plugins;
        const { getState, setState } = await import('./data.js');
        const { actions } = await import('./actions.js');

        await App.addListener('backButton', ({ canGoBack }) => {
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
                case 'home': App.exitApp(); break;
                default: actions.goHome();
            }
        });
    }
};
