const { v4: uuidv4, v4 } = require("uuid");

class GameData {
  // TODO: crea una nuova partita

  constructor(firstPlayerColor, timeSettings, position,  isAI = false, aiLevel = null) {
    this.gameId = v4();
    this.players = [v4(), v4()];
    this.spectatorKey = v4(); // Chiave spettatore 

    if (firstPlayerColor === "black") {
      this.colors = ["black", "white"];
    } else {
      this.colors = ["white", "black"];
    }
    
    this.timeSettings = {
      totalTime: timeSettings.totalTime !== undefined ? timeSettings.totalTime : 0, 
      incrementTime: timeSettings.incrementTime !== undefined ? timeSettings.incrementTime : 0,
      moveTimeLimit: timeSettings.moveTimeLimit !== undefined ? timeSettings.moveTimeLimit : 0,
      whiteTime: null,
      blackTime: null,
    };

    this.movesHistory = [];
    this.position = position;
    this.isAI = isAI;
    this.aiLevel = aiLevel;
  }
}

module.exports = GameData;