/**
 * ============================================================================
 * STRENGTH TRACKER — MÓDULO DE UI
 * [SEC-09] Renderizado & Componentes UI
 * ============================================================================
 */

import { utils } from './utils.js';
import { logic } from './logic.js';
import { analytics } from './analytics.js';

let uiModule = null;

async function getUiDeps() {
    if (!uiModule) {
        const data = await import('./data.js');
        uiModule = {
            getDb: data.getDb,
            setDb: data.setDb,
            getState: data.getState,
            setState: data.setState
        };
    }
    return uiModule;
}

export const ui = {
    app: document.getElementById('app'),
    toast: (msg) => {
        const t = document.getElementById('toast');
        t.innerText = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    },
    getThemeIcon: () => document.body.className === 'dark' ? '☀️' : '🌙',
    render: async () => {
        const { getState } = await getUiDeps();
        const state = getState();
        ui.app.innerHTML = '';
        if (state.setModal) { await ui.renderSetModal(); return; }
        if (state.modal) { await ui.renderModal(); return; }
        switch (state.view) {
            case 'home': await ui.renderHome(); break;
            case 'planes': await ui.renderPlanes(); break;
            case 'week': await ui.renderWeek(); break;
            case 'session': await ui.renderSession(); break;
            case 'exercise': await ui.renderExercise(); break;
            case 'history': await ui.renderHistory(); break;
            case 'exercise_history': await ui.renderExerciseHistory(); break;
            default: await ui.renderHome();
        }
    },
    renderHome: async () => {
        ui.app.innerHTML = `
            <header>
                <h1>Strength Tracker</h1>
                <div class="flex gap-s">
                    <button class="icon-btn ghost" onclick="actions.openHelp()" title="Ayuda" aria-label="Abrir ayuda" style="color: var(--danger); font-size: 1.35rem; font-weight: 800;">?</button>
                    <button class="icon-btn ghost" onclick="utils.toggleTheme()" title="Cambiar tema" aria-label="Cambiar tema" style="font-size: 1.35rem;">${ui.getThemeIcon()}</button>
                </div>
            </header>
            <div class="container">
                <button class="nav-tile active" onclick="actions.openPlanes()" aria-label="Abrir Mis Planes">
                    <div class="nav-tile-icon" aria-hidden="true">📝</div>
                    <div class="nav-tile-body">
                        <div class="nav-tile-title">Mis Planes</div>
                        <div class="nav-tile-desc">Gestiona tus semanas y entrenamientos</div>
                    </div>
                </button>

                <button class="nav-tile" onclick="actions.openHistory()" aria-label="Abrir Historial de Ejercicios">
                    <div class="nav-tile-icon" aria-hidden="true">📊</div>
                    <div class="nav-tile-body">
                        <div class="nav-tile-title">Historial de Ejercicios</div>
                        <div class="nav-tile-desc">Consulta tu progreso y récords (1RM)</div>
                    </div>
                </button>

                <button class="nav-tile" onclick="actions.openAnalytics()" aria-label="Abrir Análisis de Esfuerzo">
                    <div class="nav-tile-icon" aria-hidden="true">📈</div>
                    <div class="nav-tile-body">
                        <div class="nav-tile-title">Análisis de Esfuerzo</div>
                        <div class="nav-tile-desc">Métricas de volumen, RPE y carga</div>
                    </div>
                </button>

                <div class="config-divider" role="separator" aria-label="Configuración">Configuración</div>

                <div class="settings-grid">
                    <button class="setting-tile" onclick="actions.openBackups()" aria-label="Abrir Backups">
                        <div class="setting-tile-icon" aria-hidden="true">💾</div>
                        <div class="setting-tile-title">Backups</div>
                    </button>
                    <button class="setting-tile" onclick="actions.openImport()" aria-label="Importar Plan">
                        <div class="setting-tile-icon" aria-hidden="true">📥</div>
                        <div class="setting-tile-title">Importar</div>
                    </button>
                </div>
            </div>
            <button class="fab" onclick="logic.createManualWeek()" aria-label="Crear nueva semana vacía" title="Crear semana">＋</button>
        `;
    },
    renderPlanes: async () => {
        const { getDb } = await getUiDeps();
        const db = getDb();
        const weeks = Object.values(db.weeks).sort((a,b) => b.week.week_number - a.week.week_number);
        ui.app.innerHTML = `
            <header>
                <button class="ghost" onclick="actions.goHome()" aria-label="Volver al inicio">← Volver</button>
                <h3>Mis Planes</h3>
                <div class="flex gap-s">
                    <button class="icon-btn ghost" onclick="utils.toggleTheme()" aria-label="Cambiar tema">${ui.getThemeIcon()}</button>
                </div>
            </header>
            <div class="container">
                <div class="flex justify-between align-center mb-m">
                    <span class="text-small text-muted">${weeks.length} ${weeks.length === 1 ? 'semana registrada' : 'semanas registradas'}</span>
                    <button class="primary small" onclick="logic.createManualWeek()" aria-label="Crear nueva semana">+ Nueva Semana</button>
                </div>
                <div class="flex-col gap-m">
                    ${weeks.length === 0 ? '<div class="card text-center text-muted" style="padding: 36px 16px;">No hay planes todavía.<br><span class="text-small mt-s display-block">Pulsa "+ Nueva Semana" o importa un archivo JSON.</span></div>' : ''}
                    ${weeks.map(w => {
                        const allDone = w.sessions.length > 0 && w.sessions.every(s => s.session_completion.status === 'completed');
                        return `
                        <div class="card ${allDone ? 'active' : ''}" onclick="actions.openWeek(decodeURIComponent('${utils.encodeParam(w.week.week_id)}'))" role="button" tabindex="0" aria-label="Abrir semana ${utils.esc(w.week.week_number)}" style="cursor: pointer;">
                            <div class="flex justify-between align-center mb-s">
                                <h3>Semana ${utils.esc(w.week.week_number)}</h3>
                                <span class="badge ${allDone ? 'completed' : ''}">${utils.esc(w.week.source || 'Manual')}</span>
                            </div>
                            <p class="text-small">${utils.esc(w.week.notes || 'Sin notas')}</p>
                            <div class="text-small text-muted mt-s">
                                ${w.sessions.length} ${w.sessions.length === 1 ? 'sesión' : 'sesiones'}
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
            <button class="fab" onclick="logic.createManualWeek()" aria-label="Crear nueva semana vacía" title="Crear semana">＋</button>
        `;
    },
    renderWeek: async () => {
        const { getState } = await getUiDeps();
        const state = getState();
        const w = await logic.getWeek(state.activeWeekId);
        if(!w) {
            const { actions } = await import('./actions.js');
            actions.goHome();
            return;
        }
        const { actions } = await import('./actions.js');
        ui.app.innerHTML = `
            <header>
                <button class="ghost" onclick="actions.goHome()">← Volver</button>
                <h3>S ${utils.esc(w.week.week_number)}</h3>
                <div class="flex gap-s">
                    <button class="icon-btn ghost" onclick="utils.toggleTheme()">${ui.getThemeIcon()}</button>
                    <button class="secondary small" onclick="actions.exportWeek()">JSON</button>
                </div>
            </header>
            <div class="container">
                <div class="flex justify-between mb-m">
                    <span class="text-small text-muted">ID: ${utils.esc(String(w.week.week_id).slice(0,8))}...</span>
                    <button class="danger small" onclick="logic.deleteWeek(decodeURIComponent('${utils.encodeParam(w.week.week_id)}'))">Borrar</button>
                </div>
                ${w.sessions.length === 0 ? '<div class="card text-center text-muted">Semana vacía</div>' : ''}
                ${w.sessions.map(s => {
                    const st = s.session_completion.status;
                    return `
                    <div class="card ${st === 'in_progress' ? 'active' : ''}">
                        <div class="flex justify-between mb-m">
                            <h3>${utils.esc(s.session_id)} • ${utils.esc(s.title || 'Entreno')}</h3>
                            <span class="badge ${st}">${utils.esc(st.replace('_', ' '))}</span>
                        </div>
                        <p class="text-small mb-m">${utils.esc(s.goal_summary || '')}</p>
                        <button class="primary w-full" onclick="actions.openSession(decodeURIComponent('${utils.encodeParam(s.session_id)}'))">
                            ${st === 'completed' ? 'Ver Resultados' : 'Abrir Sesión'}
                        </button>
                    </div>`;
                }).join('')}
                <button class="secondary w-full mt-m" onclick="logic.addSessionToWeek(decodeURIComponent('${utils.encodeParam(w.week.week_id)}'))">
                    + Añadir Día (Ad-hoc)
                </button>
            </div>
        `;
    },
    renderSession: async () => {
        const { getState } = await getUiDeps();
        const state = getState();
        const wId = state.activeWeekId;
        const sId = state.activeSessionId;
        const s = await logic.getSession(wId, sId);
        if (!s) {
            const { actions } = await import('./actions.js');
            actions.openWeek(wId);
            return;
        }
        const locked = s.session_completion.status === 'completed';
        const { actions } = await import('./actions.js');
        ui.app.innerHTML = `
            <header>
                <button class="ghost" onclick="actions.openWeek(decodeURIComponent('${utils.encodeParam(wId)}'))">← Semana</button>
                <h3>Sesión ${utils.esc(sId)}</h3>
                <button class="icon-btn ghost" onclick="utils.toggleTheme()">${ui.getThemeIcon()}</button>
            </header>
            <div class="container">
                <div class="mb-m">
                    <h2>${utils.esc(s.title || 'Sin Título')}</h2>
                    <p class="text-small text-muted">Duración: ~${utils.esc(s.estimated_duration_min || '?')} min</p>
                </div>
                ${s.exercises.map(ex => {
                    const plan = logic.getResolvedPlan(ex);
                    const setsDone = ex.execution.sets.filter(x => x.reps > 0).length;
                    const totalSets = plan.length;
                    const done = ex.completion.status === 'completed';
                    return `
                    <div class="card" style="border-left: 4px solid ${done ? 'var(--accent)' : 'transparent'}">
                        <div class="flex justify-between">
                            <h3 style="${done ? 'opacity:0.6':''}">${utils.esc(ex.name)}</h3>
                            ${ex.target_1rm ? `<span class="badge">1RM: ${utils.esc(ex.target_1rm.value)}</span>` : ''}
                        </div>
                        <div class="text-small text-muted mt-m mb-m">
                            ${utils.esc(ex.equipment_csv_name || ex.machine_name || 'General')}
                        </div>
                        <div class="flex justify-between align-center">
                            <span class="text-small font-bold">${setsDone} / ${totalSets} Sets</span>
                            <button class="primary small" onclick="actions.openExercise(decodeURIComponent('${utils.encodeParam(ex.exercise_id)}'))">
                                ${done ? 'Revisar' : 'Entrenar'}
                            </button>
                        </div>
                    </div>`;
                }).join('')}
                ${!locked ? `
                    <button class="secondary w-full mb-m" onclick="logic.addNewExerciseToSession(decodeURIComponent('${utils.encodeParam(wId)}'),decodeURIComponent('${utils.encodeParam(sId)}'))">
                        + Añadir Ejercicio Extra
                    </button>
                ` : ''}
                ${!locked ? `
                    <div class="card">
                        <label class="text-small text-muted mb-m display-block">Notas de la sesión</label>
                        <textarea rows="3" placeholder="Cómo te sentiste..." 
                            onchange="logic.updateSessionNote(decodeURIComponent('${utils.encodeParam(wId)}'),decodeURIComponent('${utils.encodeParam(sId)}'), this.value)">${utils.esc(s.session_notes || '')}</textarea>
                    </div>
                ` : (s.session_notes ? `
                    <div class="card">
                        <label class="text-small text-muted mb-m display-block">Notas de la sesión</label>
                        <p class="text-small">${utils.esc(s.session_notes)}</p>
                    </div>
                ` : '')}
                <div class="mt-m pt-m" style="border-top:1px solid var(--border)">
                    ${locked 
                        ? `<button class="secondary w-full" onclick="actions.viewReport()">Ver Reporte JSON</button>`
                        : `<button class="primary w-full" onclick="actions.finishSession()">Finalizar Sesión</button>`
                    }
                </div>
            </div>
        `;
    },
    renderExercise: async () => {
        const { getState } = await getUiDeps();
        const state = getState();
        const wId = state.activeWeekId;
        const sId = state.activeSessionId;
        const exId = state.activeExerciseId;
        const ex = await logic.getExercise(wId, sId, exId);
        const session = await logic.getSession(wId, sId);
        if (!ex || !session) {
            const { actions } = await import('./actions.js');
            actions.openSession(sId);
            return;
        }
        const locked = session.session_completion.status === 'completed';
        const planArr = logic.getResolvedPlan(ex);
        const execArr = ex.execution.sets;
        const totalRows = Math.max(planArr.length, execArr.length);
        const lastPlan = planArr.length > 0 ? planArr[planArr.length - 1] : { reps: 10, load: 20 };
        const nextEx = await logic.getNextExercise(wId, sId, exId);
        const { actions } = await import('./actions.js');
        
        ui.app.innerHTML = `
            <header>
                <button class="ghost" onclick="actions.openSession(decodeURIComponent('${utils.encodeParam(sId)}'))">← Volver</button>
                <button class="${ex.completion.status === 'completed' ? 'secondary' : 'ghost'}" onclick="logic.toggleComplete(decodeURIComponent('${utils.encodeParam(wId)}'),decodeURIComponent('${utils.encodeParam(sId)}'),decodeURIComponent('${utils.encodeParam(exId)}'))">
                    ${ex.completion.status === 'completed' ? '✔ Hecho' : 'Marcar Fin'}
                </button>
            </header>
            <div class="container">
                <div class="flex justify-between align-center mb-m">
                    <h2>${utils.esc(ex.name)}</h2>
                    <button class="secondary small" onclick="actions.openExerciseHistory(decodeURIComponent('${utils.encodeParam(ex.name)}'))">
                        📊 Historial
                    </button>
                </div>
                ${ex.recommendations ? `<p class="text-small card mb-m" style="background: var(--bg-input); padding: 12px;">${utils.esc(ex.recommendations)}</p>` : ''}
                ${!locked ? `
                <details class="mb-m">
                    <summary class="text-small text-muted" style="cursor:pointer; padding: 10px 0;">⚙️ Ajustar Plan</summary>
                    <div class="card mt-m">
                        <div class="flex gap-s">
                            <input id="ov_sets" type="number" inputmode="numeric" placeholder="Sets" value="${utils.esc(planArr.length)}">
                            <input id="ov_reps" type="number" inputmode="numeric" placeholder="Reps" value="${utils.esc(lastPlan.reps)}">
                            <input id="ov_load" type="number" inputmode="decimal" placeholder="Kg" value="${utils.esc(lastPlan.load)}" step="0.5">
                        </div>
                        <button class="primary w-full mt-m" onclick="
                            logic.applyFlatOverride(decodeURIComponent('${utils.encodeParam(wId)}'),decodeURIComponent('${utils.encodeParam(sId)}'),decodeURIComponent('${utils.encodeParam(exId)}'), 
                            document.getElementById('ov_sets').value, 
                            document.getElementById('ov_reps').value, 
                            document.getElementById('ov_load').value)
                        ">Aplicar Nuevo Plan</button>
                    </div>
                </details>` : ''}
                
                <div class="card">
                    <div class="set-row header">
                        <div class="text-center">#</div>
                        <div class="text-center" style="border-right:1px solid var(--border)">Plan</div>
                        <div class="text-center">Real (Reps/Kg)</div>
                        <div class="text-center"></div>
                    </div>
                    ${Array.from({length: totalRows}).map((_, i) => {
                        const p = planArr[i] || { reps: '-', load: '-', unit: '' };
                        const e = execArr[i] || { reps: null, load: null };
                        const showReps = (e.reps !== null && e.reps !== '') ? e.reps : (p.reps !== '-' ? p.reps : '');
                        const showLoad = (e.load !== null && e.load !== '') ? e.load : (p.load !== '-' ? p.load : '');
                        const isDone = e.reps !== null;
                        return `
                        <div class="set-row">
                            <div class="text-center font-bold text-muted">${i+1}</div>
                            <div class="plan-col">
                                <span style="font-size:1.1rem; font-weight:700">${utils.esc(p.reps)}</span>
                                <span class="text-small text-muted">${utils.esc(p.load)}</span>
                            </div>
                            <div class="flex gap-s">
                                <input type="number" inputmode="numeric" id="reps_${i}" class="stat-input" placeholder="Reps"
                                    value="${utils.esc(showReps)}" ${locked ? 'disabled' : ''}
                                    onchange="logic.updateSet(decodeURIComponent('${utils.encodeParam(wId)}'),decodeURIComponent('${utils.encodeParam(sId)}'),decodeURIComponent('${utils.encodeParam(exId)}'), ${i}, {reps: this.value});">
                                <input type="number" inputmode="decimal" step="0.5" id="load_${i}" class="stat-input" placeholder="Kg"
                                    value="${utils.esc(showLoad)}" ${locked ? 'disabled' : ''}
                                    onchange="logic.updateSet(decodeURIComponent('${utils.encodeParam(wId)}'),decodeURIComponent('${utils.encodeParam(sId)}'),decodeURIComponent('${utils.encodeParam(exId)}'), ${i}, {load: this.value});">
                            </div>
                            <div class="flex justify-center">
                                <button class="icon-btn check-btn ${isDone ? 'done' : ''}" 
                                    onclick="actions.openSetModal(decodeURIComponent('${utils.encodeParam(wId)}'),decodeURIComponent('${utils.encodeParam(sId)}'),decodeURIComponent('${utils.encodeParam(exId)}'), ${i})">
                                    ${isDone ? '✔' : '○'}
                                </button>
                            </div>
                        </div>`;
                    }).join('')}
                    ${!locked ? `<button class="ghost w-full mt-m" onclick="logic.addSet(decodeURIComponent('${utils.encodeParam(wId)}'),decodeURIComponent('${utils.encodeParam(sId)}'),decodeURIComponent('${utils.encodeParam(exId)}'))">+ Set Extra</button>` : ''}
                </div>
                
                <div class="card">
                    <label class="text-small text-muted mb-m display-block">Notas del Ejercicio</label>
                    <textarea rows="3" placeholder="Sensaciones, ajustes..." ${locked ? 'disabled' : ''}
                        onchange="logic.updateExerciseNote(decodeURIComponent('${utils.encodeParam(wId)}'),decodeURIComponent('${utils.encodeParam(sId)}'),decodeURIComponent('${utils.encodeParam(exId)}'), this.value)">${utils.esc(ex.notes || '')}</textarea>
                </div>
                
                ${!locked && nextEx ? `
                    <button class="primary w-full mt-m" onclick="actions.openExercise(decodeURIComponent('${utils.encodeParam(nextEx.exercise_id)}'))">
                        Siguiente: ${utils.esc(nextEx.name)} →
                    </button>
                ` : ''}
                ${!locked && !nextEx ? `
                    <button class="secondary w-full mt-m" onclick="actions.openSession(decodeURIComponent('${utils.encodeParam(sId)}'))">
                        ← Volver a Sesión
                    </button>
                ` : ''}
            </div>
        `;
    },
    renderHistory: async () => {
        const exercises = analytics.getAllExercises();
        const { actions } = await import('./actions.js');
        ui.app.innerHTML = `
            <header>
                <button class="ghost" onclick="actions.goHome()">← Volver</button>
                <h3>Historial</h3>
                <button class="icon-btn ghost" onclick="utils.toggleTheme()">${ui.getThemeIcon()}</button>
            </header>
            <div class="container">
                <div class="flex justify-between align-center mb-m">
                    <h2 class="mb-m">Progreso</h2>
                    <button class="secondary small" onclick="actions.exportAllRMs()">📥 Exportar Todo</button>
                </div>
                ${exercises.length === 0 ? `
                    <div class="card text-center text-muted">
                        No hay datos de ejercicios completados.
                    </div>
                ` : ''}
                ${exercises.map(exName => {
                    const best1RM = analytics.getBest1RM(exName);
                    const history = analytics.getExerciseHistory(exName);
                    const lastSession = history[0];
                    return `
                        <div class="card" onclick="actions.openExerciseHistory(decodeURIComponent('${utils.encodeParam(exName)}'))">
                            <div class="flex justify-between align-center mb-m">
                                <h3>${utils.esc(exName)}</h3>
                                ${best1RM ? `<span class="rm-badge">${utils.esc(best1RM)} kg</span>` : ''}
                            </div>
                            <div class="text-small text-muted">
                                ${lastSession ? `Último: ${utils.formatDate(lastSession.date)} - ${utils.esc(lastSession.load)}kg × ${utils.esc(lastSession.reps)}` : 'Sin datos'}
                            </div>
                            <div class="text-small text-muted mt-m">
                                ${history.length} ${history.length === 1 ? 'serie' : 'series'} registradas
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    renderExerciseHistory: async () => {
        const { getState } = await getUiDeps();
        const state = getState();
        const exName = state.historyExercise;
        const records = analytics.get1RMRecords(exName);
        const monthlySummary = analytics.get1RMMonthlySummary(exName);
        const recentSets = analytics.getRecentSets(exName, 30);
        const best1RM = analytics.getBest1RM(exName);
        const { actions } = await import('./actions.js');

        ui.app.innerHTML = `
            <header>
                <button class="ghost" onclick="actions.openHistory()">← Historial</button>
                <h3>Progreso</h3>
                <button class="icon-btn ghost" onclick="utils.toggleTheme()">${ui.getThemeIcon()}</button>
            </header>
            <div class="container">
                <div class="card">
                    <h2 class="mb-m">${utils.esc(exName)}</h2>
                    ${best1RM ? `
                        <div class="flex justify-between align-center mb-m">
                            <span class="text-small text-muted">Mejor 1RM Estimado</span>
                            <span class="rm-badge" style="font-size: 1.1rem;">${utils.esc(best1RM)} kg</span>
                        </div>
                    ` : ''}
                </div>
                
                <details class="mb-m" open>
                    <summary>📈 Evolución de 1RM (Récords)</summary>
                    <div class="card mt-m">
                        ${records.length === 0 ? '<p class="text-small text-muted text-center">Sin récords aún</p>' : ''}
                        ${records.map((r, idx) => `
                            <div class="flex justify-between align-center" style="padding: 12px 0; ${idx < records.length - 1 ? 'border-bottom: 1px solid var(--border);' : ''}">
                                <div>
                                    <div class="font-bold">${utils.esc(r.value)} kg</div>
                                    <div class="text-small text-muted">${utils.formatDate(r.date)}</div>
                                </div>
                                <div class="text-small">
                                    ${utils.esc(r.load)}kg × ${utils.esc(r.reps)}
                                    ${r.improvement > 0 ? `<span style="color: var(--accent)"> (+${utils.esc(r.improvement.toFixed(1))})</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </details>
                
                <details class="mb-m">
                    <summary>📅 Resumen Mensual (Mejor 1RM)</summary>
                    <div class="card mt-m">
                        ${monthlySummary.length === 0 ? '<p class="text-small text-muted text-center">Sin datos mensuales</p>' : ''}
                        ${monthlySummary.map((m, idx) => `
                            <div class="flex justify-between align-center" style="padding: 12px 0; ${idx < monthlySummary.length - 1 ? 'border-bottom: 1px solid var(--border);' : ''}">
                                <div>
                                    <div class="font-bold">${utils.formatMonth(m.month)}</div>
                                    <div class="text-small text-muted">${utils.formatDate(m.date)}</div>
                                </div>
                                <div class="text-small">
                                    <span class="rm-badge">${utils.esc(m.value)} kg</span>
                                    <div class="text-muted">${utils.esc(m.load)}kg × ${utils.esc(m.reps)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </details>

                <details class="mb-m" open>
                    <summary>🗓️ Sets Recientes (último mes)</summary>
                    <div class="card mt-m">
                        ${recentSets.length === 0 ? '<p class="text-small text-muted text-center">Sin sets recientes</p>' : ''}
                        <table class="progress-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Set</th>
                                    <th>Reps</th>
                                    <th>Kg</th>
                                    <th>1RM</th>
                                    <th>RIR</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentSets.map(h => `
                                    <tr>
                                        <td class="text-small">${utils.formatDate(h.date)}</td>
                                        <td>${utils.esc(h.setIndex)}</td>
                                        <td><strong>${utils.esc(h.reps)}</strong></td>
                                        <td><strong>${utils.esc(h.load)}</strong></td>
                                        <td class="text-small text-muted">${utils.esc(h.estimated1RM || '-')}</td>
                                        <td class="text-small">${h.rir !== null ? utils.esc(h.rir) : '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </details>

                <div class="card">
                    <h3 class="mb-m">Exportar Histórico Completo</h3>
                    <div class="export-row">
                        <button class="secondary" onclick="actions.exportExerciseCSV(decodeURIComponent('${utils.encodeParam(exName)}'))">
                            📊 CSV
                        </button>
                        <button class="secondary" onclick="actions.exportExerciseJSON(decodeURIComponent('${utils.encodeParam(exName)}'))">
                            📄 JSON
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    renderModal: async () => {
        const { getState } = await getUiDeps();
        const state = getState();
        const { actions } = await import('./actions.js');
        const { backup } = await import('./backup.js');

        if (state.modal === 'help') {
            ui.app.innerHTML = `
                <div class="modal-overlay" onclick="event.target === this && actions.closeModal()" role="dialog" aria-modal="true" aria-labelledby="help-title">
                    <div class="modal-content">
                        <h2 id="help-title">¿Cómo usar Strength Tracker?</h2>
                        <div class="flex-col gap-m mt-m">
                            <p><strong>📝 Mis Planes</strong> — Crea o importa semanas de entrenamiento. Pulsa + para crear una nueva.</p>
                            <p><strong>📊 Historial</strong> — Consulta tu progreso y los récords de 1RM estimados.</p>
                            <p><strong>📈 Análisis</strong> — Volumen por sesión, RPE y carga total.</p>
                            <p><strong>💾 Backups</strong> — Crea copias de seguridad o restaura versiones anteriores.</p>
                            <p><strong>📥 Importar</strong> — Carga un JSON de plan de entrenamiento.</p>
                            <p class="text-small text-muted mt-s">Tus datos se guardan localmente en este dispositivo. Recuerda crear backups periódicamente.</p>
                        </div>
                        <button class="primary w-full mt-l" onclick="actions.closeModal()" aria-label="Cerrar ayuda">Entendido</button>
                    </div>
                </div>
            `;
            return;
        }

        if (state.modal === 'import') {
            ui.app.innerHTML = `
                <div class="modal-overlay" onclick="event.target === this && actions.closeModal()">
                    <div class="modal-content">
                        <h3>Importar JSON</h3>
                        <p class="text-small mb-m">Elige una opción:</p>
                        <button class="primary w-full mb-m" onclick="actions.pasteFromClipboard()">
                            📋 Pegar desde portapapeles
                        </button>
                        <div class="divider">o</div>
                        <div class="file-input-wrapper">
                            <div class="text-small">📂 Seleccionar archivo</div>
                            <input type="file" accept="*/*" id="fileUpload" onchange="actions.handleFileSelect(this)">
                        </div>
                        <div class="divider">o</div>
                        <textarea id="jsonInput" rows="5" placeholder='Pegar JSON aquí...'></textarea>
                        <div class="flex gap-s mt-m">
                            <button class="ghost w-full" onclick="actions.closeModal()">Cancelar</button>
                            <button class="primary w-full" onclick="actions.doImport()">Importar</button>
                        </div>
                    </div>
                </div>`;
        }
        if (state.modal === 'backups') {
            const backupList = backup.list();
            ui.app.innerHTML = `
                <div class="modal-overlay" onclick="event.target === this && actions.closeModal()">
                    <div class="modal-content">
                        <h3>Gestión de Backups</h3>
                        <p class="text-small mb-m">Backups automáticos (últimos 5):</p>
                        ${backupList.length === 0 ? `
                            <div class="card text-center text-muted">
                                No hay backups disponibles.
                            </div>
                        ` : `
                            <button class="secondary w-full mb-m" onclick="backup.downloadAll(ui.toast)">
                                📥 Descargar TODOS los backups
                            </button>
                            <div class="flex-col gap-s mb-m">
                                ${backupList.map(date => `
                                    <div class="card">
                                        <div class="flex justify-between align-center mb-m">
                                            <span class="font-bold">${utils.formatDate(date)}</span>
                                        </div>
                                        <div class="flex gap-s">
                                            <button class="secondary w-full" onclick="backup.restore(decodeURIComponent('${utils.encodeParam(date)}'), actions, ui.toast)">
                                                Restaurar
                                            </button>
                                            <button class="primary w-full" onclick="backup.download(decodeURIComponent('${utils.encodeParam(date)}'), ui.toast)">
                                                📥 Bajar
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                        <div class="section-header">Restaurar desde archivo</div>
                        <button class="primary w-full mb-m" onclick="actions.pasteBackupFromClipboard()">
                            📋 Pegar backup desde portapapeles
                        </button>
                        <div class="divider">o</div>
                        <div class="file-input-wrapper">
                            <div class="text-small">📂 Seleccionar archivo backup</div>
                            <input type="file" accept="*/*" id="backupFileUpload" onchange="actions.handleBackupFileSelect(this)">
                        </div>
                        <div class="divider">o</div>
                        <textarea id="backupJsonInput" rows="4" placeholder='Pegar JSON del backup...'></textarea>
                        <div class="flex-col gap-s mt-m mb-m">
                            <button class="primary w-full" onclick="actions.restoreFromBackupJSON('merge')">
                                🔄 Fusionar con Datos Actuales
                                <div class="text-small" style="font-weight:normal; margin-top:2px; opacity:0.9">Compara y resuelve conflictos si los hay.</div>
                            </button>
                            <button class="danger w-full" onclick="actions.restoreFromBackupJSON('replace')">
                                ⚠️ Sobrescribir Todo
                                <div class="text-small" style="font-weight:normal; margin-top:2px; opacity:0.9">Borra datos actuales y pone el backup.</div>
                            </button>
                        </div>
                        <button class="ghost w-full" onclick="actions.closeModal()">Cerrar</button>
                    </div>
                </div>`;
        }
        if (state.modal === 'conflict') {
            const conflict = state.conflictQueue[state.currentConflictIndex];
            const totalConflicts = state.conflictQueue.length;
            const currentNum = state.currentConflictIndex + 1;

            if (!conflict) {
                await actions.finishConflictResolution();
                return;
            }

            const localSets = (conflict.local.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter(s => s.reps > 0).length || 0), 0);
            const incomingSets = (conflict.incoming.exercises || []).reduce((acc, e) => acc + (e.execution?.sets?.filter(s => s.reps > 0).length || 0), 0);

            ui.app.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="flex justify-between align-center mb-m">
                            <h3>⚠️ Conflicto (${currentNum} de ${totalConflicts})</h3>
                            <span class="badge warning">Divergencia</span>
                        </div>
                        <p class="text-small mb-m">
                            Existe información diferente para <strong>Semana ${utils.esc(conflict.weekNumber)} — ${utils.esc(conflict.sessionId)} (${utils.esc(conflict.local.title || 'Sesión')})</strong>:
                        </p>
                        
                        <div class="comparison-box">
                            <div class="flex justify-between align-center mb-m">
                                <strong>🏠 En este dispositivo (Local)</strong>
                                <span class="badge ${conflict.local.session_completion.status}">${utils.esc(conflict.local.session_completion.status)}</span>
                            </div>
                            <div class="text-small text-muted">
                                • Series completadas: <strong>${localSets}</strong><br>
                                • Modificado: ${utils.formatDate(conflict.local.modified_at)}<br>
                                • Notas: ${utils.esc(conflict.local.session_notes || 'Sin notas')}
                            </div>
                        </div>

                        <div class="comparison-box">
                            <div class="flex justify-between align-center mb-m">
                                <strong>📥 Archivo importado</strong>
                                <span class="badge ${conflict.incoming.session_completion.status}">${utils.esc(conflict.incoming.session_completion.status)}</span>
                            </div>
                            <div class="text-small text-muted">
                                • Series completadas: <strong>${incomingSets}</strong><br>
                                • Modificado: ${utils.formatDate(conflict.incoming.modified_at)}<br>
                                • Notas: ${utils.esc(conflict.incoming.session_notes || 'Sin notas')}
                            </div>
                        </div>

                        <p class="text-small font-bold mt-m mb-m">¿Qué versión deseas conservar?</p>
                        <div class="flex-col gap-s mb-m">
                            <button class="secondary w-full" onclick="actions.resolveConflictChoice('local')">
                                🏠 Conservar Mi Versión (Local)
                            </button>
                            <button class="primary w-full" onclick="actions.resolveConflictChoice('incoming')">
                                📥 Usar Versión Importada
                            </button>
                            <button class="ghost w-full" onclick="actions.resolveConflictChoice('both')">
                                ➕ Conservar Ambas (Crear copia con nuevo ID)
                            </button>
                        </div>
                        
                        ${totalConflicts > 1 ? `
                            <div class="divider">aplicar a todos</div>
                            <div class="flex gap-s">
                                <button class="ghost small w-full" onclick="actions.resolveAllConflicts('local')">Todas Local</button>
                                <button class="ghost small w-full" onclick="actions.resolveAllConflicts('incoming')">Todas Importada</button>
                            </div>
                        ` : ''}
                    </div>
                </div>`;
        }
        if (state.modal === 'export_all_rms') {
            const exercises = analytics.getAllExercises();
            const totalExercises = exercises.length;
            const { actions } = await import('./actions.js');
            ui.app.innerHTML = `
                <div class="modal-overlay" onclick="event.target === this && actions.closeModal()">
                    <div class="modal-content">
                        <h3>Exportar Todos los 1RM</h3>
                        <p class="text-small mb-m">${totalExercises} ejercicios encontrados</p>
                        <div class="card">
                            <h3 class="mb-m">Formato</h3>
                            <div class="flex-col gap-s">
                                <button class="primary w-full" onclick="actions.downloadAll1RMsJSON()">
                                    📄 JSON Completo
                                    <div class="text-small" style="font-weight: normal; margin-top: 4px;">
                                        Incluye todos los récords y resumen mensual
                                    </div>
                                </button>
                                <button class="secondary w-full" onclick="actions.downloadAll1RMsCSV()">
                                    📊 CSV Resumen
                                    <div class="text-small" style="font-weight: normal; margin-top: 4px;">
                                        Tabla con mejores marcas por ejercicio
                                    </div>
                                </button>
                            </div>
                        </div>
                        <button class="ghost w-full mt-m" onclick="actions.closeModal()">
                            Cancelar
                        </button>
                    </div>
                </div>`;
        }
    },
    renderSetModal: async () => {
        const { getState } = await getUiDeps();
        const state = getState();
        const { wId, sId, exId, setIndex, currentReps, currentLoad } = state.setModal;
        const ex = await logic.getExercise(wId, sId, exId);
        if (!ex) {
            const { actions } = await import('./actions.js');
            actions.closeSetModal();
            return;
        }
        const set = ex.execution.sets[setIndex] || { reps: null, load: null, rir: null, notes: "" };
        const planArr = logic.getResolvedPlan(ex);
        const totalSets = planArr.length;
        
        const reps = currentReps !== undefined ? currentReps : (set.reps || '');
        const load = currentLoad !== undefined ? currentLoad : (set.load || '');
        
        const { actions } = await import('./actions.js');
        const { getState: gs } = await getUiDeps();
        const s = gs();
        const selectedRIR = s.selectedRIR;

        ui.app.innerHTML = `
            <div class="modal-overlay" onclick="event.target === this && actions.closeSetModal()">
                <div class="modal-content">
                    <h3>✓ Guardar Set ${setIndex + 1} de ${totalSets}</h3>
                    <div class="card mt-m">
                        <div class="flex gap-s mb-m">
                            <div class="flex-col w-full">
                                <label class="text-small text-muted mb-m">Reps</label>
                                <input id="modal_reps" type="number" inputmode="numeric" value="${utils.esc(reps)}">
                            </div>
                            <div class="flex-col w-full">
                                <label class="text-small text-muted mb-m">Carga (kg)</label>
                                <input id="modal_load" type="number" inputmode="decimal" step="0.5" value="${utils.esc(load)}">
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <label class="text-small text-muted mb-m display-block">¿Cuántas repeticiones te quedaban? (RIR)</label>
                        <div class="rir-selector">
                            <button class="rir-btn ${(set.rir !== null && set.rir !== undefined) ? (set.rir === 0 ? 'selected' : '') : (selectedRIR === 0 ? 'selected' : '')}" onclick="actions.selectRIR(0)">0</button>
                            <button class="rir-btn ${(set.rir !== null && set.rir !== undefined) ? (set.rir === 1 ? 'selected' : '') : (selectedRIR === 1 ? 'selected' : '')}" onclick="actions.selectRIR(1)">1</button>
                            <button class="rir-btn ${(set.rir !== null && set.rir !== undefined) ? (set.rir === 2 ? 'selected' : '') : (selectedRIR === 2 ? 'selected' : '')}" onclick="actions.selectRIR(2)">2</button>
                            <button class="rir-btn ${(set.rir !== null && set.rir !== undefined) ? (set.rir === 3 ? 'selected' : '') : (selectedRIR === 3 ? 'selected' : '')}" onclick="actions.selectRIR(3)">3</button>
                            <button class="rir-btn ${(set.rir !== null && set.rir !== undefined) ? (set.rir === 4 ? 'selected' : '') : (selectedRIR === 4 ? 'selected' : '')}" onclick="actions.selectRIR(4)">4+</button>
                        </div>
                        <div class="flex justify-between text-small text-muted" style="margin-top: 8px;">
                            <span>Fallo</span>
                            <span>Reserva</span>
                        </div>
                    </div>
                    <div class="card">
                        <label class="text-small text-muted mb-m display-block">Nota (opcional)</label>
                        <textarea id="modal_notes" rows="2" placeholder="Técnica, sensaciones...">${utils.esc(set.notes || '')}</textarea>
                    </div>
                    <div class="flex-col gap-s mt-m">
                        <button class="primary w-full" onclick="actions.saveSetWithRIR()">
                            ✓ Guardar
                        </button>
                        <button class="ghost w-full" onclick="actions.saveSetWithoutRIR()">
                            Guardar sin RIR
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};
