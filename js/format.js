// @bobbytable/dash-kit · formatting: escaping, sizes, times, durations (English, compact)
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function bytes(n, d = 1) {
  if (n == null || Number.isNaN(n)) return '—';
  const u = ['B', 'KB', 'MB', 'GB', 'TB']; let i = 0;
  while (Math.abs(n) >= 1000 && i < u.length - 1) { n /= 1000; i++; }
  return (i === 0 ? Math.round(n) : n.toFixed(n >= 100 ? 0 : d)) + ' ' + u[i];
}

export const rate = n => bytes(n) + '/s';

export function ago(t) {
  const m = Math.round((Date.now() - new Date(t)) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return m + ' min ago';
  const h = Math.round(m / 60);
  return h < 48 ? h + ' h ago' : Math.round(h / 24) + ' days ago';
}

export function dur(s) {
  if (s == null) return '—';
  if (s < 90) return Math.round(s) + ' s';
  const m = Math.round(s / 60); if (m < 90) return m + ' min';
  const h = Math.floor(m / 60); if (h < 48) return h + ' h ' + (m % 60) + ' min';
  return Math.floor(h / 24) + ' d ' + (h % 24) + ' h';
}

export const when = t => new Date(t).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });

export const date = t => new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

export const hhmm = (t, sec) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', ...(sec ? { second: '2-digit' } : {}) });

export const days = n => n === 1 ? '1 day' : n + ' days';

export const spaced = n => n.toLocaleString('en-US').replace(/,/g, '\u00a0');

export const longDate = t => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
