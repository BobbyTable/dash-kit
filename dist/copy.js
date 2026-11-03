// src/copy.ts
/** copy text; resolves true when it worked */
function copyText(text) {
	if (navigator.clipboard && isSecureContext) return navigator.clipboard.writeText(text).then(() => true, () => false);
	const t = document.createElement("textarea");
	t.value = text;
	t.setAttribute("readonly", "");
	t.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
	(document.querySelector("dialog[open]") || document.body).append(t);
	t.select();
	t.setSelectionRange(0, text.length);
	let ok = false;
	try {
		ok = document.execCommand("copy");
	} catch {}
	t.remove();
	return Promise.resolve(ok);
}
/** copy buttons: <button data-copy="text"> — a label in .cl shows "Copied"; icon-only buttons flash checkIcon (HTML) */
function installCopyButtons({ checkIcon = "✓", root = document } = {}) {
	root.addEventListener("click", (e) => {
		const b = e.target?.closest?.("button[data-copy]");
		if (!b) return;
		const text = b.dataset.copy ?? "";
		copyText(text).then((ok) => {
			if (!ok) {
				prompt("Copy this:", text);
				return;
			}
			const lab = b.querySelector(".cl");
			if (lab) {
				const was = lab.textContent;
				lab.textContent = "Copied";
				setTimeout(() => {
					lab.textContent = was;
				}, 1500);
			} else {
				const was = b.innerHTML;
				b.innerHTML = checkIcon;
				b.classList.add("done");
				setTimeout(() => {
					b.innerHTML = was;
					b.classList.remove("done");
				}, 1500);
			}
		});
	});
}
export { copyText, installCopyButtons };

//# sourceMappingURL=copy.js.map