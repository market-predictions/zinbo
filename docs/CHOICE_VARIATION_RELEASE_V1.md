# Zinbo — Integratie goedgekeurde antwoordvarianten (releasekandidaat)

Datum: 19 november 2026. Status: **implementatie en verificatie op aparte branch**. Geen automatische wijziging van productie.

## Acceptatie en herkomst

- Bron: [16-item-proef PR #17](https://github.com/market-predictions/zinbo/pull/17).
- Eigenaar heeft de Cloudflare-UX-proef op 19 november 2026 geaccepteerd.
- Eigenaar bevestigde daarna dat een logopedist de 32 aanvullende woordvormen en feedback heeft goedgekeurd.
- Dit is geregistreerd als **door eigenaar bevestigde logopedische beoordeling**. Er is geen zelfstandig geverifieerd verslag of naam vastgelegd; we claimen dat niet.
- De bestaande zinnen, illustraties, originele antwoordparen, item-ID's en inhoudsbank blijven ongewijzigd.

## Niveaubeleid — alleen 16 goedgekeurde bronopgaven

| Bestaand niveau | Bronopgave stage 0 | stage 1 | stage 2 |
| --- | --- | --- | --- |
| 1 | 2 opties | 2 opties | 2 opties |
| 2 | 2 opties | 3 opties | 3 opties |
| 3 | 3 opties | 3 opties | 4 opties |
| 4 | 4 opties | 4 opties | 4 opties |

Dit zijn **antwoordspecifieke presentatiebanden**. De vier bestaande Zinbo-niveaus blijven inhoudelijk gelijk. Niveau 2–4 kan een extra grammaticaal onderscheid bevatten; het gaat om een samengesteld oefendoel (tijd én persoonsvorm), niet om uitsluitend een lagere gokkans.

- De handmatige niveaukeuze blijft leidend.
- In automatische oefenwerelden bepaalt het bestaande bewijsgebaseerde niveau de keuzes.
- Bij adaptieve werkwoorduitdagingen is de beginkans rustig: stage 0 → niveau 1, stage 1 → niveau 2, stage 2 → niveau 3; de expliciete gevorderde uitdaging kan niveau 4 gebruiken.
- Alleen de 16 bronitems uit `choice_pilot.json` krijgen extra antwoorden; geen generatieve vervoegingen tijdens het oefenen.
- De selector geeft een kleine voorkeur aan een nog niet gebruikte goedgekeurde variant wanneer het niveau geschikt is, zonder de regels voor oefenfamilie, herhaling en afwisseling opzij te zetten.

## Behoud van de leerervaring

Een gewone oefening gebruikt bestaande knoppen, audio, hints, feedback, `Laat zien`, voortgang en rondebeloning. Bij tijd- en persoonsvormvragen worden gerichte aanwijzingen gegeven. Eén fout is nadrukkelijk géén diagnose.

Leerresultaten voor aangepaste werkwoordopgaven registreren aanvullend `choicesOffered` en `choiceGoal`. Deze optionele velden veranderen de bestaande opslagversie, eerdere gegevens, sterren of niveaubewijsregels **niet**. Andere oefenitems blijven exact hetzelfde.

De aparte `?choice-pilot=1`-vergelijkingspagina blijft alleen als opt-in voor begeleiders bereikbaar, zonder sterren of resultaatopslag. De teksten daar zijn aangepast aan de geregistreerde goedkeuring.

## Acceptatiecriteria

1. **Releasebron:** exact 16 item-ID's, 32 extra woordvormen en de ondertekende-op-verzoek-van-eigenaar status; build faalt bij onverwachte bankwijzigingen.
2. **Antwoordkwaliteit:** per aangeboden set 2/3/4 unieke geldige woorden en precies één correct antwoord.
3. **Niveau:** niveau 1 nooit meer dan twee; niveau 2 maximaal drie; niveau 3 drie tot vier als de opgave erbij past; niveau 4 vier.
4. **UI:** dezelfde rustige Nunito-kaarten, correcte focusrand en responsive 2×2 waar nodig.
5. **Werkelijke leerlingroute:** in de normale werelden en adaptieve werkwoordoefeningen, niet alleen de proefschakelaar.
6. **Feedback:** tijd- versus persoons-/getalsfout krijgt afzonderlijke, terughoudende aanwijzingen.
7. **Compatibiliteit:** bestaande opslag, antwoorden, vijfzinnenrondes, sterren, illustraties en 389 werelditems blijven behouden.
8. **Verificatie:** bestaande CI en nieuwe niveau-/browserregressies groen; screenshots op 1366, 1024 en 390 pixels.

## Roll-out

De code blijft op een afzonderlijke PR en Cloudflare-branchpreview totdat de nieuwe integratie is gecontroleerd en de eigenaar besluit over productiepromotie. De eerdere acceptatie ging over de losstaande proef, niet automatisch over deze nieuwe plaatsing in de gewone leerlijn.
