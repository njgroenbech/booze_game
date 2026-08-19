class PlayerPlaceholderService {
  constructor() {
    this.placeholderPattern = /\{(player\d*)\}/g;
    this.fallbackPlayerDescriptionsByLanguage = {
      da: [
        'den højeste spiller',
        'spilleren med de største sko',
        'den spiller der sidst tog en slurk',
        'spilleren med den bedste dans',
        'den spiller der kom sidst i dag',
        'spilleren med den højeste stemme',
        "spilleren der kan tage flest armbøjninger",
        "spilleren med de største muskler"
      ],
      en: [
        'the tallest player',
        'the player with the biggest shoes',
        'the player who last took a drink',
        'the player with the best dance moves',
        'the player who arrived last today',
        'the player with the loudest voice',
        'the player who can do the most push-ups',
        'the player with the biggest muscles'
      ],
    };
  }

  // language er valgfri (default 'da'), så eksisterende kald/tests er uændrede.
  resolvePlayerPlaceholders(text, players, language = 'da') {
    const defaultResult = {
      resolvedText: text,
      highlightedPlayerNames: [],
    };

    if (typeof text !== 'string') {
      return defaultResult;
    }

    const placeholderTokens = this.extractPlaceholderTokens(text);
    if (placeholderTokens.length === 0) {
      return defaultResult;
    }

    const replacementByToken = this.buildReplacementByToken(placeholderTokens, players, language);
    let resolvedText = text;
    const highlightedPlayerNames = [];

    for (const token of placeholderTokens) {
      const placeholder = `{${token}}`;
      const replacementEntry = replacementByToken[token];
      const replacementValue = replacementEntry.value;
      resolvedText = this.replaceAllOccurrences(resolvedText, placeholder, replacementValue);

      if (replacementEntry.isPlayerName) {
        if (!highlightedPlayerNames.includes(replacementValue)) {
          highlightedPlayerNames.push(replacementValue);
        }
      }
    }

    return {
      resolvedText,
      highlightedPlayerNames,
    };
  }

  // Ligesom resolvePlayerPlaceholders, men tager et dansk OG et engelsk skabelon
  // og laver ÉT tilfældigt valg pr. placeholder (samme spiller/samme fallback-
  // beskrivelse-slot), som så anvendes på begge sprog. Det sikrer at {player}
  // bliver til den samme person uanset hvilket sprog kortet vises på, i stedet
  // for at rulle terningen forfra hver gang visningssproget skifter.
  resolvePlayerPlaceholdersBilingual(daText, enText, players) {
    const defaultResult = {
      da: daText,
      en: enText,
      highlightedPlayerNames: [],
    };

    if (typeof daText !== 'string' || typeof enText !== 'string') {
      return defaultResult;
    }

    const placeholderTokens = this.extractPlaceholderTokens(daText);
    if (placeholderTokens.length === 0) {
      return defaultResult;
    }

    const replacementByToken = this.buildReplacementByTokenBilingual(placeholderTokens, players);
    let resolvedDa = daText;
    let resolvedEn = enText;
    const highlightedPlayerNames = [];

    for (const token of placeholderTokens) {
      const placeholder = `{${token}}`;
      const replacementEntry = replacementByToken[token];
      resolvedDa = this.replaceAllOccurrences(resolvedDa, placeholder, replacementEntry.valueDa);
      resolvedEn = this.replaceAllOccurrences(resolvedEn, placeholder, replacementEntry.valueEn);

      if (replacementEntry.isPlayerName) {
        if (!highlightedPlayerNames.includes(replacementEntry.valueDa)) {
          highlightedPlayerNames.push(replacementEntry.valueDa);
        }
      }
    }

    return {
      da: resolvedDa,
      en: resolvedEn,
      highlightedPlayerNames,
    };
  }

  replacePlayerPlaceholdersInText(text, players, language = 'da') {
    const replacementResult = this.resolvePlayerPlaceholders(text, players, language);
    return replacementResult.resolvedText;
  }

  replaceAllOccurrences(sourceText, searchValue, replacementValue) {
    return sourceText.split(searchValue).join(replacementValue);
  }

  extractPlaceholderTokens(text) {
    const placeholderTokens = [];
    this.placeholderPattern.lastIndex = 0;

    let match = this.placeholderPattern.exec(text);
    while (match !== null) {
      const token = match[1];
      if (!placeholderTokens.includes(token)) {
        placeholderTokens.push(token);
      }
      match = this.placeholderPattern.exec(text);
    }

    return this.sortPlaceholderTokens(placeholderTokens);
  }

  sortPlaceholderTokens(tokens) {
    const sortedTokens = [...tokens];

    sortedTokens.sort((leftToken, rightToken) => {
      const leftOrder = this.getPlaceholderOrder(leftToken);
      const rightOrder = this.getPlaceholderOrder(rightToken);

      if (leftOrder < rightOrder) {
        return -1;
      }
      if (leftOrder > rightOrder) {
        return 1;
      }
      return 0;
    });

    return sortedTokens;
  }

  getPlaceholderOrder(token) {
    if (token === 'player') {
      return 1;
    }

    if (token.startsWith('player')) {
      const numericPart = token.replace('player', '');
      const parsedNumber = Number(numericPart);
      if (!Number.isNaN(parsedNumber) && parsedNumber > 0) {
        return parsedNumber;
      }
    }

    return 9999;
  }

  buildReplacementByToken(placeholderTokens, players, language = 'da') {
    const replacementByToken = {};
    const availablePlayers = this.getUniquePlayerNames(players);
    const fallbackDescriptions = this.fallbackPlayerDescriptionsByLanguage[language]
      ?? this.fallbackPlayerDescriptionsByLanguage.da;
    const fallbackPool = [...fallbackDescriptions];

    for (const token of placeholderTokens) {
      if (availablePlayers.length > 0) {
        const selectedPlayer = this.selectRandomAndRemove(availablePlayers);
        replacementByToken[token] = {
          value: selectedPlayer,
          isPlayerName: true,
        };
      } else {
        const fallbackDescription = this.getFallbackDescription(fallbackPool, fallbackDescriptions);
        replacementByToken[token] = {
          value: fallbackDescription,
          isPlayerName: false,
        };
      }
    }

    return replacementByToken;
  }

  // Ligesom buildReplacementByToken, men vælger fallback-beskrivelser via INDEX
  // i stedet for streng, så det samme "slot" (fx "den højeste spiller"/"the
  // tallest player") kan slås op i begge sprogs array med ét og samme valg.
  buildReplacementByTokenBilingual(placeholderTokens, players) {
    const replacementByToken = {};
    const availablePlayers = this.getUniquePlayerNames(players);
    const fallbackDescriptionsDa = this.fallbackPlayerDescriptionsByLanguage.da;
    const fallbackDescriptionsEn = this.fallbackPlayerDescriptionsByLanguage.en;
    const fallbackIndexPool = fallbackDescriptionsDa.map((_, index) => index);

    for (const token of placeholderTokens) {
      if (availablePlayers.length > 0) {
        const selectedPlayer = this.selectRandomAndRemove(availablePlayers);
        replacementByToken[token] = {
          valueDa: selectedPlayer,
          valueEn: selectedPlayer,
          isPlayerName: true,
        };
      } else {
        const fallbackIndex = this.getFallbackIndex(fallbackIndexPool, fallbackDescriptionsDa.length);
        replacementByToken[token] = {
          valueDa: fallbackDescriptionsDa[fallbackIndex],
          valueEn: fallbackDescriptionsEn[fallbackIndex],
          isPlayerName: false,
        };
      }
    }

    return replacementByToken;
  }

  getFallbackIndex(fallbackIndexPool, totalCount) {
    if (fallbackIndexPool.length === 0) {
      for (let index = 0; index < totalCount; index += 1) {
        fallbackIndexPool.push(index);
      }
    }

    return this.selectRandomAndRemove(fallbackIndexPool);
  }

  getUniquePlayerNames(players) {
    const uniquePlayerNames = [];

    if (!Array.isArray(players)) {
      return uniquePlayerNames;
    }

    for (const player of players) {
      if (typeof player !== 'string') {
        continue;
      }

      const trimmedName = player.trim();
      if (trimmedName.length === 0) {
        continue;
      }

      if (!uniquePlayerNames.includes(trimmedName)) {
        uniquePlayerNames.push(trimmedName);
      }
    }

    return uniquePlayerNames;
  }

  selectRandomAndRemove(items) {
    const randomIndex = Math.floor(Math.random() * items.length);
    const removedItems = items.splice(randomIndex, 1);
    return removedItems[0];
  }

  getFallbackDescription(fallbackPool, fallbackDescriptions) {
    if (fallbackPool.length === 0) {
      fallbackPool.push(...fallbackDescriptions);
    }

    return this.selectRandomAndRemove(fallbackPool);
  }
}

export default PlayerPlaceholderService;
