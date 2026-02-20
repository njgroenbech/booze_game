# neverHaveIEver services

Denne mappe indeholder service-laget til `TicketCardStack`.
Formålet er at holde forretningslogik ude af UI-komponenten, så koden er lettere at læse og vedligeholde.

## Filer og ansvar

### `QuestionSessionService.js`
- Ansvar: Håndterer spørgsmålssessionen.
- Gør følgende:
- Bygger spørgsmålsbank pr. farve fra `data/questions.json`.
- Fjerner dubletter (normaliseret tekst) inden en session starter.
- Holder styr på hvilke spørgsmål der er tilbage i den aktive session.
- Trækker næste unikke spørgsmål med `drawNextUniqueQuestion()`.
- Nulstiller sessionens spørgsmål med `resetSessionQuestions()`.

### `TicketCardFactoryService.js`
- Ansvar: Opretter kort-objekter til UI-laget.
- Gør følgende:
- Opretter almindelige kort fra spørgsmål leveret af `QuestionSessionService`.
- Opretter "exhausted" kort, når der ikke er flere spørgsmål.
- Udskifter spiller-placeholders via `PlayerPlaceholderService`.
- Tilføjer visuel randomisering (tilt og offset), så kortene får variation.
- Samler kortoprettelsen i én entry-metode: `createNextCard(cardId, defaultBody, players)`.

### `PlayerPlaceholderService.js`
- Ansvar: Udskifter spiller-placeholders i spørgsmålstekster.
- Gør følgende:
- Finder placeholders som `{player}`, `{player2}`, `{player3}` i teksten.
- Vælger tilfældige spillernavne fra `GameContext` uden gentagelse pr. spørgsmål.
- Falder tilbage til generelle beskrivelser, hvis der mangler spillere.
- Returnerer den færdige tekst, som kan vises direkte på kortet.

## Samspil mellem services

1. `TicketCardStack` kalder `ticketCardService.createNextCard(...)`.
2. `TicketCardFactoryService` beder `QuestionSessionService` om næste unikke spørgsmål.
3. Hvis spørgsmålet har placeholders, udskifter `PlayerPlaceholderService` dem med navne/fallback.
4. Hvis der findes et spørgsmål, bygges et almindeligt kort.
5. Hvis der ikke findes flere spørgsmål, bygges et exhausted-kort.
6. Ved reset kalder `TicketCardStack` `questionSessionService.resetSessionQuestions()`.
