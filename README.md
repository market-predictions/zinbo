# Zinbo — taal en zinnen oefenen

Zinbo is de toekomstige platformnaam van het bestaande Zinsbouwer-project. Dit repository-startpakket bevat de **V4.6.2 auteurspilot** met vier neutrale niveaus en adaptieve grammaticaoefeningen.

## Status

- **Testversie**, geen vrijgegeven kindrelease.
- De HTML-app is statisch, bevat ingesloten beelden en gebruikt geen externe backend.
- De site is na publicatie **publiek toegankelijk**. `noindex` is geen toegangsbeveiliging.
- Opgaven voor VTT, *omdat* en *als* wachten nog op de afgesproken onafhankelijke didactische beoordeling.
- De app wordt in dit startpakket niet visueel gerebrand; verdere naamswijzigingen worden separaat getest.

## Structuur

- `public/index.html`: bestaande V4.6.2 HTML-testversie.
- `public/_headers`: noindex-header en basisbeveiligingsheaders.
- `public/robots.txt`: verzoek aan zoekmachines de testsite niet te indexeren.
- `docs/CLOUDFLARE_PAGES.md`: exacte Git-integratie-instellingen.

## Deployment

De bron van waarheid is GitHub `market-predictions/zinbo`, branch `main`.
Cloudflare Pages importeert deze repository **via Connect to Git**, met build command `exit 0` en outputmap `public`.
Elke nieuwe commit op `main` wordt daarna automatisch gepubliceerd, mits de Cloudflare Git-integratie actief is.

**Gebruik niet het Cloudflare-pad 'Direct Upload'.** Dat creëert een ander projecttype dat later niet naar de native Git-integratie kan worden omgezet.

## Belangrijk bij voortgang

De huidige browseropslag op een lokaal `file://` adres is niet automatisch beschikbaar op `https://zinbo.pages.dev/`. Nieuwe versies moeten de opslagstructuur zorgvuldig behouden.