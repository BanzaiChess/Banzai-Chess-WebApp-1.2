const GameData = require("./GameData");

// dizionario delle partite in corso
const CURRENT_GAMES = {};


/**
 *  Funzione che crea un nuova partita e permette di
 * condividerla con un altro giocatore.
 */

function createNewGame(firstPlayerColor, timeSettings, position, isAI, aiLevel ) {
  const newGame = new GameData(firstPlayerColor, timeSettings, position, isAI, aiLevel);
  CURRENT_GAMES[newGame.gameId] = newGame;

  //console.log(`Partita creata con ID: ${newGame.gameId}, Chiavi giocatori: ${newGame.players}, Chiave Spettatore: ${newGame.spectatorKey}`);
  return {
    gameId: newGame.gameId,
    players: newGame.players,
    spectatorKey: newGame.spectatorKey,
    colors: newGame.colors,
    time: newGame.timeSettings,
    position: newGame.position,
    isAI: newGame.isAI,
    aiLevel: newGame.aiLevel,
    success: true,
  };
}

function getGameData(gameId, key) {
  const game = CURRENT_GAMES[gameId];
  
  if (game == undefined)
    throw new Error(`Partita con id ${gameId} non trovata`);
  if (!game.players.includes(key)  && key !== game.spectatorKey) {
    //if (!game.spectatorKey.includes(key)) {
    console.error(`Chiave ${key} non autorizzata per partita ${gameId}`);
    throw new Error("Non hai i permessi per accedere alla partita");
    //}
  }
  //console.log("Accesso alla partita con chiave: ", key);
  return game;
  
}

module.exports = { createNewGame, getGameData };