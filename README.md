# @bobbytable/dash-kit

A reusable dashboard kit: Dracula (dark) / Alucard (light) colour tokens,
JetBrains Mono, cards, charts, tables, tab bar and pop-ups. Light/dark follows `prefers-color-scheme`.

| File | What |
|---|---|
| `css/theme.css` | colour tokens (`--bg --card --ink --mute --faint --line --ok --warn --error --s1 --s2 …`) + the mono font |
| `css/icons.css` | `.ic` default size (1.15 em, follows the text) + colour helpers `.ic.ok .warn .error .mute .faint` |
| `css/base.css` | page layout, header, buttons, scrollbars |
| `css/components.css` | banner, cards, history strips, range picker, charts, tables, tooltips |
| `css/tabs.css` | tab bar |
| `css/modal.css` | pop-up (`dialog#modal`), log drawer, PIN dialog |
| `index.css` | all of the above, in order |

**`example.html` is the reference**: every component with its exact markup and the class names that drive it — open it next to
your editor (light/dark follows the system setting).

Load order matters (later files build on earlier ones). Use `index.css`, or the parts you need **in this order**.
Only `theme.css` if you just want the colours and font.

## Install

```sh
npm install @bobbytable/dash-kit
```

### Angular
`angular.json` → `projects.<app>.architect.build.options.styles`:
```json
"styles": ["node_modules/@bobbytable/dash-kit/index.css", "src/styles.css"]
```
or in `src/styles.scss`: `@import "@bobbytable/dash-kit/index.css";`

### Vite / React / Vue
In your entry file: `import '@bobbytable/dash-kit/index.css';`

### Next.js
In `app/layout.tsx` (or `pages/_app.tsx`): `import '@bobbytable/dash-kit/index.css';`

### Plain HTML (CDN)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@bobbytable/dash-kit@0.4/index.css">
```

## Icons
[Lucide](https://lucide.dev) icons as inline SVG (`stroke: currentColor`, so they take the text colour):

```js
import { icon } from '@bobbytable/dash-kit/icons';
import { Cctv, HardDrive } from 'lucide';        // npm install lucide — only what you import is bundled
el.innerHTML = `${icon(Cctv)} Cameras`;
icon(HardDrive, { size: 20, class: 'warn', label: 'Disk' });
```
Plain HTML: load Lucide's UMD build and use names — `icon('Cctv')`, or mark up `<i data-icon="Cctv"></i>` and call
`hydrateIcons()`. Angular: `[innerHTML]` with `DomSanitizer.bypassSecurityTrustHtml(icon(Cctv))`, or `hydrateIcons(el)` in
`ngAfterViewInit`. (Prefer components? `lucide-angular` / `lucide-react` render the same icons; `icons.css` styles them via `.ic`.)

## JavaScript
Small, dependency-free TypeScript modules (typed: `ChartConfig`, `Series`, `Point`, `BarCell`, `IconNode` …), built to ES modules +
`.d.ts` with Vite; they style through the CSS above:

| Import | What |
|---|---|
| `@bobbytable/dash-kit/chart` | `chart(el, cfg)` — canvas line chart: series, threshold bands (`warn`/`error`), crosshair + one tooltip, area, dashed series, a named mark |
| `@bobbytable/dash-kit/markup` | `bars(cells)` bar row · `meter(pct, warn, error)` threshold meter · `kv(rows)` key/value list (HTML strings) |
| `@bobbytable/dash-kit/bars` | `installBarTips()` — hover / tap / drag tooltips for every `.pbars` row |
| `@bobbytable/dash-kit/tooltip` | `tipShow` / `tipHide` — the sliding callout the charts use |
| `@bobbytable/dash-kit/format` | `esc bytes rate ago dur when date hhmm days spaced longDate` |
| `@bobbytable/dash-kit/copy` | `copyText(text)` · `installCopyButtons()` for `<button data-copy="…">` |
| `@bobbytable/dash-kit/icons` | see Icons |

```js
import { chart } from '@bobbytable/dash-kit/chart';
chart(document.querySelector('#cpu'), {           // <div class="chart" id="cpu"></div>
  series: [{ key: 'cpu', label: 'CPU', color: getComputedStyle(document.documentElement).getPropertyValue('--s1') }],
  points: [{ t: Date.now() - 60e3, cpu: 12 }, { t: Date.now(), cpu: 18 }],
  t0: Date.now() - 60e3, t1: Date.now(), gap: 10e3, yMin: 0, warn: 80, error: 95,
  fmt: v => v.toFixed(0) + ' %', tfmt: t => new Date(t).toLocaleTimeString(), endLabel: 'now', empty: 'no data yet' });
```
Call `chart(el, cfg)` again with new points to update it. **Angular**: call it in `ngAfterViewInit` (and on data changes)
with an `ElementRef`'s `nativeElement`.

**No bundler?** `<script src="…/dash-kit/dist/dash-kit.global.js"></script>` gives the same functions on `window.DashKit`
(built by `npm run build`, done automatically before publishing).

## Developing
`src/*.ts` → `npm run build` (Vite: `dist/*.js` + `dist/dash-kit.global.js`; tsc: `dist/types`). `npm run typecheck` for a quick check.
Open `example.html` through any static server to see the result.

## Versions
Semver. Pin a minor (`^0.4`) — colour tokens and class names only change in a new minor while < 1.0.

## Licence
MIT (`LICENSE`). JetBrains Mono (in `fonts/`) is under the SIL Open Font License 1.1 (`fonts/OFL.txt`).
