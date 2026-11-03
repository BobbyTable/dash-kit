// @bobbytable/dash-kit · formatting: escaping, sizes, times, durations (English, compact)
type Time = number | string | Date;

/** escape for HTML text and attribute values */
export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c as '&' | '<' | '>' | '"']);

/** 1234567 → "1.2 MB" (decimal units); d = decimals below 100 */
export function bytes(n: number | null | undefined, d = 1): string {
  if (n == null || Number.isNaN(n)) return '—';
  const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0;
  while (Math.abs(n) >= 1000 && i < u.length - 1) { n /= 1000; i++; }
  return (i === 0 ? Math.round(n) : n.toFixed(n >= 100 ? 0 : d)) + ' ' + u[i];
}
export const rate = (n: number | null | undefined): string => bytes(n) + '/s';

/** "just now", "12 min ago", "5 h ago", "3 days ago" */
export function ago(t: Time): string {
  const m = Math.round((Date.now() - new Date(t).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + ' min ago';
  const h = Math.round(m / 60);
  return h < 48 ? h + ' h ago' : Math.round(h / 24) + ' days ago';
}
/** seconds → "45 s", "12 min", "5 h 3 min", "2 d 4 h" */
export function dur(s: number | null | undefined): string {
  if (s == null) return '—';
  if (s < 90) return Math.round(s) + ' s';
  const m = Math.round(s / 60); if (m < 90) return m + ' min';
  const h = Math.floor(m / 60); if (h < 48) return h + ' h ' + (m % 60) + ' min';
  return Math.floor(h / 24) + ' d ' + (h % 24) + ' h';
}
export const when = (t: Time): string => new Date(t).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
export const date = (t: Time): string => new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
export const hhmm = (t: Time, sec?: boolean): string =>
  new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', ...(sec ? { second: '2-digit' } : {}) });
export const days = (n: number): string => n === 1 ? '1 day' : n + ' days';
/** 1234567 → "1 234 567" (thin no-break spaces) */
export const spaced = (n: number): string => n.toLocaleString('en-US').replace(/,/g, ' ');
export const longDate = (t: Time): string => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
