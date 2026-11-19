# Zinbo — Proef antwoordvariatie (16 bestaande oefeningen)

Status: **afgeschermde proef voor eigenaar, begeleiders en taalkundige review**.
Datum: 19 november 2026. Scope: geen productiepublicatie, geen wijzigingen aan de normale kindroute.

## Businessdoel

Meer passende grammaticale uitdaging in werkwoordkeuze-oefeningen, zonder
onnodige visuele belasting, schijnnauwkeurige interpretatie van fouten of
verlies van vertrouwde Zinbo-interactie.

De proef vergelijkt drie presentatievormen binnen **dezelfde bestaande zin**:

| Proefvariant | Keuzes | Oefendoel |
| --- | --- | --- |
| A: tijdsvorm | 2 | Alleen tegenwoordige versus verleden tijd |
| B: combinatie | 3 | Tijdsvorm plus één plausibele persoons-/getalsafleider |
| C: combinatie | 4 | Tijdsvorm plus twee plausibele persoons-/getalsafleiders |

Belangrijk: B en C zijn **andere samengestelde oefendoelen**, niet automatisch
bewezen hogere taalniveaus. De reguliere niveaus 1–4 en de automatische
niveauaanpassing worden niet veranderd.

## Proef openen

Gebruik uitsluitend een Cloudflare-branchpreview met:
`?choice-pilot=1`.

Op de startpagina verschijnt dan **Proef voor begeleiders — niet vrijgegeven**.
Selecteer het gewenste startitem uit 16 bestaande zinnen, en kies 2, 3 of 4
antwoordmogelijkheden. Een ronde bevat vijf verschillende bronitems. Na
afronden kan de volgende groep van vijf worden geprobeerd. Zonder de
expliciete queryparameter is geen proefingang zichtbaar.

De bronitems komen uit de bestaande vrijgegeven `ADVANCED`-pool. De twee
aanvullende antwoordvormen per item komen uitsluitend uit
`src/content/choice_pilot.json`, staan op `reviewStatus: candidate`, en
zijn **niet** opgenomen in de gewone contentbank, grammaticale vrijgavelijst,
leerevidence of sterrenberekening.

## Taalreview: wat moet nog beoordeeld worden?

1. Zijn alle extra woordvormen grammaticaal correct vervoegd?
2. Kan in de getoonde zin precies één vorm correct zijn?
3. Is de eerste nieuwe afleider werkelijk een persoons-/getalsfout bij
   correct gekozen tijd?
4. Is de tweede nieuwe afleider daadwerkelijk zowel een tijds- als een
   persoons-/getalsfout?
5. Past de feedback bij de gekozen afleider, zonder diagnoses te suggereren?
6. Zijn de proefzinnen begrijpelijk en beeld-zinconsistent voor de doelgroep?

Een geautomatiseerde test verifieert uniciteit, schema, herkomst en technische
consistentie. Dat **vervangt geen** controle door een logopedist.

## Architectuur

- `src/content/choice_pilot.json` is een afzonderlijke reviewbank met
  bron-ID, lemma en twee kandidaat-afleiders.
- `scripts/build.mjs` controleert 16 unieke bron-ID's, canonieke tweekeuzevormen,
  één correct antwoord en twee verschillende kandidaat-afleiders.
- `src/app/runtime.js` maakt uitsluitend tijdens de proef een tijdelijke kopie
  van de bronopgave met extra keuzes; er worden geen canonieke opgaven
  overschreven en geen vormen live gegenereerd.
- Bestaande `chooseEnding()`, `check()`, `showAnswer()`, `next()` en
  `tenseBody()` blijven de basis. De proef voegt alleen een geïsoleerd pad toe.
- Gerichte feedback is hypothesegedreven: een verkeerd antwoord signaleert
  hoogstens een mogelijk probleem met tijd, persoonsvorm of beide.
- `SAVE_KEY`, `o4Data.level`, oefenresultaten, avatars en sterren blijven
  ongewijzigd tijdens een proefronde.
- Alle nieuwe CSS gebruikt de vastgelegde Zinbo-tokens; op mobiel staan
  vier antwoorden 2×2 en wordt bij drie antwoorden de laatste gecentreerd.

## Definition of Done voor deze technische proef

- [ ] Build, bestaande regressietests en Chromium-smoke groen.
- [ ] Extra schema-/proefregressie voor 16 items × 2/3/4 keuzes groen.
- [ ] Proef volledig navigeerbaar bij 1366×768, 1024×768 en 390×844.
- [ ] Per formaat screenshots beschikbaar; geen horizontale overflow.
- [ ] Reguliere startpagina en oefenwerelden zonder queryparameter ongewijzigd.
- [ ] Na een volledige proefronde exact dezelfde leerlingopslag en sterren.
- [ ] Afzonderlijke inhoudelijke beoordeling van afleiders en feedback.

## Beperkingen / volgende beslissing

Pas na inhoudelijke taalreview en een beperkte observatieproef met kinderen
beslissen we of (een deel van) de geaccepteerde varianten wordt geïntegreerd
in de normale oefenwerelden. De kwaliteit van de afleiders en de
begrijpelijkheid van het scherm gaan boven een verplicht aantal keuzes.
