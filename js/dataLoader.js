class DataLoader {
    static loadCards() {
        return fetch('data/cards.json').then(response => response.json());
    }

    static loadGameData() {
        return fetch('data/gameData.json').then(response => response.json());
    }
}
