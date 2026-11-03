import { esc } from "./format.js";
import { tipHide, tipShow } from "./tooltip.js";
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
export { chart, charts, css, draw, niceMax };

//# sourceMappingURL=chart.js.map