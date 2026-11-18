# Falcon Crest Ventures — Website

**Web Technology (01CE1306)** · Computer Engineering · Faculty of Engineering and Technology
Academic Year 2026–2027 · CSE Project

**Vats Kotadia** · Enrolment no. 92610120001
Marwadi University

A complete front-end website for a fictional venture capital firm, built from
scratch with **HTML5, CSS3 and vanilla JavaScript**. No frameworks, no build
step, no libraries.

---

## Running it

Open `index.html` in any modern browser. That's the whole setup — there is no
server, no `npm install`, no compilation.

To reach the admin console, use the **Admin console** link in the footer, or
open `admin/login.html` directly.

**Demo sign-in:** `m.reyes@falconcrest.vc` / `falcon2026`

Because there is no back end, the login form validates the credentials in
JavaScript and then redirects. Any `@falconcrest.vc` address with a password of
8+ characters containing a letter and a number will pass.

---

## Pages

### Client side — 6 pages

| File | Page | What it does |
|---|---|---|
| `index.html` | Home | Hero, firm statistics, portfolio strip, investment areas |
| `portfolio.html` | Portfolio | Company grid with live sector/status filtering and search |
| `company.html` | Company profile | Single-company detail view with facts table and timeline |
| `thesis.html` | Thesis & focus | Investment thesis, criteria lists, deal terms |
| `insights.html` | Insights | Featured article, post list, newsletter sign-up |
| `contact.html` | Contact | **Validated pitch form**, direct contacts, offices |

### Admin side — 7 pages

| File | Page | What it does |
|---|---|---|
| `admin/login.html` | Sign in | **Validated login form** with domain and password rules |
| `admin/index.html` | Portfolio companies | Sortable, searchable data table with KPI strip |
| `admin/add-company.html` | Add company | **Validated new-company form** with numeric range rules |
| `admin/lp-reporting.html` | LP reporting | Quarterly pack builder, LP table, fund performance rail |
| `admin/allocation.html` | Fund & allocation | Capital allocation bar, reserve plan, sector breakdown |
| `admin/analytics.html` | Analytics | Deal funnel, vintage chart, sourcing, loss reasons |
| `admin/team.html` | Team & permissions | Tabbed members / roles / external access views |

---

## Structure

```
falcon-crest/
├── index.html              Client pages
├── portfolio.html
├── company.html
├── thesis.html
├── insights.html
├── contact.html
├── admin/                  Admin console
│   ├── login.html
│   ├── index.html
│   ├── add-company.html
│   ├── lp-reporting.html
│   ├── allocation.html
│   ├── analytics.html
│   └── team.html
├── css/
│   ├── style.css           Tokens, layout, components, client pages
│   └── admin.css           Console shell, tables, charts
├── js/
│   ├── main.js             Navigation, filtering, search, sorting, tabs
│   └── validation.js       Reusable form validation engine
└── README.md
```

---

## JavaScript form validation

`js/validation.js` is a small reusable engine. A form opts in with
`data-validate novalidate`, and each control declares its own rules as data
attributes, so no per-form JavaScript is needed:

```html
<input type="email" id="email"
       data-rule-required="We need an email address to reply to."
       data-rule-email="That address doesn't look right.">
```

Rules available:

| Attribute | Purpose |
|---|---|
| `data-rule-required` | Field must not be empty |
| `data-rule-email` | Must be a well-formed address |
| `data-rule-min="n\|msg"` | Minimum character length |
| `data-rule-max="n\|msg"` | Maximum character length |
| `data-rule-pattern="regex\|msg"` | Must match a regular expression |
| `data-rule-number="lo,hi\|msg"` | Numeric, within a range |
| `data-rule-match="fieldId\|msg"` | Must equal another field |
| `data-rule-checked="msg"` | Checkbox must be ticked |

Behaviour:

- Fields validate on **blur**, then live on every keystroke once already flagged,
  so it corrects as you type rather than nagging mid-entry.
- On submit, every rule runs, a summary appears at the top of the form, and
  focus jumps to the first problem field.
- Errors are announced to screen readers via `role="alert"` and `aria-invalid`.
- The textarea fields carry live character counters.

Forms using it: the pitch form (`contact.html`), the sign-in form
(`admin/login.html`), the add-company form (`admin/add-company.html`) and the
newsletter sign-up (`insights.html`).

---

## Other JavaScript

`js/main.js` handles: the mobile navigation toggle, the admin sidebar drawer
(with click-outside and Escape to close), portfolio filtering by sector and
status, live company search with an empty state, "load more" reveal, admin table
search, click-to-sort table columns (text and numeric), tab switching, and the
current year in every footer.

---

## Responsiveness

Layouts are built with CSS Grid and Flexbox and adapt at three breakpoints:

| Breakpoint | Changes |
|---|---|
| `1180px` | Gutters tighten, portfolio drops to 3 columns, admin rail moves below |
| `900px` | Navigation collapses to a hamburger, sidebar becomes a drawer, grids stack |
| `600px` | Single-column throughout, filter chips scroll horizontally |

Also handled: `prefers-reduced-motion` disables transitions, a print stylesheet
strips navigation chrome, and every interactive element has a visible keyboard
focus ring.

---

## Accessibility

- Skip links to main content on every page
- Semantic landmarks (`header`, `nav`, `main`, `aside`, `footer`) with labels
- `aria-current="page"` on the active navigation item
- `aria-pressed` on filter toggles, `aria-expanded` on menu buttons
- `role="tablist"` / `role="tab"` / `role="tabpanel"` on the team page tabs
- Table `<caption>` elements and `scope` attributes on headers
- Form errors linked to their inputs via `aria-describedby`

---

## A note on fonts

Typefaces (Archivo, Inter, IBM Plex Mono) load from Google Fonts. With no
internet connection the pages fall back to the system sans-serif and monospace
stacks declared in `css/style.css`. Layout and spacing are unaffected either
way, only the letterforms change.

To remove the dependency completely, download the three families from
[fonts.google.com](https://fonts.google.com), drop the `.woff2` files into a
`fonts/` folder, and add matching `@font-face` rules at the top of
`css/style.css`. The existing `--font-display`, `--font-body` and `--font-mono`
custom properties will pick them up with no other change.

---

## Code style

- All presentation lives in the two stylesheets. The only inline styles left in
  the HTML are chart bar percentages and flex ratios, because those values are
  the data being displayed rather than styling decisions.
- Colours, type, spacing and radii are all defined once as custom properties at
  the top of `css/style.css` and reused everywhere, including by `admin.css`.
- Class names follow a light BEM convention (`block__element--modifier`).

---

## Design source

The layouts follow the wireframes produced for CSE Task 2, built in Figma with
matching colour variables, text styles and components. The colour tokens at the
top of `css/style.css` are the same values as the Figma variable collection.
