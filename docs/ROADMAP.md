# Zinbo — uitvoeringsroadmap na review V4.6.2

Status: **auteurspilot, geen kindrelease**. Bron: review van 21 oktober 2026 en Zinsbouwer-ontwerp v2.

## P0 — correctheid (eerst)
- [x] Een getoonde oplossing niet meer automatisch als zelfstandige afronding tellen; opnieuw laten bouwen en succesgeluid na tonen weglaten.
- [x] Hoofdletters afhankelijk van positie tonen in plaats van de ruwe tegeltekst te kopiëren.
- [x] Instructiekaart voorlezen wanneer audio aan staat, niet wanneer audio uit staat.
- [x] Te absolute 'persoonsvorm achteraan'-instructies voor omdat vervangen.
- [x] In O3-omdat-05/06/08/09 ook de grammaticale variant met omgekeerde werkwoordvolgorde accepteren.
- [ ] O3-omdat-10/11: alternatieve werkwoordvolgorde vergt eerst beter afgebakende tegels ('iets wil' is nu één tegel); inhoudelijke review, geen automatische gok.
- [ ] Alle tijd- en sterke-werkwoordpools auditen: congruentie-afleiders uit verkeerd gelabelde leerdoelen halen.
- [ ] Verleden-tijd-afleiders vervangen die zonder tijdsbegrip kunnen worden uitgesloten.
- [ ] Niveaus 1–4 in de werelden aantoonbaar onderscheiden.
- [ ] Inconsistenties in voortgangsbalken en resterende tekstlabels corrigeren.

## P1 — gecontroleerde inhoud
- Eenduidige leerdoelcodes voor alle oefeningen en reviewstatus vóór vrijgave.
- Geautomatiseerde structuurcontrole, plus menselijke grammaticale beoordeling van afleiders en alle toegestane antwoorden.
- Kandidaten mogen niet in de zelfstandige kindrelease terechtkomen vóór inhoudelijke vrijgave.

## P2 — leren en meten
- Per leerdoel de prestaties met hulp en zonder hulp afzonderlijk tonen.
- Steun voor vorm en woordvolgorde gericht afbouwen; herhaling over meerdere dagen.
- Eenvoudig lokaal voortgangsoverzicht voor ouder/logopedist.

## P3 — kleinschalige praktijkpilot
- Eerst logopedische inhoudsreview, daarna observatie met circa 4–6 kinderen.
- Testen met geoefende én nieuwe zinnen en aandacht voor hardop formuleren.
- App-prestaties zijn géén bewijs van transfer naar spontane spraak.

## P4 — verdieping
- VTT/VVT, tijdscontrasten, complexe bijzinnen, verdere niveau-4-varianten en transfervormen.
- Niet starten vóór P0/P1 en eerste bevindingen van P3.

## Engineering en verificatie
- Houd de bestaande statische app, lokale opslag en Cloudflare Pages-bron aan.
- Geen nieuw framework, accountdienst of tweede leerlingmodel.
- Regressietests: `node scripts/build.mjs && node --test scripts/p0.test.mjs`.
- Deze branch bevat uitsluitend een **eerste P0-deelset**. CI groen is nog geen inhoudelijke vrijgave of kindtest.
