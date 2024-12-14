const { createNewGame, getGameData } = require("./room/RoomService");

const express = require("express");
// api per gestire le stanze (nuove partite o rientro in partita)
const roomApi = express.Router();

const querystring = require('querystring');

// Endpoint per creare una nuova partita contro l'AI
roomApi.post("/api/ai/new", (req, res) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString(); // Converti il buffer in stringa
  });
  req.on('end', () => {
    console.log("Parsed body (AI):", body);
    const parsedBody = querystring.parse(body); // Parsing manuale
    const isBlack = parsedBody.isBlack === 'true';
    const firstPlayerColor = isBlack ? 'black' : 'white';
    const aiLevel = parsedBody.depth;
    const isAI = true;
    console.log("Depth:", aiLevel);

    // Estrai le impostazioni temporali dal corpo della richiesta
    const timeSettings = {
      totalTime: parsedBody.totaltime ? parseInt(parsedBody.totaltime) * 60 * 1000 : 0, // Converti minuti in ms
      incrementTime: parsedBody.increment ? parseInt(parsedBody.increment) * 1000 : 0, // Converti secondi in ms
      moveTimeLimit: parsedBody.movetime ? parseInt(parsedBody.movetime) * 60 * 1000 : 0 // Converti minuti in ms
    };

    // Gestire la FEN
    let position = parsedBody.nfen || 'start';
    if (Array.isArray(position)) {
      position = position[position.length - 1]; // Prendi l'ultimo valore se è un array
    }

    // Crea una nuova partita tramite il RoomService
    const newGameResponse = createNewGame(firstPlayerColor, timeSettings, position, isAI, aiLevel);

    // Estrai gameId dal response
    const gameId = newGameResponse.gameId;
    console.log("AI Game created: ", newGameResponse);
    const [key1] = newGameResponse.players;
    const spectatorKey = newGameResponse.spectatorKey; // Chiave spettatore

    // Rispondi con un JSON che include l'URL della stanza AI
    res.json({ 
      success: true, 
      roomUrl: `/AIroom.html?gameId=${gameId}&key1=${key1}`, 
      spectatorUrl: `/AIroom.html?gameId=${gameId}&spectatorKey=${spectatorKey}` // URL spettatore
    });
  });
});

// Endpoint per creare una nuova partita contro persone
roomApi.post("/api/games/new", (req, res) => {

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString(); // Converti il buffer in stringa
  });
  req.on('end', () => {
    //console.log("Parsed body:", body);
    const parsedBody = querystring.parse(body); // Parsing manuale
    const isBlack = parsedBody.isBlack === 'true';
    firstPlayerColor = isBlack ? 'black' : 'white'
    const selectedTime = parsedBody.time ? parseInt(parsedBody.time) * 60 * 1000 : 0; // Converti minuti in ms
    const totalTime = parsedBody.totaltime ? parseInt(parsedBody.totaltime) * 60 * 1000 : 0; // Converti minuti in ms

    if (totalTime==0 && selectedTime!=0) {
      var timeSettings = {
        totalTime: selectedTime, 
        incrementTime: parsedBody.increment ? parseInt(parsedBody.increment) * 1000 : 0, // Converti secondi in ms
        moveTimeLimit: parsedBody.movetime ? parseInt(parsedBody.movetime) * 60 * 1000 : 0 // Converti minuti in ms
      };
    } else {
      // Estrai le impostazioni temporali dal corpo della richiesta
      var timeSettings = {
        totalTime: totalTime, 
        incrementTime: parsedBody.increment ? parseInt(parsedBody.increment) * 1000 : 0, // Converti secondi in ms
        moveTimeLimit: parsedBody.movetime ? parseInt(parsedBody.movetime) * 60 * 1000 : 0 // Converti minuti in ms
      }
    }

    // Gestire la FEN
    let position = parsedBody.fen || 'start';
    if (Array.isArray(position)) {
      position = position[position.length - 1]; // Prendi l'ultimo valore se è un array
    }
  // crea una nuova partita tramite il RoomService
  const newGameResponse = createNewGame(firstPlayerColor, timeSettings, position);

  // ritorna un JSON (JavaScript Object Notation)
  // che contiene le informazioni sulla partita appena creata.
  // Queste informazioni vengono poi usate dal client (frontend) per
  // entrare in partita

  const gameId = newGameResponse.gameId;
  console.log("Room created: ", newGameResponse);
  const [key1, _] = newGameResponse.players;
  const spectatorKey = newGameResponse.spectatorKey; // Chiave spettatore
  //res.redirect(`/rooms.html?gameId=${gameId}&key1=${key1}`);
  console.log("Chiave spettatore:", spectatorKey);
  console.log("Url spettatore:", `localhost:3000/rooms.html?gameId=${gameId}&spectatorKey=${spectatorKey}`);

  // Rispondi con un JSON che include l'URL della stanza
  res.json({ 
    success: true, 
    roomUrl: `/rooms.html?gameId=${gameId}&key1=${key1}`,
    spectatorUrl: `/rooms.html?gameId=${gameId}&spectatorKey=${spectatorKey}` // URL spettatore 
    
  });
  
  });  
});


roomApi.get("/api/games/:gameId", (req, res) => {
  const key = req.query.key1 || req.query.key2 || req.query.key || req.query.spectatorKey;
  const gameId = req.params.gameId;
  console.log("GET /api/games/{gameId}");
  console.log(`Richiesta GET per /api/games/${gameId} con chiave: ${key}`);

  const existingGame = getGameData(gameId, key);
  res.send({
    gameId: existingGame.gameId,
    players: existingGame.players,
    
  });
});

module.exports = roomApi;