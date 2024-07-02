document.addEventListener('DOMContentLoaded', () => {
    let gameData, cards;

    Promise.all([
        DataLoader.loadGameData(),
        DataLoader.loadCards()
    ]).then(([loadedGameData, loadedCards]) => {
        gameData = loadedGameData;
        cards = loadedCards;

        const player = new Player(gameData.player);
        const gameLogic = new GameLogic(player, gameData.stages, cards);

        document.getElementById('start-battle-button').addEventListener('click', () => gameLogic.startBattle());
        document.getElementById('draw-button').addEventListener('click', () => gameLogic.drawCards());
        document.getElementById('next-turn-button').addEventListener('click', () => gameLogic.nextTurn());
        document.getElementById('restart-button').addEventListener('click', () => gameLogic.restartGame());

        gameLogic.updateStatus();
    });
});
