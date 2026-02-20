class PlayerPlaceholderService {
  constructor() {
    this.placeholderPattern = /\{(player\d*)\}/g;
    this.fallbackPlayerDescriptions = [
      'den højeste spiller',
      'spilleren med de største sko',
      'den spiller der sidst tog en slurk',
      'spilleren med den bedste dans',
      'den spiller der kom sidst i dag',
      'spilleren med den højeste stemme',
      'den spiller med flest lommer',
      'spilleren der lugter mest af fest',
      'den spiller der blinker først',
      'spilleren med den mest kaotiske energi',
    ];
  }

  resolvePlayerPlaceholders(text, players) {
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

    const replacementByToken = this.buildReplacementByToken(placeholderTokens, players);
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

  replacePlayerPlaceholdersInText(text, players) {
    const replacementResult = this.resolvePlayerPlaceholders(text, players);
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

  buildReplacementByToken(placeholderTokens, players) {
    const replacementByToken = {};
    const availablePlayers = this.getUniquePlayerNames(players);
    const fallbackPool = [...this.fallbackPlayerDescriptions];

    for (const token of placeholderTokens) {
      if (availablePlayers.length > 0) {
        const selectedPlayer = this.selectRandomAndRemove(availablePlayers);
        replacementByToken[token] = {
          value: selectedPlayer,
          isPlayerName: true,
        };
      } else {
        const fallbackDescription = this.getFallbackDescription(fallbackPool);
        replacementByToken[token] = {
          value: fallbackDescription,
          isPlayerName: false,
        };
      }
    }

    return replacementByToken;
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

  getFallbackDescription(fallbackPool) {
    if (fallbackPool.length === 0) {
      fallbackPool.push(...this.fallbackPlayerDescriptions);
    }

    return this.selectRandomAndRemove(fallbackPool);
  }
}

export default PlayerPlaceholderService;
