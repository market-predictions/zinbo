# Zinbo — Visuele richting beloningsbeleving (ontwerpstudie v0.2)

> **Historisch ontwerp (22 oktober 2026).** De actuele gekozen beloningsrichting is vastgelegd in [UX_AVATARS_2026-10-31.md](UX_AVATARS_2026-10-31.md): één spendabele sterrenteller, vier gratis en acht ontgrendelbare avatars, geen werkplaatsgalerij, geen tweede muntenwinkel of mascotte-uitbreiding. Beschouw onderstaande uitbreidingsideeën niet langer als huidige roadmap.

**Status:** ontwerpvoorstel, niet geïmplementeerd of didactisch vrijgegeven.  
**Datum:** 22 oktober 2026.  
**Context:** visuele verfijning na de eerste beloningsstudie en tien kritische ontwerprondes.  
**Scope:** kinderen van 9–12 jaar met TOS; desktop/laptop voorop, responsief tot 390 px; behoud de bestaande statische HTML-app.

## 1. Ambitie

Maak van een goed voltooide zin een tastbaar en aantrekkelijk succesmoment. Het moet voelen als één herkenbaar spel *binnen* Zinbo, niet als een game die de zinoefening verdringt. Inspiratie: het zichtbaar verzamelen, de verwachting van een kist en aantrekkelijke animatie in commerciële leerapps. **Geen kopie van Squla-assets of interface.**

Het bronontwerp `zinsbouwer-ontwerp-v2.md` beschrijft één beslissing per stap, een visuele grammaticale code en aandacht voor beperkte werkgeheugencapaciteit. Het huidige product heeft al crème/navy/lichtblauwe schermen, oranje accenten, afgeronde tegels, sterren, een voortgangsbalk, een eenvoudig succesgeluid en instellingen voor beweging/geluid. **Die bestaande onderdelen zijn de basis, niet een tweede systeem.**

## 2. Resultaat van 10 visuele verfijningen

1. **Herkenbare basis:** behoud de huidige Zinbo-header, oefenscène, zinbalk, tegels en typografische schaal.
2. **Niet kinderachtig:** ontwerp voor 9–12 jaar, met hoogwaardige lichte 3D-spelobjecten en een volwassen afgewerkte interface; geen kleuterillustraties.
3. **Tastbare beloning:** gouden munt met reliëf, randlicht, schaduw en één duidelijk herkenbare ster; meer dan een plat icoon.
4. **Eén karakter:** een kleine blauw-witte Zinbo-helper/werkplaatsrobot als *voorlopig concept*, met consequent silhouet en expressies. Nog niet als definitieve mascotte gekozen.
5. **Visuele prioriteit:** correcte zin en tegels blijven op hun plaats bij gewone successen; beloning verschijnt ernaast en vliegt naar de teller, niet als volledige schermvervanging.
6. **Beweging met karakter:** korte schaalverandering, gebogen muntbaan, lichte rotatie, zachte landing en een korte tellerreactie; geen lineaire schuifanimatie.
7. **Anticipatie:** maximaal vijf zichtbare stappen naar de schatkist; op stap vier een subtiele kistreactie, geen effect dat de taaltaak onderbreekt.
8. **Bewaar groot spektakel:** kistopening uitsluitend na afronden van een blok van vijf, op een afzonderlijk eindscherm en op initiatief van het kind.
9. **Samenhangende wereld:** munt, kist, vondsten, robot en eenvoudige werkplaats delen vormtaal, materialen, licht en iconografie. Ze vormen geen winkel of munteconomie in fase 1.
10. **Polish + regie:** geluid en beweging zijn nauwkeurig getimed en optioneel; nooit animatie die de voorgelezen correcte zin overstemt of de knop Volgende blokkeert.

## 3. Visuele bouwstenen

| Onderdeel | Ontwerprichting | Niet doen |
| --- | --- | --- |
| Basis | Bestaand crème `#FFFAF0`, navy `#071F54`, lichtblauw `#E7F6FF` | Nieuwe donkere arcade-interface op oefenscherm |
| Zin-UI | Bestaande tegelvormen en grammaticale semantiek; oranje `#FF8019` blijft taalkundig | Decoratief goud gebruiken als grammaticale tegelkleur |
| Beloning | Warm goud `#FFCB52`, afgeronde rand, rijke maar nette lichtreflecties | Overal goud/confetti |
| Robot (voorlopig) | Compacte blauw-witte helper met navy gezicht, kleine oranje details; beperkte plek naast beloning | Een groot personage dat de oefenillustratie of zin bedekt |
| Schatkist | Zelfde warm-gouden accent plus navy/blauwe panelen, gepolijst 3D-object | Generieke kist die qua stijl afwijkt van de munt |
| Vondsten (later) | Kleine op sokkels getoonde 3D-objecten; steeds dezelfde rendering | Tientallen categorieën, winkelstructuur of zeldzaamheidsdruk |
| Typografie | Bestaande goed leesbare grote tekst, spaarzaam decoratief gewicht | Kleinere instructietekst om ruimte voor animaties te winnen |

De illustratie die de grammaticale oefening verduidelijkt blijft de **bestaande oefenscène**. De conceptplaat met een juichend meisje is nadrukkelijk **geen** vereiste of vervanging van die scène. Illustratieve AI-mockups zijn sfeerbeelden, geen letterlijke schermspecificatie.

## 4. Drie concrete schermtoestanden

### A. Gewone oefening

De bestaande Zinbo-opgave vult het scherm: instructie met luisterknop, passende illustratie, herkenbare zintegels, voortgang en de huidige bediening. Rechtsboven blijft de bestaande teller. De helper is hier afwezig of zeer klein en inert. Geen zwevende beloningen zolang het kind bouwt.

### B. Goede zin / beloningsmoment

De gemaakte zin blijft op het scherm. De korte bevestiging verschijnt visueel in de buurt van de zin; de helper kan in een bescheiden hoek reageren. Eén munt ontstaat naast de bevestiging, volgt een boog naar de bestaande teller en verhoogt het getal. De correcte zin krijgt auditieve voorrang. Het effect kan worden overgeslagen door **Volgende**.

Op dit scherm **geen** grote kistopening, uitgebreide prijzenlijst of nieuwe menustructuur. Hulpvoltooiing en zelfstandig meteen goed krijgen verschillende, eerlijke feedback. Een munt is spelmotivatie en wordt niet gelezen als taalbeheersingsmeting.

### C. Blok van vijf voltooid

Aparte feestelijke toestand op het bestaande eindschermpad. Een prominente gesloten kist, één herkenbare korte zin, een knop **Open de schatkist**. Na tik opent de kist met warm licht en een korte geluidscue. Onthul hooguit één verzamelbare vondst tegelijk, met een duidelijke vervolgkeuze. Een werkplaatsgalerij is een **latere fase**, niet nodig voor eerste prototype.

## 5. Motion-design als voorstel, niet als UX-wet

| Micro-interactie | Richtwaarde |
| --- | --- |
| Tegels kort vast / succesgloed | 120–220 ms |
| Munt verschijnen | 200–280 ms |
| Munt naar teller | 400–550 ms gebogen baan |
| Teller lichte schaalreactie | 150–220 ms |
| Kist na expliciete tik openen | Circa 1,2–1,8 s, altijd overslaan mogelijk |
| Kleine helperreactie | 300–650 ms, alleen bij bevestiging |

Het oorspronkelijke Zinsbouwer-ontwerp noemt animaties tot 300 ms. Dit voorstel **wijkt voor de aparte beloningsbeleving daarvan af**; de grammaticale micro-interacties blijven kort. Onderzoek in de pilot of de langere feestmomenten prettig zijn.

## 6. Geluidsregie en toegankelijkheid

- Korte tegelklik, zachte muntlanding, rijker kistgeluid zijn herkenbare verschillende cues, niet één grote soundtrack.
- De correcte doelzin moet rustig en verstaanbaar uitgesproken kunnen worden zonder gelijktijdig geklingel.
- De eerdere browserstem is teruggezet; een expressievere voice is een **apart luisteronderzoek**, geen voorwaarde voor de visuele MVP.
- Gebruik bestaande instellingen **Geluid uit**, **Beweging uit** en respecteer `prefers-reduced-motion`; alle informatie blijft ook zonder effecten zichtbaar.
- Bij snel klikken, verversen of teruggaan mogen munttoevoeging en schatkist niet dubbel worden verwerkt. Gebruik dezelfde canonieke lokale voortgangsbron.
- Geen automatische afleiding van taalniveau uit beloningsmunten; behoud onderscheid zelfstandig/geholpen.

## 7. Afbakening, in bouwvolgorde

**Prototype 1: werkelijk oefenscherm → feedback → muntvlucht → bestaande teller**, plus één rustige tussentoestand van de kist in de voortgang. Het moet op 1366, 1024 en 390 px werken.

**Prototype 2: 5/5-afsluiting → tik om kist te openen → één vondst.** Pas toevoegen als het gewone successcherm aantoonbaar klopt.

**Later, na kindtest:** eenvoudige persoonlijke werkplaats, maximaal 6–8 vondsten, beperkte variaties in schatkisten en helperreacties. Geen winkel, drops met gokkarakter, competitieve ranglijst, streakdwang, coins-aankopen of extra backend.

## 8. Criteria voor een visueel geslaagde test

1. Het kind ziet direct wat de taalopdracht is; afbeelding en zin domineren vóór het antwoord.
2. Bij goed antwoord ziet het kind duidelijk wat het heeft verdiend, waar het naartoe gaat en dat de teller stijgt.
3. Het effect voelt plezierig voor verschillende leeftijden 9–12 jaar, zonder extra uitleg.
4. De kist is herkenbaar dezelfde beloningswereld als munt en helper.
5. Het kind kan de animatie overslaan en zelfstandig verdergaan.
6. Een kind dat geluid of beweging uitzet, mist geen noodzakelijke feedback.
7. Een geholpen antwoord krijgt wel warme feedback, maar niet de claim 'meteen zelfstandig goed'.
8. Geen nieuwe applicatieroute, data-opslaglaag, framework of overbodige configuratie.
9. Aantoonbare browsercontrole én een korte praktijkobservatie vóór gebruik als kindrelease.

**Besluitstatus:** deze visuele richting is een eerste uitgewerkte ontwerpvoorkeur. De gebruiker en uiteindelijk kinderen/deskundigen moeten de visuele aantrekkelijkheid en TOS-geschiktheid nog toetsen. Geen code- of vrijgaveclaim.


## Werkend QA-prototype — iteratie 1 (22 oktober 2026)

De visuele beloningsflow is als **geïsoleerde QA-route op het echte oefenscherm** toegevoegd aan de bestaande conceptbranch. Op de startpagina, onder de O3-auteurspilot: knop **Bekijk beloningsprototype (5 zinnen)**. Normale oefenzinnen, validator, tegels, instellingen en correct uitgesproken doelzin blijven de bron van waarheid. Een apart gestippeld knopje **Toon visuele beloning** vult uitsluitend in deze QA-route het juiste antwoord in om de animatie snel te demonstreren.

- Bij een correcte zin verschijnt een licht-gouden succeskaart met compacte blauw-witte Zinbo-helper en één reliëfmunt. Een tweede munt is de bonus voor meteen zelfstandig goed; bij hulp blijft het één. Het aantal munten wordt alleen in de tijdelijke `state.previewCoins` bijgehouden.
- Een munt vliegt met Web Animations naar de teller rechtsboven. Beweging uit of reduced-motion schakelt de vlucht uit; geluid uit blijft gelden.
- Na vijf echte, door de bestaande validator geaccepteerde zinnen verschijnt een kist op het bestaande einde-pad. Een expliciete knop opent die en toont één *voorlopige* vondst. Geen verzamelobjecten worden bewaard.
- Deze QA-route schrijft **geen** normale sterren, leerresultaten of O3-pilotgeschiedenis. De bestaande onafhankelijke review en kindpilot blijven onverkort nodig.

**Beperking:** Dit is een eerste echte interactieve browserimplementatie van de visuele richting, niet de definitieve asset-art of soundtrack. De robot is een eenvoudige inline SVG; de kist is in CSS geconstrueerd. De stemwijziging uit de vorige fase wordt niet aangeraakt. Test ook met echte kinderen vóór vrijgave.


## Besluit 23 oktober 2026 — muntanimatie v2: leesbare reis naar een schatkist

**Status:** v2 in de auteurspreview geïmplementeerd op 23 oktober 2026; onafhankelijke gebruikstest nog nodig. Vervangt voor de muntanimatie de eerdere richtwaarde van 400–550 ms hierboven. Geen wijziging in de grammaticale oefening, stem of release-gates.

### Gebruikersprobleem en vastgestelde oorzaak

De bestaande QA-functie `animateRewardCoin()` in `src/html-parts/part-014.txt` start een munt bij de succeskaart, verplaatst deze in 780 ms naar de teller rechtsboven en schaalt tot 36% met eindopacity 45%. Het ontvangende element is een abstracte teller, geen visueel herkenbare kist. De munt is nauwelijks te volgen en lijkt boven uit beeld te verdwijnen. Herstel niet alleen de snelheid: herstel **vertrek, route, doel, aankomst én geluid**.

### Nieuwe microflow

| Stap | Tijd (richtwaarde) | Visuele / auditieve gebeurtenis |
| --- | --- | --- |
| 1. Verschijnen | 0–220 ms | Gouden munt verschijnt bij de feedback, schaalt zacht van 85% naar 110% en terug naar 100%; volledige opacity. |
| 2. Herkenningspauze | 220–500 ms | Munt blijft zichtbaar; kind kan herkennen: “ik heb een munt verdiend”. |
| 3. Vlucht | 500–1550 ms | Munt volgt **1.050 ms** een brede, kalme gebogen baan binnen de viewport naar de *zichtbare* kist. Behoud >= 75% van het originele formaat tot het laatste kwart; eindigt op 70–80%, nooit als een bijna onzichtbaar stipje. |
| 4. Landing | 1550–1800 ms | De munt verdwijnt zichtbaar achter/in de kist; kist beweegt 4–6 px, licht heel kort op en het aantal munten stijgt. Eén herkenbaar zacht *kling* precies bij aankomst. |
| 5. Rust | daarna | Feedback en gemaakte zin blijven zichtbaar; “Volgende” blijft altijd direct beschikbaar. Geen autoplay naar de volgende vraag. |

De timing is een **luister- en observatiehypothese**, geen vaste TOS-norm. Geef de munt geen geforceerde piek van `-62px` als dit op smalle schermen tot clipping leidt. Gebruik een vloeiende boog met `cubic-bezier(.2,.65,.3,1)` als startwaarde; verfijn pas op basis van een echte browser- en kindtest.

### Zichtbaar doel, ook op mobiel

- Zet een kleine, herkenbare **blauw-gouden schatkist** naast de bestaande muntteller op het oefenscherm, uitsluitend in de belonings-UX. De kist fungeert als ontvangende container; de teller is geïntegreerd in/naast de kist. Houd de oefening visueel dominant.
- Tijdens de muntvlucht blijft het doel **in de zichtbare viewport**. Op desktop/laptop rechtsboven; op mobiel compact rechtsboven maar onder eventuele QA-banner. Gebruik zo nodig een tijdelijk binnen het scherm gepositioneerd ontvangerelement, niet de offscreen positie van een weggescrolde header.
- Lees bij de start de `getBoundingClientRect()` van munt en schatkist. De baan wordt afgeleid van hun werkelijke, actuele locaties, niet van vaste absolute coördinaten.
- Bewaak minimaal **16 px marge** rondom de gehele zichtbare munt gedurende de vlucht. Bij een onhaalbaar traject: gebruik een kortere, volledig zichtbare baan; **niet** buiten beeld animeren.
- De landing raakt het midden van de opening van de kist en wordt visueel afgedekt door de kistrand (geen verdwijnende munt boven/naast een icoon).

### Geluidsregie

- **Correcte zin eerst verstaanbaar laten uitspreken.** Toon de munt direct; start de vlucht na de uitgesproken zin (of na een beperkte fallback als spraak niet start). Vermijd muntgeluid tijdens de doelzin.
- Eén zacht munt-*kling* op het moment van zichtbare landing, geen eerdere beloningstoon die los van het beeld klinkt. De kist reageert tegelijk.
- Respecteer “Geluid uit”. Geen nieuwe externe audio-/TTS-dienst; behoud bestaande spraakstem.

### Tijdelijk, toegankelijk en correct

- `prefers-reduced-motion: reduce` of “Beweging uit”: munt verschijnt *meteen* bij de kist, teller wordt zichtbaar verhoogd, geen vliegroute of schudanimatie.
- Bij snel “Volgende”, navigeren, herstart of vernieuwen: animatie schoon afbreken; de geregistreerde beloning mag **niet dubbel** worden toegekend. Bij overslaan moet de teller wel op het juiste aantal staan.
- Award één keer bij gevalideerde `finishItem()`; onderscheid dit van **wanneer de zichtbare teller** na de animatie toeneemt. Geen opslag van QA-demomunten, geen invloed op sterren, voortgang of taalbeheersingsbewijs.
- Bij een bonus van twee munten mag één munt vliegen met label “+2”; vermijd twee onnodig opeenvolgende vluchten.

### Technische implementatie: minimaal, geen tweede architectuur

Hergebruik het bestaande QA-pad `reward-preview`, `animateRewardCoin()`, de succeskaart, de teller, Web Animations API en de bestaande instellingen. Voeg uitsluitend een visueel kistdoel, goed zichtbare animatiestappen en een aankomstgeluid/-reactie toe. Gebruik `animation.finished` plus een veilige afbreekroute voor cleanup; animerende DOM-nodes mogen niet blijven hangen bij navigatie. De beloningslogica blijft los van leerresultaten.

### Acceptatiecontrole vóór afronding

1. Op **1366×768, 1024×768 en 390×844** staat de hele munt gedurende 100% van de route binnen het zichtbare scherm.
2. Munt blijft minstens 250 ms herkenbaar vóór vertrek; de vlucht duurt rond **1.050 ms** en eindigt zichtbaar in de kist, niet in de hoek erboven.
3. Er is één duidelijk gelijktijdig zichtbaar- en hoorbaar ontvangstmoment. Stem en munt-*kling* praten niet door elkaar.
4. De teller stijgt één keer per geldig antwoord, ook bij snel klikken of overslaan; niets wordt extra opgeslagen in gewone leerlingvoortgang.
5. Geluid uit en verminderde beweging geven begrijpelijke, prettige feedback zonder verdwijnende of doorlopende animaties.
6. Op een echte laptop en telefoon/tablet is de beweging **zonder uitleg goed te volgen**; dit moet de gebruiker expliciet beoordelen, niet alleen de CI.
7. PR blijft **draft** en geen kindrelease vóór onafhankelijk didactisch oordeel en pilot.

**Besluit:** leesbare muntvlucht is visueel P0 binnen het beloningsprototype. Pas na deze correctie andere verzamel- of decoratie-effecten toevoegen.


### Implementatienotitie (23 oktober 2026)

QA-code gebruikt nu een altijd zichtbaar blauw-gouden mini-schatkistje naast de teller. De vlucht bestaat uit een 220ms verschijning, een zichtbare pauze, een gebogen vlucht van circa 1050ms en een landing. De totale animatie duurt circa 1800ms. Het muntklingeltje klinkt bij de landing en de zichtbare teller verandert dan pas. Het correcte taalmodel wordt eerst gesproken; een optionele `speak(..., onFinished)`-callback koppelt het einde van de zin aan de start van de animatie, zonder de oude stemkeuze te wijzigen. Onderbreking ruimt de animatie op en toont meteen het juiste aantal. Beweging uit en reduced-motion tonen geen vlucht. Alle effecten blijven uitsluitend in het bestaande QA-prototype. Bevestiging door een gebruiker die de animatie bekijkt blijft noodzakelijk.
