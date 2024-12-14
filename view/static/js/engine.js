var board,
    game = new Chess();

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
    updateStatus();
};

var positionCount;
var getBestMove =  async function (game) {

    positionCount = 0;
    var depth = parseInt($('#search-depth').find(':selected').text());

    var d = new Date().getTime();
    var bestMove = await minimaxRoot(depth, game, true);
    var d2 = new Date().getTime();
    var moveTime = (d2 - d);
    var positionsPerS = ( positionCount * 1000 / moveTime);

    $('#position-count').text(positionCount);
    $('#time').text(moveTime/1000 + 's');
    $('#positions-per-s').text(positionsPerS);
    return bestMove;
};

// Chessboard stuff

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
                    board.position(game.fen());
                    updateMoveHistory(move.san);
                    updateStatus()
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
                    board.position(game.fen());
                    updateMoveHistory(move.san);
                    updateStatus()
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
            //board.position(game.fen());
            updateMoveHistory(move.san);
            updateStatus()
        } catch (error) {
            console.error("Invalid Move:", error);
            return "snapback";
        }
    //} if (game.turn() === 'b') {
        window.setTimeout(makeBestMove, 200);
    }
};

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
     //const undoMoveButton = document.getElementById('undo-move');
     const saveGameButton = document.getElementById('save-game');
     if (movesTable.rows.length === 0) {
         // Nessuna mossa nello storico
         //undoMoveButton.disabled = true;
         saveGameButton.disabled = true;
     } else {
         // Almeno una mossa nello storico
         //undoMoveButton.disabled = false;
         saveGameButton.disabled = false;
     }
};

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

function updateStatus() {
    var status = '';
    var moveColor = 'White';
    if (game.turn() === 'b') {
        moveColor = 'Black';
    }

    // checkmate?
    if (game.isCheckmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
    }

    // draw?
    else if (game.isDraw()) {
        status = 'Game over, drawn position';
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
updateStatus();

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