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

| ID | Status code | Bewijs en eventuele beperking |
|---|---|---|
| P0-01 | **Gerepareerd** | Positieafhankelijke hoofdletters in tegelbank, zinsbalk en zinnen; regressietests. |
| P0-02 | **Gerepareerd, herreview nodig** | Alle zes modale `omdat`-items accepteren beide geldige werkwoordvolgordes, waaronder `iets wil zien` / `iets zien wil`; bronregressies groen. Onafhankelijke taalkundige vrijgave ontbreekt. |
| P0-03 | **Gericht gerepareerd, herreview nodig** | Achttien tijdscontrasten en vier sterke-werkwoordcontrasten gecorrigeerd; bronregressies. De volledige inhoudsbank is nog niet onafhankelijk geaudit. |
| P0-04 | **Gericht gerepareerd, herreview nodig** | Vijf afleiders hersteld die tegelijk persoonsvormcongruentie toetsten; bronregressies. |
| P0-05 | **Gerepareerd en in Chromium getest** | `Laat zien` toont het juiste model en zet de opgave terug; na zelfstandig herbouwen volgt géén automatische beloning alsof de eerste poging goed was. |
| P0-06 | **Gerepareerd en in Chromium getest** | De opdrachtknop is ingeschakeld wanneer geluid aan staat. |
| P0-07 | **Gerepareerd en in Chromium getest** | Vier instapniveaus selecteren nu op verschillende grammaticale oefentypen, niet op dezelfde 0–2-startwaarde. Dit is géén diagnostisch niveau. Niveau 4 gebruikt voorlopig alleen de bestaande gevorderde inhoud; VTT/O3-kandidaten blijven buiten kindselectie. |
| P0-08 | **Gerepareerd en in Chromium getest binnen scope** | Teller en percentage gaan over verschillende oefeningen; labels/alt-teksten hersteld; header op 1366, 1024 en 390 px gecontroleerd. |

**Reviewveiligheid:** de 27 gewijzigde V4.3-kandidaten zijn teruggezet naar `reviewStatus: candidate`; historische `reviewBy` en `reviewAt` zijn verwijderd. Er is geen nieuwe taalkundige goedkeuring geclaimd. De zes gewijzigde O3-items waren al kandidaatmateriaal en blijven dat.

**Verificatie:** [GitHub Actions run 39739635808](https://github.com/market-predictions/zinbo/actions/runs/39739635808) **SUCCESS**, commit `1ae1bcf4d26da2ec068bf05fdc5f3ea46504e7ee`. Bewijs: SHA-256-gebonden HTML-build, statische tekstcontrole, syntax- en inhoudsregressies, en echte Chromium-interactie op desktop, tablet en mobiel. Getest: niveau 1 versus 4, audio en antwoord voordoen/herbouwen. Niet getest: alle mogelijke leerlijnen, alle oefeningen of echte kinderen.

**Releasebesluit:** P0-codeherstel is in de gecontroleerde concept-PR geïmplementeerd, maar *niet* vrijgegeven. Vóór een kindrelease blijven onafhankelijke taalkundige review van de gewijzigde inhoud, passende pilotobservaties en formele vrijgave noodzakelijk. P1 wordt inhoudscontrole, niet een nieuwe architectuur. De productiebranch `main` is ongewijzigd.


## Instructie en browserstem — gebruikerstest 22 oktober 2026

De handmatige test signaleerde twee oorzaken: instructiekaart en TTS bouwden hun tekst apart op; grammaticale uitleg in opdrachten maakte het begrijpen onnodig zwaar. De conceptwijziging gebruikt nu **één letterlijke instructie** voor het scherm en de voorleesknop. O3-contextzinnen zijn korter, geven direct de situatie en vragen slechts één actie. Extra uitleg staat onder **Hint**; het rechtzetten van grammaticale concepten blijft onderdeel van de onafhankelijke taalreview (issue #3).

De op 22 oktober ingevoerde automatische voorkeur voor een Nederlandse vrouwenstem leverde bij de gebruikerstest een vlakke, traag pratende Vlaams klinkende stem op. **Daarom is die voorkeur weer verwijderd en het eerdere browsergedrag inclusief spreeksnelheid hersteld.** De herhaaltoets blijft exact de op het scherm getoonde tekst spreken. De inhoud blijft concept en niet voor kinderen vrijgegeven.

Verificatie: regressietests van alle 14 O3-instructies, hersteltest van de oorspronkelijke browserstem, en Chromium-smoke op exact tekst=spraak. Nieuwe commit en CI-bewijs staan in de PR. De bovengenoemde eerdere CI-run blijft historisch bewijs voor de vorige commit.

## UX-verkenning — 22 oktober 2026 (voorstel, nog niet gebouwd)

**Probleem:** de huidige feedback beperkt zich vooral tot tekst ('Goed!'), één eenvoudige tweeklank en een kleine sterteller. De app heeft al een voortgangsbalk, `stars` en geluid/animatie-instellingen, maar vrijwel geen voelbare beloningsanimatie.

**Kleinst mogelijke voorstel:** een korte, optioneel uit te schakelen animatie bij zelfstandig goed gemaakte zinnen (één munt/ster vliegt naar de bestaande teller), een zacht lokaal geproduceerd verzamelsignaal, positieve maar korte bevestiging, en na een blok van vijf zinnen één schatkist-/sessie-afsluiting. Voor antwoorden met hulp: erkenning van het afmaken zonder onterechte claim van zelfstandige beheersing. Houd nadruk op het goede taalmodel; geen overprikkeling, drukke confetti, scores tussen kinderen of nieuwe beloningseconomie. Respecteer 'Beweging uit' en 'Geluid uit' en de voorkeur `prefers-reduced-motion`.

**Voice-opties voor een luisterproef:** (1) de beschikbare lokale browserstemmen apart beluisteren, (2) korte, door een volwassene ingesproken of vooraf met professionele TTS gegenereerde Nederlandse instructies/aanmoedigingen opslaan als audiobestanden, of (3) alleen na onderbouwde noodzaak live TTS overwegen. Vooraf gegenereerde statische audio kan offline blijven en kent geen runtime-cloudafhankelijkheid. Bepaal stemkeuze na echte luistervergelijking, niet aan de hand van stemnaam. Geen implementatie van gamification tot dit voorstel is getoetst op TOS-geschiktheid en afgesproken scope.
