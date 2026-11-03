/** one line: key = the field in each point, color = any CSS colour (e.g. css('--s1')) */
export interface Series {
    key: string;
    label: string;
    color: string;
    dash?: number[];
    area?: boolean;
}
/** a point in time (ms) with a value per series key; null/undefined = a gap */
export type Point = {
    t: number;
} & Record<string, number | null | undefined>;
export interface ChartConfig {
    series: Series[];
    points: Point[];
    /** visible time range (ms) */
    t0: number;
    t1: number;
    /** a jump between points larger than this (ms) breaks the line */
    gap: number;
    /** value → axis label; tipFmt (optional) for the tooltip */
    fmt: (v: number) => string;
    tipFmt?: (v: number) => string;
    /** time → label; tip = true for the tooltip heading */
    tfmt: (t: number, tip?: boolean) => string;
    /** fixed top of the scale; else nice-rounded max of the data (at least floor) */
    yMax?: number;
    floor?: number;
    /** 'auto': zoom to the band the data lives in; a number: bottom of the scale */
    yMin?: 'auto' | number;
    /** 'auto' zoom may go below 0 */
    signed?: boolean;
    /** threshold lines: the line turns yellow/red above them, dashed lines mark them */
    warn?: number;
    error?: number;
    /** a vertical dotted mark at this time, with an optional label (default "now") */
    mark?: number;
    markLabel?: string;
    /** label at the right end of the time axis (default tfmt(t1)) */
    endLabel?: string;
    /** shown while there are fewer than 2 points */
    empty: string;
}
interface ChartState {
    cv: HTMLCanvasElement;
    tip: HTMLElement;
    empty: HTMLElement;
    hover: number | null;
    cfg?: ChartConfig;
}
/** a CSS custom property's value from :root, e.g. css('--s1') */
export declare const css: (v: string) => string;
export declare function niceMax(v: number): number;
export declare const charts: Map<Element, ChartState>;
/** draw (or update) a line chart in el — give el the class "chart" */
export declare function chart(el: HTMLElement, cfg: ChartConfig): void;
/** redraw a chart from its state (charts.get(el)); chart() calls this */
export declare function draw(c: ChartState): void;
export {};
