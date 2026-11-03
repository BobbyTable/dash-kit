export declare const reduceMotion: MediaQueryList;
/** show (or move) a callout: html content, place(tip, width) sets its left/top */
export declare function tipShow(tip: HTMLElement, html: string, place: (tip: HTMLElement, width: number) => void): void;
/** fade a callout out (then hide it) */
export declare function tipHide(tip: HTMLElement | null | undefined): void;
