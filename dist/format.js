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
export { ago, bytes, date, days, dur, esc, hhmm, longDate, rate, spaced, when };

//# sourceMappingURL=format.js.map