class TimeManager {
    
    constructor() {
        this.whiteStartTime;
        this.blackStartTime;
        this.moveStartTime;

        this.maxTime = 0; // Tempo totale
        this.incrementTime = 0; // Incremento per mossa
        this.moveTimeLimit = 0; // Tempo massimo per mossa

        this.whiteTimeLeft; // Tempo rimanente per il bianco
        this.blackTimeLeft; // Tempo rimanente per il nero

        this.currentPlayer; // Giocatore attuale
        this.checkInterval; // ID dell'intervallo di controllo
    }

    initializeTimer(timeSettings) {
        this.maxTime = timeSettings.totalTime;
        this.incrementTime = timeSettings.incrementTime;
        this.moveTimeLimit = timeSettings.moveTimeLimit;

        this.whiteTimeLeft = this.maxTime;
        this.blackTimeLeft = this.maxTime;

        console.log(
            `Tempo totale: ${this.maxTime / 60 / 1000} minuti; Incremento: ${this.incrementTime / 1000} secondi; Tempo per mossa: ${this.moveTimeLimit / 60 / 1000} minuti`
        );
    }

    updateTime(player, timeLeft) {
        if (timeLeft < 0) timeLeft = 0;

        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);

        //console.log(`Tempo rimanente per ${player}: ${minutes}m ${seconds}s`);
    }

    startClock(player) {
        console.log(`Starting clock for: ${player}`);
        this.stopClock();

        if (player === 'white') {
            this.whiteStartTime = new Date();
        } else {
            this.blackStartTime = new Date();
        }

        this.moveStartTime = new Date();
        this.currentPlayer = player;

        this.checkInterval = setInterval(() => this.checkExpired(player), 100);
    }

    stopClock() {
        clearInterval(this.checkInterval);
    }

    checkExpired(player) {

        const curTime = new Date();
        let timeDifference;
        let moveTimeDifference;

        if (player === 'white') {
            timeDifference = curTime.getTime() - this.whiteStartTime.getTime();
            this.whiteTimeLeft -= timeDifference; // Diminuisci il tempo residuo
            this.whiteStartTime = curTime; // Aggiorna l'orario di inizio
            //this.updateTime('white', this.whiteTimeLeft);
            //console.log("White Time Left:", whiteTimeLeft / 1000)
        } else {
           timeDifference = curTime.getTime() - this.blackStartTime.getTime();
           this.blackTimeLeft -= timeDifference; // Diminuisci il tempo residuo
           this.blackStartTime = curTime; // Aggiorna l'orario di inizio
           //this.updateTime('black', this.blackTimeLeft);
            //console.log("Black Time Left:", blackTimeLeft / 1000)
        }

        if (!this.moveTimeLimit == 0) {

            moveTimeDifference = curTime.getTime() - this.moveStartTime.getTime();
            if (moveTimeDifference >= this.moveTimeLimit) {
                console.log(`${player} exceeded move time limit!`);
                this.stopClock();
                this.notifyTimeOver(player);
            }   // Aggiungi qui la logica per gestire la perdita del giocatore per superamento del tempo per mossa
        }


        if (this.whiteTimeLeft <= 0) {
            console.log("White's time up");
            this.stopClock();
            this.notifyTimeOver('white');
            // Aggiungi qui la logica per gestire la fine del tempo del bianco
        } else if (this.blackTimeLeft <= 0) {
            console.log("Black's time up");
            this.stopClock();
            this.notifyTimeOver('black');
            // Aggiungi qui la logica per gestire la fine del tempo del nero
        }

    }

    switchTurn() {
        const prevPlayer = this.currentPlayer;
        this.currentPlayer = prevPlayer === 'white' ? 'black' : 'white';

        if (prevPlayer === 'white') {
            this.whiteTimeLeft += this.incrementTime;
            //this.updateTime('white', this.whiteTimeLeft);
        } else {
            this.blackTimeLeft += this.incrementTime;
            //this.updateTime('black', this.blackTimeLeft);
        }

        this.startClock(this.currentPlayer);
    }

    notifyTimeOver(player) {
        console.log(`${player}'s time is up!`);
    }

    getWhiteTime() {
        return this.whiteTimeLeft;
    }

    getBlackTime() {
        return this.blackTimeLeft;
    }
}

module.exports = TimeManager;