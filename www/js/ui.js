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
            case 'analytics': await ui.renderAnalytics(); break;
            default: await ui.renderHome();
        }
    },
    renderHome: async () => {
        ui.app.innerHTML = `
            <header>
                <h1>Strength Tracker</h1>
                <div class="flex gap-s">
                    <button type="button" class="icon-btn ghost" data-action="openHelp" title="Ayuda" aria-label="Abrir ayuda" style="color: var(--danger); font-size: 1.35rem; font-weight: 800;">?</button>
                    <button type="button" class="icon-btn ghost" data-action="toggleTheme" title="Cambiar tema" aria-label="Cambiar tema" style="font-size: 1.35rem;">${ui.getThemeIcon()}</button>
                </div>
            </header>
            <div class="container">
                <button type="button" class="nav-tile active" data-action="openPlanes" aria-label="Abrir Mis Planes">
                    <div class="nav-tile-icon" aria-hidden="true">📝</div>
                    <div class="nav-tile-body">
                        <div class="nav-tile-title">Mis Planes</div>
                        <div class="nav-tile-desc">Gestiona tus semanas y entrenamientos</div>
                    </div>
                </button>

                <button type="button" class="nav-tile" data-action="openHistory" aria-label="Abrir Historial de Ejercicios">
                    <div class="nav-tile-icon" aria-hidden="true">📊</div>
                    <div class="nav-tile-body">
                        <div class="nav-tile-title">Historial de Ejercicios</div>
                        <div class="nav-tile-desc">Consulta tu progreso y récords (1RM)</div>
                    </div>
                </button>

                <button type="button" class="nav-tile" data-action="openAnalytics" aria-label="Abrir Análisis de Esfuerzo">
                    <div class="nav-tile-icon" aria-hidden="true">📈</div>
                    <div class="nav-tile-body">
                        <div class="nav-tile-title">Análisis de Esfuerzo</div>
                        <div class="nav-tile-desc">Métricas de volumen, RPE y carga</div>
                    </div>
                </button>

                <div class="config-divider" role="separator" aria-label="Configuración">Configuración</div>

                <div class="settings-grid">
                    <button type="button" class="setting-tile" data-action="openBackups" aria-label="Abrir Backups">
                        <div class="setting-tile-icon" aria-hidden="true">💾</div>
                        <div class="setting-tile-title">Backups</div>
                    </button>
                    <button type="button" class="setting-tile" data-action="openImport" aria-label="Importar Plan">
                        <div class="setting-tile-icon" aria-hidden="true">📥</div>
                        <div class="setting-tile-title">Importar</div>
                    </button>
                </div>
            </div>
            <button type="button" class="fab" data-action="createManualWeek" aria-label="Crear nueva semana vacía" title="Crear semana">＋</button>
        `;
    },
    renderPlanes: async () => {
        const { getDb } = await getUiDeps();
        const db = getDb();
        const weeks = Object.values(db.weeks).sort((a,b) => b.week.week_number - a.week.week_number);
        ui.app.innerHTML = `
            <header>
                <button type="button" class="ghost" data-action="goHome" aria-label="Volver al inicio">← Volver</button>
                <h3>Mis Planes</h3>
                <div class="flex gap-s">
                    <button type="button" class="icon-btn ghost" data-action="toggleTheme" aria-label="Cambiar tema">${ui.getThemeIcon()}</button>
                </div>
            </header>
            <div class="container">
                <div class="flex justify-between align-center mb-m">
                    <span class="text-small text-muted">${weeks.length} ${weeks.length === 1 ? 'semana registrada' : 'semanas registradas'}</span>
                    <button type="button" class="primary small" data-action="createManualWeek" aria-label="Crear nueva semana">+ Nueva Semana</button>
                </div>
                <div class="flex-col gap-m">
                    ${weeks.length === 0 ? '<div class="card text-center text-muted" style="padding: 36px 16px;">No hay planes todavía.<br><span class="text-small mt-s display-block">Pulsa "+ Nueva Semana" o importa un archivo JSON.</span></div>' : ''}
                    ${weeks.map(w => {
                        const allDone = w.sessions.length > 0 && w.sessions.every(s => s.session_completion.status === 'completed');
                        return `
                        <div class="card ${allDone ? 'active' : ''}" data-action="openWeek" data-week-id="${utils.esc(w.week.week_id)}" role="button" tabindex="0" aria-label="Abrir semana ${utils.esc(w.week.week_number)}" style="cursor: pointer;">
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
            <button type="button" class="fab" data-action="createManualWeek" aria-label="Crear nueva semana vacía" title="Crear semana">＋</button>
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
                <button type="button" class="ghost" data-action="goHome">← Volver</button>
                <h3>S ${utils.esc(w.week.week_number)}</h3>
                <div class="flex gap-s">
                    <button type="button" class="icon-btn ghost" data-action="toggleTheme">${ui.getThemeIcon()}</button>
                    <button class="secondary small" data-action="exportWeek">JSON</button>
                </div>
            </header>
            <div class="container">
                <div class="flex justify-between mb-m">
                    <span class="text-small text-muted">ID: ${utils.esc(String(w.week.week_id).slice(0,8))}...</span>
                    <button class="danger small" data-action="deleteWeek" data-week-id="${utils.esc(w.week.week_id)}">Borrar</button>
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
                        <p class="text-small note-text mb-m">${utils.esc(s.goal_summary || '')}</p>
                        <button class="primary w-full" data-action="openSession" data-session-id="${utils.esc(s.session_id)}">
                            ${st === 'completed' ? 'Ver Resultados' : 'Abrir Sesión'}
                        </button>
                    </div>`;
                }).join('')}
                <button class="secondary w-full mt-m" data-action="addSessionToWeek" data-week-id="${utils.esc(w.week.week_id)}">
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
                <button class="ghost" data-action="openWeek" data-week-id="${utils.esc(wId)}">← Semana</button>
                <h3>Sesión ${utils.esc(sId)}</h3>
                <button type="button" class="icon-btn ghost" data-action="toggleTheme">${ui.getThemeIcon()}</button>
            </header>
            <div class="container">
                <div class="mb-m">
                    <h2>${utils.esc(s.title || 'Sin Título')}</h2>
                    <p class="text-small text-muted">Duración: ~${utils.esc(s.estimated_duration_min || '?')} min</p>
                    <label class="text-small text-muted display-block">Fecha programada
                        <input type="date" value="${utils.esc(s.scheduled_date || '')}" data-change-action="updateScheduledDate">
                    </label>
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
                            <button class="primary small" data-action="openExercise" data-exercise-id="${utils.esc(ex.exercise_id)}">
                                ${done ? 'Revisar' : 'Entrenar'}
                            </button>
                        </div>
                    </div>`;
                }).join('')}
                ${!locked ? `
                    <button class="secondary w-full mb-m" data-action="addNewExerciseToSession" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}">
                        + Añadir Ejercicio Extra
                    </button>
                ` : ''}
                ${!locked ? `
                    <div class="card">
                        <label class="text-small text-muted mb-m display-block">Notas de la sesión</label>
                        <textarea rows="3" placeholder="Cómo te sentiste..."
                            data-change-action="updateSessionNote" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}">${utils.esc(s.session_notes || '')}</textarea>
                    </div>
                ` : (s.session_notes ? `
                    <div class="card">
                        <label class="text-small text-muted mb-m display-block">Notas de la sesión</label>
                        <p class="text-small note-text">${utils.esc(s.session_notes)}</p>
                    </div>
                ` : '')}
                <div class="mt-m pt-m" style="border-top:1px solid var(--border)">
                    ${locked 
                        ? `<button type="button" class="secondary w-full" data-action="viewReport">Ver Reporte JSON</button>`
                        : `<button type="button" class="primary w-full" data-action="finishSession">Finalizar Sesión</button>`
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
                <button class="ghost" data-action="openSession" data-session-id="${utils.esc(sId)}">← Volver</button>
                <button class="${ex.completion.status === 'completed' ? 'secondary' : 'ghost'}" data-action="toggleComplete" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}">
                    ${ex.completion.status === 'completed' ? '✔ Hecho' : 'Marcar Fin'}
                </button>
            </header>
            <div class="container">
                <div class="flex justify-between align-center mb-m">
                    <h2>${utils.esc(ex.name)}</h2>
                    <button class="secondary small" data-action="openExerciseHistory" data-ex-key="${utils.esc(analytics.exerciseKey(ex))}">
                        📊 Historial
                    </button>
                </div>
                ${ex.recommendations ? `<p class="text-small note-text card mb-m" style="background: var(--bg-input); padding: 12px;">${utils.esc(ex.recommendations)}</p>` : ''}
                ${!locked ? `
                <details class="mb-m">
                    <summary class="text-small text-muted" style="cursor:pointer; padding: 10px 0;">⚙️ Ajustar Plan</summary>
                    <div class="card mt-m">
                        <div class="flex gap-s">
                            <input id="ov_sets" type="number" inputmode="numeric" placeholder="Sets" value="${utils.esc(planArr.length)}">
                            <input id="ov_reps" type="number" inputmode="numeric" placeholder="Reps" value="${utils.esc(lastPlan.reps)}">
                            <input id="ov_load" type="number" inputmode="decimal" placeholder="Kg" value="${utils.esc(lastPlan.load)}" step="0.5">
                        </div>
                        <button type="button" class="primary w-full mt-m" data-action="applyFlatOverride" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}">Aplicar Nuevo Plan</button>
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
                                    data-change-action="updateSetReps" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}" data-set-idx="${i}">
                                <input type="number" inputmode="decimal" step="0.5" id="load_${i}" class="stat-input" placeholder="Kg"
                                    value="${utils.esc(showLoad)}" ${locked ? 'disabled' : ''}
                                    data-change-action="updateSetLoad" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}" data-set-idx="${i}">
                            </div>
                            <div class="flex justify-center">
                                <button class="icon-btn check-btn ${isDone ? 'done' : ''}" 
                                    data-action="openSetModal" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}" data-set-idx="${i}">
                                    ${isDone ? '✔' : '○'}
                                </button>
                            </div>
                        </div>`;
                    }).join('')}
                    ${!locked ? `<button class="ghost w-full mt-m" data-action="addSet" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}">+ Set Extra</button>` : ''}
                </div>
                
                <div class="card">
                    <label class="text-small text-muted mb-m display-block">Notas del Ejercicio</label>
                    <textarea rows="3" placeholder="Sensaciones, ajustes..." ${locked ? 'disabled' : ''}
                        data-change-action="updateExerciseNote" data-week-id="${utils.esc(wId)}" data-session-id="${utils.esc(sId)}" data-exercise-id="${utils.esc(exId)}">${utils.esc(ex.notes || '')}</textarea>
                </div>
                
                ${!locked && nextEx ? `
                    <button class="primary w-full mt-m" data-action="openExercise" data-exercise-id="${utils.esc(nextEx.exercise_id)}">
                        Siguiente: ${utils.esc(nextEx.name)} →
                    </button>
                ` : ''}
                ${!locked && !nextEx ? `
                    <button class="secondary w-full mt-m" data-action="openSession" data-session-id="${utils.esc(sId)}">
                        ← Volver a Sesión
                    </button>
                ` : ''}
            </div>
        `;
    },
    renderAnalytics: async () => {
        const { getDb, getState } = await getUiDeps();
        const db = getDb();
        const state = getState();
        const variants = analytics.getVariants(db);
        const selected = state.analyticsExerciseKey || variants[0]?.exercise_key || null;
        const bounds = analytics.periodBounds(state.analyticsPeriod, db.seasons);
        const metrics = analytics.summarize(db, selected, bounds);
        const activeSeason = Object.values(db.seasons || {}).find(season => !season.end_date);
        const display = (value, suffix = '') => value === null || value === undefined ? '—' : `${value}${suffix}`;
        const periods = [['active_season', 'Temporada', !activeSeason], ['last_30_days', 'Último mes'], ['last_3_months', '3 meses'], ['last_6_months', '6 meses'], ['last_year', '1 año'], ['all_time', 'Toda la vida'], ...Object.values(db.seasons || {}).filter(season => season.end_date).sort((a, b) => b.start_date.localeCompare(a.start_date)).map(season => [`season:${season.season_id}`, season.name])];
        const performance = analytics.movingTrend(metrics.exposures);
        const values = performance.map(item => item.adjusted_e1rm);
        const y = (value) => 90 - (value - Math.min(...values)) / (Math.max(...values) - Math.min(...values) || 1) * 70;
        const x = (index) => performance.length === 1 ? 150 : 10 + index * 280 / (performance.length - 1);
        const polyline = performance.length > 1 ? performance.map((item, index) => `${x(index)},${y(item.adjusted_e1rm)}`).join(' ') : '';
        const trendLine = performance.length > 1 ? performance.map((item, index) => `${x(index)},${y(item.trend)}`).join(' ') : '';
        const weekly = analytics.weeklyLoad(db, selected, bounds);
        const intensity = analytics.intensityDistribution(db, selected, bounds);
        const comparable = analytics.comparableRir(db, selected, bounds);
        const maxLoad = Math.max(...weekly.map(item => item.tonnage), 1);
        const selectedSeasonId = state.analyticsPeriod?.startsWith('season:') ? state.analyticsPeriod.slice(7) : null;
        const seasonReport = selectedSeasonId ? (await import('./seasons.js')).seasons.summary(db, selectedSeasonId) : null;
        ui.app.innerHTML = `
            <header><button type="button" class="ghost" data-action="goHome">← Inicio</button><h3>Análisis de Esfuerzo</h3><button type="button" class="icon-btn ghost" data-action="toggleTheme">${ui.getThemeIcon()}</button></header>
            <main class="container analytics-view">
                <section class="card"><div class="flex justify-between align-center"><strong>${activeSeason ? utils.esc(activeSeason.name) : 'Sin temporada activa'}</strong><div class="flex gap-s"><button type="button" class="secondary small" data-action="createSeason">${activeSeason ? 'Nueva' : 'Crear'} temporada</button>${activeSeason ? '<button type="button" class="ghost small" data-action="closeActiveSeason">Cerrar</button>' : ''}<button type="button" class="ghost small" data-action="manageSeasons">Gestionar</button></div></div>${activeSeason ? `<button type="button" class="ghost small mt-m" data-action="exportSeasonJSON" data-season-id="${utils.esc(activeSeason.season_id)}">Exportar resumen</button>` : ''}</section>
                <label class="text-small text-muted">Periodo<select data-change-action="selectAnalyticsPeriod">${periods.map(([id, label, disabled]) => `<option value="${utils.esc(id)}" ${disabled ? 'disabled' : ''} ${id === state.analyticsPeriod && !disabled ? 'selected' : ''}>${utils.esc(label)}${disabled ? ' (crea una temporada)' : ''}</option>`).join('')}</select></label>
                <label class="text-small text-muted">Variante<select data-change-action="selectAnalyticsVariant">${variants.length ? variants.map(item => `<option value="${utils.esc(item.exercise_key)}" ${item.exercise_key === selected ? 'selected' : ''}>${utils.esc(item.display_name)}${item.equipment_name !== 'General' ? ` (${utils.esc(item.equipment_name)})` : ''}</option>`).join('') : '<option>Sin series completadas</option>'}</select></label>
                <section class="analytics-grid" aria-label="Resumen del periodo">
                    <article class="card"><span class="text-small text-muted">e1RM referencia</span><strong>${display(metrics.reference_e1rm, ' kg')}</strong></article>
                    <article class="card"><span class="text-small text-muted">Cambio</span><strong>${display(metrics.change, ' kg')}</strong></article>
                    <article class="card"><span class="text-small text-muted">Tonelaje</span><strong>${display(metrics.tonnage, ' kg')}</strong></article>
                    <article class="card"><span class="text-small text-muted">Series duras / RIR</span><strong>${metrics.hard_sets} / ${display(metrics.average_rir)}</strong></article>
                    <article class="card"><span class="text-small text-muted">Adherencia</span><strong>${display(metrics.adherence, '%')}</strong><small>${metrics.completed_sessions}/${metrics.planned_sessions} sesiones</small></article>
                </section>
                <section class="card"><h3>Rendimiento</h3>${performance.length ? `<svg class="analytics-chart" viewBox="0 0 300 100" role="img" aria-label="Evolución por mejor e1RM de cada sesión">${polyline ? `<polyline fill="none" stroke="var(--accent)" stroke-width="3" points="${polyline}"/>` : ''}${trendLine ? `<polyline fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="4" points="${trendLine}"/>` : ''}${performance.map((item, index) => `<circle cx="${x(index)}" cy="${y(item.adjusted_e1rm)}" r="4" fill="var(--accent)"><title>${utils.esc(`${item.date}: ${item.load} kg × ${item.reps}, RIR ${item.rir}, e1RM ${item.adjusted_e1rm} kg`)}</title></circle>`).join('')}</svg><div class="table-scroll"><table class="progress-table"><thead><tr><th>Fecha</th><th>Serie</th><th>e1RM</th><th>Tendencia</th></tr></thead><tbody>${performance.map(item => `<tr><td>${utils.esc(item.date)}</td><td>${item.load} × ${item.reps} @${item.rir}</td><td>${item.adjusted_e1rm} kg</td><td>${item.consolidated ? `${item.trend} kg` : 'En formación'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="text-muted">Aún no hay exposiciones de alta confianza.</p>'}<p class="text-small text-muted">Cada punto es la mejor serie válida de una sesión. La línea discontinua es la media de las tres últimas exposiciones.</p></section>
                <section class="card"><h3>Volumen semanal</h3>${weekly.length ? `<div class="bar-chart" role="img" aria-label="Tonelaje y series duras por semana">${weekly.map(item => `<div><div class="bar" style="height:${item.tonnage ? Math.max(3, item.tonnage / maxLoad * 100) : 0}px"></div><small>${utils.esc(item.week.slice(5))}</small></div>`).join('')}</div><div class="table-scroll"><table class="progress-table"><thead><tr><th>Semana</th><th>Tonelaje</th><th>Series duras</th><th>Reps</th></tr></thead><tbody>${weekly.map(item => `<tr><td>${utils.esc(item.week)}</td><td>${item.tonnage} kg</td><td>${item.hard_sets}</td><td>${item.reps}</td></tr>`).join('')}</tbody></table></div>` : '<p class="text-muted">No hay volumen registrado en este periodo.</p>'}<p class="text-small text-muted">Las semanas sin carga conservan su espacio y se muestran con cero.</p></section>
                <section class="card"><h3>Distribución de intensidad</h3>${intensity.some(item => item.reps) ? `<ul class="metric-list">${intensity.map(item => `<li>${item.label}: <strong>${item.reps} reps</strong></li>`).join('')}</ul>` : '<p class="text-muted">No hay e1RM de referencia suficiente para clasificar intensidad.</p>'}</section>
                <section class="card"><h3>RIR a carga comparable</h3>${comparable ? `<p>${comparable.load} kg: RIR medio <strong>${comparable.average_rir}</strong> (${comparable.observations.length} series exactas)</p>` : '<p class="text-muted">Aún no hay suficientes series comparables.</p>'}</section>
                ${seasonReport ? `<section class="card"><h3>Comparativa de temporada</h3><p class="text-small text-muted">${utils.esc(seasonReport.season.objective)} · ${utils.esc(seasonReport.season.start_date)} a ${utils.esc(seasonReport.season.end_date || '')}</p>${seasonReport.exercises.length ? `<ul class="metric-list">${seasonReport.exercises.map(item => `<li><span>${utils.esc(item.exercise_key)}</span><span>${display(item.metrics.best_e1rm, ' kg')} ${item.previous?.best_e1rm !== null && item.previous?.best_e1rm !== undefined ? `vs ${item.previous.best_e1rm} kg` : ''}</span></li>`).join('')}</ul>` : '<p class="text-muted">Esta temporada no tiene variantes prioritarias.</p>'}</section>` : ''}
                <section class="card"><h3>Histórico del periodo</h3>${metrics.observations.length ? `<div class="table-scroll"><table class="progress-table"><thead><tr><th>Fecha</th><th>Carga</th><th>RIR</th><th>e1RM</th><th>Confianza</th></tr></thead><tbody>${metrics.observations.map(item => `<tr><td>${utils.esc(item.date)}</td><td>${item.load} × ${item.reps}</td><td>${item.rir_is_open_ended ? '4+' : item.rir ?? '—'}</td><td>${display(item.adjusted_e1rm, ' kg')}</td><td>${utils.esc(item.confidence)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="text-muted">No hay series completadas para este periodo.</p>'}</section>
            </main>`;
    },
    renderHistory: async () => {
        const exercises = analytics.getAllExercises();
        const { actions } = await import('./actions.js');
        ui.app.innerHTML = `
            <header>
                <button type="button" class="ghost" data-action="goHome">← Volver</button>
                <h3>Historial</h3>
                <button type="button" class="icon-btn ghost" data-action="toggleTheme">${ui.getThemeIcon()}</button>
            </header>
            <div class="container">
                <div class="flex justify-between align-center mb-m">
                    <h2 class="mb-m">Progreso</h2>
                    <button type="button" class="secondary small" data-action="exportAllRMs">📥 Exportar Todo</button>
                </div>
                ${exercises.length === 0 ? `
                    <div class="card text-center text-muted">
                        No hay datos de ejercicios completados.
                    </div>
                ` : ''}
                ${exercises.map(variant => {
                    const best1RM = analytics.getBest1RM(variant.exercise_key);
                    const history = analytics.getExerciseHistory(variant.exercise_key);
                    const lastSession = history[0];
                    return `
                        <div class="card" data-action="openExerciseHistory" data-ex-key="${utils.esc(variant.exercise_key)}" role="button" tabindex="0">
                            <div class="flex justify-between align-center mb-m">
                                <h3>${utils.esc(variant.display_name)}${variant.equipment_name !== 'General' ? ` (${utils.esc(variant.equipment_name)})` : ''}</h3>
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
        const variant = analytics.getVariants().find(item => item.exercise_key === exName);
        const records = analytics.get1RMRecords(exName);
        const monthlySummary = analytics.get1RMMonthlySummary(exName);
        const recentSets = analytics.getRecentSets(exName, 30);
        const best1RM = analytics.getBest1RM(exName);
        const { actions } = await import('./actions.js');

        ui.app.innerHTML = `
            <header>
                <button type="button" class="ghost" data-action="openHistory">← Historial</button>
                <h3>Progreso</h3>
                <button type="button" class="icon-btn ghost" data-action="toggleTheme">${ui.getThemeIcon()}</button>
            </header>
            <div class="container">
                <div class="card">
                    <h2 class="mb-m">${utils.esc(variant ? `${variant.display_name} (${variant.equipment_name})` : exName)}</h2>
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
                                        <td class="text-small">${h.rir !== null ? utils.esc(h.rir_is_open_ended ? '4+' : h.rir === 4 ? '4 (histórico)' : h.rir) : '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </details>

                <div class="card">
                    <h3 class="mb-m">Exportar Histórico Completo</h3>
                    <div class="export-row">
                        <button class="secondary" data-action="exportExerciseCSV" data-ex-key="${utils.esc(exName)}">
                            📊 CSV
                        </button>
                        <button class="secondary" data-action="exportExerciseJSON" data-ex-key="${utils.esc(exName)}">
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
        if (state.modal === 'season_form') {
            const { getDb } = await getUiDeps();
            const variants = analytics.getVariants(getDb());
            const now = new Date();
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            ui.app.innerHTML = `<div class="modal-overlay"><form class="modal-content" role="dialog" aria-modal="true" aria-labelledby="season_form_title" data-submit-action="submitSeasonForm"><h3 id="season_form_title">Crear temporada</h3><label>Nombre<input id="season_name" required maxlength="80"></label><label>Inicio<input id="season_start" type="date" value="${today}" required></label><label>Objetivo<select id="season_objective"><option value="strength">Fuerza</option><option value="hypertrophy">Hipertrofia</option><option value="maintenance">Mantenimiento</option><option value="return">Vuelta</option></select></label><fieldset><legend>Variantes prioritarias</legend>${variants.map(item => `<label><input type="checkbox" name="season_priority" value="${utils.esc(item.exercise_key)}"> ${utils.esc(item.display_name)} (${utils.esc(item.equipment_name)})</label>`).join('')}</fieldset><label>Notas<textarea id="season_notes" maxlength="500"></textarea></label><div class="flex gap-s"><button class="primary" type="submit">Crear y activar</button><button class="ghost" type="button" data-action="closeModal">Cancelar</button></div></form></div>`;
            document.getElementById('season_name')?.focus();
            return;
        }
        if (state.modal === 'season_confirm') {
            const prepared = state.seasonPrepared;
            ui.app.innerHTML = `<div class="modal-overlay"><div class="modal-content" role="dialog" aria-modal="true"><h3>Confirmar cierre</h3><p>Se cerrará ${utils.esc(prepared.activeSeason.name)} el ${utils.esc(prepared.proposedCloseDate)} antes de crear ${utils.esc(prepared.season.name)}.</p><div class="flex gap-s"><button type="button" class="primary" data-action="confirmSeasonCreate">Confirmar</button><button type="button" class="ghost" data-action="closeModal">Cancelar</button></div></div></div>`;
            return;
        }
        if (state.modal === 'season_manage') {
            const { getDb } = await getUiDeps();
            const { seasons } = await import('./seasons.js');
            const list = seasons.list(getDb());
            ui.app.innerHTML = `<div class="modal-overlay"><div class="modal-content" role="dialog" aria-modal="true"><h3>Gestionar temporadas</h3>${list.map(season => `<article class="card"><strong>${utils.esc(season.name)}</strong><p class="text-small">${utils.esc(season.start_date)}${season.end_date ? ` – ${utils.esc(season.end_date)}` : ' · activa'}</p><button type="button" class="secondary" data-action="exportSeasonJSON" data-season-id="${utils.esc(season.season_id)}">Exportar</button><button type="button" class="danger" data-action="deleteSeasonFromManage" data-season-id="${utils.esc(season.season_id)}">Borrar metadatos</button></article>`).join('') || '<p>Sin temporadas.</p>'}<button type="button" class="ghost" data-action="closeModal">Cerrar</button></div></div>`;
            return;
        }
        const { backup } = await import('./backup.js');

        if (state.modal === 'help') {
            const { LLM_PROMPT_TEMPLATE } = await import('./config.js');
            ui.app.innerHTML = `
                <div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="help-title">
                    <div class="modal-content">
                        <h2 id="help-title" style="margin-bottom: 12px;">¿Cómo usar Strength Tracker?</h2>
                        <div class="flex-col gap-m">
                            <p><strong>📝 Mis Planes</strong> — Gestiona y consulta tus semanas de entrenamiento o crea una nueva.</p>
                            <p><strong>📊 Historial</strong> — Consulta tu progreso y los récords de 1RM estimados.</p>
                            <p><strong>📈 Análisis</strong> — Métricas de volumen, esfuerzo RIR/RPE y carga total.</p>
                            <p><strong>💾 Backups</strong> — Crea copias de seguridad automáticas o restaura versiones anteriores.</p>
                            <p><strong>📥 Importar</strong> — Carga rutinas generadas manualmente o por Inteligencia Artificial.</p>
                        </div>

                        <div class="card mt-m" style="border: 1.5px solid var(--accent); background: var(--bg-input);">
                            <div class="flex justify-between align-center mb-s">
                                <h3 style="font-size: 1.05rem;">🤖 Crear Rutinas con IA</h3>
                                <span class="badge completed">Prompt LLM</span>
                            </div>
                            <p class="text-small text-muted mb-m">
                                Pídele a ChatGPT, Claude o Gemini que diseñe tu semana en el formato exacto de Strength Tracker.
                            </p>
                            <button type="button" class="primary w-full" data-action="copyLLMPrompt">
                                📋 Copiar Prompt y Plantilla para IA
                            </button>
                            
                            <details class="mt-m">
                                <summary class="text-small font-bold" style="cursor: pointer; padding: 6px 0;">Ver estructura JSON</summary>
                                <pre class="text-small mono" style="background: var(--bg-card); padding: 12px; border-radius: 8px; overflow-x: auto; max-height: 200px; border: 1px solid var(--border); margin-top: 8px; font-size: 0.78rem; line-height: 1.4;">${utils.esc(LLM_PROMPT_TEMPLATE)}</pre>
                            </details>
                        </div>

                        <p class="text-small text-muted mt-s">Tus datos se guardan 100% localmente en este dispositivo.</p>
                        <button type="button" class="secondary w-full mt-m" data-action="closeModal" aria-label="Cerrar ayuda">Entendido</button>
                    </div>
                </div>
            `;
            return;
        }

        if (state.modal === 'import') {
            ui.app.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <h3>Importar Plan JSON</h3>
                        <p class="text-small mb-m">Elige cómo cargar tu rutina semanal:</p>
                        
                        <div class="card mb-m" style="background: var(--bg-input); padding: 12px 14px; border: 1px solid var(--border);">
                            <div class="flex justify-between align-center">
                                <span class="text-small font-bold">🤖 ¿Usas ChatGPT o Claude?</span>
                                <button type="button" class="ghost small" data-action="openHelp" style="padding: 4px 8px; color: var(--accent); font-weight: 700;">Ver Prompt →</button>
                            </div>
                        </div>

                        <button type="button" class="primary w-full mb-m" data-action="pasteFromClipboard">
                            📋 Pegar desde portapapeles
                        </button>
                        <div class="divider">o</div>
                        <div class="file-input-wrapper">
                            <div class="text-small">📂 Seleccionar archivo .json</div>
                            <input type="file" accept="*/*" id="fileUpload" data-change-action="handleFileSelect">
                        </div>
                        <div class="divider">o</div>
                        <textarea id="jsonInput" rows="4" placeholder='Pegar JSON aquí...'></textarea>
                        <div class="flex gap-s mt-m">
                            <button type="button" class="ghost w-full" data-action="closeModal">Cancelar</button>
                            <button type="button" class="primary w-full" data-action="doImport">Importar</button>
                        </div>
                    </div>
                </div>`;
        }
        if (state.modal === 'backups') {
            const backupList = backup.list();
            ui.app.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <h3>Gestión de Backups</h3>
                        <p class="text-small mb-m">Backups automáticos (últimos 5):</p>
                        ${backupList.length === 0 ? `
                            <div class="card text-center text-muted">
                                No hay backups disponibles.
                            </div>
                        ` : `
                            <button type="button" class="secondary w-full mb-m" data-action="downloadAllBackups">
                                📥 Descargar TODOS los backups
                            </button>
                            <div class="flex-col gap-s mb-m">
                                ${backupList.map(date => `
                                    <div class="card">
                                        <div class="flex justify-between align-center mb-m">
                                            <span class="font-bold">${utils.formatDate(date)}</span>
                                        </div>
                                        <div class="flex gap-s">
                                            <button class="secondary w-full" data-action="restoreBackup" data-timestamp="${utils.esc(date)}">
                                                Restaurar
                                            </button>
                                            <button class="primary w-full" data-action="downloadBackup" data-timestamp="${utils.esc(date)}">
                                                📥 Bajar
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                        <div class="section-header">Restaurar desde archivo</div>
                        <button type="button" class="primary w-full mb-m" data-action="pasteBackupFromClipboard">
                            📋 Pegar backup desde portapapeles
                        </button>
                        <div class="divider">o</div>
                        <div class="file-input-wrapper">
                            <div class="text-small">📂 Seleccionar archivo backup</div>
                            <input type="file" accept="*/*" id="backupFileUpload" data-change-action="handleBackupFileSelect">
                        </div>
                        <div class="divider">o</div>
                        <textarea id="backupJsonInput" rows="4" placeholder='Pegar JSON del backup...'></textarea>
                        <div class="flex-col gap-s mt-m mb-m">
                            <button type="button" class="primary w-full" data-action="restoreFromBackupJSON" data-mode="merge">
                                🔄 Fusionar con Datos Actuales
                                <div class="text-small" style="font-weight:normal; margin-top:2px; opacity:0.9">Compara y resuelve conflictos si los hay.</div>
                            </button>
                            <button type="button" class="danger w-full" data-action="restoreFromBackupJSON" data-mode="replace">
                                ⚠️ Sobrescribir Todo
                                <div class="text-small" style="font-weight:normal; margin-top:2px; opacity:0.9">Borra datos actuales y pone el backup.</div>
                            </button>
                        </div>
                        <button type="button" class="ghost w-full" data-action="closeModal">Cerrar</button>
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
                            <button type="button" class="secondary w-full" data-action="resolveConflictChoice" data-choice="local">
                                🏠 Conservar Mi Versión (Local)
                            </button>
                            <button type="button" class="primary w-full" data-action="resolveConflictChoice" data-choice="incoming">
                                📥 Usar Versión Importada
                            </button>
                            <button type="button" class="ghost w-full" data-action="resolveConflictChoice" data-choice="both">
                                ➕ Conservar Ambas (Crear copia con nuevo ID)
                            </button>
                        </div>
                        
                        ${totalConflicts > 1 ? `
                            <div class="divider">aplicar a todos</div>
                            <div class="flex gap-s">
                                <button type="button" class="ghost small w-full" data-action="resolveAllConflicts" data-choice="local">Todas Local</button>
                                <button type="button" class="ghost small w-full" data-action="resolveAllConflicts" data-choice="incoming">Todas Importada</button>
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
                <div class="modal-overlay">
                    <div class="modal-content">
                        <h3>Exportar Todos los 1RM</h3>
                        <p class="text-small mb-m">${totalExercises} ejercicios encontrados</p>
                        <div class="card">
                            <h3 class="mb-m">Formato</h3>
                            <div class="flex-col gap-s">
                                <button type="button" class="primary w-full" data-action="downloadAll1RMsJSON">
                                    📄 JSON Completo
                                    <div class="text-small" style="font-weight: normal; margin-top: 4px;">
                                        Incluye todos los récords y resumen mensual
                                    </div>
                                </button>
                                <button type="button" class="secondary w-full" data-action="downloadAll1RMsCSV">
                                    📊 CSV Resumen
                                    <div class="text-small" style="font-weight: normal; margin-top: 4px;">
                                        Tabla con mejores marcas por ejercicio
                                    </div>
                                </button>
                            </div>
                        </div>
                        <button type="button" class="ghost w-full mt-m" data-action="closeModal">
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
        const selectedRIRIsOpenEnded = s.selectedRIRIsOpenEnded;

        ui.app.innerHTML = `
            <div class="modal-overlay" data-action="closeSetModalOnOverlay">
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
                            <button type="button" class="rir-btn ${(set.rir !== null && set.rir !== undefined) ? (set.rir === 0 && !set.rir_is_open_ended ? 'selected' : '') : (selectedRIR === 0 && !selectedRIRIsOpenEnded ? 'selected' : '')}" data-action="selectRIR" data-rir="0">0</button>
                            <button type="button" class="rir-btn ${(set.rir !== null && set.rir !== undefined) ? (set.rir === 1 ? 'selected' : '') : (selectedRIR === 1 ? 'selected' : '')}" data-action="selectRIR" data-rir="1">1</button>
                            <button type="button" class="rir-btn ${(set.rir !== null && set.rir !== undefined) ? (set.rir === 2 ? 'selected' : '') : (selectedRIR === 2 ? 'selected' : '')}" data-action="selectRIR" data-rir="2">2</button>
                            <button type="button" class="rir-btn ${(set.rir !== null && set.rir !== undefined) ? (set.rir === 3 ? 'selected' : '') : (selectedRIR === 3 ? 'selected' : '')}" data-action="selectRIR" data-rir="3">3</button>
                            <button type="button" class="rir-btn ${(set.rir_is_open_ended || ((set.rir === null || set.rir === undefined) && selectedRIR === 4 && selectedRIRIsOpenEnded)) ? 'selected' : ''}" data-action="selectRIR" data-rir="4" data-rir-open-ended="true">4+</button>
                        </div>
                        ${set.rir === 4 && !set.rir_is_open_ended ? '<p class="text-small text-muted">RIR 4 (histórico). Pulsa 4+ solo si deseas cambiar su significado.</p>' : ''}
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
                        <button type="button" class="primary w-full" data-action="saveSetWithRIR">
                            ✓ Guardar
                        </button>
                        <button type="button" class="ghost w-full" data-action="saveSetWithoutRIR">
                            Guardar sin RIR
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    /**
     * Sistema de delegated listeners para evitar XSS por atributos inline (onclick).
     * Los datos del usuario se pasan como data-attributes (escapados) y se leen
     * en el handler, eliminando la necesidad de interpolar JS en atributos HTML.
     */
    bindDelegated: () => {
        if (ui._delegatedBound) return;
        ui._delegatedBound = true;

        document.addEventListener?.('keydown', async (event) => {
            const { getState } = await getUiDeps();
            const state = getState();
            if (!state.modal && !state.setModal) return;
            if (event.key === 'Escape') {
                const { actions } = await import('./actions.js');
                actions.closeModal();
                actions.closeSetModal();
                return;
            }
            if (event.key !== 'Tab') return;
            const focusable = [...document.querySelectorAll('.modal-content button, .modal-content input, .modal-content select, .modal-content textarea')].filter(element => !element.disabled);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        });

        ui.app.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            const target = event.target.closest('[role="button"][data-action]');
            if (!target) return;
            event.preventDefault();
            target.click();
        });

        ui.app.addEventListener('click', async (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            const action = target.getAttribute('data-action');
            const get = (name) => {
                const attribute = `data-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
                const v = target.getAttribute(attribute);
                return v === null ? null : v;
            };

            const { actions } = await import('./actions.js');
            const { backup } = await import('./backup.js');

            switch (action) {
                case 'goHome': actions.goHome(); break;
                case 'toggleTheme': utils.toggleTheme(); break;
                case 'openHelp': actions.openHelp(); break;
                case 'openPlanes': actions.openPlanes(); break;
                case 'openHistory': actions.openHistory(); break;
                case 'openAnalytics': actions.openAnalytics(); break;
                case 'openBackups': actions.openBackups(); break;
                case 'openImport': actions.openImport(); break;
                case 'closeModal': actions.closeModal(); break;
                case 'confirmSeasonCreate': actions.confirmSeasonCreate(); break;
                case 'deleteSeasonFromManage': actions.deleteSeasonFromManage(get('seasonId')); break;
                case 'copyLLMPrompt': actions.copyLLMPrompt(); break;
                case 'pasteFromClipboard': actions.pasteFromClipboard(); break;
                case 'doImport': actions.doImport(); break;
                case 'downloadAllBackups': backup.downloadAll(); break;
                case 'pasteBackupFromClipboard': actions.pasteBackupFromClipboard(); break;
                case 'restoreFromBackupJSON': actions.restoreFromBackupJSON(get('mode')); break;
                case 'applyFlatOverride': logic.applyFlatOverride(get('weekId'), get('sessionId'), get('exerciseId'), document.getElementById('ov_sets')?.value, document.getElementById('ov_reps')?.value, document.getElementById('ov_load')?.value); break;
                case 'downloadAll1RMsJSON': actions.downloadAll1RMsJSON(); break;
                case 'downloadAll1RMsCSV': actions.downloadAll1RMsCSV(); break;
                case 'createManualWeek': logic.createManualWeek(); break;
                case 'createSeason': actions.createSeason(); break;
                case 'closeActiveSeason': actions.closeActiveSeason(); break;
                case 'manageSeasons': actions.manageSeasons(); break;
                case 'exportSeasonJSON': actions.exportSeasonJSON(get('seasonId')); break;
                case 'viewReport': actions.viewReport(); break;
                case 'finishSession': actions.finishSession(); break;
                case 'exportAllRMs': actions.exportAllRMs(); break;
                case 'selectRIR': actions.selectRIR(parseInt(get('rir'), 10), get('rirOpenEnded') === 'true', target); break;
                case 'saveSetWithRIR': actions.saveSetWithRIR(); break;
                case 'saveSetWithoutRIR': actions.saveSetWithoutRIR(); break;
                case 'closeSetModalOnOverlay': if (e.target === target) actions.closeSetModal(); break;
                case 'openWeek': actions.openWeek(get('weekId')); break;
                case 'openSession': actions.openSession(get('sessionId')); break;
                case 'openExercise': actions.openExercise(get('exerciseId')); break;
                case 'openExerciseHistory': actions.openExerciseHistory(get('exKey') || get('exName')); break;
                case 'deleteWeek': logic.deleteWeek(get('weekId')); break;
                case 'addSessionToWeek': logic.addSessionToWeek(get('weekId')); break;
                case 'addNewExerciseToSession': logic.addNewExerciseToSession(get('weekId'), get('sessionId')); break;
                case 'toggleComplete': logic.toggleComplete(get('weekId'), get('sessionId'), get('exerciseId')); break;
                case 'addSet': logic.addSet(get('weekId'), get('sessionId'), get('exerciseId')); break;
                case 'openSetModal': actions.openSetModal(get('weekId'), get('sessionId'), get('exerciseId'), parseInt(get('setIdx'), 10)); break;
                case 'exportWeek': actions.exportWeek(); break;
                case 'exportExerciseCSV': actions.exportExerciseCSV(get('exKey') || get('exName')); break;
                case 'exportExerciseJSON': actions.exportExerciseJSON(get('exKey') || get('exName')); break;
                case 'resolveConflictChoice': actions.resolveConflictChoice(get('choice')); break;
                case 'resolveAllConflicts': actions.resolveAllConflicts(get('choice')); break;
                case 'restoreBackup': backup.restore(get('timestamp'), actions, ui.toast); break;
                case 'downloadBackup': backup.download(get('timestamp'), ui.toast); break;
                default: break;
            }
        });

        ui.app.addEventListener('change', async (e) => {
            const target = e.target.closest('[data-change-action]');
            if (!target) return;
            const action = target.getAttribute('data-change-action');
            const get = (name) => {
                const attribute = `data-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
                return target.getAttribute(attribute);
            };
            const { actions } = await import('./actions.js');

            switch (action) {
                case 'selectAnalyticsPeriod': actions.selectAnalyticsPeriod(target.value); break;
                case 'selectAnalyticsVariant': actions.selectAnalyticsVariant(target.value); break;
                case 'updateScheduledDate': actions.updateScheduledDate(target.value); break;
                case 'handleFileSelect': actions.handleFileSelect(target); break;
                case 'handleBackupFileSelect': actions.handleBackupFileSelect(target); break;
                case 'updateSessionNote':
                    logic.updateSessionNote(get('weekId'), get('sessionId'), target.value);
                    break;
                case 'updateExerciseNote':
                    logic.updateExerciseNote(get('weekId'), get('sessionId'), get('exerciseId'), target.value);
                    break;
                case 'updateSetReps':
                    logic.updateSet(get('weekId'), get('sessionId'), get('exerciseId'), parseInt(get('setIdx'), 10), { reps: target.value });
                    break;
                case 'updateSetLoad':
                    logic.updateSet(get('weekId'), get('sessionId'), get('exerciseId'), parseInt(get('setIdx'), 10), { load: target.value });
                    break;
                default:
                    break;
            }
        });

        ui.app.addEventListener('submit', async (e) => {
            const form = e.target.closest('[data-submit-action]');
            if (!form) return;
            e.preventDefault();
            if (form.getAttribute('data-submit-action') === 'submitSeasonForm') {
                const { actions } = await import('./actions.js');
                await actions.submitSeasonForm();
            }
        });
    }
};
