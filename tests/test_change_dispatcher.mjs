import assert from 'node:assert/strict';

const handlers = new Map();
const app = {
    innerHTML: '',
    addEventListener: (type, handler) => handlers.set(type, handler),
    classList: { add: () => {}, remove: () => {} }
};
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
globalThis.document = {
    body: { className: 'dark' },
    getElementById: (id) => id === 'app' ? app : { classList: { add: () => {}, remove: () => {} } },
    addEventListener: () => {},
    querySelectorAll: () => []
};
globalThis.window = { matchMedia: () => ({ matches: true }), Capacitor: null };
Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { readText: async () => '' } }, configurable: true });

const { ui } = await import(new URL('../www/js/ui.js', import.meta.url).href);
const { actions } = await import(new URL('../www/js/actions.js', import.meta.url).href);
const { logic } = await import(new URL('../www/js/logic.js', import.meta.url).href);
const calls = [];
for (const name of ['selectAnalyticsPeriod', 'selectAnalyticsVariant', 'updateScheduledDate', 'handleFileSelect', 'handleBackupFileSelect']) {
    actions[name] = async (value) => calls.push([name, value]);
}
logic.updateSessionNote = async (...args) => calls.push(['updateSessionNote', ...args]);
logic.updateSet = async (...args) => calls.push(['updateSet', ...args]);

ui.bindDelegated();
const listenerCount = handlers.size;
ui.bindDelegated();
assert.equal(handlers.size, listenerCount);

const change = handlers.get('change');
const target = (action, value, data = {}) => {
    const element = {
        value,
        getAttribute: (name) => name === 'data-change-action' ? action : data[name] ?? null
    };
    element.closest = () => element;
    return element;
};
for (const [action, value] of [
    ['selectAnalyticsPeriod', 'last_30_days'],
    ['selectAnalyticsVariant', 'press-machine_a'],
    ['updateScheduledDate', '2026-08-22'],
    ['handleFileSelect', { files: ['plan.json'] }],
    ['handleBackupFileSelect', { files: ['backup.json'] }]
]) await change({ target: target(action, value) });
await change({ target: target('updateSessionNote', 'nota', { 'data-week-id': 'week_1', 'data-session-id': 'session_1' }) });
assert.deepEqual(calls.map(([name]) => name), ['selectAnalyticsPeriod', 'selectAnalyticsVariant', 'updateScheduledDate', 'handleFileSelect', 'handleBackupFileSelect', 'updateSessionNote']);
console.log('Change dispatcher tests completed');
