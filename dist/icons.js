// src/icons.ts
var ATTR = "viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"";
var escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
function resolve(x) {
	if (Array.isArray(x)) return x;
	const node = globalThis.lucide?.icons?.[x];
	if (!node) console.warn(`[dash-kit] icon "${x}" not found — import it from 'lucide' and pass the node, or load the Lucide UMD build`);
	return node || [];
}
/** inline SVG string <svg class="ic …">; size in px (default: css, 1.15 em); a label makes it announced, else aria-hidden */
function icon(x, { size, label, class: cls } = {}) {
	const body = resolve(x).map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${escAttr(v)}"`).join(" ")}/>`).join("");
	const dims = size ? ` style="width:${+size}px;height:${+size}px"` : "";
	const a11y = label ? ` role="img" aria-label="${escAttr(label)}"` : " aria-hidden=\"true\"";
	return `<svg class="ic${cls ? " " + escAttr(cls) : ""}" ${ATTR}${dims}${a11y}>${body}</svg>`;
}
/** replace every <i data-icon="Name"> under root with its SVG (names via window.lucide, or pass a { Name: node } map) */
function hydrateIcons(root = document, icons) {
	for (const el of root.querySelectorAll("[data-icon]")) {
		const n = el.dataset.icon ?? "";
		el.outerHTML = icon(icons?.[n] ?? n, {
			label: el.getAttribute("aria-label") || void 0,
			class: el.className || void 0
		});
	}
}
export { hydrateIcons, icon };

//# sourceMappingURL=icons.js.map