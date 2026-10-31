# Zinbo — UX en avatarbibliotheek (31 oktober 2026)

**Status:** implementatie op PR #5, gecontroleerde vrijgave afhankelijk van CI/browserreview.  
**Referentie:** door opdrachtgever geaccepteerde avatar-mockup en ontwerpspecificatie van 31 oktober. De mockup is visueel leidend, niet voor de verschillende prijsniveaus.

## Besluit: één eenvoudig beloningsmodel

- Vier gratis smileys, acht ontgrendelbare karakteravatars (verkenner, astronaut, kroon, kat, robot, superheld, regenboog, muziek).
- Eén vaste prijs: **5 sterren**, zonder winkel, inventaris, koopgeld, oplopende prijzen of een tweede verzamelwereld.
- Nieuwe sterren: **1 per volledig afgeronde reguliere ronde van vijf oefeningen**, ook bij hulp/fouten. Zelfstandigheid en taalbeheersing worden apart gemeten.
- Bestaande sterren blijven behouden bij migratie. Reeds gekozen oude objectavatars blijven beschikbaar zonder nieuwe betaling; bestaande avatar-ID's blijven geldig.
- Permanente ontgrendeling en keuze worden bewaard via dezelfde bestaande lokale `SAVE_KEY`. Ontgrendeling is een eenmalige handeling met expliciete bevestiging.
- De bestaande schatkist blijft een visueel feedbackmoment: mini-teller telt zinnen binnen de huidige ronde. De historische `rewardCoins` wordt voor compatibiliteit gelezen, maar er worden geen nieuwe permanente munten bijgeschreven.

## Navigatie en voortgang

- Sterrenteller linksboven is klikbaar en opent dezelfde profiel-/avatarbibliotheek als het profielmenu.
- Losse Instellingen-knop in de bovenbalk vervalt; profielmenu bevat profiel en avatars, voortgang, oefenniveau, instellingen, kennismaking en Voor ouders.
- Drie voortgangscijfers zijn informatief en worden niet kunstmatig klikbaar.
- Volgende stap en Verder oefenen staan in één compacte actieregel; ouder-tip verdwijnt onder de voortgang.

## Terugluisteren — voorlopig geen standaardfunctie

- In de ouder-/instellingenweergave staat de optionele proefinstelling **Mijn zin terugluisteren (proef)**, standaard uit.
- Als ingeschakeld, kan een kind vóór Controleer de eigen compleet gelegde zin terughoren. De actie geeft nooit een score of hint.
- Deze functie is voor kinderen met TOS pas geschikt als de begeleide praktijkobservatie aantoont dat ze helpt bij zelfcorrectie en geen onnodige foutieve taalmodellen versterkt.
- **De productiepublicatie van de overige UX is geen didactische vrijgave van deze proef.**

## Verificatie en grenzen

Bestaande broninhoud (389 opgaven) en onafhankelijke review-checks blijven onaangetast. Test de normale vijf-opgaven-wereld, gratis avatarselectie, slotstatus, betaalbevestiging, dubbelklik, herladen, historische avatar-ID, naam, sterrenbehoud, taak-audio, schatkist en responsiviteit op 1366, 1024 en 390 px.

Herbruikbare inline SVG's, geen netwerkasset of extra library; één bestaande statische GitHub-main → Cloudflare Pages route.

**Voorgaande richting:** `docs/UX_BELONING_VISUELE_RICHTING.md` blijft een historisch verkenningsdocument. Concepten als extra vondsten, robotmascotte, werkplaatsgalerij en wisselende prijzen maken **geen** deel uit van dit plan.

**Releasepoort:** pas mergen na geslaagde SHA-256-build, tekstcontrole, regressies, Chromium-test en controle van Cloudflare-preview. De code bevat geen bewijs voor een uitgevoerde TOS-luisterpilot.


## Correctieronde 31 oktober — hints en zelf terugluisteren

- **Werkwoordplaats:** de oude generieke zin `Het oranje werkwoord staat op plek 2` en dezelfde vaste aanname in foutfeedback zijn verwijderd. In zinsbouwopgaven met één werkwoord wordt een concrete positie alleen genoemd wanneer die in **alle** toegestane `solutions` gelijk is.
- **Bijzinnen:** `omdat` en `als` krijgen contextuele uitleg op basis van `kind`, óók wanneer een opgave in een reguliere leerwereld voorkomt. Alternatieve, correct geautoriseerde volgordes blijven geaccepteerd. Bij afwijkende correcte werkwoordposities verschijnt geen misleidende markering van één vak.
- **VTT:** een eigen hint verwijst naar hulpwerkwoord én voltooid deelwoord; dezelfde opgave hoeft niet als auteurspilot te draaien om de juiste hint te krijgen.
- **Terugluisteren:** de bestaande experimentele actie `Mijn zin horen` staat binnen het werkgebied onmiddellijk onder de opgebouwde `slots`/`stem-line`, niet meer in de onderste bediening. De knop wordt pas actief bij een complete zin en wanneer geluid en de optionele proefinstelling aan staan.
- **QA:** alle 166 zinsbouwdefinities worden in Chromium op concrete plaatsclaims gecontroleerd; de positie van de terugluisterknop wordt op 1366, 1024 en 390 px gemeten. Deze geautomatiseerde controles vervangen geen onafhankelijke taalkundige beoordeling of begeleide TOS-luisterproef.

Dit betreft geen wijziging in oefenzinnen of validator, alleen de wijze van ondersteunen en presenteren.
