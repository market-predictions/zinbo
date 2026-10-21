# Zinbo — GitHub → Cloudflare Pages

## Eenmalige configuratie

1. Cloudflare Dashboard → Workers & Pages → Create application → Pages → **Connect to Git**. **Niet** Direct Upload.
2. Geef de Cloudflare GitHub App indien gevraagd toegang tot `market-predictions/zinbo`.
3. Selecteer repository `market-predictions/zinbo`, production branch `main`.
4. Projectnaam `zinbo` als beschikbaar (verwacht `https://zinbo.pages.dev/`).
5. Framework preset `None`.
6. **Build command:** `node scripts/build.mjs`.
7. **Output directory:** `public`.
8. Deploy en controleer de automatische koppeling.

## Waarom één buildcommando?

De bron is een bestaande 8,86 MB offline auteurspilot. De GitHub-koppeling accepteerde het volledige bronbestand niet in één API-call. Daarom zijn de ongewijzigde bytes als vijftien segmenten vastgelegd. Het buildscript genereert **de originele index.html** en stopt bij een foutieve SHA-256. Dit vraagt geen dependencies, nieuw framework, secrets of aparte runner.

## Acceptatie

- GitHub main bevat vijftien bronsegmenten en `scripts/build.mjs`.
- De Cloudflare-build slaagt en publiceert de app met beelden en audio.
- De URL opent de V4.6.2-auteurspilot op desktop en mobiel.
- Wijzig vervolgens een klein repo-bestand op main: Cloudflare start automatisch een tweede deployment.
- Na verversen werkt de app en blijft de eigen testvoortgang waar passend behouden.

## Aandachtspunten

- Dit is een publieke **QA**-site, geen definitieve kindrelease.
- `X-Robots-Tag: noindex` en `robots.txt` beschermen niet tegen directe toegang.
- Gebruik geen echte kindgegevens of ongereviewde claims over leerresultaat.
- Bestaande voortgang uit `file://` migreert niet naar `pages.dev`.
- Er is geen handmatige upload vereist na de eenmalige Git-integratie.
