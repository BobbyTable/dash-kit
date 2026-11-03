/** threshold meter: blue up to warn, yellow up to error, red beyond; ticks mark both. Put it in <div class="meter">. */
export declare function meter(pct: number | null | undefined, w?: number | null, e?: number | null): string;
/** key/value list; values are HTML (escape your own), falsy rows are skipped */
export declare const kv: (rows: Array<[string, string] | null | undefined | false>) => string;
/** one bar of a bar row: m = tooltip title, n = height value, v + u = tooltip value + unit, cls = extra class on the bar */
export interface BarCell {
    m: string;
    n?: number | null;
    v: string | number;
    u?: string;
    cls?: string;
}
/** a row of thin bars with hover/tap/drag tooltips (call installBarTips() once); top = value of a full bar (default: the max) */
export declare function bars(cells: BarCell[], top?: number): string;
