
//const gameState = {
  //fen: game.fen(), // Posizione della scacchiera in FEN
  //moveHistory: [], // Storico delle mosse
  //currentPlayer: 'white'||'black', // Giocatore corrente
  //remainingTime: { // Tempi rimanenti per ciascun giocatore
      //white: 600,
      //black: 600
  //}
//};

// Funzione per impostare un cookie
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Funzione per ottenere un cookie
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Funzione per cancellare un cookie
function eraseCookie(name) {   
  document.cookie = name + '=; Max-Age=-99999999;';  
}

function saveGameState(gameState) {
  // Serializza lo stato del gioco in JSON e salva nei cookie
  setCookie('gameState', JSON.stringify(gameState), 1); // 1 giorno di durata
}

function loadGameState() {
  const savedState = getCookie('gameState');
  if (savedState) {
      try {
          // Deserializza lo stato del gioco dal JSON
          return JSON.parse(savedState);
      } catch (error) {
          console.error('Errore nel parsing dello stato del gioco:', error);
      }
  }
  return null;
}

function updateGameView(state) {
  // Aggiorna la visualizzazione del gioco in base allo stato
  // Esempio: aggiorna la scacchiera, i tempi, etc.
}

function setMoveHistory(moveHistory) {
  // Imposta la storia delle mosse nel gioco
}

function getMoveHistory() {
  // Ritorna la storia delle mosse dal gioco
  return game.history(); // Funzione ipotetica che ottiene la storia delle mosse
}

function setCurrentPlayer(player) {
  // Imposta il giocatore corrente
}

function getCurrentPlayer() {
  // Ritorna il giocatore corrente
  return game.turn(); // Funzione ipotetica che ritorna il giocatore corrente
}

function setRemainingTime(time) {
  // Imposta i tempi rimanenti per ciascun giocatore
}

function getRemainingTime() {
  // Ritorna i tempi rimanenti
  return { white: 600, black: 600 }; // Esempio statico, puoi modificarlo per adattarlo alla tua logica
}

//document.addEventListener('DOMContentLoaded', () => {
  // Genera o recupera l'ID del giocatore
  //let playerId = getCookie('playerId');
  //if (!playerId) {
      //playerId = generateUniqueId(); // Funzione per generare un ID unico
      //setCookie('playerId', playerId, 7); // Salva l'ID per 7 giorni
  //}

  // Invia l'ID del giocatore al server
  //socket.emit('reconnect', { gameId, playerId });
//});

function generateUniqueId() {
  // Genera un ID unico semplice
  return 'player-' + Math.random().toString(36).substr(2, 16);
}
