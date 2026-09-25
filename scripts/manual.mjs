// npm run manual — docs/MANUAL_DEMO.md → public/manual/index.html (+ images) → docs/MANUAL_DEMO.pdf
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { marked } from 'marked';
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const md = readFileSync('docs/MANUAL_DEMO.md', 'utf8');
const imgs = [...md.matchAll(/\]\(screenshots\/([^)]+)\)/g)].map((m) => m[1]);
mkdirSync('public/manual/img', { recursive: true });
for (const f of imgs) cpSync(`docs/screenshots/${f}`, `public/manual/img/${f}`);

const body = marked.parse(md.replaceAll('](screenshots/', '](img/'));
const html = `<!doctype html><html lang="es-PE"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Manual de la demo · KuyayPet</title><link rel="icon" href="../favicon.svg">
<style>
:root{--cream:#FFF8EE;--cocoa:#4A2E22;--terra:#B5553A;--sage:#4F8A65;--line:#F0D4AE}
*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--cocoa);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:860px;margin:0 auto;padding:24px 16px 64px}
h1{color:var(--terra);font-size:2.1rem;margin:.2em 0}h2{margin-top:2em;border-bottom:2px solid var(--line);padding-bottom:.2em}
a{color:var(--terra)}code{background:#F9E6CC;padding:.1em .35em;border-radius:6px}
table{width:100%;border-collapse:collapse;margin:1em 0;font-size:.92rem;display:block;overflow-x:auto}
th,td{border:1px solid var(--line);padding:.45em .6em;text-align:left;vertical-align:top}th{background:#F9E6CC}
img{max-width:100%;border-radius:16px;box-shadow:0 8px 24px -10px rgba(74,46,34,.35);margin:.6em 0;display:block}
hr{border:0;border-top:1px dashed var(--line);margin:2em 0}
.back{display:inline-block;margin-bottom:8px;font-weight:700}
@media print{body{background:#fff}main{max-width:none;padding:0}h2{break-after:avoid}table,img{break-inside:avoid}.back{display:none}img{max-height:420px;width:auto}}
</style></head><body><main><a class="back" href="../">← Volver a la app</a>${body}</main></body></html>`;
writeFileSync('public/manual/index.html', html);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve('public/manual/index.html')).href);
await page.pdf({ path: 'docs/MANUAL_DEMO.pdf', format: 'A4', printBackground: true, margin: { top: '16mm', bottom: '16mm', left: '14mm', right: '14mm' } });
await browser.close();
console.log('✓ manual: public/manual/index.html + docs/MANUAL_DEMO.pdf');
