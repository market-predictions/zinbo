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
