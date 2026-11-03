type Time = number | string | Date;
/** escape for HTML text and attribute values */
export declare const esc: (s: unknown) => string;
/** 1234567 → "1.2 MB" (decimal units); d = decimals below 100 */
export declare function bytes(n: number | null | undefined, d?: number): string;
export declare const rate: (n: number | null | undefined) => string;
/** "just now", "12 min ago", "5 h ago", "3 days ago" */
export declare function ago(t: Time): string;
/** seconds → "45 s", "12 min", "5 h 3 min", "2 d 4 h" */
export declare function dur(s: number | null | undefined): string;
export declare const when: (t: Time) => string;
export declare const date: (t: Time) => string;
export declare const hhmm: (t: Time, sec?: boolean) => string;
export declare const days: (n: number) => string;
/** 1234567 → "1 234 567" (thin no-break spaces) */
export declare const spaced: (n: number) => string;
export declare const longDate: (t: Time) => string;
export {};
