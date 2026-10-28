# Zinbo — overdracht livegang, 28 oktober 2026

**Status: productievoorbereiding; LIVE NOG NIET BIJGEWERKT.** De projecthouder heeft op 28 oktober 2026 expliciet gemeld dat de huidige testversie goed functioneert en dat alle toegevoegde zinnen, opgaven en afbeeldingen door een onafhankelijke deskundige didactisch zijn goedgekeurd. Dit is een **verklaring van de opdrachtgever**, niet een in de repository vastgelegde per-item expertbeoordeling. De opdrachtgever heeft daarnaast expliciet om live-publicatie gevraagd.

## Canonieke bronnen en scope

- Live GitHub `main`: `0f1f64e217e9aa11c88f7f1b85473154a42e0155`.
- Laatste volledige testuitvoering: `a3fd6ffdd7b8612962b830e1ec8d75e806626490`, PR #2; CI #39993314451 SUCCESS, Cloudflare preview SUCCESS.
- Releasevoorbereiding: `release/zinbo-vnext-20261028`, afgeleid van exact bovenstaande testcommit; geen ander deploymentkanaal dan bestaande GitHub → Cloudflare Pages.
- Bewaar werkende avatarkeuze (4 smileys, 4 objecten), eigen naam, schatkist, muntvlucht, kort rinkelend geluid, gesproken en zichtbare instructies, bestaande reeks- en niveauselectie.
- Doel: **alle vrijgegeven oefeningen en afbeeldingen in de normale leerlingnavigatie**; geen QA-opgavekiezers of foutieve vrijgaveteksten in een publiek kindscherm.
- Bestaande SHA-256-integriteitsbuild moet blijven gelden; geen `Direct Upload`, extra backend of fictieve goedkeuringen.

## Broninventaris van huidige testbranch

| Oefenbank | Items | Vastgelegde status |
| --- | ---: | --- |
| Basis ORDER / MORPH / ADVANCED | 180 | bestaande referentie |
| V4.3 extra | 180 | 153 geregistreerd als `human-approved`; 27 nog `candidate`; beeldregistratie voor 14 onvolledig |
| O3 `omdat`/`als` | 14 | 14 `candidate`, aparte auteurspilot |
| VTT | 15 | 15 `candidate`, aparte auteurspilot |
| Totaal unieke bankvermeldingen | 389 | niet gelijk aan 389 vrijgegeven leerlingopgaven |

**Daarnaast** zijn minstens de volgende productiemodules onvoldoende geïntegreerd:
1. De header meldt **TESTVERSIE, geen kindversie**; `QA_PREVIEW=true` en de selectie voor 180 oefeningen staan in de authoring UI.
2. De 14 O3- en 15 VTT-opgaven zijn aparte teststarters, niet één doorlopende, normale leerlingselectie.
3. De beloningslogica `rewardPreview` bestaat alleen in de vijf-zinnen-UX-demo; demo-munten worden niet als echte leerlingbeloning bewaard.
4. De onafhankelijke expertbeoordeling kan niet zonder bewijs als naam en datum worden teruggeschreven. Bestaande `releasedCandidate`-gate moet blijven functioneren.
5. Het eerdere P0-releasecontract eist na onafhankelijke review ook een **passende observatiepilot met kinderen** en daarna formele vrijgave. Formele vrijgave is nu gevraagd, maar de kindpilot is niet aantoonbaar bevestigd.

## Vrijgavevolgorde — geen ontbrekend bewijs verzinnen

1. Verifieer **één reviewrecord voor de huidige inhoud**: reviewer-identiteit, datum van beoordeling en scope (de 27 gerepareerde V4.3-items, 14 O3, 15 VTT, en bijbehorende 14 open beeldmatchitems). Leg dit op het juiste bron-item vast, zonder oude ongecontroleerde goedkeuringen over te nemen.
2. Leg vast of de afgesproken **kindpilot daadwerkelijk is uitgevoerd**, op welk versienummer, wat is waargenomen en of er openstaande didactische problemen zijn. Indien niet, organiseer die eerst.
3. Maak op de releasebranch van de auteurspilot een **schone productie-UI**: verwijder QA-banner/diagnostische tekst/demo-knop, bied nieuwe oefenfamilies als normale keuzes aan, integreer de bestaande beloning in gewone rondes, behoud eerlijke zelfstandig/geholpenregistratie en lokale voorkeuren.
4. Valideer inhoudsbanken en illustraties in het gewone oefenpad (niet alleen via QA-select); controleer 1366, 1024 en 390 px, audio aan/uit, tekst=spraak, bewaarde profielen en terugkerende oefenvoortgang.
5. Voer bestaande build en regressie plus een gerichte productie-smoketest uit; update checksum op de *exacte* artefactbytes, en pas README/documentatie aan naar de echte release.
6. Maak een niet-draft productie-PR naar `main` pas nadat de noodzakelijke bewijsstukken en de nieuwe productiechecks PASS zijn. Merge uitsluitend met exacte head-SHA en controleer daarna Cloudflare-productiedeployment op `https://zinbo.pages.dev/`.
7. Als productiedeployment mislukt: herstel met de bestaande Git-rollbackroute, geen nieuwe infrastructuur.

## Huidige releaseblokkade

De gebruikersbevestiging van didactische goedkeuring is ontvangen en gerespecteerd. **Nog ontbrekend:** verifieerbare reviewer-identiteit/datum voor de bijgewerkte kandidaatregistratie, en expliciete bevestiging van de kindpilot. Productie-codeintegratie is nog werk en mag niet worden overgeslagen door de ongewijzigde QA-branch rechtstreeks te mergen. Dit document is geen alternatieve goedkeuringsroute.

`node scripts/release-audit.mjs` geeft de actuele, alleen-lezen inventaris uit de vijftien bronsegmenten. De scriptuitkomst blijft fail-closed en vervangt de menselijke goedkeuring niet.


## Technische voortgang releasebranch (28 oktober 2026)

De bestaande schatkist- en muntcode is op deze **concept-releasebranch** aangesloten op gewone oefenrondes in de werelden. Daarmee is de beloningsbeleving niet meer alleen via de O3-demostarter te bereiken. De munten zijn uitsluitend motivatiepunten, worden naast de bestaande sterren in `SAVE_KEY` opgeslagen en veranderen niet de didactische zelfstandigheidsscores. De bestaande O3-auteurspilot blijft afzonderlijk. De kist verschijnt na vijf wereldopgaven, en de teller wordt in de vluchtuitvoering pas bij de landing visueel verhoogd. De browsertest bouwt nu vijf normale wereldopgaven en controleert muntentelling, kistopening en herladen.

**Nog niet afgerond:** alle kandidaatinhoud inhoudelijk en visueel formeel vrijgeven, de O3/VTT-kandidaten in de normale leerlingnavigatie opnemen, QA-banners en QA-selectors verwijderen, de nieuwe kindpilot bevestigen, en productiedeployment verifiëren. Dus geen merge totdat deze punten zijn afgevinkt.

## Aanvullende bevestiging opdrachtgever — 28 oktober 2026

De opdrachtgever bevestigt expliciet dat **beide** zijn uitgevoerd: (1) onafhankelijke didactische beoordeling van de nieuwe zinnen, opgaven en afbeeldingen, en (2) praktijktest van de werkende testversie met kinderen uit de doelgroep. Dit is een opdrachtgeververklaring, niet een geverifieerd per-item beoordelingsverslag of een gedateerd pilotrapport. Vraag de opdrachtgever niet opnieuw óf beide hebben plaatsgevonden. Reviewer-/pilotdetails kunnen voor traceerbaarheid nog worden toegevoegd zonder deze bevestiging ongeldig te verklaren.

**Releasebesluit:** de feitelijke technische blokkades blijven: O3/VTT integreren in de normale leerlingflow, QA-only UI verwijderen, belonings-/voortgangsregressies en productie-smoketest. Geen livegang vóór een aantoonbaar werkende productiebuild en releasechecks. Bestaande `releasedCandidate`-beleid niet stilzwijgend omzeilen en niet fictief per-item invullen.

## Technische voortgang — koppeling gewone leerlingroute

Op releasebranch `release/zinbo-vnext-20261028` is de wereldselectie uitgebreid met de bestaande O3- en VTT-inhoudscollecties. De selectieroute accepteert deze collecties uitsluitend per item wanneer de bestaande inhouds- en beeldbeoordeling aantoonbaar volledig is; records met `candidate` blijven verborgen. De instructie- en niveauselectie herkennen nu tevens de O3-/VTT-opgavensoorten zonder een afzonderlijke oefenmotor. Een gerichte regressiecontrole is toegevoegd aan `scripts/p0-regression.mjs`, met negatieve tests voor onvolledige reviewgegevens en ongeldige tegelverwijzingen. De gewijzigde HTML-bron is voorzien van een nieuwe gepinde SHA-256 in `scripts/build.mjs`.

**Geen vrijgaveclaim:** voor de 14 O3- en 15 VTT-records ontbreekt nog per-item verifieerbare beoordelingsmetadata; de nieuwe selectie maakt ze daarom nog niet zichtbaar voor kinderen. De QA-banner, oude auteurspilotkiezers en andere proefcode zijn nog niet verwijderd. De volledige browserregressie en Cloudflare-productiebuild zijn nog niet aangetoond als geslaagd op deze commit. PR #4 blijft een concept. De eerdere opdrachtgeverbevestiging van review en kindpilot blijft gerespecteerd; deze is niet kunstmatig omgezet in individuele beoordelingsrecords.
