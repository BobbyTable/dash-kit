/** pointer handler: shows the tooltip for the bar under e.target (exported so pages with their own scrubbing can reuse it) */
export declare function barTip(e: {
    target: EventTarget | null;
}): void;
/** wire the bar tooltips up once (document-level listeners; safe to call more than once) */
export declare function installBarTips(root?: Document | HTMLElement): void;
