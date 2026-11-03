/*! @bobbytable/dash-kit 0.3.0 · MIT · built from js/ by build.cjs — do not edit */
(function () {
'use strict';
// ── format.js ──
// @bobbytable/dash-kit · formatting: escaping, sizes, times, durations (English, compact)
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function bytes(n, d = 1) {
  if (n == null || Number.isNaN(n)) return '—';
  const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0;
  while (Math.abs(n) >= 1000 && i < u.length - 1) { n /= 1000; i++; }
  return (i === 0 ? Math.round(n) : n.toFixed(n >= 100 ? 0 : d)) + ' ' + u[i];
}

const rate = n => bytes(n) + '/s';

function ago(t) {
  const m = Math.round((Date.now() - new Date(t)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + ' min ago';
  const h = Math.round(m / 60);
  return h < 48 ? h + ' h ago' : Math.round(h / 24) + ' days ago';
}

function dur(s) {
  if (s == null) return '—';
  if (s < 90) return Math.round(s) + ' s';
  const m = Math.round(s / 60); if (m < 90) return m + ' min';
  const h = Math.floor(m / 60); if (h < 48) return h + ' h ' + (m % 60) + ' min';
  return Math.floor(h / 24) + ' d ' + (h % 24) + ' h';
}

const when = t => new Date(t).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });

const date = t => new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

const hhmm = (t, sec) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', ...(sec ? { second: '2-digit' } : {}) });

const days = n => n === 1 ? '1 day' : n + ' days';

const spaced = n => n.toLocaleString('en-US').replace(/,/g, '\u00a0');

const longDate = t => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

// ── tooltip.js ──
// @bobbytable/dash-kit · chart callouts: fade in where they appear, then slide + resize to the next point; fade out on leave
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function tipShow(tip, html, place) {          // place(tip, width) sets left/top
  const was = !tip.hidden && !tip.classList.contains('off'), w0 = was ? tip.offsetWidth : 0;
  clearTimeout(tip._hide); tip.style.width = ''; tip.innerHTML = html; tip.hidden = false;
  const w1 = tip.offsetWidth;                 // natural width of the new content
  if (!was || reduceMotion.matches) {        // reduceMotion: the one MediaQueryList, declared with the group headers               // appear in place, then fade in
    tip.style.transition = 'none'; place(tip, w1); tip.classList.add('off'); void tip.offsetWidth;
    tip.style.transition = ''; tip.classList.remove('off'); return;
  }
  tip.style.width = w0 + 'px'; void tip.offsetWidth; tip.style.width = w1 + 'px'; place(tip, w1);
}

function tipHide(tip) {
  if (!tip || tip.hidden || tip.classList.contains('off')) return;
  tip.classList.add('off'); clearTimeout(tip._hide); tip._hide = setTimeout(() => { if (tip.classList.contains('off')) tip.hidden = true; }, 180);
}

// ── icons.js ──
// @bobbytable/dash-kit · icons — Lucide (https://lucide.dev, ISC) as inline SVG strings, styled by css/icons.css (.ic).
// The icon set is not bundled here: import just the icons you use from 'lucide' (tree-shaken), or load Lucide's UMD
// build on a plain page and pass names.
//
//   import { icon } from '@bobbytable/dash-kit/icons';
//   import { Cctv, HardDrive } from 'lucide';
//   el.innerHTML = icon(Cctv) + ' Cameras';
//   icon('Cctv')                          // by name, when window.lucide (UMD) is on the page
//   icon(Cctv, { size: 20, label: 'Cameras', class: 'ok' })
//
// Angular: bind with [innerHTML]="safe(icon(Cctv))" (DomSanitizer.bypassSecurityTrustHtml), or use hydrateIcons() after render.

const ATTR = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** an icon node from Lucide (array of [tag, attrs]) or a name looked up on window.lucide.icons */
function resolve(x) {
  if (Array.isArray(x)) return x;
  const node = globalThis.lucide?.icons?.[x];
  if (!node) console.warn(`[dash-kit] icon "${x}" not found — import it from 'lucide' and pass the node, or load the Lucide UMD build`);
  return node || [];
}

/** inline SVG string: <svg class="ic …">…</svg>; size in px (default: css, 1.15em); label makes it announced, else aria-hidden */
function icon(x, { size, label, class: cls } = {}) {
  const body = resolve(x).map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${escAttr(v)}"`).join(' ')}/>`).join('');
  const dims = size ? ` style="width:${+size}px;height:${+size}px"` : '';   // inline style: beats the .ic default (attributes would not)
  const a11y = label ? ` role="img" aria-label="${escAttr(label)}"` : ' aria-hidden="true"';
  return `<svg class="ic${cls ? ' ' + escAttr(cls) : ''}" ${ATTR}${dims}${a11y}>${body}</svg>`;
}

/** replace every <i data-icon="Name"> under root with its SVG (names via window.lucide, or pass an { Name: node } map) */
function hydrateIcons(root = document, icons) {
  for (const el of root.querySelectorAll('[data-icon]')) {
    const n = el.dataset.icon, node = icons?.[n] ?? n;
    el.outerHTML = icon(node, { label: el.getAttribute('aria-label') || undefined, class: el.className || undefined });
  }
}

// ── markup.js ──
// @bobbytable/dash-kit · markup helpers (HTML strings): threshold meter, key/value list, bar row (tooltips: bars.js)
function meter(pct, w, e) {
  const p = Math.max(0, Math.min(100, pct ?? 0)), seg = (a, b) => Math.max(0, Math.min(p, b) - a);
  return `<i style="width:${seg(0, w ?? 100)}%"></i>` +
    (w != null ? `<i class="warn" style="width:${seg(w, e ?? 100)}%"></i>` : '') +
    (e != null ? `<i class="error" style="width:${seg(e, 100)}%"></i>` : '') +
    (w != null ? `<b class="warn" style="left:${w}%"></b>` : '') + (e != null ? `<b class="error" style="left:${e}%"></b>` : '');
}

const kv = rows => `<dl class="kv">${rows.filter(Boolean).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join('')}</dl>`;

function bars(cells, top) {
  const max = top || Math.max(1, ...cells.map(c => c.n || 0));
  return `<div class="pbars">${cells.map(c => `<span data-m="${esc(c.m)}" data-v="${esc(c.v)}" data-u="${esc(c.u)}"><i style="height:${Math.max(c.n ? 8 : 2, 100 * (c.n || 0) / max)}%" class="${c.n ? '' : 'z'} ${c.cls || ''}"></i></span>`).join('')}<div class="tip" hidden></div></div>`;
}

// ── chart.js ──
// @bobbytable/dash-kit · canvas line chart: 2px lines, recessive grid, threshold bands, crosshair + one tooltip for all series
// chart(el, cfg) — call again with a new cfg to update; the element keeps its canvas + tooltip
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

function niceMax(v) {
  if (!(v > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(v)), f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}

const charts = new Map();

function chart(el, cfg) {
  // cfg: { series:[{key,label,color,dash?}], points:[{t,…}], t0, t1, gap, fmt, tipFmt?, tfmt, mark?(t), signed?, yMax?, yMin?('auto'), floor?, endLabel?, empty }
  let c = charts.get(el);
  if (!c) {
    el.innerHTML = '<canvas></canvas><div class="tip" hidden></div><div class="empty" hidden></div>';
    c = { cv: el.querySelector('canvas'), tip: el.querySelector('.tip'), empty: el.querySelector('.empty'), hover: null };
    const move = e => { c.hover = e.clientX - c.cv.getBoundingClientRect().left; draw(c); };
    c.cv.addEventListener('pointermove', move);
    c.cv.addEventListener('pointerdown', move);
    c.cv.addEventListener('pointerleave', () => { c.hover = null; draw(c); });
    charts.set(el, c);
  }
  c.cfg = cfg; draw(c);
}

function draw(c) {
  const { cv, cfg } = c, dpr = devicePixelRatio || 1;
  const W = cv.clientWidth, H = cv.clientHeight;
  if (!W || !cfg) return;
  cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  const pts = cfg.points.filter(p => p.t >= cfg.t0 && p.t <= cfg.t1 + 60e3);
  const n = pts.filter(p => cfg.series.some(s => p[s.key] != null)).length;
  c.empty.hidden = n > 1; c.empty.replaceChildren(Object.assign(document.createElement('span'), { textContent: cfg.empty }));
  const plotB = H - 16, top = 4;
  let lo = 0, hi = cfg.yMax;
  if (hi == null) {
    let mx = cfg.floor ?? 0, mn = Infinity;
    for (const p of pts) for (const s of cfg.series) { const v = p[s.key]; if (v != null) { mx = Math.max(mx, v); mn = Math.min(mn, v); } }
    if (cfg.yMin === 'auto' && mn < Infinity) {   // zoom to the band the data lives in (disk fill), padded
      const pad = Math.max((mx - mn) * 0.5, mx * 0.002);
      lo = cfg.signed ? mn - pad : Math.max(0, mn - pad); hi = mx + pad;   // signed: temperatures may go below 0
    } else hi = niceMax(mx * 1.1);
  }
  const X = t => ((t - cfg.t0) / (cfg.t1 - cfg.t0)) * W;
  const Y = v => top + (1 - (Math.min(Math.max(v, lo), hi) - lo) / (hi - lo || 1)) * (plotB - top);
  const faint = css('--faint');
  const bands = [[lo, cfg.warn ?? hi, null], ...(cfg.warn != null ? [[cfg.warn, cfg.error ?? hi, css('--warn')]] : []),
    ...(cfg.error != null ? [[cfg.error, hi, css('--error')]] : [])];
  g.font = '10px ' + css('--mono');
  for (let i = 0; i <= 2; i++) {                  // 3 recessive gridlines, labels just above, right-aligned
    const v = lo + (hi - lo) * (i / 2), y = Math.round(Y(v)) + .5;
    g.strokeStyle = css('--grid'); g.lineWidth = 1; g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
    if (i > 0) { g.fillStyle = faint; g.textAlign = 'right'; g.textBaseline = 'bottom'; g.fillText(cfg.fmt(v), W - 2, y - 2); }
  }
  if (cfg.mark != null && cfg.mark > cfg.t0 && cfg.mark < cfg.t1) {   // "now" on a chart that runs into the future
    const x = Math.round(X(cfg.mark)) + .5;
    g.save(); g.strokeStyle = faint; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(x, top); g.lineTo(x, plotB); g.stroke(); g.restore();
    g.fillStyle = faint; g.textBaseline = 'top';
    if (cfg.markLabel) {   // a named mark: left of the line and below the warn/error lines, so it never sits on them
      g.textAlign = 'right'; g.fillText(cfg.markLabel, x - 5, (cfg.warn != null && cfg.warn < hi ? Y(cfg.warn) : top) + 7);
    } else { g.textAlign = 'center'; g.fillText('now', x, top); }
  }
  g.textBaseline = 'alphabetic'; g.fillStyle = faint;
  g.textAlign = 'left'; g.fillText(cfg.tfmt(cfg.t0), 0, H - 2);
  g.textAlign = 'right'; g.fillText(cfg.endLabel || cfg.tfmt(cfg.t1), W, H - 2);
  for (const s of cfg.series) {
    const segs = []; let path = [];
    for (const p of pts) {
      const v = p[s.key];
      if (v == null || (path.length && p.t - path.at(-1).t > cfg.gap)) { if (path.length) segs.push(path); path = []; }
      if (v != null) path.push({ x: X(p.t), y: Y(v) });
    }
    if (path.length) segs.push(path);
    // one pass per threshold band, clipped to it: the part of a line above warn/error takes that color
    for (const [b0, b1, bc] of bands) {
      if (b1 <= lo || b0 >= hi) continue;
      const yTop = b1 >= hi ? 0 : Y(b1), yBot = b0 <= lo ? H : Y(b0);   // outer bands reach the edges (line caps)
      g.save(); g.beginPath(); g.rect(0, yTop, W, yBot - yTop); g.clip();
      const col = bc || s.color;
      g.strokeStyle = col; g.lineWidth = 2; g.lineJoin = 'round'; g.lineCap = 'round'; g.setLineDash(s.dash || []);   // dash: e.g. a projection
      for (const seg of segs) {
        if (cfg.series.length === 1 || s.area) {   // a lone series (or one asking for it) gets a faint area under its line
          g.beginPath(); g.moveTo(seg[0].x, Y(lo)); seg.forEach(q => g.lineTo(q.x, q.y)); g.lineTo(seg.at(-1).x, Y(lo));
          g.globalAlpha = .12; g.fillStyle = col; g.fill(); g.globalAlpha = 1;
        }
        g.beginPath(); seg.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
      }
      g.restore();
    }
  }
  for (const [v, k] of [[cfg.warn, '--warn'], [cfg.error, '--error']]) {
    if (v == null || v <= lo || v >= hi) continue;
    const y = Math.round(Y(v)) + .5;
    g.save(); g.strokeStyle = css(k); g.globalAlpha = .6; g.setLineDash([3, 3]); g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); g.restore();
  }
  if (c.hover == null || !n) { tipHide(c.tip); return; }
  const t = cfg.t0 + (c.hover / W) * (cfg.t1 - cfg.t0);
  let best = null;
  for (const p of pts) if (cfg.series.some(s => p[s.key] != null) && (!best || Math.abs(p.t - t) < Math.abs(best.t - t))) best = p;
  if (!best) { tipHide(c.tip); return; }
  const x = Math.round(X(best.t)) + .5;
  g.strokeStyle = faint; g.lineWidth = 1; g.beginPath(); g.moveTo(x, top); g.lineTo(x, plotB); g.stroke();
  let html = `<div class="t">${esc(cfg.tfmt(best.t, true))}</div>`;
  for (const s of cfg.series) {
    const v = best[s.key]; if (v == null) continue;
    g.fillStyle = s.color; g.strokeStyle = css('--card'); g.lineWidth = 2;
    g.beginPath(); g.arc(x, Y(v), 4, 0, 7); g.fill(); g.stroke();
    html += `<div class="r"><i style="background:${esc(s.color)}"></i><b>${esc((cfg.tipFmt || cfg.fmt)(v))}</b><span>${esc(s.label)}</span></div>`;
  }
  // same callout behaviour as the bar charts (tipShow: fade in, then slide + resize); live redraws with the same content don't re-fade
  tipShow(c.tip, html, (t, tw) => { t.style.left = (x + 12 + tw > W ? Math.max(0, x - tw - 12) : x + 12) + 'px'; });
}

// ── bars.js ──
// @bobbytable/dash-kit · tooltips for bar rows (markup.bars / any .pbars > span with data-m/-v/-u[/-rows]): hover, tap, drag
function barTip(e) {
  // pressing captures the pointer on the row (for drag-scrubbing); the browser then reports it as 'over' the row itself —
  // that isn't the pointer leaving the bars, so don't hide anything
  if (e.target?.matches?.('.pbars, .strip')) return;
  const b = e.target.closest?.('.pbars > span');
  document.querySelectorAll('.pbars > span.on').forEach(x => x !== b && x.classList.remove('on'));
  document.querySelectorAll('.pbars .tip').forEach(t => { if (!b || t.parentNode !== b.parentNode) tipHide(t); });
  if (!b) return;
  const tip = b.parentNode.querySelector('.tip'), who = b.closest('.phrow')?.querySelector('.pn b')?.textContent;
  b.classList.add('on');
  const w = b.parentNode.clientWidth, x = b.offsetLeft + b.offsetWidth / 2;
  // data-rows (optional): a legend, one row per series — [[colour var, label, value], …]
  const rows = b.dataset.rows ? JSON.parse(b.dataset.rows).map(([c, l, v]) => `<div class="r lg"><i style="background:var(${c})"></i><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join('') : '';
  tipShow(tip, `<div class="t">${esc(b.dataset.m)}${who ? ' · ' + esc(who) : ''}</div><div class="r"><b>${esc(b.dataset.v)}</b><span>${esc(b.dataset.u)}</span></div>${rows}`,
    (t, tw) => { t.style.left = Math.min(w - tw / 2, Math.max(tw / 2, x)) + 'px'; });
}

// press and drag sideways across a bar row: the selection + tooltip follow the finger (vertical drags still scroll: touch-action pan-y)
let scrub = null, installed = false;
/** wire the bar tooltips up once (document-level listeners; safe to call more than once) */
function installBarTips(root = document) {
  if (installed) return; installed = true;
  root.addEventListener('pointerover', barTip);
  root.addEventListener('pointerdown', e => { barTip(e); const p = e.target.closest?.('.pbars'); scrub = p || null; if (p) p.setPointerCapture?.(e.pointerId); });
  root.addEventListener('pointermove', e => {
    if (!scrub) return;
    const r = scrub.getBoundingClientRect(), x = Math.min(r.right - 1, Math.max(r.left + 1, e.clientX)), at = document.elementFromPoint(x, r.top + r.height / 2);
    const b = at?.closest?.('.pbars > span');
    if (b && b.parentNode === scrub && !b.classList.contains('on')) barTip({ target: b });
  });
  for (const t of ['pointerup', 'pointercancel']) root.addEventListener(t, () => { scrub = null; });
}

// ── copy.js ──
// @bobbytable/dash-kit · copy to clipboard (falls back to execCommand outside secure contexts, e.g. plain http on a LAN)
function copyText(text) {
  if (navigator.clipboard && isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => false);
  const t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', '');
  t.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';   // 16px: no iOS zoom
  (document.querySelector('dialog[open]') || document.body).append(t);   // inside an open dialog, or the copy is blocked t.select(); t.setSelectionRange(0, text.length);
  let ok = false; try { ok = document.execCommand('copy'); } catch {}
  t.remove(); return Promise.resolve(ok);
}

/** copy buttons: <button data-copy="text"> — label in .cl shows 'Copied', icon-only buttons flash a check (pass checkIcon html) */
function installCopyButtons({ checkIcon = '✓', root = document } = {}) {
  root.addEventListener('click', e => {
  const b = e.target.closest?.('button[data-copy]'); if (!b) return;
  copyText(b.dataset.copy).then(ok => {
    if (!ok) { prompt('Copy this:', b.dataset.copy); return; }   // browser refused: show it ready to copy by hand
    const lab = b.querySelector('.cl');
    if (lab) { const was = lab.textContent; lab.textContent = 'Copied'; setTimeout(() => { lab.textContent = was; }, 1500); }
    else { const was = b.innerHTML; b.innerHTML = checkIcon; b.classList.add('done'); setTimeout(() => { b.innerHTML = was; b.classList.remove('done'); }, 1500); }   // icon-only
  });
});
}

window.DashKit = { esc, bytes, rate, ago, dur, when, date, hhmm, days, spaced, longDate, reduceMotion, tipShow, tipHide, icon, hydrateIcons, meter, kv, bars, css, niceMax, charts, chart, draw, barTip, installBarTips, copyText, installCopyButtons };
})();
