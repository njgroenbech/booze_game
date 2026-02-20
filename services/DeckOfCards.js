class DeckOfCards {
    constructor(totalCards = 52) {
        this.totalCards = totalCards;
        this.cards = [];
        this.reset();
    }

    // Returns a fresh, ordered deck
    reset() {
        this.cards = Array.from({ length: this.totalCards }, (_, i) => i);
        return this;
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this;
    }

    drawNextCard() {
        if (this.cards.length === 0) {
            console.warn("Deck is empty!");
            return null; 
        }
        return this.cards.shift();
    }

    get remaining() {
        return this.cards.length;
    }

    get isEmpty() {
        return this.cards.length === 0;
    }

    peek(n = 1) {
        return this.cards.slice(0, n);
    }
}

export default DeckOfCards