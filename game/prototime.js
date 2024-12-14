let whiteStartTime, blackStartTime; // Orari di inizio
let moveStartTime; // Orario di inizio per il tempo per mossa

let maxTime = 0; // 10 minuti in millisecondi
let currentPlayer; // Giocatore attuale
let checkInterval; // Intervallo di controllo

let whiteTimeLeft = maxTime; // Tempo residuo per il bianco
let blackTimeLeft = maxTime; // Tempo residuo per il nero

let incrementTime = 0; // Incremento di 5 secondi in millisecondi
let moveTimeLimit = 0; // Tempo per mossa di 60 secondi in millisecondi

function initializeTimer(timeSettings) {
    // Assegna i valori di timeSettings alle variabili di timer.js
    //const whiteTime = timeSettings.whiteTime;
    //const blackTime = timeSettings.blackTime;
    maxTime = timeSettings.totalTime;
    incrementTime = timeSettings.incrementTime;
    moveTimeLimit = timeSettings.moveTimeLimit;
    console.log("Tempo totale:", maxTime/60/1000,"minuti;","Incremento:", incrementTime/1000, "secondi;", "Tempo per mossa:", moveTimeLimit/60/1000, "minuti");

    // Aggiorna il timer HTML solo se maxTime è maggiore di 0
    if (maxTime > 0) { 

        // Inizializza i tempi residui solo se maxTime è maggiore di 0
        whiteTimeLeft = maxTime;
        blackTimeLeft = maxTime;

        // Converte il tempo massimo in minuti e secondi
        let maxMinutes = Math.floor(maxTime / 60000);
        let maxSeconds = Math.floor((maxTime % 60000) / 1000);

        // Aggiorna l'HTML con il tempo massimo
        //document.getElementById("white-minutes").innerText = maxMinutes.toString().padStart(2, '0');
        //document.getElementById("white-seconds").innerText = maxSeconds.toString().padStart(2, '0');
        //document.getElementById("black-minutes").innerText = maxMinutes.toString().padStart(2, '0');
        //document.getElementById("black-seconds").innerText = maxSeconds.toString().padStart(2, '0');
    }   //else {
       
}

function updateTime(player, timeLeft) {

    // Assicuriamoci che il tempo residuo non sia mai negativo
    if (timeLeft < 0) {
        timeLeft = 0;
    }

    let minutes = Math.floor(timeLeft / 60000); // Converti in minuti
    let seconds = Math.floor((timeLeft % 60000) / 1000); // Converti in secondi

    //if (player==='white') {
        //whiteTimeLeft = minutes, seconds;
        
    //} else blackTimeLeft = minutes, seconds;

    //console.log("Players time is:", whiteTimeLeft, blackTimeLeft);
    //socket.in(gameId).emit('time-update', player, minutes, seconds);
    
    // Aggiorna l'HTML con il tempo rimanente
    //document.getElementById(`${player}-minutes`).innerText = minutes.toString().padStart(2, '0');
    //document.getElementById(`${player}-seconds`).innerText = seconds.toString().padStart(2, '0');
    // Evidenzia il timer attivo
    //document.getElementById(`${player}-timer`).classList.add('active');
    //document.getElementById(`${player === 'white' ? 'black' : 'white' }-timer`).classList.remove('active');
}

function startClock(player) {

    console.log(`Starting clock for: ${player}`);

    if (maxTime > 0) {
        stopClock(); // Ferma qualsiasi controllo precedente
        if (player === 'white') {
            whiteStartTime = new Date(); // Inizializza l'orario di inizio per il Bianco
        } else {
            blackStartTime = new Date(); // Inizializza l'orario di inizio per il Nero
        }
        moveStartTime = new Date(); // Inizializza l'orario di inizio per la mossa

        checkInterval = setInterval(() => {
            checkExpired(player); // Controlla se il tempo è scaduto ogni 100 ms
        }, 100);
    }
}

function stopClock() {
    clearInterval(checkInterval); // Ferma l'intervallo di controllo
}

function checkExpired(player) {
    const curTime = new Date();
    
    let timeDifference;
    let moveTimeDifference;

    if (player === 'white') {
        timeDifference = curTime.getTime() - whiteStartTime.getTime();
        whiteTimeLeft -= timeDifference; // Diminuisci il tempo residuo
        whiteStartTime = curTime; // Aggiorna l'orario di inizio
        updateTime('white', whiteTimeLeft);
        //console.log("White Time Left:", whiteTimeLeft / 1000)
    } else {
        timeDifference = curTime.getTime() - blackStartTime.getTime();
        blackTimeLeft -= timeDifference; // Diminuisci il tempo residuo
        blackStartTime = curTime; // Aggiorna l'orario di inizio
        updateTime('black', blackTimeLeft);
        //console.log("Black Time Left:", blackTimeLeft / 1000)
    }

    if (!moveTimeLimit == 0) {

        moveTimeDifference = curTime.getTime() - moveStartTime.getTime();
        if (moveTimeDifference >= moveTimeLimit) {
            console.log(`${player} exceeded move time limit!`);
            clearInterval(checkInterval);
            //notifyTimeOver(player);
        }   // Aggiungi qui la logica per gestire la perdita del giocatore per superamento del tempo per mossa
    }


    if (whiteTimeLeft <= 0) {
        console.log("White's time up");
        clearInterval(checkInterval);
        notifyTimeOver('white');
        // Aggiungi qui la logica per gestire la fine del tempo del bianco
    } else if (blackTimeLeft <= 0) {
        console.log("Black's time up");
        clearInterval(checkInterval);
        notifyTimeOver('black');
        // Aggiungi qui la logica per gestire la fine del tempo del nero
    }
    
}
function switchTurn(playerColor) {
    //console.log(`Before Swicth, current Player: ${playerColor}`);
    currentPlayer = playerColor === 'white' ? 'black' : 'white' ;
    //console.log(`Switching turn. New currentPlayer: ${currentPlayer}`);

    // Aggiungi l'incremento al tempo residuo del giocatore precedente
    if (currentPlayer === 'black') {
        whiteTimeLeft += incrementTime;
        updateTime('white', whiteTimeLeft);
        
    } else {
        blackTimeLeft += incrementTime;
        updateTime('black', blackTimeLeft);
        
    }
    startClock(currentPlayer); // Avvia il timer per il nuovo giocatore
}

function switchBackTurn() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white' ;

    // Aggiungi l'incremento al tempo residuo del giocatore precedente
    if (currentPlayer === 'black') {
        //blackTimeLeft -= incrementTime;
        updateTime('black', blackTimeLeft);
    } else {
        //whiteTimeLeft -= incrementTime;
        updateTime('white', whiteTimeLeft);
    }
    startClock(currentPlayer); // Avvia il timer per il nuovo giocatore
}
    function notifyTimeOver(player) {
    //socket.emit('time-is-over', { player: player, gameId: gameId });
    //socket.emit('game-is-over', { gameId });
}

// Getter per ottenere i tempi
function getWhiteTime() {
    return whiteTimeLeft;
  }
  
function getBlackTime() {
    return blackTimeLeft;
  }

//odule.exports = { initializeTimer, startClock, stopClock, switchTurn, switchBackTurn, getWhiteTime, getBlackTime };
