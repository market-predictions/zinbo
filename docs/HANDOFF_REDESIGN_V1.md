# Zinbo — overdracht herontwerp v1 (voor ChatGPT)

Datum: 18 november 2026 · Opgesteld door: Claude, in opdracht van de eigenaar · Branch: `design/handoff-v1`

Dit document is de opdracht. Lees het helemaal voordat je iets wijzigt. Werk de fasen in volgorde af; elke fase is een eigen pull request die de eigenaar kan beoordelen.

## 0. Wat er in deze branch staat

| Pad | Wat |
| --- | --- |
| `docs/HANDOFF_REDESIGN_V1.md` | Deze opdracht |
| `docs/design-system/README.md` | Het ontwerpsysteem: principes, stem, kleur, rolkleuren, typografie, ruimte, beweging, opbouw oefenscherm |
| `docs/design-system/tokens.json` | Alle ontwerpwaarden (de enige bron voor kleur, type, ruimte, hoeken, schaduw) |
| `docs/design-system/mockups/*.dc.html` | De zeven goedgekeurde schermontwerpen als HTML met inline stijl. `art:<bestand>.webp` verwijst naar de bestaande illustratie met die naam in de app. Gebruik ze als visuele specificatie, niet als code om te kopiëren. |

Online (alleen voor de eigenaar zichtbaar, ter referentie):
- Beoordeling: https://claude.ai/artifact/ACBjm3pe4SEtAfMWLaLzTt
- Ontwerpsysteem: https://claude.ai/artifact/6xfysDDKzc9CmHjQtrxNDa
- Schermontwerpen: https://claude.ai/artifact/UPB7CvFx7SbPaPrKd1c3F5

Mockups: `Main` (A, zin bouwen met rolkleuren), `Nog-niet` (B, foutfeedback), `Goed` (C, goed), `Mobiel` (D, oefenscherm 390 px), `Start` (E), `Einde` (F), `Start-mobiel` (G).

## 1. Doel

De interface van een 6,5 naar een 8 brengen (rust, consistentie, premium uitstraling op het niveau van Squla/Gynzy), zonder de didactische kern te beschadigen, en tegelijk de oorzaak van de huidige 6,5 wegnemen.

**De oorzaak (vastgesteld, niet aannemen dat het anders is):** de stylesheet is ~500 KB en bestaat uit circa vijftien gestapelde ontwerprondes (V3.9 … V4.3.8, P0-08, avatar). Gemeten: 655 unieke kleurwaarden, 97 lettergroottes, 21 letterdiktes, 80 schaduwen, 43 hoekafrondingen, 49 media queries, 27× `!important`. Nunito wordt genoemd maar nooit geladen. **Nog een laag toevoegen is daarom verboden.** Elke visuele wijziging vervangt; er wordt niets bovenop gestapeld.

## 2. Harde regels

1. **Geen nieuwe CSS-laag.** Vervang bestaande regels; voeg geen overschrijvende blokken toe.
2. **Alle waarden uit `tokens.json`.** Geen losse hex-waarden, pixelmaten of schaduwen in componenten. Genereer CSS custom properties uit `tokens.json` in de build.
3. **Didactische logica niet aanraken** tenzij een fase dat expliciet vraagt: validator, oplossingen, alternatieve volgordes, `Laat zien`→zelf herbouwen, onderscheid zelfstandig/geholpen, positie-afhankelijke hoofdletters.
4. **Inhoud niet wijzigen** (zinnen, tegels, afleiders). Inhoud is nog niet taalkundig vrijgegeven (zie `docs/P0_DIDACTISCHE_KWALITEIT.md`).
5. **Lokale opslag compatibel houden:** `SAVE_KEY` en bestaande velden blijven leesbaar; sterren en avatars blijven behouden.
6. **CI blijft groen:** build, `p0-text-audit --strict`, `p0-regression`, browser-smoke. Pas tests aan waar teksten bewust wijzigen, en zeg dat in de PR.
7. **Elke fase = één PR naar `main`**, met schermafbeeldingen op 1366×768, 1024×768 en 390×844, vóór en na.
8. **Geen claims** over leereffect. Rolkleuren en foutfeedback zijn voorstellen die een logopedist nog moet toetsen.

## 3. Fasen

### Fase 0 — Kindgerichte fouten (klein, eerst, apart PR)

- `startWorld()` zet `rewardPreview: true`. Daardoor zien alle kinderen in elke wereld "QA · geen echte munten" en de knop "Toon visuele beloning". Die knop vult het antwoord in en crasht bij werkwoordoefeningen (`Cannot read properties of undefined (reading '0')`, want `item().solutions` bestaat niet bij morph-items). **Zet de preview uit in werelden** en laat de QA-route alleen bereikbaar via de expliciete auteurspilot.
- Eindscherm: "1 sterren beschikbaar" → enkelvoud/meervoud correct.
- `<title>`: "Zinsbouwer V4.6.2 QA — O4 adaptieve leerlijn niveau 1–4" → "Zinbo".
- Merknaam: overal "Zinbo" (logo-tekst zegt nu "Zinsbouwer").
- Profielmenu: "Instellingen" en "Voor ouders" openen hetzelfde scherm → één item.
- Mobiel (390 px): het schatkist-badge valt over de titel van het oefenscherm.

**Klaar als:** geen QA-tekst in een wereld; regressietest die dat bewijst; CI groen.

### Fase 1 — Echte broncode (voorwaarde voor alles daarna)

Nu is `src/html-parts/part-000…014.txt` het bouwproduct in stukken. Splits in echte bronbestanden, en laat de build daar weer één site van maken:

- `src/content/*.json` — de opgavenbanken (ORDER, MORPH, ADVANCED, O3, VTT, werelden).
- `src/styles/` — één stylesheet, gebaseerd op tokens (fase 2 vult die).
- `src/app/*.js` — logica in modules: opslag, selectie, oefening, beloning, weergave per scherm, pilots apart.
- `public/art/*.webp` — de 34 illustraties als losse bestanden (nu 8,4 MB base64 in de JS). Cloudflare Pages serveert en cachet ze; voeg cache-headers toe in `public/_headers`.

Vervang de SHA-256-pin op het eindbestand door controles op de bron (content-validatie blijft zoals hij is). Gedrag moet identiek blijven: draai de bestaande regressies en browser-smoke vóór en na.

**Klaar als:** geen functionele verschillen; eerste laad merkbaar kleiner; een CSS-wijziging is een diff van een paar regels in één bestand.

### Fase 2 — Ontwerpsysteem toepassen

- Genereer `tokens.css` uit `docs/design-system/tokens.json` (custom properties, namen = tokennamen).
- Host **Nunito** zelf (400, 700, 800; woff2 in `public/fonts/`). Geen Google Fonts in productie (privacy, geen externe afhankelijkheden).
- Herschrijf de stylesheet op tokens: maximaal 7 tekststijlen, 3 gewichten, 4 hoeken, 2 schaduwen, 3–4 breekpunten. Gooi alle versielagen weg.
- Eén lijnicoonset (2 px, ronde uiteinden, 24 px raster), inline SVG.

**Meetbaar klaar als:** unieke kleurwaarden in de CSS ≤ 30, lettergroottes ≤ 8, letterdiktes ≤ 3, `!important` = 0. Voeg dit toe als check in `scripts/` zodat het niet terugsluipt.

### Fase 3 — Oefenscherm (mockups A–D)

Vaste vier zones, op elk formaat (zie `docs/design-system/README.md`, "Het oefenscherm"):
1. Opdracht: grote voorleesknop + **één** instructie, naast de illustratie **in een kader** (niet als achtergrond, niets eroverheen).
2. Zinstrook op een kaart; lege vakken `surface-sunken` met stippelrand en nummer.
3. Keuzebak met tegels.
4. Actiebalk: Opnieuw en Hint secundair links, één primaire knop rechts.

Specifiek:
- **Rolkleuren + vormmerk op elke tegel.** De data heeft al `role` per tegel (`subject`, `verb`, `object`, `place`, `time`, `other`); nu krijgt alleen `verb` kleur. Gebruik `role-*-soft` als vlak, `role-*` als 4 px onderrand en het vormmerk linksboven (cirkel, driehoek, vierkant, ruit, halve cirkel, streep). Zet de codering achter een instelling zodat de logopedist hem kan uitzetten.
- **Eén instructie.** Verwijder de dubbele titel, het label boven de keuzes ("Kies het woord dat past.") en de herhaalde vraag in de feedbackregel. Wat op het scherm staat = wat de voorleesknop zegt.
- **Foutfeedback (mockup B):** noem wat het kind koos en waarom het niet past, bv. "Je koos *pakte*. Dat is gisteren. Het gebeurt nu." Toon het gekozen woord doorgestreept/gedimd. Bij tijdsopgaven een tijdlabel ("nu"/"gisteren") in tijdkleur naast de zin. Teksten per opgavetype genereren uit bestaande velden (`when`, `prompt`); geen nieuwe inhoud verzinnen. Markeer in de PR dat dit didactisch getoetst moet worden.
- **Goed (mockup C):** feedbackregel direct onder de zin met de hele goede zin; geen zwevende kaart over beeld of zin; robot-kaart weg. "Je deed het zelf, in één keer" alleen bij zelfstandig goed.
- **Eén teller per ronde:** de segmentbalk "Zin x van 5" bovenaan. Schatkistteller op het oefenscherm vervalt.
- Hint visueel secundair; Controleer de enige primaire knop. Disabled-staat met `disabled`/`disabled-ink`.
- Aanraakdoelen ≥ 56 px. `prefers-reduced-motion` en "Beweging uit" respecteren.

### Fase 4 — Startscherm en eindscherm (mockups E–G)

- Start: één welkomstkaart met "Verder oefenen" (naar de laatste wereld) + illustratie in kader; daaronder zes wereldkaarten (beeld 16:10, titel op één regel, één statusbadge: "Nieuw" / "Bezig · zin x van 5" / "N zinnen geoefend"). Verwijder het blok "Jouw voortgang" met drie keer 0%; voortgangscijfers horen bij "Voor ouders".
- Einde: ster + "Ronde klaar!", de vijf gemaakte zinnen met "Zelf"/"Met hulp" en een luisterknop per zin, primair "Nog een ronde", secundair "Naar start". Platte CSS-schatkist vervalt (eigenaar beslist nog of de kist terugkomt in nieuwe stijl).
- Bovenbalk: woordmerk "Zinbo" (er is nog geen logo), sterrenteller, profielknop. De "Kies niveau"-pil verdwijnt uit de bovenbalk.

### Fase 5 — Didactische selectie (eigenaarakkoord 18 november 2026)

De eigenaar heeft in de Control-chat expliciet akkoord gegeven voor uitvoering van fase 5. De implementatie staat uitsluitend op een aparte branch en concept-PR; dit akkoord is geen toestemming om zonder checks te mergen.
- Kennismaking geeft een voorzichtig oefenstartadvies (1–3) na vijf resultaten; niveau 4 is geen conclusie uit een korte kennismaking.
- Automatische groei per wereld vereist diverse zelfstandige resultaten, meerdere scènes en meerdere dagen. Een handmatige keuze voor niveau 1–4 gaat altijd voor; Automatisch kan expliciet worden gekozen.
- Een ronde bevat maximaal twee oefeningen uit dezelfde werkwoordfamilie, tenzij onvoldoende goedgekeurde variatie beschikbaar is om vijf oefeningen te vullen. Geen nieuwe opgaven toegevoegd.
- Deze regels zijn oefenheuristieken, geen diagnostiek; logopedische beoordeling is nog nodig.

## 4. Wat je niet doet

- Geen framework, bundler-wissel of backend toevoegen.
- Geen nieuwe beloningseconomie, mascotte of winkel.
- Geen wijzigingen aan inhoud of validator buiten wat hierboven staat.
- Niet op `main` committen; altijd via PR.

## 5. Rapportage per PR

Per PR: wat veranderd is, schermafbeeldingen vóór/na op drie formaten, CI-status, de meetwaarden uit fase 2 (zodra van toepassing), en een lijst open vragen voor de eigenaar. Houd `docs/HANDOFF_REDESIGN_V1.md` bij met een statusregel per fase onderaan.

## Status

| Fase | Status |
| --- | --- |
| 0 | [PR #10](https://github.com/market-predictions/zinbo/pull/10) — QA-fouten afgeschermd; CI groen, preview beschikbaar; eigenaarreview open |
| 1 | [PR #11](https://github.com/market-predictions/zinbo/pull/11) — broncode en afbeeldingen gesplitst; CI groen; eigenaarreview open |
| 2 | [PR #12](https://github.com/market-predictions/zinbo/pull/12) — design tokens, Nunito, CSS-audit; CI groen; eigenaarreview open |
| 3 | [PR #13](https://github.com/market-predictions/zinbo/pull/13) — oefenschermen volgens mockups A–D en rolmarkeringen; CI groen; eigenaarreview open |
| 4 | [PR #14](https://github.com/market-predictions/zinbo/pull/14) — start/einde volgens mockups E–G; mobiele screenshotbevindingen gecorrigeerd; laatste CI en visuele review nog af te ronden |
| 5 | [PR #15](https://github.com/market-predictions/zinbo/pull/15) — eigenaarakkoord ontvangen; didactische selectie aangepast; nieuwe CI en onafhankelijke didactische beoordeling vereist |

De PRs volgen op elkaar en zijn nog **niet** geïntegreerd in `main`.
De preview van de gezamenlijke wijzigingen staat op
https://design-phase-4-start-end-red.zinbo.pages.dev/ .
De zeven mockups zijn visuele specificaties; de didactische rolcodering en feedback moeten nog door een logopedist worden beoordeeld.
