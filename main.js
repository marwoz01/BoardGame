const fs = require('fs');
const path = require('path');

// Funkcja do wczytywania danych z pliku
const readInputFile = (fileName) => {

  const filePath = path.join(__dirname, fileName);

  // Zabezpieczenie do zczytania pliku
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('error');
      return;
    }

    // Usunięcie  znaków i podział na linie
    const lines = data.replace(/\r/g, '').trim().split('\n');

    // Sprawdzenie czy są podane wszystkie dane
    if (lines.length !== 6) {
      console.log('error');
      return;
    }

    const [teamA, speedA, teamB, speedB, width, height] = lines;

    // Sprawdzenie nazw drużyn
    const isValidName = name => /^[A-Za-z0-9]{1,10}$/.test(name);
    if (!isValidName(teamA) || !isValidName(teamB)) {
      console.log('error');
      return;
    }

    // Sprawdzenie czy nazwy drużyn są różne
    if (teamA === teamB) {
      console.log('error');
      return;
    }

    // Sprawdzenie współczynników prędkości
    const isValidSpeed = speed => /^[1-3]$/.test(speed);
    if (!isValidSpeed(speedA) || !isValidSpeed(speedB)) {
      console.log('error');
      return;
    }

    // Sprawdzenie wymiarów planszy
    const isValidDimension = dim => /^[1-9][0-9]{0,2}$/.test(dim) && dim >= 1 && dim <= 1000;
    if (!isValidDimension(width) || !isValidDimension(height)) {
      console.log('error');
      return;
    }

    // Inicjalizacja drużyn
    let teamAPieces = Array.from({ length: width }, (_, x) => ({
      x,
      y: parseInt(height) - 1,
      speed: calculateSpeed(x, parseInt(speedA), height - 1),
    }));

    let teamBPieces = Array.from({ length: width }, (_, x) => ({
      x,
      y: 0,
      speed: calculateSpeed(x, parseInt(speedB), 0),
    }));

    // Funkcja do obliczania prędkości
    function calculateSpeed(x, speedCoefficient, startingY) {
      const baseSpeed = speedCoefficient;
      return startingY === 0 ? baseSpeed : -baseSpeed;
    }

    // Symulacja
    while (teamAPieces.length > 0 && teamBPieces.length > 0) {
      // Poruszanie drużyny A
      teamAPieces.forEach(piece => {
        piece.y += piece.speed;
      });

      // Poruszanie drużyny B
      teamBPieces.forEach(piece => {
        piece.y += piece.speed;
      });

      // Usuwanie figurek, które opuściły planszę
      const isOnBoard = piece => piece.y >= 0 && piece.y < height;
      teamAPieces = teamAPieces.filter(isOnBoard);
      teamBPieces = teamBPieces.filter(isOnBoard);

      // Obsługa kolizji
      const positions = new Map();

      const addToMap = (piece, team) => {
        const key = `${piece.x},${piece.y}`;
        if (!positions.has(key)) {
          positions.set(key, []);
        }
        positions.get(key).push({ ...piece, team });
      };

      teamAPieces.forEach(piece => addToMap(piece, 'A'));
      teamBPieces.forEach(piece => addToMap(piece, 'B'));

      const resolvedPositions = [];

      positions.forEach((pieces, key) => {
        if (pieces.length === 1) {
          resolvedPositions.push(pieces[0]);
        } else if (pieces.length > 1) {
          pieces.sort((a, b) => Math.abs(a.speed) - Math.abs(b.speed));

          const smallestSpeed = Math.abs(pieces[0].speed);
          const filteredPieces = pieces.filter(p => Math.abs(p.speed) === smallestSpeed);

          if (filteredPieces.length === 1) {
            resolvedPositions.push(filteredPieces[0]);
          }
          // Remis
        }
      });

      teamAPieces = resolvedPositions.filter(p => p.team === 'A');
      teamBPieces = resolvedPositions.filter(p => p.team === 'B');
    }

    // Wybór zwycięzcy
    if (teamAPieces.length > 0) {
      console.log(teamA);
    } else if (teamBPieces.length > 0) {
      console.log(teamB);
    } else {
      console.log('Remis');
    }

  });
};

// Wywołanie funkcji
readInputFile('input.txt');