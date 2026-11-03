// Builds dist/dash-kit.global.js: the ES modules in js/ as one classic script that sets window.DashKit = { … }.
// For pages without a bundler (plain HTML). Bundlers (Angular, Vite, Next) import js/*.js directly.
// No dependencies: imports are dropped (everything shares one scope), `export` keywords stripped. Run: node build.cjs
const fs = require('node:fs'), path = require('node:path');
const ORDER = ['format', 'tooltip', 'icons', 'markup', 'chart', 'bars', 'copy'];   // dependencies first
const pkg = require('./package.json'), names = [];
let body = '';
for (const m of ORDER) {
  let src = fs.readFileSync(path.join(__dirname, 'js', m + '.js'), 'utf8');
  src = src.replace(/^import [^;]+;\n/gm, '');
  src = src.replace(/^export (function|const|let|async function) ([\w$]+)/gm, (_, kw, name) => { names.push(name); return `${kw} ${name}`; });
  body += `\n// ── ${m}.js ──\n${src}`;
}
const out = `/*! @bobbytable/dash-kit ${pkg.version} · MIT · built from js/ by build.cjs — do not edit */\n(function () {\n'use strict';${body}\nwindow.DashKit = { ${names.join(', ')} };\n})();\n`;
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'dash-kit.global.js'), out);
console.log(`dist/dash-kit.global.js · ${names.length} exports: ${names.join(' ')}`);
