/** copy text; resolves true when it worked */
export declare function copyText(text: string): Promise<boolean>;
/** copy buttons: <button data-copy="text"> — a label in .cl shows "Copied"; icon-only buttons flash checkIcon (HTML) */
export declare function installCopyButtons({ checkIcon, root }?: {
    checkIcon?: string | undefined;
    root?: Document | HTMLElement | undefined;
}): void;
