# Eenmalige inrichting — GitHub → Cloudflare Pages

Zinbo is een statische auteurspilot. GitHub `market-predictions/zinbo` is de bron van waarheid.

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git (niet Direct Upload).
2. Autoriseer de GitHub-installatie voor `market-predictions/zinbo`, indien nodig.
3. Projectnaam `zinbo` (mits beschikbaar), production branch `main`.
4. Framework `None`, build command `exit 0`, output directory `public`.
5. Deploy; controleer de URL, beelden, audio en werking op desktop en mobiel.
6. Maak daarna een kleine commit op `main` en verifieer een automatische vervolgdeployment.

Let op: `noindex` betekent niet privé. Test geen echte kindgegevens. De lokale file:// voortgang wordt niet automatisch overgezet naar het pages.dev-adres.

Geen nieuwe runner, GitHub Action of tweede deploymentroute nodig.
