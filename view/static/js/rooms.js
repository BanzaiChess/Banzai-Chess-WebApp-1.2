const boardWrapperElement = document.getElementById('board-wrapper');
const boardElement = document.getElementById('board');
const room = document.getElementById('room-join-in');
const connectButton = document.getElementById('room-join-submit');
const state = document.getElementById('room-join-state');
const roomStatusWrapperElement = document.getElementById('room-status-wrapper');
const roomStatusElement = document.getElementById('room-status');


// ==== Game ==== //

let board = null
const game = new Chess();

const onDragStart = (source, piece, position, orientation) => {

    // disallow piece movement when game is over
    if (game.isGameOver()) return false;

    // disallow piece movement when game hasn't started
    if (play) return false;

    // disallow moving pieces of the other player
    if ((color === 'white' && piece.search(/^b/) !== -1) ||
        (color === 'black' && piece.search(/^w/) !== -1)) {
        return false;
    }

    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

const onDrop = async (source, target) => {

  // Controlla se è una promozione standard
  const isPromotion = game.moves({ verbose: true }).filter((move) => move.from === source && move.to === target && move.flags.includes('p')).length > 0;
  // Controlla se è una promozione con spinta
  const isPushPromotion = game.moves({ verbose: true }).some((move) => move.from === source && move.to === target && move.subpromotion);
  const playerColor = game.turn() === 'w' ? 'white' : 'black'; // Ottieni il colore del giocatore corrente

  if (isPromotion) {
    console.log("PROMOTION?", isPromotion); 

    // Rilascio del pedone prima di aprire la modale
    setTimeout(async () => {
      try {
        const promotionpiece = await showPromotionModal(playerColor, false); // Aspetta la scelta dell'utente
        if (promotionpiece) {
          const move = game.move({ from: source, to: target, promotion: promotionpiece });
          socket.emit("move", { move: move, sanMove: move.san, board: game.fen(), room: gameId, playerColor, movesHistory: game._history});
          board.position(game.fen());
          updateMoveHistory(move.san);
          //update();
          //switchTurn(playerColor);
        }
      } catch (error) {
        console.error("Promotion error:", error);
        return "snapback";
      }
    }, 0);

  } else if (isPushPromotion) {
    console.log("PUSH PROMOTION?", isPushPromotion); 

    // Rilascio del pedone prima di aprire la modale
    setTimeout(async () => {
      try {
        const subpromotionpiece = await showPromotionModal(playerColor, true); // Aspetta la scelta dell'utente, escludendo la regina
        if (subpromotionpiece) {
          const move = game.move({ from: source, to: target, subpromotion: subpromotionpiece });
          socket.emit("move", { move: move, sanMove: move.san, board: game.fen(), room: gameId, playerColor, movesHistory: game._history});
          board.position(game.fen());
          updateMoveHistory(move.san);
          //update();
          //switchTurn(playerColor);
        }
      } catch (error) {
        console.error("Push Promotion error:", error);
        return "snapback";
      }
    }, 0);
  } else {
    try {
      console.log("NOT A PROMOTION MOVE");
      // Verifica se la mossa è legale
      const move = game.move({ from: source, to: target });
      socket.emit("move", { move: move, sanMove: move.san, board: game.fen(), room: gameId, playerColor, movesHistory: game._history}); 
      updateMoveHistory(move.san);
      //update();
      //console.log(playerColor);
      //switchTurn(playerColor);
    } catch (error) {
      console.error("Invalid Move:", error);
      return "snapback";
    }
  }
};

const recallMoveHistory = (movesHistory) => {
  //console.log(...movesHistory);
  let moves = movesHistory;
  const movesTable = document.getElementById("moves-table").getElementsByTagName("tbody")[0];
  
  for (let i = 0; i < moves.length; i++) {
    let move = moves[i];
    let moveColor = (i % 2 === 0) ? 'white' : 'black';
    //console.log(`Move: ${move}, Color: ${moveColor}`);

    if (moveColor === 'white') {
    // Aggiungi una nuova riga con la mossa del bianco
      const newRow = movesTable.insertRow();
      const whiteCell = newRow.insertCell(0);
      const blackCell = newRow.insertCell(1);
      whiteCell.textContent = move;
      blackCell.textContent = "";
    } else {
      const lastRow = movesTable.rows[movesTable.rows.length - 1];
      const blackCell = lastRow.cells[1];
      blackCell.textContent = move;
    }
  }
}

  const updateMoveHistory = (sanMove) => {

    const movesTable = document.getElementById("moves-table").getElementsByTagName("tbody")[0];
    const moveColor = game.turn() === 'b' ? 'white' : 'black';

    if (moveColor === 'white') {
      // Aggiungi una nuova riga con la mossa del bianco
      const newRow = movesTable.insertRow();
      const whiteCell = newRow.insertCell(0);
      const blackCell = newRow.insertCell(1);
      whiteCell.textContent = sanMove;
    } else {
      
      // Aggiungi la mossa del nero all'ultima riga
      let lastRow;
      if (movesTable.rows.length === 0 || movesTable.rows[movesTable.rows.length - 1].cells[1].textContent.trim() !== "") {
        // Se non c'è ancora una riga o l'ultima riga ha già la mossa nera, crea una nuova riga
        lastRow = movesTable.insertRow();
        lastRow.insertCell(0).textContent = "--"; // Inserisci "-" nella cella del bianco
        lastRow.insertCell(1).textContent = ""; // Inserisci una cella vuota per il nero
      } else {
        // Altrimenti, usa l'ultima riga esistente
        lastRow = movesTable.rows[movesTable.rows.length - 1];
      }
      const blackCell = lastRow.cells[1];
      blackCell.textContent = sanMove; 
    }
     // Abilita o disabilita il pulsante "Ritira Mossa" e "Salva Partita"
     const undoMoveButton = document.getElementById('undo-move');
     const saveGameButton = document.getElementById('save-game');
     if (movesTable.rows.length === 0) {
         // Nessuna mossa nello storico
         undoMoveButton.disabled = true;
         saveGameButton.disabled = true;
     } else {
         // Almeno una mossa nello storico
         undoMoveButton.disabled = false;
         saveGameButton.disabled = false;
     }
  };

  const removeLastMoveFromHistory = () => {
    
    const movesTable = document.getElementById("moves-table").getElementsByTagName("tbody")[0];
    const rows = movesTable.rows;

    if (rows.length === 0) return;
    

    const lastRow = rows[rows.length - 1];
    const whiteCell = lastRow.cells[0];
    const blackCell = lastRow.cells[1];

    if (blackCell && blackCell.textContent !== "") {
        blackCell.textContent = "";
        
    } else {
        movesTable.deleteRow(rows.length - 1);
        
    }
    // Controlla di nuovo il pulsante "Ritira Mossa" e "Salva Partita"
    const undoMoveButton = document.getElementById('undo-move');
    const saveGameButton = document.getElementById('save-game');
    if (movesTable.rows.length === 0) {
        // Nessuna mossa nello storico
        undoMoveButton.disabled = true;
        saveGameButton.disabled = true; 
    } else {
        // Almeno una mossa nello storico
        undoMoveButton.disabled = false;
        saveGameButton.disabled = false;
    } 
  };

  // update board position after the piece snap, for castling, en passant, pawn promotion
  const onSnapEnd = () => {
    board.position(game.fen());
  };
  
  const update = () => {
    var state = "";
    var moveColor = "White";
    if (game.turn() === "b") {
      moveColor = "Black";
    }
  
    // checkmate?
    if (game.isCheckmate()) {
      socket.emit('game-is-over', { gameId });
      state = "Game over - " + moveColor + " is in checkmate";
      gameInfo = state;
    }
  
    // draw?
    else if (game.isDraw()) {
      socket.emit('game-is-over', { gameId });
      state = "Draw";
      gameInfo = state;
    }
  
    // game still on
    else {
      state = moveColor + " turn";
  
      // check?
      if (game.inCheck()) {
        state += ", " + moveColor + " is in check";
      }
    }
    document.getElementById("room-join-state").innerHTML = state;
  };
  
  var config = {
    draggable: true,
    position: "start",
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
  };
  board = Chessboard("board", config);
  update();

// ==== Socket.IO ==== //

const socket = io();

// some global variables
let color = "white";
let play = true;
let players;
let playerID;
let currentFEN = '';
let timeSettings;
let serverSettings = null;
let disabledButtons = new Set();
let whitePlayerKey, blackPlayerKey; // Per connessioni biunivoche
let WhitePlayer, BlackPlayer; // Per connessioni biunivoche
let playerColor;
let gameInfo;
// Estrai i parametri dalla URL
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get("gameId");
const playerKey = urlParams.get("key1") || urlParams.get("key2");
const spectatorKey = urlParams.get("spectatorKey");

//console.log("Attempting to join room:", gameId);
//console.log("Player key:", playerKey); // Aggiungi questo log per vedere la key inviata dal client

if (gameId && playerKey) {
  document.getElementById("room-join-state").innerText = `Connecting to room ${gameId}...`;

  socket.emit("join", { gameId, playerKey });  // Invia la richiesta di unirsi alla stanza

  // Ascolta gli eventi dal server
  socket.on("player", (msg) => {
    
    const { playerSocket, colors, gameId, timeSettings, movesHistory, position  } = msg; //
    console.log("Received player assignment:", msg);
    playerColor = colors; // playerIndex === 0 ? colors[0] : colors[1];
    currentFEN = msg.position;
    let maxTime = timeSettings.totalTime;
    let initialPosition = msg.position;

    if (playerSocket !== undefined) {
      playerID = msg.playerSocket;
    };

    if (Array.isArray(playerColor)) {
       if (playerKey === urlParams.get("key1")) {
        playerColor = colors[0];
        if (playerSocket === undefined) {
          playerID = (playerColor === "white") ? msg.white : msg.black;
        }       
      } else if (playerKey === urlParams.get("key2")) {
        playerColor = colors[1];
        if (playerSocket === undefined) {
          playerID = (playerColor === "black") ? msg.black : msg.white;
        }
      }
    };

    if (maxTime === 0) {
      document.getElementById("white-timer").style.display = "none";
      document.getElementById("black-timer").style.display = "none";
      document.getElementById("timers").style.display = "none"; 
    };

    if (initialPosition === "start") { //per caricare la nuova fen su chess.js 
      //console.log("Regular Starting Position")
    } else game.load(initialPosition, { skipValidation: true, preserveHeaders: false });

    if (maxTime > 0 && msg.reconnection !== true) {
      // Aggiorna l'HTML con il tempo massimo
      // Converte il tempo massimo in minuti e secondi
      let maxMinutes = Math.floor(maxTime / 60000);
      let maxSeconds = Math.floor((maxTime % 60000) / 1000);
      document.getElementById("white-minutes").innerText = maxMinutes.toString().padStart(2, '0');
      document.getElementById("white-seconds").innerText = maxSeconds.toString().padStart(2, '0');
      document.getElementById("black-minutes").innerText = maxMinutes.toString().padStart(2, '0');
      document.getElementById("black-seconds").innerText = maxSeconds.toString().padStart(2, '0');
    };

    if (msg.reconnection === true) {
      console.log('Player with', playerColor, 'is reconnecting');
      let whiteTime = msg.timeSettings.whiteTime;
      let blackTime = msg.timeSettings.blackTime;
      //console.log("Players time recovered is: ", whiteTime, blackTime);

      // Aggiorna l'HTML
      document.getElementById("white-minutes").innerText = Math.floor(whiteTime / 60000).toString().padStart(2, '0');
      document.getElementById("white-seconds").innerText = Math.floor((whiteTime % 60000) / 1000).toString().padStart(2, '0');
      document.getElementById("black-minutes").innerText = Math.floor(blackTime / 60000).toString().padStart(2, '0');
      document.getElementById("black-seconds").innerText = Math.floor((blackTime % 60000) / 1000).toString().padStart(2, '0');
      
      game._history = msg.movesHistory; 
      //console.log("Game State recovered is: ", game);    
    } 

    if (msg.gameOver === true) {
      console.log('Player with', playerColor, 'is trying to access a finished game');
      board.orientation(playerColor);
      board.position(initialPosition);
      document.getElementById("room-join-state").innerHTML = msg.result;
      let whiteTime = msg.timeSettings.whiteTime;
      let blackTime = msg.timeSettings.blackTime;
      //console.log("Players time recovered is: ", whiteTime, blackTime);
      // Aggiorna l'HTML
      document.getElementById("white-minutes").innerText = Math.floor(whiteTime / 60000).toString().padStart(2, '0');
      document.getElementById("white-seconds").innerText = Math.floor((whiteTime % 60000) / 1000).toString().padStart(2, '0');
      document.getElementById("black-minutes").innerText = Math.floor(blackTime / 60000).toString().padStart(2, '0');
      document.getElementById("black-seconds").innerText = Math.floor((blackTime % 60000) / 1000).toString().padStart(2, '0');
      // Disabilita il movimento delle pedine
      board.draggable = false;
      play = true;
      // Disabilita i pulsanti draw, resign, takeback
      document.getElementById("offer-draw").disabled = true;
      document.getElementById("resign").disabled = true;
      document.getElementById("undo-move").disabled = true;
      document.getElementById("save-game").disabled = false;
      return
          
    } 

    board.orientation(playerColor);
    board.position(initialPosition);   
    update();  
  });

  socket.on("move", (msg) => {
    //console.log("Received move:", msg);
    if (msg.room === gameId) {
      const playerColor = msg.move.color === 'w' ? 'white' : 'black';
      game.move(msg.move);
      board.position(game.fen());
      updateMoveHistory(msg.move.san);
      //update();
      //switchTurn(playerColor);
      //play = false;

      //console.log("PGN OF THE GAME: ", game.pgn())    
    }
  });

  socket.on("error", (msg) => {
    state.innerText = msg;
  });

  socket.on("player-exit", (msg) => {
    console.log("Player exited:", msg);
    if (msg.room === gameId) {
      document.getElementById(
        "room-join-state"
      ).innerText = `The other player left the game.`;

      const config = {
        draggable: false,
        position: game.fen(),
      };

      board = Chessboard("board", config);
      board.orientation(color);
    }
  });

} else {

  if (gameId && spectatorKey) {

    // Invia la richiesta di unirsi alla stanza
    socket.emit("watch", { gameId, spectatorKey });

    socket.on("spectator", (msg) => {
      console.log("New Spectator!");
      const { gameId, isSpectator, specatatorSocket, game } = msg;
      console.log("Game Info for spectator: ", msg);
      let currentFEN = game.position;
      
      //console.log("Moves history: ", msg.movesHistory);
      let maxTime = game.timeSettings.totalTime;
      let whiteTime = game.timeSettings.whiteTime;
      let blackTime = game.timeSettings.blackTime;

      if (maxTime === 0) {
        document.getElementById("white-timer").style.display = "none";
        document.getElementById("black-timer").style.display = "none";
        document.getElementById("timers").style.display = "none";
        recallMoveHistory(game.movesRecord);
      }
  
      if (maxTime > 0 && whiteTime === undefined && blackTime === undefined) {

        let maxMinutes = Math.floor(maxTime / 60000);
        let maxSeconds = Math.floor((maxTime % 60000) / 1000);
        document.getElementById("white-minutes").innerText = maxMinutes.toString().padStart(2, '0');
        document.getElementById("white-seconds").innerText = maxSeconds.toString().padStart(2, '0');
        document.getElementById("black-minutes").innerText = maxMinutes.toString().padStart(2, '0');
        document.getElementById("black-seconds").innerText = maxSeconds.toString().padStart(2, '0');

      } else if (maxTime > 0 && whiteTime !== undefined && blackTime !== undefined) {

        document.getElementById("white-minutes").innerText = Math.floor(whiteTime / 60000).toString().padStart(2, '0');
        document.getElementById("white-seconds").innerText = Math.floor((whiteTime % 60000) / 1000).toString().padStart(2, '0');
        document.getElementById("black-minutes").innerText = Math.floor(blackTime / 60000).toString().padStart(2, '0');
        document.getElementById("black-seconds").innerText = Math.floor((blackTime % 60000) / 1000).toString().padStart(2, '0');
        //game._history = msg.movesHistory;
        recallMoveHistory(game.movesRecord);
      }

      if (isSpectator) {
        //console.log(`Connected as spectator to game ${gameId}`);
        // Disabilita i controlli per gli spettatori
        document.getElementById("right-buttons").style.display = "none";
        document.getElementById("share-link").hidden = true;
        document.getElementById("rotate").hidden = false;
      }

      if (game.gameOver === true) {
        console.log('Spectator is trying to access a finished game');
         board.orientation("white");
         board.position(currentFEN);
         document.getElementById("room-join-state").innerHTML = game.result;
         return
      }

      board.orientation("white");
      board.position(currentFEN);   
      update(); 

    });

    socket.on("newmove", (msg) => {
      console.log("Received move:", msg);
      if (msg.room === gameId) {
        game.move(msg.move);
        board.position(game.fen());
        updateMoveHistory(msg.move.san);
        //update();
        //switchTurn();  
      }
    });
  }

  //document.getElementById("room-join-state").innerText = "No room ID provided.";
}

socket.on("play", (msg) => {
  
  const { gameId, WhitePlayerSocket, BlackPlayerSocket, reconnection } = msg;
  WhitePlayer = WhitePlayerSocket;
  BlackPlayer = BlackPlayerSocket;
  
  if (msg.gameId === gameId && reconnection !== true) {
    
    if (game.turn()==="w") {
      socket.emit('start-clock', gameId, "white");
      //startClock("white");
    } else if (game.turn()==="b") {
      socket.emit('start-clock', gameId, "black");
      //startClock("black"); 
    }
    play = false;
    update();
    console.log("Play event received. Both players have joined. Game started!");  
  
  } else {
    play = false;
    update();
    console.log("Play event received. Both players have joined. Game started!");  
  }
  
});

socket.on("rotate-board", (msg) => {
  //console.log("ROTATING THIS BOARD");

  color = msg.color;

  players = msg.players;

  playerId = msg.playerId;

  board.orientation(color);
  update();
});

socket.on('time-update', msg => {
  const {whiteTime, blackTime} = msg;
  //console.log("Time Update Info are: ", msg);
  turnPlayer = game.turn() === 'w' ? 'white' : 'black';
  //console.log("Turn player color is:", turnPlayer);
  let timeLeft = turnPlayer === 'white' ? whiteTime : blackTime;
  let minutes = Math.floor(timeLeft / 60000); // Converti in minuti
  let seconds = Math.floor((timeLeft % 60000) / 1000); // Converti in secondi
  //console.log("Turn Player time is:", minutes, seconds );
  // Aggiorna l'HTML con il tempo rimanente
  document.getElementById(`${turnPlayer}-minutes`).innerText = minutes.toString().padStart(2, '0');
  document.getElementById(`${turnPlayer}-seconds`).innerText = seconds.toString().padStart(2, '0');
  // Evidenzia il timer attivo
  document.getElementById(`${turnPlayer}-timer`).classList.add('active');
  document.getElementById(`${turnPlayer === 'white' ? 'black' : 'white' }-timer`).classList.remove('active');
})

socket.on("updateMoves", (msg) => {
  const { movesHistory, playerSocket } = msg;

  // Controlla se l'aggiornamento è destinato a questo giocatore
  if (playerID === playerSocket || msg.gameOver) {
    //console.log("Updating moves table for player:", playerID);
    recallMoveHistory(movesHistory);
  } else {
    //console.log("Ignoring update for player:", playerSocket);
  }
});

// Aggiorna il turno
socket.on("NewTurn", (msg) => {
  // Nuovo turno, riabilita i pulsanti
  
  disabledButtons.clear();
  enableTurnButtons();
  updateButtonStates(); // Aggiorna lo stato dei pulsanti
  //console.log("Disabled Buttons:", disabledButtons);
  //console.log("play is: ", play);
});

// Recupera la fen corrente per quando salvi la partita
socket.on("NewFen", (msg) => {
  //console.log("FEN corrente: ", msg);
  currentFEN = msg;
});

// Recupera il corretto stato della partita dopo ogni mossa
socket.on("Update-Status", (msg) => {
  //console.log("Updating Game Status for:", msg)
  update()
});

// Gestione dello stato in caso di resa
socket.on("resigned", (msg) => {
  const { playerColor } = msg;
  // Aggiorna lo stato della partita
  const losingPlayer = playerColor.charAt(0).toUpperCase() + playerColor.slice(1);
  const winningPlayer = playerColor === 'white' ? 'Black' : 'White';
  document.getElementById("room-join-state").innerText = `${losingPlayer} resigned. ${winningPlayer} won.`;
});

// Gestione dell'offerta di patta
socket.on("draw-offered", (msg) => {
  const { playerKey } = msg;
  console.log(`Il giocatore con chiave ${playerKey} offre una patta.`);

  // Mostra la modale per accettare o rifiutare
  const modal = document.getElementById("drawModal");
  modal.style.display = "block";

  // Gestione dei pulsanti della modale
  document.getElementById("acceptDrawBtn").onclick = function() {
      socket.emit("draw-response", { gameId, accept: true });
      modal.style.display = "none";
  };

  document.getElementById("rejectDrawBtn").onclick = function() {
      socket.emit("draw-response", { gameId, accept: false });
      modal.style.display = "none";
  };
});

// Gestione dello stato in risposta alla patta
socket.on("draw-response-result", (msg) => {
  const { accept } = msg;
  if (accept) {
      document.getElementById("room-join-state").innerText = "Draw Agreed";
      console.log("La patta è stata accettata.");
  } else {
      console.log("La patta è stata rifiutata.");
  }
});

// Gestione dell'offerta di ritiro mossa 
socket.on("undo-request", (msg) => {
  const { playerKey } = msg;
  console.log(`Il giocatore con chiave ${playerKey} vuole ritirare l'ultima mossa.`);

  // Mostra la modale per accettare o rifiutare
  const modal = document.getElementById("moveModal");
  modal.style.display = "block";

  // Gestione dei pulsanti della modale
  document.getElementById("acceptMoveBtn").onclick = function() {
      socket.emit("move-takeback-response", { gameId, accept: true });
      modal.style.display = "none";
  };

  document.getElementById("rejectMoveBtn").onclick = function() {
      socket.emit("move-takeback-response", { gameId, accept: false });
      modal.style.display = "none";
  };
});

// Gestione dello stato in risposta al ritiro mossa
socket.on("move-takeback-response-result", (msg) => {
  const { accept, gameId } = msg;
  //console.log("move tackeback response message:", msg );
  //console.log("Fen attuale della variabile currentFen: ", currentFEN);
  //console.log("Fen attuale data da game.fen(): ", game.fen()); 
  //console.log("Game history base on the history method: ", game.history())
  //console.log("Lista mosse dalla funzione PGN: ", game.pgn());
  if (accept) {
      // Logica per ritirare l'ultima mossa
      game.undo();
      board.position(game.fen());
      update();
      //switchBackTurn();   
      position = game.fen();
      currentFEN = position;
      socket.emit("fenUpdate", gameId, position);
      removeLastMoveFromHistory();

      // Determina il turno del giocatore che ha ritirato la mossa
      const moveColor = game.turn() === 'w' ? 'White' : 'Black';
      //update()
      document.getElementById("room-join-state").innerText = `${moveColor} turn`;
      console.log("La richiesta di ritiro mossa è stata accettata.");
  } else {
      console.log("La richiesta di ritiro mossa è stata rifiutata.");
  }
});

// Gestione Status per Time Over 
socket.on('time-over', (data) => {
  const { player, gameId } = data;
  console.log("Time Over");

  // Aggiorna lo stato della partita per entrambi i giocatori
  document.getElementById("room-join-state").innerText = `${player.charAt(0).toUpperCase() + player.slice(1)}'s time is over - ${player === 'white' ? 'black' : 'white'} wins`;
});

// ==== Gestione della Fine della Partita ==== //
socket.on("game-over", (msg) => {
  const { gameId } = msg;
  console.log("Game Over for room:", gameId);
  //stopClock(currentPlayer); // Ferma il timer
  gameInfo = document.getElementById("room-join-state").innerText;
  console.log("Game Status after Game Over:", gameInfo);
  socket.emit("finalGameState", gameId, gameInfo);

  // Disabilita il movimento delle pedine
  board.draggable = false;
  play = true;

  // Disabilita i pulsanti draw, resign, takeback
  document.getElementById("offer-draw").disabled = true;
  document.getElementById("resign").disabled = true;
  document.getElementById("undo-move").disabled = true;
});

socket.on("reconnect", ({msg}) => {

});

// Funzione per Arrendersi
function resign() {
  const resignModal = document.getElementById('resignModal');
  const confirmResignBtn = document.getElementById('confirmResignBtn');
  const cancelResignBtn = document.getElementById('cancelResignBtn');

  // Mostra la modale
  resignModal.style.display = 'block';

  // Gestisci il click sul pulsante di conferma
  confirmResignBtn.onclick = function() {
      resignModal.style.display = 'none';
      socket.emit("resign", { gameId, playerKey, playerColor });
      console.log(`${playerColor.charAt(0).toUpperCase() + playerColor.slice(1)} resigns.`);
  };

  // Gestisci il click sul pulsante di annullamento
  cancelResignBtn.onclick = function() {
      resignModal.style.display = 'none';
  };

  // Chiudi la modale se clicchi fuori da essa
  window.onclick = function(event) {
      if (event.target == resignModal) {
          resignModal.style.display = 'none';
      }
  };
}

// Funzione per Offrire Patta
function offerDraw() {
  socket.emit("draw-offer", { gameId, playerKey, playerColor, sender: playerID });
  console.log(`${playerColor.charAt(0).toUpperCase() + playerColor.slice(1)} offers a draw.`);
  //console.log("Offerta di patta inviata.");
}

// Funzione per Ritirare Mossa
function undoMove() {
  //console.log("Sender ID: ", playerID)
  socket.emit("undo-move", { gameId, playerKey, playerColor, sender: playerID });
  console.log(`${playerColor.charAt(0).toUpperCase() + playerColor.slice(1)} ask to takeback his last move.`);
  //console.log("Richiesta di ritirare mossa inviata.");
}

// Funzione per abilitare i pulsanti all'inizio del nuovo turno
function enableTurnButtons() {
  const buttons = ["offer-draw", "undo-move", "save-game"];
  buttons.forEach(buttonId => {
      if (!disabledButtons.has(buttonId)) {
          document.getElementById(buttonId).disabled = false;
      }
  });
}

// Funzione per disabilitare un pulsante specifico
function disableButton(buttonId) {
  disabledButtons.add(buttonId);
  document.getElementById(buttonId).disabled = true;
  console.log("Disabled Buttons:", disabledButtons)
}

// Funzione per verificare se ci sono mosse nella cronologia
function hasMoves() {
  const movesTable = document.getElementById("moves-table").getElementsByTagName("tbody")[0];
  return movesTable.rows.length > 0;
}

// Funzione per aggiornare lo stato dei pulsanti in caso di ritiro mossa multiplo
function updateButtonStates() {
  const hasMoveHistory = hasMoves();
  //const initialPosition = isInitialPosition();
  if (hasMoveHistory === false) {
      disabledButtons.add("undo-move");
      disabledButtons.add("save-game");
      document.getElementById("undo-move").disabled = true;
      document.getElementById("save-game").disabled = true;
  } else return;
}

//Funzione per gestire Modale Promozione
function showPromotionModal(playerColor, isPushPromotion) {
  return new Promise((resolve) => {
    // Mostra la modale
    const modal = document.getElementById('promotionModal');
    modal.style.display = 'block';

    // Nascondi tutte le opzioni
    document.getElementById('black-options').style.display = 'none';
    document.getElementById('white-options').style.display = 'none';

    // Mostra solo le opzioni pertinenti
    let optionsSelector;
    if (playerColor === 'w') {
      optionsSelector = '#white-options';
    } else {
      optionsSelector = '#black-options';
    }
    
    const optionsContainer = document.querySelector(optionsSelector);
    optionsContainer.style.display = 'block';

    // Nascondi la regina se è una promozione tramite spinta
    if (isPushPromotion) {
      optionsContainer.querySelector('[data-piece="q"]').style.display = 'none';
    } else {
      optionsContainer.querySelector('[data-piece="q"]').style.display = 'inline';
    }

    // Gestione della scelta del pezzo
    let chosenPiece = "";
    optionsContainer.querySelectorAll('.promotion-piece').forEach(piece => {
      piece.onclick = () => {
        chosenPiece = piece.getAttribute('data-piece');
        console.log("Chosen Piece:", chosenPiece);    
        modal.style.display = 'none';
        resolve(chosenPiece); // Risolve la promise con il pezzo scelto
      };
    });
  });
}

//boardWrapperElement.style.display = 'block';
boardElement.style.display = 'block';
//roomStatusWrapperElement.style.display = 'none';
boardElement.style.width = '100%';
boardElement.style.height = '100%';

const exposeBoard = () => {

    boardWrapperElement.style.display = 'block';
    boardElement.style.display = 'block';
    roomStatusWrapperElement.style.display = 'none';
    boardElement.style.width = '100%';
    boardElement.style.height = '100%';

}

const getNormalizedInRange = (value, min, max) => {

    return (value - min) / (max - min);

}
