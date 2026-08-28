# Revigora — Landing page & waitlist

Static, dependency-free landing page for the Danish launch of Revigora. Built to the
`PRD.md` spec: linen canvas, Instrument Serif display, Inter body, mint/teal conversion
palette, mobile-first with one breakpoint at 768px.

## Run

No build step. Serve the folder over HTTP (needed for the fonts + fetch to behave):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

## Structure

```
index.html                     markup + all Danish copy
assets/css/styles.css          design tokens (PRD §1.4) + every section + responsive
assets/js/main.js              scroll reveal, hero readout animation, waitlist modal
assets/img/placeholder/*.svg   aspect-locked placeholder art for the image slots
```

## Wire up the waitlist (Formspree)

1. Create a form at <https://formspree.io> and copy its endpoint
   (`https://formspree.io/f/xxxxxxxx`).
2. Open `assets/js/main.js` and replace the value of `FORM_ENDPOINT` at the top.

The modal POSTs JSON:

```json
{ "intent": "longevity", "name": "...", "email": "...", "city": "København",
  "locale": "da", "source": "landing-waitlist" }
```

On a non-OK response the modal shows an inline retry message and keeps the entered data.
The confirmation step shows a plain "you're on the list" message plus a share action
(`navigator.share` where available, copy-link fallback otherwise) — no priority number,
per the agreed scope.

## Swap in real photography

Each image slot is a plain `<img>` (hero uses `<picture>` for art direction — 16:9 on
desktop, 4:5 on mobile). Drop real files into `assets/img/` and update the `src` /
`srcset`. Keep the intrinsic ratio and the `width`/`height` attributes so layout shift
stays at zero:

| Slot | File(s) | Ratio |
|---|---|---|
| Hero | `hero-16x9.*`, `hero-4x5.*` | 16:9 / 4:5 |
| Package cards | `package-performance.*`, `package-longevity.*`, `package-membership.*` | 4:3 |

## Design tokens

All tokens live in `:root` in `styles.css` and mirror `PRD.md §1.4` verbatim. Two
deliberate additions:

- `--color-paper: #EFE3D3` — a linen tint used for the readout tracks and card insets.
- `--font-mono: 'IBM Plex Mono'` — a utility face for biomarker values, prices and data
  labels (lab-report vernacular).

The **readout** component (`.readout`) is the signature element: a range track with a
low / optimal / high scale and an animated marker dot. It appears in the hero dashboard
card, the value-prop cards, and the package biomarker counts.

## Analytics

`track()` in `main.js` pushes to `window.dataLayer` when present, otherwise
`console.debug`. Events: `mobile_modal_open`, `desktop_modal_open`, `waitlist_completed`.

## Danish copy — review checklist

Copy was translated from the PRD's English. Worth a native pass:

- Hero headline: *"Stop med at gætte om dit helbred. Mål det, der tæller — indeni."*
- Section 2 heading: *"Fra prøve til protokol, uden gætværk."*
- Founder letter (two paragraphs) — tone should stay authoritative, not literal.
- Package names kept in English (*Performance & Fitness*, *Longevity & Healthspan*) as
  product names; badges and body are Danish.
- Prices use Danish format: `2.490 kr.`, `3.990 kr.`, `1.190 kr. / kvartal`.

## Accessibility / performance notes

- All interactive targets ≥ 48px; visible `:focus-visible` rings; skip link.
- Modal traps focus, closes on `Esc` / backdrop, restores focus to the trigger.
- `prefers-reduced-motion` disables reveal + readout animation.
- No render-blocking images; placeholder art is inline-styled SVG. LCP element is the
  hero `<h1>` text.
