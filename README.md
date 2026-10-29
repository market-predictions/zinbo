# Zinbo — zelfstandig zinnen oefenen

Zinbo is een Nederlandstalige leeromgeving voor kinderen met taalontwikkelingsproblemen. De app gebruikt de bestaande statische HTML-oefenmotor en bewaart de voortgang lokaal in de browser.

## Leerlingversie

- Oefenwerelden met een instelbaar startniveau (1–4) en herhaling van bestaande taalvaardigheden.
- De inhoudsbank omvat 180 basisopgaven, 180 V4.3-opgaven, 14 O3-opgaven (omdat/als) en 15 VTT-opgaven: **389 opgavevermeldingen**. Een vermelding is alleen beschikbaar wanneer de bestaande inhouds- en beeldvrijgavepoorten slagen.
- Profiel met eigen naam en acht avatars, met bewaren en herstel van de keuze.
- Schatkist, munten en feedback na een normale vijfopgavenronde; beloningen staan los van taalbeheersing.
- Hoorbare instructies, met voorkeur voor een Nederlandse `nl-NL`-spraakstem in plaats van `nl-BE`. De daadwerkelijke spraakkwaliteit hangt af van de geïnstalleerde browserstemmen.
- Geen backend, advertenties of externe runtime-afhankelijkheden.

## Publicatie en controle

De enige productieroute is **GitHub `main` → Cloudflare Pages → https://zinbo.pages.dev/**. Vooraf controleren we de releasebranch via pull request, GitHub Actions en een Cloudflare-branchpreview; geen Direct Upload.

- Build: `node scripts/build.mjs` → `public/index.html`
- Tekstcontrole: `node scripts/p0-text-audit.mjs --strict`
- Regressies: `node scripts/p0-regression.mjs`
- Chromium: `node scripts/p0-browser-smoke.mjs` (Playwright beschikbaar in CI)

De HTML-bron is technisch in vijftien delen opgeslagen onder `src/html-parts/` vanwege de bestandsgroottelimiet van de GitHub-koppeling. `scripts/build.mjs` herstelt het productiebestand en controleert een gepinde SHA-256, de vrijgegeven inhoudsbanken en de vervangende hondenillustratie.

De bijbehorende releaseverantwoording staat in `docs/RELEASE_PROMOTION_2026-10-28.md` en `docs/CONTENT_REVIEW_2026-10-28.json`. Een nieuwe afbeelding is niet automatisch opnieuw onafhankelijk beoordeeld.

**Let op:** lokale voortgang en voorkeuren zijn gekoppeld aan de browser en herkomst (domain). Gegevens van een branchpreview komen niet automatisch mee naar de productiepagina. De bestaande lokale opslagsleutel is om compatibiliteitsredenen behouden.

Zie [Cloudflare-inrichting](docs/CLOUDFLARE_PAGES.md).
