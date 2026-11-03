// @bobbytable/dash-kit · canvas line chart: 2px lines, recessive grid, threshold bands, crosshair + one tooltip for all series.
// chart(el, cfg) — call again with a new cfg to update; the element keeps its canvas + tooltip. Styled by .chart in components.css.
import { esc } from './format';
import { tipShow, tipHide } from './tooltip';

/** one line: key = the field in each point, color = any CSS colour (e.g. css('--s1')) */
export interface Series { key: string; label: string; color: string; dash?: number[]; area?: boolean }
/** a point in time (ms) with a value per series key; null/undefined = a gap */
export type Point = { t: number } & Record<string, number | null | undefined>;
export interface ChartConfig {
  series: Series[];
  points: Point[];
  /** visible time range (ms) */
  t0: number; t1: number;
  /** a jump between points larger than this (ms) breaks the line */
  gap: number;
  /** value → axis label; tipFmt (optional) for the tooltip */
  fmt: (v: number) => string; tipFmt?: (v: number) => string;
  /** time → label; tip = true for the tooltip heading */
  tfmt: (t: number, tip?: boolean) => string;
  /** fixed top of the scale; else nice-rounded max of the data (at least floor) */
  yMax?: number; floor?: number;
  /** 'auto': zoom to the band the data lives in; a number: bottom of the scale */
  yMin?: 'auto' | number;
  /** 'auto' zoom may go below 0 */
  signed?: boolean;
  /** threshold lines: the line turns yellow/red above them, dashed lines mark them */
  warn?: number; error?: number;
  /** a vertical dotted mark at this time, with an optional label (default "now") */
  mark?: number; markLabel?: string;
  /** label at the right end of the time axis (default tfmt(t1)) */
  endLabel?: string;
  /** shown while there are fewer than 2 points */
  empty: string;
}
interface ChartState { cv: HTMLCanvasElement; tip: HTMLElement; empty: HTMLElement; hover: number | null; cfg?: ChartConfig }

/** a CSS custom property's value from :root, e.g. css('--s1') */
export const css = (v: string): string => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export function niceMax(v: number): number {
  if (!(v > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(v)), f = v / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}

export const charts = new Map<Element, ChartState>();

/** draw (or update) a line chart in el — give el the class "chart" */
export function chart(el: HTMLElement, cfg: ChartConfig): void {
  let c = charts.get(el);
  if (!c) {
    el.innerHTML = '<canvas></canvas><div class="tip" hidden></div><div class="empty" hidden></div>';
    const s: ChartState = { cv: el.querySelector('canvas')!, tip: el.querySelector<HTMLElement>('.tip')!, empty: el.querySelector<HTMLElement>('.empty')!, hover: null };
    const move = (e: PointerEvent) => { s.hover = e.clientX - s.cv.getBoundingClientRect().left; draw(s); };
    s.cv.addEventListener('pointermove', move);
    s.cv.addEventListener('pointerdown', move);
    s.cv.addEventListener('pointerleave', () => { s.hover = null; draw(s); });
    charts.set(el, s); c = s;
  }
  c.cfg = cfg; draw(c);
}

/** redraw a chart from its state (charts.get(el)); chart() calls this */
export function draw(c: ChartState): void {
  const { cv, cfg } = c, dpr = devicePixelRatio || 1;
  const W = cv.clientWidth, H = cv.clientHeight;
  if (!W || !cfg) return;
  cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext('2d')!; g.scale(dpr, dpr);
  const pts = cfg.points.filter(p => p.t >= cfg.t0 && p.t <= cfg.t1 + 60e3);
  const n = pts.filter(p => cfg.series.some(s => p[s.key] != null)).length;
  c.empty.hidden = n > 1; c.empty.replaceChildren(Object.assign(document.createElement('span'), { textContent: cfg.empty }));
  const plotB = H - 16, top = 4;
  let lo = typeof cfg.yMin === 'number' ? cfg.yMin : 0, hi = cfg.yMax as number;
  if (hi == null) {
    let mx = cfg.floor ?? 0, mn = Infinity;
    for (const p of pts) for (const s of cfg.series) { const v = p[s.key]; if (v != null) { mx = Math.max(mx, v); mn = Math.min(mn, v); } }
    if (cfg.yMin === 'auto' && mn < Infinity) {   // zoom to the band the data lives in (disk fill), padded
      const pad = Math.max((mx - mn) * 0.5, mx * 0.002);
      lo = cfg.signed ? mn - pad : Math.max(0, mn - pad); hi = mx + pad;   // signed: temperatures may go below 0
    } else hi = niceMax(mx * 1.1);
  }
  const X = (t: number) => ((t - cfg.t0) / (cfg.t1 - cfg.t0)) * W;
  const Y = (v: number) => top + (1 - (Math.min(Math.max(v, lo), hi) - lo) / (hi - lo || 1)) * (plotB - top);
  const faint = css('--faint');
  const bands: [number, number, string | null][] = [[lo, cfg.warn ?? hi, null], ...(cfg.warn != null ? [[cfg.warn, cfg.error ?? hi, css('--warn')] as [number, number, string]] : []),
    ...(cfg.error != null ? [[cfg.error, hi, css('--error')] as [number, number, string]] : [])];
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
    const segs: { x: number; y: number }[][] = []; let path: { x: number; y: number; t: number }[] = [];
    for (const p of pts) {
      const v = p[s.key];
      if (v == null || (path.length && p.t - path.at(-1)!.t > cfg.gap)) { if (path.length) segs.push(path); path = []; }
      if (v != null) path.push({ x: X(p.t), y: Y(v), t: p.t });
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
          g.beginPath(); g.moveTo(seg[0].x, Y(lo)); seg.forEach(q => g.lineTo(q.x, q.y)); g.lineTo(seg.at(-1)!.x, Y(lo));
          g.globalAlpha = .12; g.fillStyle = col; g.fill(); g.globalAlpha = 1;
        }
        g.beginPath(); seg.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y)); g.stroke();
      }
      g.restore();
    }
  }
  for (const [v, k] of [[cfg.warn, '--warn'], [cfg.error, '--error']] as [number | undefined, string][]) {
    if (v == null || v <= lo || v >= hi) continue;
    const y = Math.round(Y(v)) + .5;
    g.save(); g.strokeStyle = css(k); g.globalAlpha = .6; g.setLineDash([3, 3]); g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); g.restore();
  }
  if (c.hover == null || !n) { tipHide(c.tip); return; }
  const t = cfg.t0 + (c.hover / W) * (cfg.t1 - cfg.t0);
  let best: Point | null = null;
  for (const p of pts) if (cfg.series.some(s => p[s.key] != null) && (!best || Math.abs(p.t - t) < Math.abs(best.t - t))) best = p;
  const bp = best as Point | null;
  if (!bp) { tipHide(c.tip); return; }
  const x = Math.round(X(bp.t)) + .5;
  g.strokeStyle = faint; g.lineWidth = 1; g.beginPath(); g.moveTo(x, top); g.lineTo(x, plotB); g.stroke();
  let html = `<div class="t">${esc(cfg.tfmt(bp.t, true))}</div>`;
  for (const s of cfg.series) {
    const v = bp[s.key]; if (v == null) continue;
    g.fillStyle = s.color; g.strokeStyle = css('--card'); g.lineWidth = 2;
    g.beginPath(); g.arc(x, Y(v), 4, 0, 7); g.fill(); g.stroke();
    html += `<div class="r"><i style="background:${esc(s.color)}"></i><b>${esc((cfg.tipFmt || cfg.fmt)(v))}</b><span>${esc(s.label)}</span></div>`;
  }
  // same callout behaviour as the bar charts (tipShow: fade in, then slide + resize); live redraws with the same content don't re-fade
  tipShow(c.tip, html, (t, tw) => { t.style.left = (x + 12 + tw > W ? Math.max(0, x - tw - 12) : x + 12) + 'px'; });
}
