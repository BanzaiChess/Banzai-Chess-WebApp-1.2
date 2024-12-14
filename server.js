const express = require("express");
const app = express();

const path = require("path");
const http = require("http");

const server = http.createServer(app);
const { Server } = require("socket.io");

const roomApi = require("./roomApi.js");
const config = require("./config.json");

const timer = require('./room/TimeManager.js'); 

const { createNewGame, getGameData } = require("./room/RoomService.js"); // Importa le funzioni necessarie

const GameManager = require("./game/GameManager.js");
const gameManager = new GameManager(config.games || 128);

app.use(express.static(path.join(__dirname + "/view")));

// monta la roomApi nel server
app.use("/", roomApi);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/view/index.html");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/view/index.html");
});

app.get("/init", (req, res) => {
  res.json({ games: gameManager.games.length });
});

app.get("/room-status", (req, res) => {
  res.json(gameManager.getGamesStatus());
});

const io = new Server(server, {
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    //maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  }
});

let games = {}; // Memorizza i dati dei giochi
const gameTimers = {}; // Oggetto per tenere traccia dei timer per ciascun gameId

io.on("connection", (socket) => {

  //console.log(`New connection: ${socket.id}`);

  socket.on("watch", ({ gameId, spectatorKey }) => {

    socket.join(gameId);
    console.log(`Spectator ${spectatorKey} has joined room ${gameId}`);

    if (games[gameId].gameOver === true) {
      io.in(gameId).emit("spectator", {
        gameId,
        isSpectator: true,
        specatatorSocket: socket.id,
        game: games[gameId],
      });
      return
    }

    let totTime = games[gameId].timeSettings.totalTime;
    let timer = gameTimers[gameId];

    games[gameId] = {
      ...games[gameId],
      timeSettings: {
        ...games[gameId].timeSettings,
        whiteTime: totTime !== 0 ? timer.getWhiteTime() : null,
        blackTime: totTime !== 0 ? timer.getBlackTime() : null
      },
    };

    io.in(gameId).emit("spectator", {
      gameId,
      isSpectator: true,
      specatatorSocket: socket.id,
      game: games[gameId],
    });
  });

  socket.on("join", ({ gameId, playerKey }) => {
    //console.log(`Player with key ${playerKey} attempting to join room: ${gameId}`);

    try {
      const game = getGameData(gameId, playerKey);
      const players = game.players;
      var color = game.colors;
      const timeSettings = game.timeSettings;
      //timer.initializeTimer(timeSettings);
      const position = game.position
      const playerIndex = players.indexOf(playerKey);
      //console.log("PLAYER INDEX IS: ", playerIndex);
      playerColor = color[playerIndex];
      const AI = game.isAI;
      const Depth = game.aiLevel;
      //console.log("These are the game stats for this game: ", gameStats);
      // Controlla il numero di socket nella stanza
      const socketsInRoom = io.sockets.adapter.rooms.get(gameId);
      const numClients = socketsInRoom ? socketsInRoom.size : 0;
      //console.log(`Number of clients in room ${gameId}: ${numClients}`);
      //const JointClient = io.sockets.adapter.rooms.get(gameId).size;

      if (!game || !game.players) {
        throw new Error(`Invalid game data for gameId: ${gameId}`);
      }
      if (playerIndex === -1) {
        throw new Error(`Player key ${playerKey} not found in game ${gameId}`);
      }

      //se la partita è gia iniziata, allora si tratta di una RICONNESSIONE
      if (games[gameId] && (games[gameId].white !== null && games[gameId].black !== null) && AI !== true) {
        console.log("NON SI TRATTA DI JOIN MA RECONNECT");

        //Se la partita però è già finita ritorna, non è necessario riconnettersi
        if (games[gameId].gameOver) {
          io.to(socket.id).emit("player", (games[gameId]));
          io.to(socket.id).emit("updateMoves", {
            movesHistory: games[gameId].movesRecord,
            playerSocket: socket.id, // Specifica a chi è destinato
            gameOver: true
          });
          console.log("La partita è terminata");
          return
        }
      
        if (playerColor === 'white') {
          games[gameId].white = socket.id;
        } else if (playerColor === 'black') {
          games[gameId].black = socket.id;
        };
        games[gameId] = { //Aggiorna i dati della partita in questione inizializzandone gli specifici valori di partenza
          ...games[gameId],
          //timeSettings: {
            //...games[gameId].timeSettings,
            //whiteTime: timer.getWhiteTime(),
            //blackTime: timer.getBlackTime()
            //},
          reconnection: true
        }

        if (playerColor === 'black') { //se siamo il nero ruota la scacchiera
          socket.emit("rotate-board", {
            playerId: playerKey,
            players: playerIndex,
            color: playerColor,
            gameId,
          });
        } 
        // Salva l'ID del gioco nei dati del socket
        //socket.data.gameId = gameId;
        socket.join(gameId);
        
        io.to(socket.id).emit("player", (games[gameId]));

        io.in(gameId).fetchSockets().then((sockets) => {
          //console.log(`Sockets in room ${gameId}:`, sockets.map(s => s.id));
        });

        io.to(socket.id).emit("updateMoves", {
          movesHistory: games[gameId].movesRecord,
          playerSocket: socket.id, // Specifica a chi è destinato
        });

        io.to(socket.id).emit("play", {gameId, WhitePlayerSocket: games[gameId].white, BlackPlayerSocket: games[gameId].black, reconnection: true});
        //console.log("The actual game info are: ", game);
      
        return;

      //riconnessione contro AI
      } else if (AI === true && games[gameId] && (games[gameId].white !== null || games[gameId].black !== null)) {      
          console.log("NON SI TRATTA DI JOIN MA RECONNECT");

          //Se la partita però è già finita ritorna, non è necessario riconnettersi
          if (games[gameId].gameOver) {
            io.to(socket.id).emit("player", (games[gameId]));
            io.to(socket.id).emit("updateMoves", {
              movesHistory: games[gameId].movesRecord,
              playerSocket: socket.id, // Specifica a chi è destinato
              gameOver: true
            });
            console.log("La partita è terminata");
            return
          }

          //console.log("pLAYER COLOR IS: ", playerColor);

          if (playerColor === 'white') {
            games[gameId].white = socket.id;
          } else if (playerColor === 'black') {
            games[gameId].black = socket.id;
          };

          if (playerColor === 'black') { //se siamo il nero ruota la scacchiera
            socket.emit("rotate-board", {
              playerId: playerKey,
              players: playerIndex,
              color: playerColor,
              gameId,
            });
          }

          //Aggiorna i dati della partita in questione inizializzandone gli specifici valori di partenza
          games[gameId] = { 
            ...games[gameId],
            reconnection: true
          }


          // Salva l'ID del gioco nei dati del socket
          //socket.data.gameId = gameId;
          socket.join(gameId);
          io.to(socket.id).emit("player", (games[gameId]));
          io.to(socket.id).emit("updateMoves", {
            movesHistory: games[gameId].movesRecord,
            playerSocket: socket.id, // Specifica a chi è destinato
          });
          return;
      }

      // Salva l'ID del gioco nei dati del socket
      socket.data.gameId = gameId;
      socket.join(gameId)
      console.log(`socket ${socket.id} has joined room ${gameId}`);
      //timer.initializeTimer(timeSettings);

      // Inizializza il gioco se non esiste ancora nell'oggetto 'games'
      if (!games[gameId]) {
        games[gameId] = { white: null, black: null };
      }      
      if (playerColor === 'black') { //se siamo il nero ruota la scacchiera
        socket.emit("rotate-board", {
          playerId: playerKey,
          players: playerIndex,
          color: playerColor,
          gameId,
        });
      }       
      // Gestisci Giocatori e IA
      if (AI == true) { //Partita contro computer
        if (numClients <= 1) {
          // Assegna il socket ID al giocatore corretto
          const playerColor = game.colors[playerIndex];
          if (playerColor === 'white') {
            games[gameId].white = socket.id;
          } else if (playerColor === 'black') {
            games[gameId].black = socket.id;
          }    
          //console.log(`Game ${gameId} state:`, games[gameId]);
          //console.log("Partita contro AI")
          games[gameId] = { //Aggiorna i dati della partita in questione inizializzandone gli specifici valori di partenza
            ...games[gameId], // Mantieni eventuali dati esistenti
            gameId: gameId, // Inserisci l'ID della partita
            players: players,
            //spectatorKey: spectatorKey,
            colors: playerColor,
            //timeSettings: timeSettings,
            movesHistory: [], // Inizializza la cronologia mosse come array vuoto
            position: position, // Imposta la posizione iniziale
            movesRecord: [],
            isAI: true,
            aiLevel: Depth
          };
          // Inizializza il gioco con l'IA
          socket.emit("player", {
            playerId: playerKey,
            playerColor: playerColor,
            timeSettings: game.timeSettings,
            position: game.position,
            gameId,
            playerSocket: socket.id,
            isAI: true,
            aiLevel: Depth,
          });
          // Inizia la partita
          io.in(gameId).emit("play", {gameId, WhitePlayerSocket: games[gameId].white, BlackPlayerSocket: games[gameId].black});
          io.in(gameId).emit("AIstart", playerColor);

        } else {
          socket.emit("spectator", {
            gameId,
            isSpectator: true,
            specatatorSocket: socket.id,
          });
        }    
      } else { //Partita tra persone

        if (numClients <= 2) {
          // Assegna il socket ID al giocatore corretto
          const playerColor = game.colors[playerIndex];
          if (playerColor === 'white') {
            games[gameId].white = socket.id;
          } else if (playerColor === 'black') {
            games[gameId].black = socket.id;
          };

          games[gameId] = { //Aggiorna i dati della partita in questione inizializzandone gli specifici valori di partenza
            ...games[gameId], // Mantieni eventuali dati esistenti
            gameId: gameId, // Inserisci l'ID della partita
            players: players,
            //spectatorKey: spectatorKey,
            colors: color,
            timeSettings: timeSettings,
            movesHistory: [], // Inizializza la cronologia mosse come array vuoto
            position: position, // Imposta la posizione iniziale
            movesRecord: []
          };
          //console.log("These are the game stats for this game: ", games);
                 
          socket.emit("player", {
            playerKey: playerKey,
            players: playerIndex,
            colors: color,
            timeSettings: timeSettings,
            position: position,
            gameId,
            playerSocket: socket.id,
            reconnection: false,
            gameOver: false
          });

        } else {
          // Gestisci come spettatore
          //games[gameId].spectators.push(socket.id);
          socket.emit("spectator", {
            gameId,
            isSpectator: true,
            specatatorSocket: socket.id,
          });
        }
        //Controlla se entrambi i giocatori sono nella stanza
        const sockets = io.sockets.adapter.rooms.get(gameId);
        if (sockets && sockets.size === 2) {
          // Controlla se il giocatore è già connesso
          const game = games[gameId];
          if (game && game.whiteSocketId && game.blackSocketId) {
             // Non emettere "play" se i giocatori sono già connessi
            return;
          }
            io.in(gameId).emit("play", {gameId, WhitePlayerSocket: games[gameId].white, BlackPlayerSocket: games[gameId].black});
            console.log("Both players have joined the room"); 

        }
      }
    } catch (error) {
      console.log(`Error joining room: ${error.message}`);
      //io.in(gameId).emit("error", error.message);
      if (playerKey===undefined) {
        socket.emit("spectator", {
          gameId,
          isSpectator: true,
          specatatorSocket: socket.id,
        });
      }
      socket.emit("error", error.message);
    }    
  });

  socket.on('start-clock', (gameId, turnPlayer) => {

    if (games[gameId].timeSettings.totalTime === 0) {
      return;
    }
    // Crea un timer per questa partita se non esiste
    if (!gameTimers[gameId] && games[gameId].timeSettings.totalTime !== 0) {
        //console.log(`Inizializzazione timer per partita ${gameId}`);
        const gameTimer = new timer(); // Crea un'istanza di timeManager
        gameTimer.initializeTimer(games[gameId].timeSettings); // Inizializza con le impostazioni di tempo
        gameTimers[gameId] = gameTimer;
        gameTimer.startClock(turnPlayer);
        
    }
    const gameTimer = gameTimers[gameId];
    // Aggiorna periodicamente i tempi ai giocatori
    const checkTime = setInterval(() => {
        const whiteTime = gameTimer.getWhiteTime();
        const blackTime = gameTimer.getBlackTime();

        if (whiteTime <= 0 || blackTime <= 0) {
            clearInterval(checkTime); // Ferma l'aggiornamento
            const player = whiteTime <= 0 ? "white" : "black";
            //const winner = loser === 'white' ? 'black' : 'white';
            games[gameId] = {
              ...games[gameId],
              timeSettings: {
                ...games[gameId].timeSettings,
                whiteTime: whiteTime <= 0 ? 0 : whiteTime,
                blackTime: blackTime <= 0 ? 0 : blackTime
              },
            }

            io.in(gameId).emit('time-over', { player, gameId });
            io.in(gameId).emit('game-over', { gameId });

            // Rimuovi il timer dalla mappa
            delete gameTimers[gameId];
        } else {
            // Invia l'aggiornamento ai giocatori
            io.in(gameId).emit('time-update', { whiteTime, blackTime });
        }
    }, 100);
  });
  
  // recieved when a player makes a move ALSO updates some properties of the
  //games object with the gameID specified. (moves history, position, time left) 
  socket.on("move", (msg) => {
    const AI = msg.AI;
    const move = msg.move;
    let moveInSan= msg.sanMove;
    let currentRoom = msg.room;
    let currentFEN = msg.board;
    let playerColor = msg.playerColor;
    let movesH = msg.movesHistory
    //console.log("Moves history from client: ", movesH);

    // Gestione mosse IA e umane
    if (AI === true) { //partite col computer

      //whiteTimeLeft = msg.timeStamps.whiteTime;
      //blackTimeLeft = msg.timeStamps.blackTime;
      games[currentRoom].movesRecord.push(moveInSan);
      console.log("Game Object Stat before changes: ", games);
      games[currentRoom] = {
        ...games[currentRoom],
        //timeSettings: {
        //...games[currentRoom].timeSettings,
        //whiteTime: whiteTimeLeft,
        //blackTime: blackTimeLeft
        //},
        movesHistory: movesH,
        position: currentFEN,
        reconnection: false, 
      };
      console.log("Game Object Stat after changes: ", games);
      //console.log("mossa ricevuta: ", msg);
      //io.in(currentRoom).emit("move", msg);
      io.in(currentRoom).emit("AItomove", msg);
      io.in(currentRoom).emit("NewTurn", msg);
      io.in(currentRoom).emit("NewFen", currentFEN);
      io.in(currentRoom).emit("Update-Status", msg);
    } else { // partita tra persone
      //SALVO TUTTI I DATI NELL'OGGETTO games[gameId] -- 
      //ricorda il tempo che salvi non è quello della RICONNESSIONE -- quello va calcolato
      let timer = gameTimers[currentRoom];
      let totTime = games[currentRoom].timeSettings.totalTime;
      //whiteTimeLeft = msg.timeStamps.whiteTime;
      //blackTimeLeft = msg.timeStamps.blackTime;
      games[currentRoom].movesRecord.push(moveInSan);
      //console.log("Game Object Stat before changes: ", games);
      games[currentRoom] = {
        ...games[currentRoom],
        timeSettings: {
        ...games[currentRoom].timeSettings,
        whiteTime: totTime !== 0 ? timer.getWhiteTime() : null,
        blackTime: totTime !== 0 ? timer.getBlackTime() : null
        },
        movesHistory: movesH,
        position: currentFEN,
        reconnection: false, 
      };
      //console.log("Game Object Stat after changes: ", games);
      //console.log("mossa ricevuta: ", msg);
      //io.in(currentRoom).sockets.broadcast.emit("move", msg);
      if (totTime !== 0) {
        timer.switchTurn(playerColor);
      }
      
      socket.broadcast.emit("move", msg);
      socket.broadcast.emit("newmove", msg);
 
      io.in(currentRoom).emit("NewTurn", msg);
      io.in(currentRoom).emit("NewFen", currentFEN);
      io.in(currentRoom).emit("Update-Status", msg);
    
    }
  });

  // recieved when the AI makes a move
  socket.on("AImove", (msg) => {
    let move= msg.move;
    let movesH = msg.movesHistory
    currentRoom = msg.room;
    currentFEN = msg.board;
    games[currentRoom].movesRecord.push(move);

    console.log("Actual REcord: ", games[currentRoom].movesRecord );
    games[currentRoom] = {
      ...games[currentRoom],
      
      movesHistory: movesH,
      position: currentFEN,
      reconnection: false, 
    };
    console.log("GAME OBJECT AFTER AI MOVE: ", games[currentRoom] );
    //console.log("mossa ricevuta: ", msg);
    //io.in(currentRoom).emit("move", msg);
    io.in(currentRoom).emit("NewTurn", msg);
    io.in(currentRoom).emit("NewFen", currentFEN);
    io.in(currentRoom).emit("Update-Status", msg);
    
  });

  // recieved when the game is over
  socket.on("game-is-over", (msg) => {
    const { gameId } = msg;

    // Controlla se la partita è già terminata
    if (games[gameId]?.gameOver) {
      console.log(`Game Over already processed for room: ${gameId}`);
      return; // Non fare nulla se il gioco è già terminato
    }

    if (games[gameId].isAI === true) {
      io.in(gameId).emit("game-over", msg);
      return;
    }

    let totTime = games[gameId].timeSettings.totalTime;
    let timer = gameTimers[gameId];
    if (totTime !== 0) {timer.stopClock()};

    games[gameId] = {
      ...games[gameId],
      timeSettings: {
        ...games[gameId].timeSettings,
        whiteTime: totTime !== 0 ? timer.getWhiteTime() : null,
        blackTime: totTime !== 0 ? timer.getBlackTime() : null
      }, 
      gameOver: true,

    }
    
    io.in(gameId).emit("game-over", msg);
    console.log("Game Over event received for room:", msg);

  });

   // recieved when the game is over
   socket.on("time-is-over", (data) => {
    gameTimers[gameId].stopClock();
    const { player, gameId } = data;
    games[gameId] = {
      ...games[gameId],
      gameOver: true
    }
    io.in(gameId).emit("time-over", { player, gameId });
    console.log("Time Over event received for room:", data);

  });

// gestione pulsanti partita in corso
  socket.on("resign", (data) => {
    const { gameId, playerKey, playerColor} = data;
    console.log("Resigning data:", data);
    if (games[gameId].isAI === true) {
      io.in(gameId).emit("resigned", { playerColor });
      io.in(gameId).emit("game-over", { gameId });
      return;
    }
    let totTime = games[gameId].timeSettings.totalTime;
    let timer = gameTimers[gameId];
    if (totTime !== 0) {timer.stopClock()};

    games[gameId] = {
      ...games[gameId],
      timeSettings: {
        ...games[gameId].timeSettings,
          whiteTime: totTime !== 0 ? timer.getWhiteTime() : null,
          blackTime: totTime !== 0 ? timer.getBlackTime() : null
        }, 
    }
    io.in(gameId).emit("resigned", { playerColor });
    io.in(gameId).emit("game-over", { gameId });
    
  });

  socket.on("draw-offer", (data) => {
    const { gameId, sender } = data;
    const receiver = (games[gameId].white === sender) ? games[gameId].black : games[gameId].white;
    console.log("Sender Socket:", sender);
    console.log("Receiver Socket:", receiver);
    io.to(receiver).emit("draw-offered", { playerKey: data.playerKey });
  });

  socket.on("draw-response", (data) => {
    const { gameId, accept } = data;
    io.in(gameId).emit("draw-response-result", { accept });
    // Se la patta è accettata, termina la partita
    if (accept) {
        // Logica per gestire la fine della partita 
        let totTime = games[gameId].timeSettings.totalTime;
        let timer = gameTimers[gameId];
        if (totTime !== 0) {timer.stopClock()};
        
        games[gameId] = {
          ...games[gameId],
          timeSettings: {
            ...games[gameId].timeSettings,
            whiteTime: totTime !== 0 ? timer.getWhiteTime() : null,
            blackTime: totTime !== 0 ? timer.getBlackTime() : null
            }, 
        }    
        io.in(gameId).emit("game-over", { gameId });
        console.log("La partita è finita in patta.");
    } else {
        console.log("La patta è stata rifiutata, il gioco continua.");
    }
  });

  socket.on("undo-move", (data) => {
    const { gameId, playerKey, playerColor, sender, board, AI } = data;

    if (AI === true) {
      //ogni volta che lo fai contro Ai cancelli due mosse per volta
      games[gameId].movesHistory.pop();
      games[gameId].movesRecord.pop();
      games[gameId].movesHistory.pop();
      games[gameId].movesRecord.pop();
      games[gameId].position = board;
      console.log("Game data after undo move:", games[gameId]);
      io.in(gameId).emit("NewTurn", data);
      io.in(gameId).emit("NewFen", board);
      io.in(gameId).emit("Update-Status", data);
      
    } else {
      const receiver = (games[gameId].white === sender) ? games[gameId].black : games[gameId].white;
      console.log("Sender Socket:", sender);
      console.log("Receiver Socket:", receiver);
      //io.in(gameId).broadcast("undo-request", { playerKey });
      io.to(receiver).emit("undo-request", { playerKey: data.playerKey });
    }
 
  });

  socket.on("move-takeback-response", (data) => {
    const { gameId, accept } = data;
    let timer = gameTimers[gameId];
    let totTime = games[gameId].timeSettings.totalTime;
    //console.log("move takeback data: ",data);
    // Invia la risposta di ritiro mossa a entrambi i giocatori
    io.in(gameId).emit("move-takeback-response-result", { accept, gameId });
    // Se il ritiro è accettato, esegui logica per ritirare l'ultima mossa
    if (accept) {
        if (totTime !== 0) {timer.switchTurn()};        
        games[gameId].movesHistory.pop();
        games[gameId].movesRecord.pop();
        io.in(gameId).emit("NewTurn", gameId);
        console.log("La richiesta di ritiro mossa è stata accettata.");
    } else {
        console.log("La richiesta di ritiro mossa è stata rifiutata, il gioco continua.");
    }  
    
  });

  socket.on("fenUpdate", (gameId, position) => {

    games[gameId] = {
      ...games[gameId],
      position: position
    }
    //console.log("Game Fen after Takeback: ", games[gameId].position);
    //console.log("Game Info After takeback: ", games[gameId]);
  })

  socket.on("restart", (data) => {
    const { gameId, playerKey, board, AI } = data;
    console.log("Player color on restart:", playerColor);
    

    if(AI===true) {

      if (playerColor==="black") { 
        io.in(gameId).emit("AIstart", playerColor);
        io.in(gameId).emit("play", gameId);
      } else { 
        io.in(gameId).emit("NewTurn", data);
        io.in(gameId).emit("NewFen", board);
        io.in(gameId).emit("Update-Status", data);
        io.in(gameId).emit("play", gameId);
      }
    } else {
      io.in(gameId).broadcast.emit("restart", { playerKey });
      //socket.broadcast.emit("undo-request", { playerKey });
    }
 
  });

  socket.on("finalGameState", (gameId, gameInfo)=> { // se aggiorni il tempo qui puoi toglierlo da resign, draw e game over

    // Controlla se la partita è già terminata
    if (games[gameId]?.gameOver) {
      console.log(`Game Over already processed for room: ${gameId}`);
      return; // Non fare nulla se il gioco è già terminato
    }
    
    //console.log("GAME RESULT: ", gameInfo);
  
    games[gameId] = {
      ...games[gameId],
      gameOver: true,
      result: gameInfo
    }
    console.log("Game final Object is: ", games[gameId]);
  });

  socket.on("get-room-status", () => {
    console.log("Get room status request received");
    

    socket.emit("send-room-status", gameManager.getGamesStatus());
    //socket.broadcast.emit("send-room-status", gameManager.getGamesStatus());
  });

  socket.on("reconnect", ({ gameId, playerId }) => {
    console.log("User Reconnection");
    const game = games[gameId];
    if (!game) return console.log("Game not found");

    //console.log("These are the game stats for this game: ", game);

    // Trova il giocatore nel gioco e aggiorna il suo socket ID
    if (game.whitePlayerId === playerId) {
        game.whiteSocketId = socket.id;
    } else if (game.blackPlayerId === playerId) {
        game.blackSocketId = socket.id;
    } else {
        // Se il giocatore non è trovato, potrebbe essere uno spettatore
        socket.join(gameId);
        socket.emit('spectator',); // Invia la posizione corrente
        return;
    }

    io.in(gameId).emit("player", game);
    // Sincronizza lo stato del gioco senza emettere un nuovo evento "play"
    //socket.join(gameId);
    //socket.emit('sync', {
        //gameId,
        //fen: game.fen(),
        //moveHistory: game.moveHistory,
        //currentPlayer: game.currentPlayer,
        //whiteTime: game.remainingTime.white,
    //}); //blackTime:game.remainingTime.black

    console.log(`Player reconnected: ${playerId}`);
});

  socket.on("disconnect", () => {
    //socket.broadcast.emit('player-exit', { roomId: gameId });
    //gameManager.removePlayerFromGame(playerId);

    socket.emit("send-room-status", gameManager.getGamesStatus());
    socket.broadcast.emit("send-room-status", gameManager.getGamesStatus());
  });
});

server.listen(config.port || process.env.PORT, () =>
  console.info(`Banzai Chess running on port ${config.port}.`)
);