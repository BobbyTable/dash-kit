import { esc } from "./format.js";
import { tipHide, tipShow } from "./tooltip.js";
// src/bars.ts
/** pointer handler: shows the tooltip for the bar under e.target (exported so pages with their own scrubbing can reuse it) */
function barTip(e) {
	const el = e.target;
	if (el?.matches?.(".pbars, .strip")) return;
	const b = el?.closest?.(".pbars > span");
	document.querySelectorAll(".pbars > span.on").forEach((x) => x !== b && x.classList.remove("on"));
	document.querySelectorAll(".pbars .tip").forEach((t) => {
		if (!b || t.parentNode !== b.parentNode) tipHide(t);
	});
	if (!b) return;
	const row = b.parentNode, tip = row.querySelector(".tip");
	if (!tip) return;
	const who = b.closest(".phrow")?.querySelector(".pn b")?.textContent;
	b.classList.add("on");
	const w = row.clientWidth, x = b.offsetLeft + b.offsetWidth / 2;
	const rows = b.dataset.rows ? JSON.parse(b.dataset.rows).map(([c, l, v]) => `<div class="r lg"><i style="background:var(${c})"></i><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join("") : "";
	tipShow(tip, `<div class="t">${esc(b.dataset.m)}${who ? " · " + esc(who) : ""}</div><div class="r"><b>${esc(b.dataset.v)}</b><span>${esc(b.dataset.u)}</span></div>${rows}`, (t, tw) => {
		t.style.left = Math.min(w - tw / 2, Math.max(tw / 2, x)) + "px";
	});
}
var scrub = null;
var installed = false;
/** wire the bar tooltips up once (document-level listeners; safe to call more than once) */
function installBarTips(root = document) {
	if (installed) return;
	installed = true;
	root.addEventListener("pointerover", barTip);
	root.addEventListener("pointerdown", (e) => {
		barTip(e);
		const p = e.target?.closest?.(".pbars");
		scrub = p;
		if (p) p.setPointerCapture?.(e.pointerId);
	});
	root.addEventListener("pointermove", (e) => {
		if (!scrub) return;
		const pe = e, r = scrub.getBoundingClientRect(), x = Math.min(r.right - 1, Math.max(r.left + 1, pe.clientX));
		const b = document.elementFromPoint(x, r.top + r.height / 2)?.closest(".pbars > span");
		if (b && b.parentNode === scrub && !b.classList.contains("on")) barTip({ target: b });
	});
	for (const t of ["pointerup", "pointercancel"]) root.addEventListener(t, () => {
		scrub = null;
	});
}
export { barTip, installBarTips };

//# sourceMappingURL=bars.js.map