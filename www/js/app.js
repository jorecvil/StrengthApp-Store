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

export const init = async () => {
    await initAppListeners();
    utils.initTheme();
    await ui.render();
    console.log('%c Strength Tracker v6.7 (Integridad + Fusión Segura)', 'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
};

init();
