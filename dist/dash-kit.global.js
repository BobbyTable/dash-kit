var DashKit = (function(exports) {
	Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
	// src/format.ts
	/** escape for HTML text and attribute values */
	var esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		"\"": "&quot;"
	})[c]);
	/** 1234567 → "1.2 MB" (decimal units); d = decimals below 100 */
	function bytes(n, d = 1) {
		if (n == null || Number.isNaN(n)) return "—";
		const u = [
			"B",
			"KB",
			"MB",
			"GB",
			"TB"
		];
		let i = 0;
		while (Math.abs(n) >= 1e3 && i < u.length - 1) {
			n /= 1e3;
			i++;
		}
		return (i === 0 ? Math.round(n) : n.toFixed(n >= 100 ? 0 : d)) + " " + u[i];
	}
	var rate = (n) => bytes(n) + "/s";
	/** "just now", "12 min ago", "5 h ago", "3 days ago" */
	function ago(t) {
		const m = Math.round((Date.now() - new Date(t).getTime()) / 6e4);
		if (m < 1) return "just now";
		if (m < 60) return m + " min ago";
		const h = Math.round(m / 60);
		return h < 48 ? h + " h ago" : Math.round(h / 24) + " days ago";
	}
	/** seconds → "45 s", "12 min", "5 h 3 min", "2 d 4 h" */
	function dur(s) {
		if (s == null) return "—";
		if (s < 90) return Math.round(s) + " s";
		const m = Math.round(s / 60);
		if (m < 90) return m + " min";
		const h = Math.floor(m / 60);
		if (h < 48) return h + " h " + m % 60 + " min";
		return Math.floor(h / 24) + " d " + h % 24 + " h";
	}
	var when = (t) => new Date(t).toLocaleString([], {
		weekday: "short",
		hour: "2-digit",
		minute: "2-digit"
	});
	var date = (t) => new Date(t).toLocaleDateString([], {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
	var hhmm = (t, sec) => new Date(t).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		...sec ? { second: "2-digit" } : {}
	});
	var days = (n) => n === 1 ? "1 day" : n + " days";
	/** 1234567 → "1 234 567" (thin no-break spaces) */
	var spaced = (n) => n.toLocaleString("en-US").replace(/,/g, "\xA0");
	var longDate = (t) => new Date(t).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric"
	});
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
	// src/markup.ts
	/** threshold meter: blue up to warn, yellow up to error, red beyond; ticks mark both. Put it in <div class="meter">. */
	function meter(pct, w, e) {
		const p = Math.max(0, Math.min(100, pct ?? 0)), seg = (a, b) => Math.max(0, Math.min(p, b) - a);
		return `<i style="width:${seg(0, w ?? 100)}%"></i>` + (w != null ? `<i class="warn" style="width:${seg(w, e ?? 100)}%"></i>` : "") + (e != null ? `<i class="error" style="width:${seg(e, 100)}%"></i>` : "") + (w != null ? `<b class="warn" style="left:${w}%"></b>` : "") + (e != null ? `<b class="error" style="left:${e}%"></b>` : "");
	}
	/** key/value list; values are HTML (escape your own), falsy rows are skipped */
	var kv = (rows) => `<dl class="kv">${rows.filter((r) => !!r).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join("")}</dl>`;
	/** a row of thin bars with hover/tap/drag tooltips (call installBarTips() once); top = value of a full bar (default: the max) */
	function bars(cells, top) {
		const max = top || Math.max(1, ...cells.map((c) => c.n || 0));
		return `<div class="pbars">${cells.map((c) => `<span data-m="${esc(c.m)}" data-v="${esc(c.v)}" data-u="${esc(c.u)}"><i style="height:${Math.max(c.n ? 8 : 2, 100 * (c.n || 0) / max)}%" class="${c.n ? "" : "z"} ${c.cls || ""}"></i></span>`).join("")}<div class="tip" hidden></div></div>`;
	}
	// src/chart.ts
	/** a CSS custom property's value from :root, e.g. css('--s1') */
	var css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
	function niceMax(v) {
		if (!(v > 0)) return 1;
		const p = 10 ** Math.floor(Math.log10(v)), f = v / p;
		return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
	}
	var charts = /* @__PURE__ */ new Map();
	/** draw (or update) a line chart in el — give el the class "chart" */
	function chart(el, cfg) {
		let c = charts.get(el);
		if (!c) {
			el.innerHTML = "<canvas></canvas><div class=\"tip\" hidden></div><div class=\"empty\" hidden></div>";
			const s = {
				cv: el.querySelector("canvas"),
				tip: el.querySelector(".tip"),
				empty: el.querySelector(".empty"),
				hover: null
			};
			const move = (e) => {
				s.hover = e.clientX - s.cv.getBoundingClientRect().left;
				draw(s);
			};
			s.cv.addEventListener("pointermove", move);
			s.cv.addEventListener("pointerdown", move);
			s.cv.addEventListener("pointerleave", () => {
				s.hover = null;
				draw(s);
			});
			charts.set(el, s);
			c = s;
		}
		c.cfg = cfg;
		draw(c);
	}
	/** redraw a chart from its state (charts.get(el)); chart() calls this */
	function draw(c) {
		const { cv, cfg } = c, dpr = devicePixelRatio || 1;
		const W = cv.clientWidth, H = cv.clientHeight;
		if (!W || !cfg) return;
		cv.width = W * dpr;
		cv.height = H * dpr;
		const g = cv.getContext("2d");
		g.scale(dpr, dpr);
		const pts = cfg.points.filter((p) => p.t >= cfg.t0 && p.t <= cfg.t1 + 6e4);
		const n = pts.filter((p) => cfg.series.some((s) => p[s.key] != null)).length;
		c.empty.hidden = n > 1;
		c.empty.replaceChildren(Object.assign(document.createElement("span"), { textContent: cfg.empty }));
		const plotB = H - 16, top = 4;
		let lo = typeof cfg.yMin === "number" ? cfg.yMin : 0, hi = cfg.yMax;
		if (hi == null) {
			let mx = cfg.floor ?? 0, mn = Infinity;
			for (const p of pts) for (const s of cfg.series) {
				const v = p[s.key];
				if (v != null) {
					mx = Math.max(mx, v);
					mn = Math.min(mn, v);
				}
			}
			if (cfg.yMin === "auto" && mn < Infinity) {
				const pad = Math.max((mx - mn) * .5, mx * .002);
				lo = cfg.signed ? mn - pad : Math.max(0, mn - pad);
				hi = mx + pad;
			} else hi = niceMax(mx * 1.1);
		}
		const X = (t) => (t - cfg.t0) / (cfg.t1 - cfg.t0) * W;
		const Y = (v) => top + (1 - (Math.min(Math.max(v, lo), hi) - lo) / (hi - lo || 1)) * (plotB - top);
		const faint = css("--faint");
		const bands = [
			[
				lo,
				cfg.warn ?? hi,
				null
			],
			...cfg.warn != null ? [[
				cfg.warn,
				cfg.error ?? hi,
				css("--warn")
			]] : [],
			...cfg.error != null ? [[
				cfg.error,
				hi,
				css("--error")
			]] : []
		];
		g.font = "10px " + css("--mono");
		for (let i = 0; i <= 2; i++) {
			const v = lo + (hi - lo) * (i / 2), y = Math.round(Y(v)) + .5;
			g.strokeStyle = css("--grid");
			g.lineWidth = 1;
			g.beginPath();
			g.moveTo(0, y);
			g.lineTo(W, y);
			g.stroke();
			if (i > 0) {
				g.fillStyle = faint;
				g.textAlign = "right";
				g.textBaseline = "bottom";
				g.fillText(cfg.fmt(v), W - 2, y - 2);
			}
		}
		if (cfg.mark != null && cfg.mark > cfg.t0 && cfg.mark < cfg.t1) {
			const x = Math.round(X(cfg.mark)) + .5;
			g.save();
			g.strokeStyle = faint;
			g.setLineDash([2, 3]);
			g.beginPath();
			g.moveTo(x, top);
			g.lineTo(x, plotB);
			g.stroke();
			g.restore();
			g.fillStyle = faint;
			g.textBaseline = "top";
			if (cfg.markLabel) {
				g.textAlign = "right";
				g.fillText(cfg.markLabel, x - 5, (cfg.warn != null && cfg.warn < hi ? Y(cfg.warn) : top) + 7);
			} else {
				g.textAlign = "center";
				g.fillText("now", x, top);
			}
		}
		g.textBaseline = "alphabetic";
		g.fillStyle = faint;
		g.textAlign = "left";
		g.fillText(cfg.tfmt(cfg.t0), 0, H - 2);
		g.textAlign = "right";
		g.fillText(cfg.endLabel || cfg.tfmt(cfg.t1), W, H - 2);
		for (const s of cfg.series) {
			const segs = [];
			let path = [];
			for (const p of pts) {
				const v = p[s.key];
				if (v == null || path.length && p.t - path.at(-1).t > cfg.gap) {
					if (path.length) segs.push(path);
					path = [];
				}
				if (v != null) path.push({
					x: X(p.t),
					y: Y(v),
					t: p.t
				});
			}
			if (path.length) segs.push(path);
			for (const [b0, b1, bc] of bands) {
				if (b1 <= lo || b0 >= hi) continue;
				const yTop = b1 >= hi ? 0 : Y(b1), yBot = b0 <= lo ? H : Y(b0);
				g.save();
				g.beginPath();
				g.rect(0, yTop, W, yBot - yTop);
				g.clip();
				const col = bc || s.color;
				g.strokeStyle = col;
				g.lineWidth = 2;
				g.lineJoin = "round";
				g.lineCap = "round";
				g.setLineDash(s.dash || []);
				for (const seg of segs) {
					if (cfg.series.length === 1 || s.area) {
						g.beginPath();
						g.moveTo(seg[0].x, Y(lo));
						seg.forEach((q) => g.lineTo(q.x, q.y));
						g.lineTo(seg.at(-1).x, Y(lo));
						g.globalAlpha = .12;
						g.fillStyle = col;
						g.fill();
						g.globalAlpha = 1;
					}
					g.beginPath();
					seg.forEach((q, i) => i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y));
					g.stroke();
				}
				g.restore();
			}
		}
		for (const [v, k] of [[cfg.warn, "--warn"], [cfg.error, "--error"]]) {
			if (v == null || v <= lo || v >= hi) continue;
			const y = Math.round(Y(v)) + .5;
			g.save();
			g.strokeStyle = css(k);
			g.globalAlpha = .6;
			g.setLineDash([3, 3]);
			g.lineWidth = 1;
			g.beginPath();
			g.moveTo(0, y);
			g.lineTo(W, y);
			g.stroke();
			g.restore();
		}
		if (c.hover == null || !n) {
			tipHide(c.tip);
			return;
		}
		const t = cfg.t0 + c.hover / W * (cfg.t1 - cfg.t0);
		let best = null;
		for (const p of pts) if (cfg.series.some((s) => p[s.key] != null) && (!best || Math.abs(p.t - t) < Math.abs(best.t - t))) best = p;
		const bp = best;
		if (!bp) {
			tipHide(c.tip);
			return;
		}
		const x = Math.round(X(bp.t)) + .5;
		g.strokeStyle = faint;
		g.lineWidth = 1;
		g.beginPath();
		g.moveTo(x, top);
		g.lineTo(x, plotB);
		g.stroke();
		let html = `<div class="t">${esc(cfg.tfmt(bp.t, true))}</div>`;
		for (const s of cfg.series) {
			const v = bp[s.key];
			if (v == null) continue;
			g.fillStyle = s.color;
			g.strokeStyle = css("--card");
			g.lineWidth = 2;
			g.beginPath();
			g.arc(x, Y(v), 4, 0, 7);
			g.fill();
			g.stroke();
			html += `<div class="r"><i style="background:${esc(s.color)}"></i><b>${esc((cfg.tipFmt || cfg.fmt)(v))}</b><span>${esc(s.label)}</span></div>`;
		}
		tipShow(c.tip, html, (t, tw) => {
			t.style.left = (x + 12 + tw > W ? Math.max(0, x - tw - 12) : x + 12) + "px";
		});
	}
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
	exports.ago = ago;
	exports.barTip = barTip;
	exports.bars = bars;
	exports.bytes = bytes;
	exports.chart = chart;
	exports.charts = charts;
	exports.copyText = copyText;
	exports.css = css;
	exports.date = date;
	exports.days = days;
	exports.draw = draw;
	exports.dur = dur;
	exports.esc = esc;
	exports.hhmm = hhmm;
	exports.hydrateIcons = hydrateIcons;
	exports.icon = icon;
	exports.installBarTips = installBarTips;
	exports.installCopyButtons = installCopyButtons;
	exports.kv = kv;
	exports.longDate = longDate;
	exports.meter = meter;
	exports.niceMax = niceMax;
	exports.rate = rate;
	exports.reduceMotion = reduceMotion;
	exports.spaced = spaced;
	exports.tipHide = tipHide;
	exports.tipShow = tipShow;
	exports.when = when;
	return exports;
})({});

//# sourceMappingURL=dash-kit.global.js.map