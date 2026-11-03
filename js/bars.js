// @bobbytable/dash-kit · tooltips for bar rows (markup.bars / any .pbars > span with data-m/-v/-u[/-rows]): hover, tap, drag
import { esc } from './format.js';
import { tipShow, tipHide } from './tooltip.js';
export function barTip(e) {
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
export function installBarTips(root = document) {
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
