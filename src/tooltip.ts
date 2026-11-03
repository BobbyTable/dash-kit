// @bobbytable/dash-kit · chart callouts: fade in where they appear, then slide + resize to the next point; fade out on leave
export const reduceMotion: MediaQueryList = matchMedia('(prefers-reduced-motion: reduce)');

type Tip = HTMLElement & { _hide?: ReturnType<typeof setTimeout> };

/** show (or move) a callout: html content, place(tip, width) sets its left/top */
export function tipShow(tip: HTMLElement, html: string, place: (tip: HTMLElement, width: number) => void): void {
  const t = tip as Tip, was = !t.hidden && !t.classList.contains('off'), w0 = was ? t.offsetWidth : 0;
  clearTimeout(t._hide); t.style.width = ''; t.innerHTML = html; t.hidden = false;
  const w1 = t.offsetWidth;                  // natural width of the new content
  if (!was || reduceMotion.matches) {        // appear in place, then fade in
    t.style.transition = 'none'; place(t, w1); t.classList.add('off'); void t.offsetWidth;
    t.style.transition = ''; t.classList.remove('off'); return;
  }
  t.style.width = w0 + 'px'; void t.offsetWidth; t.style.width = w1 + 'px'; place(t, w1);
}
/** fade a callout out (then hide it) */
export function tipHide(tip: HTMLElement | null | undefined): void {
  const t = tip as Tip | null | undefined;
  if (!t || t.hidden || t.classList.contains('off')) return;
  t.classList.add('off'); clearTimeout(t._hide); t._hide = setTimeout(() => { if (t.classList.contains('off')) t.hidden = true; }, 180);
}
