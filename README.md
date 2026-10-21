# Zinbo — oefenen met taal en zinnen

De officiële GitHub-bron van Zinbo (voorheen Zinsbouwer).

## Huidige status

- **V4.6.2 auteurspilot**, technisch getest; **geen** vrijgegeven kindrelease.
- Neutrale niveaus 1–4, adaptieve grammaticale oefeningen, VTT, `omdat` en `als`.
- De bestaande illustraties, audio en interface blijven ongewijzigd.
- Geen backend of externe runtime nodig; voortgang wordt in de browser bewaard.
- Niet alle kandidaatopgaven zijn onafhankelijk didactisch vrijgegeven.

## Publicatie

Cloudflare Pages is bedoeld als **Git-gekoppelde** stagingomgeving. Publiceer niet via Direct Upload.

- Repository: `market-predictions/zinbo`
- Production branch: `main`
- Framework preset: `None`
- Build command: `node scripts/build.mjs`
- Build output: `public`
- Gewenste projectnaam: `zinbo` (`https://zinbo.pages.dev`, indien beschikbaar)

De V4.6.2-release zit in `src/html-parts/` als vijftien genummerde tekstsegmenten, uitsluitend vanwege de uploadlimiet van de GitHub-koppeling. Het kleine standaard Node-script voegt ze **byte voor byte** samen tot `public/index.html` en controleert de SHA-256. Dit is geen tweede applicatie of deploymentroute.

Lokaal controleren: `node scripts/build.mjs` en `public/index.html` openen.

Zie [Cloudflare-inrichting](docs/CLOUDFLARE_PAGES.md).

**Let op:** de publieke testsite gebruikt een andere browser-opslagoorsprong dan de eerdere offline HTML. Voortgang verhuist niet automatisch. `noindex` is geen toegangsbeveiliging; gebruik geen persoonsgegevens van kinderen voor deze publieke test.
