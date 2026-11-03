// @bobbytable/dash-kit · copy to clipboard (falls back to execCommand outside secure contexts, e.g. plain http on a LAN)
export function copyText(text) {
  if (navigator.clipboard && isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => false);
  const t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', '');
  t.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';   // 16px: no iOS zoom
  (document.querySelector('dialog[open]') || document.body).append(t);   // inside an open dialog, or the copy is blocked t.select(); t.setSelectionRange(0, text.length);
  let ok = false; try { ok = document.execCommand('copy'); } catch {}
  t.remove(); return Promise.resolve(ok);
}

/** copy buttons: <button data-copy="text"> — label in .cl shows 'Copied', icon-only buttons flash a check (pass checkIcon html) */
export function installCopyButtons({ checkIcon = '✓', root = document } = {}) {
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
