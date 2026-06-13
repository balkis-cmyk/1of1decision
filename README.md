# HALIMO — Portfolio

A bold, animated one-page portfolio. Wolf-of-Wall-Street / Hormozi energy:
gold-on-black, big Anton type, smooth-scroll reveals, animated counters,
money-rain background, a custom magnetic cursor, and an interactive
**"Catch the Bag"** mini-game.

## ⚠️ Add the photo (1 step)
Save Halimo's boardroom photo here, named exactly:

```
assets/halimo.jpg
```

(The presentation shot — black vest, tablet in hand — is the one wired into the
About section.) Until you add it, the site shows a clean "HALIMO" fallback card.

## Run it
Just **double-click `index.html`** — it works straight from the file system
(GSAP / Lenis load from CDN).

Or serve it locally for the smoothest experience:
```bash
cd halimo-portfolio
python3 -m http.server 4600
# open http://localhost:4600
```

## Easy things to edit
- **Stats** — in `index.html`, the `.stats` section. Each number is a
  `data-count` attribute (e.g. followers, clients). Change the numbers there.
- **Services** — the four `.svc` cards in `index.html`.
- **Links** — Instagram is set to `instagram.com/1of1halimo`; update TikTok /
  YouTube / LinkedIn / email in the Contact section.
- **Colors** — the `--gold`, `--bg`, etc. variables at the top of `styles.css`.

## Files
- `index.html` — structure & copy
- `styles.css` — all styling + the money aesthetic
- `script.js` — loader, cursor, smooth scroll, GSAP reveals, counters, money rain
- `game.js` — the Catch the Bag game
