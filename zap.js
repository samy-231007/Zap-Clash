// Klasse für das Fruit Zap Spiel
class FruitZap {
    // Konstruktor: Initialisiert das Spiel
    constructor() {
        // Eigenschaften des Spiels
        this.symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '🍍', '🔔', '⭐', '🍀']; // Symbole für die Walzen
        this.balance = 1000; // Startguthaben
        this.autoPlay = false; // Auto-Play-Modus
        this.totalReels = 9; // Gesamtzahl der Walzen (3x3)

        // DOM-Elemente
        this.spinButton = document.getElementById('spinBtn'); // Spin-Button
        this.autoPlayButton = document.getElementById('autoPlayBtn'); // Auto-Play-Button
        this.betAmountSelect = document.getElementById('betAmount'); // Einsatz-Auswahlfeld
        this.balanceDisplay = document.getElementById('balance'); // Guthaben-Anzeige
        this.winLinesContainer = document.getElementById('winLines'); // Container für Gewinnlinien
        this.resultText = document.getElementById('result'); // Ergebnisanzeige

        // Walzen initialisieren
        this.reels = this.initReels();

        // Audio initialisieren
        this.initAudio();

        // Event-Listener hinzufügen
        this.bindEvents();

        // Guthaben anzeigen
        this.updateBalance();
    }

    // Walzen initialisieren (3x3 Grid)
    initReels() {
        const reels = [];
        for (let row = 0; row < 3; row++) { // Schleife über die Reihen
            const rowReels = [];
            for (let col = 0; col < 3; col++) { // Schleife über die Spalten
                const reel = document.getElementById(`reel-${row}-${col}`); // Einzelne Walze holen
                if (!reel) console.error(`Reel reel-${row}-${col} nicht gefunden!`); // Fehler, falls Walze fehlt
                rowReels.push(reel); // Walze zur aktuellen Reihe hinzufügen
            }
            reels.push(rowReels); // Reihe zum Walzen-Array hinzufügen
        }
        return reels;
    }

    // Audio-Objekte initialisieren
    initAudio() {
        this.spinAudio = new Audio('https://freesound.org/data/previews/120/120138_2157169-lq.mp3'); // Dreh-Sound
        this.stopAudio = new Audio('https://freesound.org/data/previews/387/387153_71257-lq.mp3'); // Stop-Sound
        this.winAudio = new Audio('https://freesound.org/data/previews/511/511484_10891712-lq.mp3'); // Gewinn-Sound
        this.spinAudio.loop = true; // Dreh-Sound wird geloopt

        // Audio laden
        this.spinAudio.load();
        this.stopAudio.load();
        this.winAudio.load();

        // Audio bei erster Interaktion freischalten (Browser-Richtlinien)
        document.addEventListener('click', () => {
            this.spinAudio.play().then(() => { this.spinAudio.pause(); this.spinAudio.currentTime = 0; }).catch(err => console.error('Spin Audio Fehler:', err));
            this.stopAudio.play().then(() => { this.stopAudio.pause(); this.stopAudio.currentTime = 0; }).catch(err => console.error('Stop Audio Fehler:', err));
            this.winAudio.play().then(() => { this.winAudio.pause(); this.winAudio.currentTime = 0; }).catch(err => console.error('Win Audio Fehler:', err));
        }, { once: true });
    }

    // Event-Listener für Buttons hinzufügen
    bindEvents() {
        this.spinButton.addEventListener('click', () => this.spinReels()); // Spin-Button startet Drehung
        this.autoPlayButton.addEventListener('click', () => this.toggleAutoPlay()); // Auto-Play-Button schaltet Auto-Modus
    }

    // Guthaben aktualisieren und anzeigen
    updateBalance() {
        this.balanceDisplay.textContent = this.balance; // Guthaben anzeigen
    }

    // Walzen drehen
    spinReels() {
        if (this.spinButton.disabled && !this.autoPlay) return; // Abbrechen, wenn Button deaktiviert und kein Auto-Play

        const bet = parseInt(this.betAmountSelect.value); // Einsatz aus Dropdown holen
        if (this.balance < bet) { // Prüfen, ob genug Guthaben vorhanden
            this.resultText.textContent = 'Kein Cash mehr!'; // Nachricht bei zu wenig Guthaben
            this.spinButton.disabled = false; // Button aktivieren
            this.autoPlay = false; // Auto-Play deaktivieren
            this.autoPlayButton.textContent = 'Auto-Zap'; // Button-Text zurücksetzen
            return;
        }

        this.balance -= bet; // Einsatz vom Guthaben abziehen
        this.updateBalance(); // Guthaben aktualisieren
        this.resultText.textContent = ''; // Ergebnisanzeige leeren
        this.winLinesContainer.innerHTML = ''; // Gewinnlinien leeren
        this.spinButton.disabled = true; // Spin-Button deaktivieren
        this.spinAudio.play().catch(err => console.error('Spin Audio Fehler:', err)); // Dreh-Sound abspielen

        let completed = 0; // Zähler für abgeschlossene Walzen

        this.reels.forEach((row, rowIndex) => { // Über jede Reihe iterieren
            row.forEach((reel, colIndex) => { // Über jede Walze in der Reihe iterieren
                if (!reel) return; // Sicherheit, falls Walze fehlt
                reel.classList.add('spinning'); // Dreh-Klasse hinzufügen
                reel.classList.remove('winning'); // Gewinn-Klasse entfernen
                reel.style.transition = 'none'; // Übergang deaktivieren
                reel.style.transform = 'translateY(80px)'; // Walze nach unten verschieben
                setTimeout(() => { // Verzögerung für Animation
                    reel.style.transition = 'transform 1.5s ease-out'; // Sanfter Übergang
                    reel.style.transform = `translateY(-${this.getRandomSpins() * 80}px)`; // Zufällige Drehung nach oben
                    setTimeout(() => { // Nach Animation
                        reel.textContent = this.symbols[Math.floor(Math.random() * this.symbols.length)]; // Zufälliges Symbol setzen
                        reel.classList.remove('spinning'); // Dreh-Klasse entfernen
                        reel.style.transition = 'none'; // Übergang deaktivieren
                        reel.style.transform = 'translateY(0)'; // Walze zurücksetzen
                        completed++; // Zähler erhöhen
                        if (completed === this.totalReels) { // Wenn alle Walzen fertig
                            this.spinAudio.pause(); // Dreh-Sound stoppen
                            this.spinAudio.currentTime = 0; // Dreh-Sound zurücksetzen
                            this.stopAudio.play().catch(err => console.error('Stop Audio Fehler:', err)); // Stop-Sound abspielen
                            this.checkWin(bet); // Gewinne prüfen
                            this.spinButton.disabled = false; // Spin-Button aktivieren
                            if (this.autoPlay) setTimeout(() => this.spinReels(), 2000); // Auto-Play fortsetzen
                        }
                    }, 1500); // Dauer der Drehanimation
                }, colIndex * 200); // Verzögerung pro Walze
            });
        });
    }

    // Zufällige Anzahl an Drehungen generieren
    getRandomSpins() {
        return Math.floor(Math.random() * 10) + 15; // Zufällige Anzahl zwischen 15 und 24
    }

    // Gewinne prüfen
    checkWin(bet) {
        const reelValues = this.reels.map(row => row.map(reel => reel.textContent)); // Aktuelle Walzenwerte holen
        let wins = 0; // Gewinnzähler
        let winningLines = []; // Array für Gewinnlinien

        // Horizontale Gewinne prüfen
        reelValues.forEach((row, rowIndex) => {
            if (row[0] === row[1] && row[1] === row[2]) { // Wenn alle drei Symbole gleich
                wins += 5; // Gewinn erhöhen
                winningLines.push({ type: 'horizontal', index: rowIndex }); // Gewinnlinie speichern
            }
        });

        // Vertikale Gewinne prüfen
        for (let col = 0; col < 3; col++) {
            if (reelValues[0][col] === reelValues[1][col] && reelValues[1][col] === reelValues[2][col]) { // Wenn alle drei Symbole gleich
                wins += 5; // Gewinn erhöhen
                winningLines.push({ type: 'vertical', index: col }); // Gewinnlinie speichern
            }
        }

        // 20% Chance auf kleinen Gewinn, wenn kein Liniengewinn
        if (wins === 0 && Math.random() < 0.2) {
            wins = 1;
        }

        let winnings = 0; // Gewinnbetrag
        if (wins > 0) { // Wenn Gewinn vorhanden
            winnings = bet * wins * 2; // Gewinn berechnen (Einsatz * Gewinne * Multiplikator)
            this.balance += winnings; // Gewinn zum Guthaben addieren
            this.resultText.textContent = `Zap! ${winnings} € gecasht!`; // Erfolgsmeldung
            this.resultText.style.color = '#e0f7ff'; // Türkis-weiße Farbe
            this.winAudio.play().catch(err => console.error('Win Audio Fehler:', err)); // Gewinn-Sound abspielen
            this.drawWinLines(winningLines); // Gewinnlinien zeichnen
            this.highlightWinningSymbols(winningLines); // Gewinnsymbole hervorheben
        } else {
            this.resultText.textContent = 'Nix? Zap nochmal!'; // Nachricht bei keinem Gewinn
            this.resultText.style.color = '#00d4ff'; // Türkise Farbe
        }
        this.updateBalance(); // Guthaben aktualisieren
    }

    // Gewinnlinien zeichnen
    drawWinLines(winningLines) {
        winningLines.forEach(line => { // Über jede Gewinnlinie iterieren
            const winLine = document.createElement('div'); // Neues Div für Linie erstellen
            winLine.classList.add('win-line'); // Klasse hinzufügen
            if (line.type === 'horizontal') { // Horizontale Linie
                const top = line.index * 80 + 40; // Position an Reel-Höhe angepasst
                winLine.style.top = `${top}px`; // Obere Position
                winLine.style.left = '0'; // Linker Rand
                winLine.style.width = '100%'; // Volle Breite
                winLine.style.height = '4px'; // Höhe der Linie
            } else if (line.type === 'vertical') { // Vertikale Linie
                const left = line.index * (100 / 3) + (100 / 6); // Position berechnen
                winLine.style.top = '0'; // Oberer Rand
                winLine.style.left = `${left}%`; // Linke Position
                winLine.style.width = '4px'; // Breite der Linie
                winLine.style.height = '100%'; // Volle Höhe
            }
            this.winLinesContainer.appendChild(winLine); // Linie zum Container hinzufügen
        });
    }

    // Gewinnsymbole hervorheben
    highlightWinningSymbols(winningLines) {
        winningLines.forEach(line => { // Über jede Gewinnlinie iterieren
            if (line.type === 'horizontal') { // Horizontale Linie
                this.reels[line.index].forEach(reel => reel.classList.add('winning')); // Gewinn-Klasse hinzufügen
            } else if (line.type === 'vertical') { // Vertikale Linie
                this.reels.forEach(row => row[line.index].classList.add('winning')); // Gewinn-Klasse hinzufügen
            }
        });
    }

    // Auto-Play-Modus umschalten
    toggleAutoPlay() {
        this.autoPlay = !this.autoPlay; // Auto-Play-Status umschalten
        this.autoPlayButton.textContent = this.autoPlay ? 'Stop Zap' : 'Auto-Zap'; // Button-Text anpassen
        if (this.autoPlay) this.spinReels(); // Bei Auto-Play Drehung starten
    }
}

// Spiel starten
const game = new FruitZap();