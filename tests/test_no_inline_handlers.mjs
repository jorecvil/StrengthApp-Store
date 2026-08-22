import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const files = [
    new URL('../www/index.html', import.meta.url),
    new URL('../www/js/ui.js', import.meta.url),
    new URL('../www/dist/app.js', import.meta.url)
];
const inlineHandler = /\son[a-z]+\s*=/i;

for (const file of files) {
    const content = readFileSync(file, 'utf8');
    assert.equal(inlineHandler.test(content), false, `Handler inline detectado en ${file.pathname}`);
    assert.equal(/window\.event\b|Object\.assign\(window\b|window\.(actions|analytics|backup|logic|seasons|ui|utils)\b/.test(content), false, `Global interno detectado en ${file.pathname}`);
}

console.log('Inline handler check completed');
