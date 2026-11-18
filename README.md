# Zinbo — zelfstandig zinnen oefenen

Zinbo is een Nederlandstalige leeromgeving voor kinderen met taalontwikkelingsproblemen. De app gebruikt de bestaande statische HTML-oefenmotor en bewaart de voortgang lokaal in de browser.

## Leerlingversie

- Oefenwerelden met een instelbaar startniveau (1–4) en herhaling van bestaande taalvaardigheden.
- De inhoudsbank omvat 180 basisopgaven, 180 V4.3-opgaven, 14 O3-opgaven (omdat/als) en 15 VTT-opgaven: **389 opgavevermeldingen**. Een vermelding is alleen beschikbaar wanneer de bestaande inhouds- en beeldvrijgavepoorten slagen.
- Profiel met eigen naam en acht avatars, met bewaren en herstel van de keuze.
- Een ster na een normale ronde van vijf opgaven, met reguliere feedback en eindscherm; de demonstratieschatkist is uitsluitend beschikbaar via de expliciete auteurspilot.
- Hoorbare instructies, met voorkeur voor een Nederlandse `nl-NL`-spraakstem in plaats van `nl-BE`. De daadwerkelijke spraakkwaliteit hangt af van de geïnstalleerde browserstemmen.
- Geen backend, advertenties of externe runtime-afhankelijkheden.

## Avatarbibliotheek en rustigere navigatie

Vier gratis smileys en acht ontgrendelbare avatars maken sterren besteedbaar (één vaste prijs van vijf sterren). Een nieuwe ster wordt verdiend na een volledige reguliere ronde van vijf oefeningen, onafhankelijk van fouten of hulp; de bestaande beoordeling van zelfstandigheid verandert niet. Bestaande sterren en eerder gebruikte avatar-ID's blijven behouden. De aparte Instellingen-knop uit de bovenbalk is verwijderd, het profielmenu bevat ook Voor ouders, en Verder oefenen is een compacte actie naast de volgende uitdaging. De normale kinderroute heeft geen demonstratieschatkist of QA-bediening; de schatkist blijft uitsluitend beschikbaar binnen de expliciete auteurspilot, niet als tweede valuta. **Mijn zin terugluisteren** is een optionele begeleide proef, standaard uit totdat het didactisch is getoetst. Technisch contract: [UX_AVATARS_2026-10-31.md](docs/UX_AVATARS_2026-10-31.md).

## Premium redesign (live sinds 19 november 2026)

De goedgekeurde interface volgens Claude Opus is gepubliceerd op [zinbo.pages.dev](https://zinbo.pages.dev/): nieuwe startpagina, oefenschermen, zinsdeelkleuren en vormmarkeringen, compacte feedback en een terugblik op de vijf gemaakte zinnen. De kennismaking kan een voorzichtig oefenstartniveau adviseren; ouders behouden de keuze om het niveau handmatig vast te zetten. De selectie spreidt waar mogelijk oefenfamilies binnen een ronde. De introductie van nieuwe didactische beslisregels is geen klinische validatie of bewezen leereffect. De eerdere browseropslag blijft compatibel.

Release: [PR #15](https://github.com/market-predictions/zinbo/pull/15), met onderliggende PR's #10–#14 en [geverifieerde productie-CI](https://github.com/market-predictions/zinbo/actions/runs/44421396595). Zie de [ontwerphandoff](docs/HANDOFF_REDESIGN_V1.md) voor de status per fase.

## Publicatie en controle

De enige productieroute is **GitHub `main` → Cloudflare Pages → https://zinbo.pages.dev/**. Vooraf controleren we de releasebranch via pull request, GitHub Actions en een Cloudflare-branchpreview; geen Direct Upload.

- Build: `node scripts/build.mjs` → `public/index.html`
- Tekstcontrole: `node scripts/p0-text-audit.mjs --strict`
- Regressies: `node scripts/p0-regression.mjs`
- Chromium: `node scripts/p0-browser-smoke.mjs` (Playwright beschikbaar in CI)

Sinds de redesign van november 2026 komt de app uit onderhoudbare bronbestanden: `src/app/*.js`, `src/content/*.json`, `src/styles/` en `src/templates/`. `scripts/build.mjs` bouwt hiermee `public/index.html`, genereert de ontwerptokens en controleert de inhoudsbanken, de integriteit van de 37 illustraties en de goedgekeurde hondenafbeelding. Er is geen afhankelijkheid meer van de oude vijftien HTML-fragmenten of een hash van het volledige HTML-eindbestand.

De bijbehorende releaseverantwoording staat in `docs/RELEASE_PROMOTION_2026-10-28.md` en `docs/CONTENT_REVIEW_2026-10-28.json`. Een nieuwe afbeelding is niet automatisch opnieuw onafhankelijk beoordeeld.

**Let op:** lokale voortgang en voorkeuren zijn gekoppeld aan de browser en herkomst (domain). Gegevens van een branchpreview komen niet automatisch mee naar de productiepagina. De bestaande lokale opslagsleutel is om compatibiliteitsredenen behouden.

Zie [Cloudflare-inrichting](docs/CLOUDFLARE_PAGES.md).
