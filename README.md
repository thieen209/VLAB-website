# VLAB Website

This is a static landing page for VLAB. Run it locally with:

```powershell
npm start
```

## Structure

- `index.html` — page markup
- `assets/styles/main.css` — page styling
- `assets/scripts/main.js` — interactions, animations, and language/theme controls
- `assets/images/logos/` — VLAB logo variants
- `components/` and `lib/` — reusable React utilities retained for a future app build

## Content and deployment

This remains a static site: no compile/build step or framework migration is required.
Vercel serves this directory; `vercel.json` enables `/terms` and `/privacy` as clean URLs.
The browser demos are conceptual simulations, separate from the Unity prototypes.
Hardware direction and lab stages reflect the project owner's September 2026 update;
performance, affordability and educational impact are not presented as measured outcomes.
The website uses real Unity captures and supplied team/Kit imagery; future glasses are an AI-generated concept.
The October refresh uses a current main-menu capture and four clean 4K Ultra room photographs,
with smaller responsive image variants. Capture provenance and verification are recorded in
[`docs/refresh-2026-10-26.md`](docs/refresh-2026-10-26.md).
The header and footer use the supplied with-text logo, switching variants for light and dark mode.

Legal wording is preserved from the official Drive documents, including their stated dates:

- Terms VI: https://drive.google.com/file/d/1IpIoDW2zuXVJCvR-LreZke5EZ-39bM0_/view
- Terms EN: https://drive.google.com/file/d/1FghsN004OE_Tq8qFz8I6QD5fj3CpjkUy/view
- Privacy VI: https://docs.google.com/document/d/1ZQLMnV7gkJbV9usgARuQ7e7A2X2f-YIQMPu-t4wG7S4/edit
- Privacy EN: https://drive.google.com/file/d/1MWp1166ALhwgXQsXPJh-qZx4tc3IDVcu/view

The privacy source discusses accounts, advertising and AI services. It is reproduced as
provided, not used as evidence that these features are implemented in this static site.

Validation: `npm install --ignore-scripts --no-package-lock`, `npm audit --omit=dev`,
`node --check assets/scripts/main.js`, then `npm start` for the preview at http://127.0.0.1:4178/.
Run `npm test` for local link/image checks, bilingual download controls, release-link consistency,
and motion/theme preference initialization. No build step is needed.

## Downloads and motion

The download page links directly to the public VLAB GitHub release APK, including its version,
minimum Android version, size, date and SHA-256. It deliberately pins a named release: GitHub's
`releases/latest` excludes the project's prereleases. Check the VLAB repository's Releases list
when updating it, and keep the APK URL, visible details and checksum together.

The footer's motion control is remembered across pages. It defaults to the operating system's
reduced-motion preference; without a saved choice, it also follows live preference changes.
Turning motion off removes entrance animations, hover movement and smooth scrolling, and pauses
the pendulum demo. Page content remains visible without JavaScript.
