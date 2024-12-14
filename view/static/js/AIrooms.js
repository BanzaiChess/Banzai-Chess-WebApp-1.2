let board = null
//var board,
  const  game = new Chess();

/*The "AI" part starts here */

var minimaxRoot = async function(depth, game, isMaximisingPlayer) {
    //console.log("Starting minimaxRoot with depth:", depth);
    var newGameMoves = game.moves();
    var bestMove = -9999;
    var bestMoveFound;
    //console.log("All possible moves: ", newGameMoves); // Check generated moves

    for(var i = 0; i < newGameMoves.length; i++) {
        var newGameMove = newGameMoves[i]
        game.move(newGameMove);
        //console.log("Move applied: ", newGameMove, "Current FEN: ", game.fen()); // Check applied move
        var value = await minimax(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
        game.undo();
        //console.log("Undo move, current FEN: ", game.fen()); // Check undo functionality
        if(value >= bestMove) {
            bestMove = value;
            bestMoveFound = newGameMove;
        }
    }
    //console.log("Minimax root Best move found:", bestMoveFound);
    return bestMoveFound;
};

var minimax = async function (depth, game, alpha, beta, isMaximisingPlayer) {
    positionCount++;
    if (depth === 0) {
        return -evaluateBoard(game.board());
    }

    var newGameMoves = game.moves();

    if (isMaximisingPlayer) {
        var bestMove = -9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.move(newGameMoves[i]);
            bestMove = Math.max(bestMove, await minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
            game.undo();
            alpha = Math.max(alpha, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        //console.log("Minimax Best move found:", bestMove);
        return bestMove;
    } else {
        var bestMove = 9999;
        for (var i = 0; i < newGameMoves.length; i++) {
            game.move(newGameMoves[i]);
            bestMove = Math.min(bestMove, await minimax(depth - 1, game, alpha, beta, !isMaximisingPlayer));
            game.undo();
            beta = Math.min(beta, bestMove);
            if (beta <= alpha) {
                return bestMove;
            }
        }
        //console.log("Minimax Best move found:", bestMove);
        return bestMove;
    }
};

var evaluateBoard = function (board) {
    var totalEvaluation = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i ,j);
        }
    }
    return totalEvaluation;
};

var reverseArray = function(array) {
    return array.slice().reverse();
};

var pawnEvalWhite =
    [
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
        [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
        [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
        [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
        [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
        [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
        [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
        [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ];

var pawnEvalBlack = reverseArray(pawnEvalWhite);

var knightEval =
    [
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
        [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
        [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
        [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
        [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
        [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
        [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
        [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
    ];

var bishopEvalWhite = [
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
    [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
    [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
    [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
    [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
    [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

var bishopEvalBlack = reverseArray(bishopEvalWhite);

var rookEvalWhite = [
    [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
    [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
    [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

var rookEvalBlack = reverseArray(rookEvalWhite);

var evalQueen = [
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
    [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
    [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
    [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
    [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

var kingEvalWhite = [

    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
    [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
    [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
    [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
    [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];

var kingEvalBlack = reverseArray(kingEvalWhite);

var getPieceValue = function (piece, x, y) {
    if (piece === null) {
        return 0;
    }
    var getAbsoluteValue = function (piece, isWhite, x ,y) {
        if (piece.type === 'p') {
            return 10 + ( isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x] );
        } else if (piece.type === 'r') {
            return 50 + ( isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x] );
        } else if (piece.type === 'n') {
            return 30 + knightEval[y][x];
        } else if (piece.type === 'b') {
            return 30 + ( isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x] );
        } else if (piece.type === 'q') {
            return 90 + evalQueen[y][x];
        } else if (piece.type === 'k') {
            return 900 + ( isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x] );
        }
        throw "Unknown piece type: " + piece.type;
    };

    var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x ,y);
    return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

var makeBestMove =  async function () {
    
    var bestMove = await getBestMove(game);
    console.log( "final move =", bestMove);
    game.move(`${bestMove}`);
    board.position(game.fen());
    updateMoveHistory(bestMove);
    //switchTurn();
    update();
    socket.emit("AImove", { move: bestMove, board: game.fen(), room: gameId, movesHistory: game._history});
};

var positionCount;
var getBestMove =  async function (game) {

    positionCount = 0;
    var depth = parseInt($('#search-depth').find(':selected').text());
    // Memorizza il tempo di inizio per l'IA
    var startTime = new Date().getTime();
    // Avvia il timer dell'IA
    //startClock(currentPlayer);

    var d = new Date().getTime();
    var bestMove = await minimaxRoot(depth, game, true);

    // Ferma il timer dell'IA dopo aver calcolato la mossa
    //stopClock(currentPlayer); // Ferma l'aggiornamento continuo del timer
    // Memorizza il tempo di fine per l'IA
    var endTime = new Date().getTime();
    // Calcola il tempo impiegato e aggiorna il tempo residuo dell'IA
    var moveTime = endTime - startTime;

    //if (currentPlayer === 'black') {
      //blackTimeLeft -= moveTime; // Sottrai il tempo impiegato dal tempo rimanente per il nero
      //updateTime('black', blackTimeLeft); // Aggiorna l'interfaccia con il nuovo tempo
    //} else {
      //whiteTimeLeft -= moveTime; // Sottrai il tempo impiegato dal tempo rimanente per il bianco
      //updateTime('white', whiteTimeLeft); // Aggiorna l'interfaccia con il nuovo tempo
  //}

    //blackTimeLeft -= moveTime; // Sottrai il tempo impiegato dal tempo rimanente
    //updateTime('black', blackTimeLeft); // Aggiorna l'interfaccia con il nuovo tempo

    var d2 = new Date().getTime();
    var moveTime = (d2 - d);
    var positionsPerS = ( positionCount * 1000 / moveTime);

    $('#position-count').text(positionCount);
    $('#time').text(moveTime/1000 + 's');
    $('#positions-per-s').text(positionsPerS);
    return bestMove;
};

// ==== Chessboard  ==== //

function onDragStart(source, piece, position, orientation) {
    //console.log(`onDragStart called with piece ${piece} at ${source}`);
    
    // do not pick up pieces if the game is over
    if (game.isGameOver()) return false;

    // only pick up pieces for the side to move
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
    const playerColor = game.turn(); // Ottieni il colore del giocatore corrente
    removeGreySquares();
    if (isPromotion) {
        //console.log("PROMOTION?", isPromotion); 

        // Rilascio del pedone prima di aprire la modale
        setTimeout(async () => {
            try {
                const promotionpiece = await showPromotionModal(playerColor, false); // Aspetta la scelta dell'utente
                if (promotionpiece) {
                    const move = game.move({ from: source, to: target, promotion: promotionpiece });
                    socket.emit("move", { move: move, sanMove: move.san, board: game.fen(), room: gameId, AI: true, movesHistory: game._history });
                    board.position(game.fen());
                    updateMoveHistory(move.san);
                    //switchTurn();
                    //update()
                }
            } catch (error) {
                console.error("Promotion error:", error);
                return "snapback";
            }
        }, 0);

    } else if (isPushPromotion) {
        //console.log("PUSH PROMOTION?", isPushPromotion); 

        // Rilascio del pedone prima di aprire la modale
        setTimeout(async () => {
            try {
                const subpromotionpiece = await showPromotionModal(playerColor, true); // Aspetta la scelta dell'utente, escludendo la regina
                if (subpromotionpiece) {
                    const move = game.move({ from: source, to: target, subpromotion: subpromotionpiece });
                    socket.emit("move", { move: move, sanMove: move.san, board: game.fen(), room: gameId, AI: true, movesHistory: game._history });
                    board.position(game.fen());
                    updateMoveHistory(move.san);
                    //switchTurn();
                    //update()
                }
            } catch (error) {
                console.error("Push Promotion error:", error);
                return "snapback";
            }
        }, 0);
    } else {
        try {
            //console.log("NOT A PROMOTION MOVE");
             // Verifica se la mossa è legale
            const move = game.move({ from: source, to: target });
            socket.emit("move", { move: move, sanMove: move.san, board: game.fen(), room: gameId, AI: true, movesHistory: game._history });
            //board.position(game.fen());
            updateMoveHistory(move.san);
            //switchTurn();
            //update()
        } catch (error) {
            console.error("Invalid Move:", error);
            return "snapback";
        }
    //} if (game.turn() === 'b') {
        //window.setTimeout(makeBestMove, 200);
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
     const undoMoveButton = document.getElementById('UndoMove');
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
};

// Funzione per cancellare lo storico delle mosse
function clearMoveHistory() {
  const movesTable = document.getElementById("moves-table").getElementsByTagName("tbody")[0];
  while (movesTable.rows.length > 0) {
      movesTable.deleteRow(0);
  }
  updateButtonStates(); // Aggiorna lo stato dei pulsanti
}

function onSnapEnd() {
    board.position(game.fen());
    
}

var onMouseoverSquare = function(square, piece) {
    var moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0) return;

    greySquare(square);

    for (var i = 0; i < moves.length; i++) {
        greySquare(moves[i].to);
    }
};

var onMouseoutSquare = function(square, piece) {
    removeGreySquares();
};

var removeGreySquares = function() {
    $('#board .square-55d63').css('background', '');
};

var greySquare = function(square) {
    var squareEl = $('#board .square-' + square);

    var background = '#a9a9b9';
    if (squareEl.hasClass('black-3c85d') === true) {
        background = '#696969';
    }

    squareEl.css('background', background);
};

function update() {
    var status = '';
    var moveColor = 'White';
    if (game.turn() === 'b') {
        moveColor = 'Black';
    }

    // checkmate?
    if (game.isCheckmate()) {
      socket.emit('game-is-over', { gameId });
        status = 'Game over, ' + moveColor + ' is in checkmate.';
        gameInfo = status;
    }

    // draw?
    else if (game.isDraw()) {
      socket.emit('game-is-over', { gameId });
        status = 'Game over, drawn position';
        gameInfo = status;
    }

    // game still on
    else {
        status = moveColor + ' turn';

        // check?
        if (game.inCheck()) {
            status += ', ' + moveColor + ' is in check';
        }
    }
    document.getElementById('status').innerHTML = status;

}

var config = {
    
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};
board = Chessboard('board', config);
update();

// ==== Socket.IO ==== //

const socket = io();

// some global variables
let color = "white";
let play = true;
let players;
let playerID;
let playerColor;
let currentFEN = '';
let timeSettings;
let serverSettings = null;
let disabledButtons = new Set();
let whitePlayerKey, blackPlayerKey; // Per connessioni biunivoche
let gameInfo;
// Estrai i parametri dalla URL
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get("gameId");
const playerKey = urlParams.get("key1");

//console.log("Attempting to join room:", gameId);
//console.log("Player key:", playerKey); // Aggiungi questo log per vedere la key inviata dal client

if (gameId && playerKey) {
  document.getElementById("status").innerText = `Connecting to room ${gameId}...`;

  // Invia la richiesta di unirsi alla stanza
  socket.emit("join", { gameId, playerKey });

  // Ascolta gli eventi dal server
  socket.on("player", (msg) => {
    console.log("Received player assignment:", msg);
    const { playerSocket, colors, gameId, timeSettings: receivedTimeSettings, position, isAI, aiLevel } = msg;
    //timeSettings = receivedTimeSettings;
    //maxTime = timeSettings.totalTime;
    initialPosition = position;
    playerColor = colors;
    savedDepth = aiLevel;

    if (playerSocket !== undefined) {
      playerID = playerSocket;
    } else {
      playerID = playerColor === "white" ? msg.white : msg.black;
    };

    const searchDepthSelect = document.getElementById("search-depth");
    searchDepthSelect.value = savedDepth;

    //if (maxTime === 0) {
    document.getElementById("white-timer").style.display = "none";
    document.getElementById("black-timer").style.display = "none";
    document.getElementById("timers").style.display = "none"; 
    //}

    if (initialPosition === "start") { //per caricare la nuova fen su chess.js 
      console.log("Regular Starting Position")
    } else game.load(initialPosition, { skipValidation: true, preserveHeaders: false })

    //if (maxTime > 0) {
      //initializeTimer(timeSettings);
    //}

    if (msg.reconnection === true) {
      console.log('Player with', playerColor, 'is reconnecting');
      game._history = msg.movesHistory; 
      //console.log("Game State recovered is: ", game);    
    } 

    if (msg.gameOver === true) {
      console.log('Player with', playerColor, 'is trying to access a finished game');
      board.orientation(playerColor);
      board.position(initialPosition);
      document.getElementById("status").innerHTML = msg.result;
      // Disabilita il movimento delle pedine
      board.draggable = false;
      play = true;
      // Disabilita i pulsanti , resign, takeback
      document.getElementById("Restart").disabled = true;
      document.getElementById("Resign").disabled = true;
      document.getElementById("UndoMove").disabled = true;
      document.getElementById("save-game").disabled = false;
      return;
          
    } 
    
    board.orientation(color);
    board.position(initialPosition);   
    update();  
  });

  socket.on("spectator", (msg) => {
    const { gameId, isSpectator } = msg;
    if (maxTime === 0) {
      document.getElementById("white-timer").style.display = "none";
      document.getElementById("black-timer").style.display = "none";
      document.getElementById("timers").style.display = "none"; 
    }

    if (maxTime > 0) {
      initializeTimer(timeSettings);
    }
    if (isSpectator) {
      console.log(`Connected as spectator to game ${gameId}`);
      // Disabilita i controlli per gli spettatori
      document.getElementById("right-buttons").style.display = "none";
      document.getElementById("engine-level").hidden = true;
      document.getElementById("Srotate").hidden = false;
    }
  });

  //socket.on("move", (msg) => {
    //console.log("Received AI move:", msg);
    //if (msg.room === gameId) { 
      //update();
      //switchTurn();
    //}
  //});

  socket.on("AItomove", (msg) => {
    //console.log("Received Human move:", msg);
    if (msg.room === gameId) {
      window.setTimeout(makeBestMove, 200);
      //switchTurn();
    }
  });

  socket.on("error", (msg) => {
    //state.innerText = msg;
  });

  socket.on("player-exit", (msg) => {
    console.log("Player exited:", msg);
    if (msg.room === gameId) {
      document.getElementById(
        "status"
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
  document.getElementById("status").innerText = "No room ID provided.";
}

socket.on("play", (msg) => {
  if (msg == gameId) {
    play = false;
    update();
    console.log("Play event received. Game started!");
    document.getElementById("Resign").disabled = false;
    //startClock(currentPlayer); // Avvia il timer quando inizia la partita
  }
});

socket.on("rotate-board", (msg) => {
  console.log("ROTATING THIS BOARD");

  color = msg.color;

  players = msg.players;

  playerId = msg.playerId;

  board.orientation(color);
  update();
});

socket.on("updateMoves", (msg) => {
  const { movesHistory, playerSocket } = msg;

  // Controlla se l'aggiornamento è destinato a questo giocatore
  if (playerID === playerSocket || msg.gameOver) {
    //console.log("Updating moves table for player:", playerID);
    recallMoveHistory(movesHistory);
  } else {
    console.log("Ignoring update for player:", playerSocket);
  }
});

socket.on("AIstart", (msg) => {
  //console.log("AIstart event received:", msg);  // Log di debug
  const playercolor = msg;
  
  if (game.turn() === 'w' && playercolor=== "black") {
    //console.log("Ai first to move");
    window.setTimeout(makeBestMove, 200);
    //switchTurn();
  } else if (game.turn() === 'b' && playercolor=== "white") {
    //console.log("Ai first to move");
    window.setTimeout(makeBestMove, 200);
    //switchTurn();
  } 
});

// Aggiorna il turno
socket.on("NewTurn", (msg) => {
  //console.log("NEW TURN");
  
  // Nuovo turno, riabilita i pulsanti
  disabledButtons.clear();
  enableTurnButtons();
  updateButtonStates(); // Aggiorna lo stato dei pulsanti
  //console.log("Disabled Buttons:", disabledButtons);
  
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
  //console.log("Resigning:", msg);
  // Aggiorna lo stato della partita
  const losingPlayer = playerColor.charAt(0).toUpperCase() + playerColor.slice(1);
  const winningPlayer = playerColor === 'white' ? 'Black' : 'White';
  document.getElementById("status").innerText = `${losingPlayer} resigned. ${winningPlayer} won.`;
  gameInfo = document.getElementById("status").innerText;
});

// Gestione Status per Time Over 
socket.on('time-over', (data) => {
  const { player, gameId } = data;
  console.log("Time Over");
  // Aggiorna lo stato della partita per entrambi i giocatori
  document.getElementById("room-join-state").innerText = `${player.charAt(0).toUpperCase() + player.slice(1)}'s time is over - ${player === 'white' ? 'black' : 'white'} wins`;
  gameInfo = document.getElementById("status").innerText;
});

// ==== Gestione della Fine della Partita ==== //
socket.on("game-over", (msg) => {
  const { gameId } = msg;
  console.log("Game Over for room:", gameId);
  //stopClock(currentPlayer); // Ferma il timer
  gameInfo = document.getElementById("status").innerText;
  //console.log("Game Status after Game Over:", gameInfo);
  socket.emit("finalGameState", gameId, gameInfo);

  // Disabilita il movimento delle pedine
  board.draggable = false;
  play = true;

  // Disabilita i pulsanti draw, resign, takeback
  document.getElementById("Resign").disabled = true;
  document.getElementById("UndoMove").disabled = true;
  //document.getElementById("Restart").disabled = false
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
      socket.emit("resign", { gameId, playerKey, playerColor: color });
      board.draggable = false;   
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

// Funzione per Ritirare Mossa
function undoMove() {
  game.undo();
  game.undo();              
  board.position(game.fen());
  removeLastMoveFromHistory;
  removeLastMoveFromHistory;
  //switchBackTurn(); 
  socket.emit("undo-move", { gameId, playerKey, playerColor, board: game.fen(), AI: true });
  update();
}

function restart() {
  board.position('start');
  game.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  clearMoveHistory();
  update();
  socket.emit("restart", { gameId, playerKey, board: game.fen(), AI: true });
}

// Funzione per abilitare i pulsanti all'inizio del nuovo turno
function enableTurnButtons() {
  const buttons = [ "UndoMove", "save-game"];
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
      disabledButtons.add("UndoMove");
      disabledButtons.add("save-game");
      document.getElementById("UndoMove").disabled = true;
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
