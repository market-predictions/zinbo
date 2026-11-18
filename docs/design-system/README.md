# Zinbo

Zinbo helpt kinderen van 9 tot 12 jaar met een taalontwikkelingsstoornis (TOS) om zinnen te bouwen. Het ontwerp heeft één taak: het kind laten zien wat de opdracht is, wat de zinsdelen zijn en wat het goed deed. Al het andere komt daarna.

Dit is een eerste, bewust klein ontwerpsysteem. Het vervangt de huidige gestapelde stylesheet (655 kleurwaarden, 97 lettergroottes, 21 letterdiktes) door één set afspraken. De waarden zijn een voorstel op basis van de bestaande app (navy tekst, crème achtergrond, oranje werkwoord, goud voor beloning). De rolkleuren voor zinsdelen moeten nog worden afgestemd met een logopedist.

## Principes

1. **Eén ding tegelijk.** Per scherm één instructie, één taak, één primaire knop. Kinderen met TOS hebben vaak een beperkt verbaal werkgeheugen; elke extra zin op het scherm kost capaciteit.
2. **Grammatica is zichtbaar.** Elk zinsdeel heeft een vaste kleur én een vaste vorm. Zo wordt een regel iets wat je ziet, niet alleen iets wat je hoort.
3. **Beloning is apart.** Goud (`reward`) is alleen voor sterren, munten en de schatkist. Grammaticale kleuren worden nooit decoratief gebruikt, beloningskleuren nooit grammaticaal.
4. **Rust is premium.** Weinig waarden, overal hetzelfde toegepast. Eén kaartschaduw, vier hoekafrondingen, zeven lettergroottes.
5. **Het beeld blijft heel.** Illustraties staan in een kader en worden nooit als achtergrond bijgesneden. Er ligt nooit tekst of een knop over een gezicht.

## Stem en tekst

- Spreek het kind aan met *je*. Korte zinnen, één werkwoord per zin.
- Instructies zijn letterlijk wat de voorleesknop zegt: scherm en stem zijn identiek.
- Geen vaktermen in instructies. "Kies het werkwoord" mag als het kind dat woord in de les leert; "voltooid deelwoord" niet.
- Goed: **"Goed zo! Ik koop bloemen op de markt."** (herhaal altijd de hele goede zin).
- Nog niet: **"Je koos *kocht*. Dat is gisteren. Het gebeurt nu."** (noem wat het kind koos en waarom; geen "fout").
- Nooit: uitroepen zonder inhoud ("Super!!!"), ironie, emoji in instructies.

## Kleur

- Tekst is altijd `ink` op `surface-page` of `surface-card`. `ink-muted` alleen voor bijzaken (tellers, labels), nooit voor wat het kind moet doen.
- De primaire knop is `brand` met witte tekst. Er is per scherm maar één.
- Feedback gebruikt `success` en `attention` met hun `-soft` achtergronden. Er is geen rood: "nog niet" is geen alarm.
- `reward` (goud) komt alleen voor bij sterren, munten en de schatkist.

### Rolkleuren voor zinsdelen

| Rol | Vraag | Vlak | Rand en merk | Merkvorm |
| --- | --- | --- | --- | --- |
| Onderwerp | wie/wat? | `role-subject-soft` | `role-subject` | cirkel |
| Werkwoord | doet? | `role-verb-soft` | `role-verb` | driehoek |
| Voorwerp | wat? | `role-object-soft` | `role-object` | vierkant |
| Plaats | waar? | `role-place-soft` | `role-place` | ruit |
| Tijd | wanneer? | `role-time-soft` | `role-time` | halve cirkel |
| Overig | hoe/met wie? | `role-other-soft` | `role-other` | streep |

Waarom vorm én kleur: ongeveer één op de twaalf jongens heeft een vorm van kleurenblindheid, en zes kleuren zijn niet alleen op lichtheid uit elkaar te houden. De vorm draagt de betekenis; de kleur versterkt haar. Tekst op elk tegelvlak is `ink` (minstens 12,8:1). De randen halen minstens 3,8:1 op hun vlak.

Deze codering is geïnspireerd op het principe achter expliciete grammatica-aanpakken met vormen en kleuren, maar kopieert geen bestaand systeem. Laat de definitieve keuze toetsen door een logopedist die met de kinderen werkt.

## Typografie

Eén familie: **Nunito**. Rond en vriendelijk, maar met open letters en duidelijke vormen. In productie zelf hosten (nu laadt de app het font niet en valt elk apparaat terug op een ander systeemfont).

| Stijl | Gebruik |
| --- | --- |
| `display` 40/44 800 | Alleen het eindscherm en de begroeting. |
| `title` 28/34 800 | Schermtitel; op het oefenscherm de opdracht zelf. |
| `tile` 28/34 700 | Woorden op tegels. Groot, want dit is de taak. |
| `instruction` 22/30 700 | Feedbackregel onder de zin. |
| `body` 20/28 400 | Lopende tekst, uitleg voor ouders. |
| `ui` 18/24 700 | Knoppen. |
| `small` 15/20 700 | Tellers en badges. Nooit kleiner. |

Drie gewichten: 400, 700, 800. Geen andere.

## Ruimte, vorm en diepte

- Ruimte in stappen van 4: `space-1` tot `space-12`. Schermzones staan `space-8` uit elkaar.
- Hoeken: `radius-md` voor alles wat je aanraakt, `radius-lg` voor kaarten en het beeldkader, `radius-pill` voor tellers.
- Diepte: `shadow-card` voor kaarten. `shadow-raised` alleen voor een tegel die je sleept en voor dialogen. Tegels zelf hebben geen schaduw maar een onderrand van 3px in hun rolkleur: dat voelt als een blokje dat je kunt oppakken.
- Aanraakdoelen minstens 56px hoog.

## Beweging

- Tegel naar vak: 180 ms, `cubic-bezier(.2,.7,.3,1)`.
- Feedbackregel verschijnen: 200 ms opacity en 8px omhoog.
- Munt naar schatkist: zoals vastgelegd in de bestaande documentatie (circa 1,8 s totaal), alleen na de gesproken goede zin.
- Altijd uit bij `prefers-reduced-motion` of "Beweging uit". Er gaat geen informatie verloren zonder beweging.

## Het oefenscherm

Altijd dezelfde vier zones, van boven naar beneden, op elk formaat:

1. **Opdracht:** voorleesknop + opdracht (`title`), naast het illustratiekader. Eén zin.
2. **Zin:** de zinstrook op `surface-card`. Lege vakken zijn `surface-sunken` met een stippelrand.
3. **Keuzes:** de tegels in hun rolkleur, in een keuzebak op `surface-sunken`.
4. **Acties:** een vaste balk onderaan. Links Opnieuw en Hint (secundair), rechts de ene primaire knop.

Feedback verschijnt direct onder de zin, nooit als zwevende kaart over het beeld. De voortgang (1 van 5) en de sterren staan klein in de bovenbalk; er is één teller per ronde, niet twee.

## Iconografie

Eén lijnicoonset met 2px lijndikte en ronde uiteinden, 24px raster. Iconen zijn `ink` of de kleur van hun knop. Alleen iconen met een vaste betekenis: luisteren, opnieuw, hint, home, instellingen, ster.
