/** a Lucide icon node: [tag, attributes][] */
export type IconNode = [string, Record<string, string | number>][];
export interface IconOptions {
    size?: number;
    label?: string;
    class?: string;
}
/** inline SVG string <svg class="ic …">; size in px (default: css, 1.15 em); a label makes it announced, else aria-hidden */
export declare function icon(x: IconNode | string, { size, label, class: cls }?: IconOptions): string;
/** replace every <i data-icon="Name"> under root with its SVG (names via window.lucide, or pass a { Name: node } map) */
export declare function hydrateIcons(root?: Document | Element, icons?: Record<string, IconNode>): void;
