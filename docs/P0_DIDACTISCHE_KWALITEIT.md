# P0 — didactische betrouwbaarheid (review 21 oktober 2026)

Status: **in uitvoering, niet vrijgegeven voor kinderen**. Bron: `zinsbouwer-review-v4.6.2(1).md`; ontwerp: Zinsbouwer v2.

## Eerst oplossen — blokkeert kindpilot

| ID | Defect | Acceptatiecriterium |
|---|---|---|
| P0-01 | Hoofdletters midden in de zin; hoofdletter verraadt eerste tegel | Getoonde én gesproken zinnen normaliseren naar zinspositie; eigennamen blijven correct; test o3/o6/o8/o10/o12/o13/o17/c1-03/c1-06/d1-05. |
| P0-02 | O3-omdat met modaal: misleidende hint en geldige alternatieve volgorde afgekeurd | o3-omdat-05/06/08/09/10/11: taalbeschrijving correct, 'omdat ik lezen wil' én 'omdat ik wil lezen' accepteren waar de tegels dit toelaten; grammaticale expert beoordeelt de volledige set. |
| P0-03 | Verkeerd construct in oefenpools (18/113 + 4/90 volgens review) | Elke oefening koppelt aantoonbaar aan het leerdoel; geen congruentiecontrasten onder tijd/sterke werkwoorden. |
| P0-04 | Verleden-tijd-afleiders tevens ongeldig voor congruentie | Iedere afleider verschilt op het beoogde grammaticale doel, niet op een tweede regel; controle op Sam aai/aaide etc. |
| P0-05 | 'Laat zien' levert successterren en 'Goed!' | Hulpantwoord is niet zelfstandig goed; daarna zelf opnieuw bouwen; apart registreren. |
| P0-06 | Audio-instructieknop omgekeerd disabled | Bij geluid AAN kan instructie herhaald worden; bij UIT geen verwarrende interactieve knop. |
| P0-07 | Niveau 2–4 in werelden identiek | Niveau toont echte ondersteunde oefeninhoud of wordt niet aangeboden; niet alleen startstadium wijzigen. |
| P0-08 | Niet-kloppende voortgangslabel en ongepaste tekst | 'Kijk naar Ik.', alt-tekst 'Premium illustratie', afgekapt tagline en betekenis van % corrigeren. |

## Eenvoudige aanpak

1. Behoud huidige V4.6.2 **ongewijzigd als referentie**. De huidige `scripts/build.mjs` controleert een vaste SHA-256 en mag niet worden versoepeld om wijzigingen door te laten.
2. Leg eerst een reproduceerbare fout per ID vast. Voer een beperkte machinecheck uit waar een fouttekst exact toetsbaar is; dit vervangt **geen** handmatige taalkundige review.
3. Repareer de bronoorzaak in één canonieke oefenbron, niet in een runtime-stringpatch of een tweede app. Splits het grote HTML-artefact pas op wanneer dat nodig is om veilige codewijzigingen te kunnen testen; houd één build/deploymentroute.
4. Voeg regressietests toe voor alternatieve goede volgordes, afleiders, voortgang en audio. Controleer opnieuw in Chrome desktop en touch.
5. Na aanpassing van de bron: genereer nieuw artefact en controleer een **nieuwe aantoonbaar juiste checksum**; leg die bij de versie vast.
6. Geen claims over leerresultaten zonder onafhankelijke inhoudelijke controle en pilot met kinderen.

## Na P0

P1: inhoudsvalidatie en taalkundige vrijgave; P2: eerlijk onderscheid zelfstandig/geholpen en afbouw ondersteuning; P3: kleinschalige praktijkpilot; P4: nieuwe complexe grammatica. O5 uitbreiding blijft achter deze kwaliteitsstappen.

**Definition of Done voor P0:** alle acht defecten aantoonbaar opgelost met bewijs, regressies groen, geen tweede architecturele route, pilotset door deskundige beoordeeld voor inhoudelijke juistheid. Een checklist of testscript alléén is niet DONE.

## Uitvoeringsstatus — 22 oktober 2026

| Defect | Code | Verificatie / resterende stap |
|---|---|---|
| P0-01 hoofdletters | Aangepast | Positieafhankelijke presentatie in tegelbank, zinsbalk en voorleeszin; regressietest. Nog handmatig in browser nalopen. |
| P0-02 O3-modaliteit | Aangepast | Zes `omdat`-opgaven: vier met beide grammaticale werkwoordvolgordes, twee met object vóór werkwoordgroep. Regressietest; **taalkundige review vereist**. |
| P0-03 foutieve vaardigheidscontrasten | Gericht hersteld | 18 tegenwoordige-tijditems uit 'Nu of gisteren?' en 4 uit 'Bijzondere werkwoorden' opnieuw voorzien van tijdscontrast. Andere items niet onafhankelijk geaudit. |
| P0-04 persoonsfout in tijdafleider | Gericht hersteld | Vijf in review benoemde afleiders voor derde persoon gecorrigeerd. |
| P0-05 'Laat zien' | Aangepast | Modelantwoord tonen, oefening resetten, kind opnieuw laten bouwen; geen directe afronding of feestelijke beloning na onthullen. Browser-E2E nog uit te voeren. |
| P0-06 geluid | Aangepast | Omgekeerde enabled/disabled-voorwaarde hersteld en regressietest. |
| P0-07 niveaus werelden | **Open** | Nog aantoonbaar koppelen aan oefendoelen. |
| P0-08 labels/layout | **Deels** | Onhandige 'Kijk naar Ik' en twaalf interne alt-teksten hersteld; voortgangsetiket en afgekapt headerlabel nog open. |

De 27 gewijzigde V4.3-items zijn expliciet teruggezet naar `reviewStatus: candidate`; historische `reviewBy` en `reviewAt` verwijderd. Hiermee kan een eerdere inhoudelijke goedkeuring niet onterecht de nieuwe varianten vrijgeven. Dat betreft in totaal 18+4 gewijzigde Nu-items en 5 afleiders in Gisteren-items. Nieuwe deskundige beoordeling is vereist.

**Technische CI:** [Validate Zinbo P0, run 39734080209](https://github.com/market-predictions/zinbo/actions/runs/39734080209) is **SUCCESS** op commit `435d57248a0d91e3ce6370bb5a19f2cbd3f5a17f`: SHA-256-build, tekstcheck en regressies. Testdekking bestaat uit bron-/scriptcompilatie en gerichte regressies, niet uit een browser- of kindpilot. P0 blijft open; geen kindrelease en geen merge.
