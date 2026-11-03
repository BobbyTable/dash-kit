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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@bobbytable/dash-kit@0.1/index.css">
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

## Versions
Semver. Pin a minor (`^0.1`) — colour tokens and class names only change in a new minor while < 1.0.

## Licence
MIT. JetBrains Mono (in `fonts/`) is under the SIL Open Font License 1.1.
