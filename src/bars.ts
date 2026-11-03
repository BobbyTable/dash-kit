// @bobbytable/dash-kit · tooltips for bar rows (markup.bars, or any .pbars > span with data-m/-v/-u[/-rows]): hover, tap, drag
import { esc } from './format';
import { tipShow, tipHide } from './tooltip';

/** pointer handler: shows the tooltip for the bar under e.target (exported so pages with their own scrubbing can reuse it) */
export function barTip(e: { target: EventTarget | null }): void {
  const el = e.target as Element | null;
  // pressing captures the pointer on the row (for drag-scrubbing); the browser then reports it as 'over' the row itself —
  // that isn't the pointer leaving the bars, so don't hide anything
  if (el?.matches?.('.pbars, .strip')) return;
  const b = el?.closest?.('.pbars > span') as HTMLElement | null;
  document.querySelectorAll('.pbars > span.on').forEach(x => x !== b && x.classList.remove('on'));
  document.querySelectorAll<HTMLElement>('.pbars .tip').forEach(t => { if (!b || t.parentNode !== b.parentNode) tipHide(t); });
  if (!b) return;
  const row = b.parentNode as HTMLElement, tip = row.querySelector<HTMLElement>('.tip'); if (!tip) return;
  const who = b.closest('.phrow')?.querySelector('.pn b')?.textContent;
  b.classList.add('on');
  const w = row.clientWidth, x = b.offsetLeft + b.offsetWidth / 2;
  // data-rows (optional): a legend, one row per series — [[colour var, label, value], …]
  const rows = b.dataset.rows ? (JSON.parse(b.dataset.rows) as [string, string, string][])
    .map(([c, l, v]) => `<div class="r lg"><i style="background:var(${c})"></i><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join('') : '';
  tipShow(tip, `<div class="t">${esc(b.dataset.m)}${who ? ' · ' + esc(who) : ''}</div><div class="r"><b>${esc(b.dataset.v)}</b><span>${esc(b.dataset.u)}</span></div>${rows}`,
    (t, tw) => { t.style.left = Math.min(w - tw / 2, Math.max(tw / 2, x)) + 'px'; });
}

// press and drag sideways across a bar row: the selection + tooltip follow the finger (vertical drags still scroll: touch-action pan-y)
let scrub: HTMLElement | null = null, installed = false;
/** wire the bar tooltips up once (document-level listeners; safe to call more than once) */
export function installBarTips(root: Document | HTMLElement = document): void {
  if (installed) return; installed = true;
  root.addEventListener('pointerover', barTip as EventListener);
  root.addEventListener('pointerdown', (e: Event) => {
    barTip(e); const p = (e.target as Element | null)?.closest?.('.pbars') as HTMLElement | null;
    scrub = p; if (p) p.setPointerCapture?.((e as PointerEvent).pointerId);
  });
  root.addEventListener('pointermove', (e: Event) => {
    if (!scrub) return;
    const pe = e as PointerEvent, r = scrub.getBoundingClientRect(), x = Math.min(r.right - 1, Math.max(r.left + 1, pe.clientX));
    const b = document.elementFromPoint(x, r.top + r.height / 2)?.closest('.pbars > span');
    if (b && b.parentNode === scrub && !b.classList.contains('on')) barTip({ target: b });
  });
  for (const t of ['pointerup', 'pointercancel']) root.addEventListener(t, () => { scrub = null; });
}
