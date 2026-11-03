// src/tooltip.ts
var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
/** show (or move) a callout: html content, place(tip, width) sets its left/top */
function tipShow(tip, html, place) {
	const t = tip, was = !t.hidden && !t.classList.contains("off"), w0 = was ? t.offsetWidth : 0;
	clearTimeout(t._hide);
	t.style.width = "";
	t.innerHTML = html;
	t.hidden = false;
	const w1 = t.offsetWidth;
	if (!was || reduceMotion.matches) {
		t.style.transition = "none";
		place(t, w1);
		t.classList.add("off");
		t.offsetWidth;
		t.style.transition = "";
		t.classList.remove("off");
		return;
	}
	t.style.width = w0 + "px";
	t.offsetWidth;
	t.style.width = w1 + "px";
	place(t, w1);
}
/** fade a callout out (then hide it) */
function tipHide(tip) {
	const t = tip;
	if (!t || t.hidden || t.classList.contains("off")) return;
	t.classList.add("off");
	clearTimeout(t._hide);
	t._hide = setTimeout(() => {
		if (t.classList.contains("off")) t.hidden = true;
	}, 180);
}
export { reduceMotion, tipHide, tipShow };

//# sourceMappingURL=tooltip.js.map