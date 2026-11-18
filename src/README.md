# Zinbo — echte bronbestanden (fase 1)

Deze fase is bewust gedragsneutraal. Er verandert niets aan oefeningen, validators, sterren of lokale opslag.

- `src/templates/index.html` bevat het HTML-skelet.
- `src/app/runtime.js`, `worlds.js` en `screens.js` blijven in dezelfde runtime-closure en laadvolgorde.
- `src/content/*.json` bevat ongewijzigde oefeningen en beeldreview-banken.
- `src/styles/legacy.css` bevat voorlopig de bestaande styling; fase 2 moet deze vervangen en mag geen overschrijvende laag stapelen.
- `public/art/*.webp` bevat 37 originele afbeeldingen. Hun exacte Git-blobs worden bij elke build gecontroleerd.
- De build blijft alle eigenaar-geattesteerde contentbanks en het QA-guard controleren.

De 15 arbitraire `html-parts`-segmenten en de hardgepinde eindbestand-SHA zijn verwijderd. De gebouwde pagina verwijst naar losse CSS en afbeeldingen, zodat de HTML-bundel veel kleiner is.

Controleer de build, regressies en echte browserflows op 1366, 1024 en 390 pixels vóór beoordeling.
