// @bobbytable/dash-kit · copy to clipboard (falls back to execCommand outside secure contexts, e.g. plain http on a LAN)

/** copy text; resolves true when it worked */
export function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => false);
  const t = document.createElement('textarea'); t.value = text; t.setAttribute('readonly', '');
  t.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';   // 16px: no iOS zoom
  (document.querySelector('dialog[open]') || document.body).append(t);        // inside an open dialog, or the copy is blocked
  t.select(); t.setSelectionRange(0, text.length);
  let ok = false; try { ok = document.execCommand('copy'); } catch { /* not allowed */ }
  t.remove(); return Promise.resolve(ok);
}

/** copy buttons: <button data-copy="text"> — a label in .cl shows "Copied"; icon-only buttons flash checkIcon (HTML) */
export function installCopyButtons({ checkIcon = '✓', root = document as Document | HTMLElement } = {}): void {
  root.addEventListener('click', (e: Event) => {
    const b = (e.target as Element | null)?.closest?.('button[data-copy]') as HTMLButtonElement | null; if (!b) return;
    const text = b.dataset.copy ?? '';
    copyText(text).then(ok => {
      if (!ok) { prompt('Copy this:', text); return; }   // browser refused: show it ready to copy by hand
      const lab = b.querySelector('.cl');
      if (lab) { const was = lab.textContent; lab.textContent = 'Copied'; setTimeout(() => { lab.textContent = was; }, 1500); }
      else { const was = b.innerHTML; b.innerHTML = checkIcon; b.classList.add('done'); setTimeout(() => { b.innerHTML = was; b.classList.remove('done'); }, 1500); }
    });
  });
}
