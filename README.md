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
The hero is an explanatory CSS illustration, not a Unity screenshot or a photograph of the controller.
The logo is the supplied horizontal master, with transparent export margins trimmed for web use.

Legal wording is preserved from the official Drive documents, including their stated dates:

- Terms VI: https://drive.google.com/file/d/1IpIoDW2zuXVJCvR-LreZke5EZ-39bM0_/view
- Terms EN: https://drive.google.com/file/d/1FghsN004OE_Tq8qFz8I6QD5fj3CpjkUy/view
- Privacy VI: https://docs.google.com/document/d/1ZQLMnV7gkJbV9usgARuQ7e7A2X2f-YIQMPu-t4wG7S4/edit
- Privacy EN: https://drive.google.com/file/d/1MWp1166ALhwgXQsXPJh-qZx4tc3IDVcu/view

The privacy source discusses accounts, advertising and AI services. It is reproduced as
provided, not used as evidence that these features are implemented in this static site.

Validation: `npm install --ignore-scripts --no-package-lock`, `npm audit --omit=dev`,
`node --check assets/scripts/main.js`, then `npm start -- --listen 4173` for browser checks.
The package has no build or lint script; its original `test` command is a placeholder.
