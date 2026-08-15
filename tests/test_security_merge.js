#!/usr/bin/env node
/**
 * Test suite para Strength Tracker v6.7
 * Verifica: Sanitización XSS, Validación de JSON, Motor de Fusión, Migraciones de Esquema y Resiliencia.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('--- Iniciando Test Suite: Seguridad, Validación y Fusión ---');

// Extraer lógica JavaScript de www/index.html para testeo unitario
const htmlContent = fs.readFileSync(path.join(__dirname, '../www/index.html'), 'utf8');
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
    throw new Error('No se encontró etiqueta <script> en www/index.html');
}

// Mock de entorno browser mínimo
const mockLocalStorage = {};
const mockStorage = {
    getItem: (k) => mockLocalStorage[k] || null,
    setItem: (k, v) => { mockLocalStorage[k] = String(v); },
    removeItem: (k) => { delete mockLocalStorage[k]; },
    clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
};

const sandbox = {
    console: { log: ()=>{}, warn: ()=>{}, error: ()=>{} },
    localStorage: mockStorage,
    window: { matchMedia: () => ({ matches: true }), Capacitor: null },
    document: {
        getElementById: (id) => ({ innerHTML: '', innerText: '', value: '', classList: { add: ()=>{}, remove: ()=>{} } }),
        body: { className: 'dark' },
        querySelectorAll: () => []
    },
    navigator: {
        clipboard: { readText: async () => '' }
    },
    setTimeout: setTimeout,
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
    parseFloat: parseFloat,
    parseInt: parseInt,
    isNaN: isNaN,
    Date: Date,
    Math: Math,
    JSON: JSON,
    Array: Array,
    Object: Object,
    Set: Set,
    Map: Map,
    String: String,
    Boolean: Boolean,
    RegExp: RegExp,
    Error: Error,
    __TEST_EXPORTS__: null
};

// Envolver el script para capturar los objetos de módulo
const wrappedScript = `
${scriptMatch[1]}
__TEST_EXPORTS__ = { utils, validate, backup, mergeEngine, analytics, logic };
`;

vm.createContext(sandbox);
vm.runInContext(wrappedScript, sandbox);

const { utils, validate, backup, mergeEngine, analytics, logic } = sandbox.__TEST_EXPORTS__;

let passed = 0;
let total = 0;

function test(name, fn) {
    total++;
    try {
        fn();
        console.log(`  ✓ ${name}`);
        passed++;
    } catch (err) {
        console.error(`  ✗ ${name}:`, err.message);
        throw err;
    }
}

// 1. Tests de Sanitización XSS
console.log('\n[1] Pruebas de Sanitización XSS (utils.esc y encodeParam)');

test('utils.esc neutraliza tags HTML y scripts maliciosos', () => {
    const payload = '<script>alert("XSS")</script>';
    const escaped = utils.esc(payload);
    assert.strictEqual(escaped, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    assert(!escaped.includes('<script>'));
});

test('utils.esc maneja comillas simples, dobles y backticks', () => {
    const payload = `O'Connor "Quotes" & ` + '`backticks`';
    const escaped = utils.esc(payload);
    assert.strictEqual(escaped, 'O&#39;Connor &quot;Quotes&quot; &amp; &#96;backticks&#96;');
});

test('utils.esc maneja nulos, indefinidos y números', () => {
    assert.strictEqual(utils.esc(null), '');
    assert.strictEqual(utils.esc(undefined), '');
    assert.strictEqual(utils.esc(123), '123');
    assert.strictEqual(utils.esc(0), '0');
});

test('utils.encodeParam codifica caracteres peligrosos para inline handlers', () => {
    const param = `Bicep's "Curl" <script>`;
    const encoded = utils.encodeParam(param);
    assert(!encoded.includes("'"));
    assert(!encoded.includes('"'));
    assert(!encoded.includes('<'));
    assert(!encoded.includes('>'));
    assert.strictEqual(utils.decodeParam(encoded), param);
});

// 2. Tests de Validación de JSON
console.log('\n[2] Pruebas de Validación de Importación (validate.json / backupJSON)');

test('validate.json rechaza entradas no válidas o vacías', () => {
    assert.throws(() => validate.json(''), /Entrada vacía/);
    assert.throws(() => validate.json('{ bad json }'), /JSON malformado/);
    assert.throws(() => validate.json('{}'), /Falta el campo/);
    assert.throws(() => validate.json('{"week_ref": {}}'), /'sessions' debe ser una lista/);
});

test('validate.json sanitiza y estructura correctamente una semana válida', () => {
    const raw = JSON.stringify({
        week_ref: {
            week_id: "w_test_1",
            week_number: 2,
            notes: "Semana pesada"
        },
        sessions: [
            {
                session_id: "Día 1",
                title: "Torso Fuerza",
                exercises: [
                    {
                        name: "Press Banca",
                        baseline: { planned_sets: 4, planned_reps: 6, planned_load: 85 }
                    }
                ]
            }
        ]
    });
    const clean = validate.json(raw);
    assert.strictEqual(clean.week.week_id, "w_test_1");
    assert.strictEqual(clean.week.week_number, 2);
    assert.strictEqual(clean.sessions.length, 1);
    assert.strictEqual(clean.sessions[0].exercises[0].name, "Press Banca");
    assert.strictEqual(clean.sessions[0].exercises[0].baseline.planned_sets, 4);
    assert.strictEqual(clean.sessions[0].session_completion.status, 'pending');
});

test('validate.backupJSON procesa backups con múltiples formatos', () => {
    const backupObj = {
        backup_meta: { date: "2026-08-15", version: "6.7" },
        data: {
            weeks: {
                "w1": {
                    week: { week_id: "w1", week_number: 1 },
                    sessions: []
                }
            }
        }
    };
    const clean = validate.backupJSON(JSON.stringify(backupObj));
    assert(clean.weeks["w1"]);
    assert.strictEqual(clean.weeks["w1"].week.week_number, 1);
});

// 3. Tests de Fusión y Detección de Conflictos
console.log('\n[3] Pruebas del Motor de Fusión y Conflictos (mergeEngine)');

test('detectSessionConflict identifica cuando no hay divergencia (ej: una vacía, una completada)', () => {
    const emptyS = {
        session_id: "Día 1",
        exercises: [{ name: "Press", execution: { sets: [] } }]
    };
    const completedS = {
        session_id: "Día 1",
        exercises: [{ name: "Press", execution: { sets: [{ reps: 8, load: 80 }] } }]
    };
    assert.strictEqual(mergeEngine.detectSessionConflict(emptyS, completedS), false);
});

test('detectSessionConflict detecta divergencia real cuando ambas tienen series distintas', () => {
    const localS = {
        session_id: "Día 1",
        exercises: [{ name: "Press", execution: { sets: [{ reps: 8, load: 80 }] } }]
    };
    const incomingS = {
        session_id: "Día 1",
        exercises: [{ name: "Press", execution: { sets: [{ reps: 10, load: 85 }] } }]
    };
    assert.strictEqual(mergeEngine.detectSessionConflict(localS, incomingS), true);
});

// 4. Tests de Migración de Esquema y Resiliencia
console.log('\n[4] Pruebas de Migración de Esquema (utils.migrateSchema)');

test('migrateSchema migra datos v1 a v2 asegurando timestamps y schema_version', () => {
    const oldData = {
        weeks: {
            "old_w": {
                week: { week_id: "old_w", week_number: 3 },
                sessions: [
                    { session_id: "S1", exercises: [{ name: "Sentadilla" }] }
                ]
            }
        }
    };
    const migrated = utils.migrateSchema(oldData);
    assert.strictEqual(migrated.schema_version, 2);
    assert(migrated.modified_at);
    assert(migrated.weeks["old_w"].week.modified_at);
    assert(migrated.weeks["old_w"].sessions[0].modified_at);
});

// 5. Tests de Analítica (1RM Epley)
console.log('\n[5] Pruebas de Analítica (analytics.estimate1RM)');

test('estimate1RM calcula correctamente según fórmula de Epley', () => {
    assert.strictEqual(analytics.estimate1RM(100, 1), 100);
    // 100 * (1 + 10/30) = 133.3
    assert.strictEqual(analytics.estimate1RM(100, 10), 133.3);
    assert.strictEqual(analytics.estimate1RM(null, 5), null);
});

console.log(`\n==============================================`);
console.log(`Todos los tests superados con éxito (${passed}/${total})`);
console.log(`==============================================\n`);
