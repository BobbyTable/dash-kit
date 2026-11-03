// @bobbytable/dash-kit · chart callouts: fade in where they appear, then slide + resize to the next point; fade out on leave
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

export function tipShow(tip, html, place) {          // place(tip, width) sets left/top
  const was = !tip.hidden && !tip.classList.contains('off'), w0 = was ? tip.offsetWidth : 0;
  clearTimeout(tip._hide); tip.style.width = ''; tip.innerHTML = html; tip.hidden = false;
  const w1 = tip.offsetWidth;                 // natural width of the new content
  if (!was || reduceMotion.matches) {        // reduceMotion: the one MediaQueryList, declared with the group headers               // appear in place, then fade in
    tip.style.transition = 'none'; place(tip, w1); tip.classList.add('off'); void tip.offsetWidth;
    tip.style.transition = ''; tip.classList.remove('off'); return;
  }
  tip.style.width = w0 + 'px'; void tip.offsetWidth; tip.style.width = w1 + 'px'; place(tip, w1);
}

export function tipHide(tip) {
  if (!tip || tip.hidden || tip.classList.contains('off')) return;
  tip.classList.add('off'); clearTimeout(tip._hide); tip._hide = setTimeout(() => { if (tip.classList.contains('off')) tip.hidden = true; }, 180);
}
