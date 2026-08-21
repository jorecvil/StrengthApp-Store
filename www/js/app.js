/**
 * ============================================================================
 * STRENGTH TRACKER — PUNTO DE ENTRADA PRINCIPAL
 * [SEC-11] Integración Nativa & Arranque
 * ============================================================================
 */

import { wakeLock } from './config.js';
import { utils } from './utils.js';
import { initAppListeners } from './capacitor-adapter.js';
import { ui } from './ui.js';
import { actions } from './actions.js';
import { logic } from './logic.js';
import { backup } from './backup.js';
import { analytics } from './analytics.js';

// Legacy templates still use static handlers. Only code-controlled module APIs
// are exposed; imported data is passed through data attributes and validation.
Object.assign(window, { actions, analytics, backup, logic, ui, utils });

export const init = async () => {
    try {
        await initAppListeners();
    } catch (error) {
        // El back handler nativo no puede impedir que la interfaz se inicie.
        console.error('No se pudo inicializar la integración nativa:', error);
    }
    utils.initTheme();
    ui.bindDelegated();
    await ui.render();
    console.log('%c Strength Tracker v6.7 (Integridad + Fusión Segura)', 'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
};

init();
