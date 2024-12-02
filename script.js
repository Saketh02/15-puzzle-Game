const puzzleContainer = document.getElementById('puzzle-container');
const homePage = document.getElementById('home-page');
const gamePage = document.getElementById('game-page');
const startGameButton = document.getElementById('start-game');
const shuffleButton = document.getElementById('shuffle-button');
const backToHomeButton = document.getElementById('back-to-home');
const timerDisplay = document.getElementById('timer'); 
const modal = document.getElementById('game-over-modal'); 
const winMessage = document.getElementById('win-message');
const timeTakenElement = document.getElementById('time-taken');
const restartButton = document.getElementById('restart-game');
const backToHomeFromModalButton = document.getElementById('back-to-home-from-modal');
const nameInputSection = document.getElementById('name-input-section');
const playerNameInput = document.getElementById('player-name');
const submitScoreButton = document.getElementById('submit-score');
const viewLeaderboardButton = document.getElementById('view-leaderboard');
const leaderboardModal = document.getElementById('leaderboard-modal');
const leaderboardBody = document.getElementById('leaderboard-body');
const closeLeaderboardButton = document.querySelector('.close-leaderboard');

function saveScore() {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter a name');
        return;
    }
    let leaderboard = JSON.parse(localStorage.getItem('puzzleLeaderboard')) || [];
    const scoreEntry = {
        name: playerName,
        time: timeElapsed,
        moves: moveCount,
        timestamp: Date.now()
    };

    leaderboard.push(scoreEntry);

    leaderboard.sort((a, b) => {
        if (a.time !== b.time) return a.time - b.time;
        return a.moves - b.moves;
    });

    leaderboard = leaderboard.slice(0, 10);

    
    localStorage.setItem('puzzleLeaderboard', JSON.stringify(leaderboard));
    nameInputSection.classList.add('hidden');
    displayLeaderboard();
}

function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('puzzleLeaderboard')) || [];
    leaderboardBody.innerHTML = '';
    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${formatTime(entry.time)}</td>
            <td>${entry.moves}</td>
        `;
        leaderboardBody.appendChild(row);
    });

    leaderboardModal.classList.remove('hidden');
}
function displayWinModal() {
    console.log("Displaying Modal");

    if (!modal) {
        console.error('Modal element not found!');
        return;
    }

    winMessage.textContent = "You Win!";
    timeTakenElement.textContent = `Time Taken: ${formatTime(timeElapsed)} | Moves: ${moveCount}`;

    nameInputSection.classList.remove('hidden');
    
    modal.classList.remove('hidden');
}
submitScoreButton.addEventListener('click', saveScore);
viewLeaderboardButton.addEventListener('click', displayLeaderboard);
closeLeaderboardButton.addEventListener('click', () => {
    leaderboardModal.classList.add('hidden');
});

let selectedImage = '';
let tiles = [];
let emptyTileIndex;
let isGameRunning = false;
let timerInterval;
let timeElapsed = 0;
let moveCount = 0; 

const backgroundMusic = document.getElementById('background-music');
backgroundMusic.volume = 0.3; 

startGameButton.addEventListener('click', () => {
    backgroundMusic.play();
});

backToHomeButton.addEventListener('click', () => {
    backgroundMusic.pause();
    location.reload();
});

document.querySelectorAll('.select-image').forEach(img => {
    img.addEventListener('click', () => {
        selectedImage = img.src; 
        document.querySelectorAll('.select-image').forEach(image => {
            image.classList.remove('selected'); 
        });
        img.classList.add('selected');
        startGameButton.disabled = false;
    });
});

startGameButton.addEventListener('click', () => {
    homePage.classList.add('hidden');
    gamePage.classList.remove('hidden');
    initPuzzle();
    startTimer();
    moveCount = 0;
});

backToHomeButton.addEventListener('click', () => {
    gamePage.classList.add('hidden');
    homePage.classList.remove('hidden');
    startGameButton.disabled = true; 
    tiles = [];
    isGameRunning = false;
    resetTimer();
    moveCount = 0; 
});

function initPuzzle() {
    tiles = Array.from({ length: 16 }, (_, i) => (i < 15 ? i + 1 : 0)); 
    emptyTileIndex = 15; 
    shuffleTiles();
    renderPuzzle();
    isGameRunning = true; 
    moveCount = 0; 
    updateMoveDisplay(); 
}


function updateMoveDisplay() {
    const moveDisplay = document.getElementById('move-display');
    if (moveDisplay) {
        moveDisplay.textContent = `Moves: ${moveCount}`;
    }
}

shuffleButton.addEventListener('click', shuffleTiles);

function shuffleTiles() {
    if (!isGameRunning) return;
    for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    emptyTileIndex = tiles.indexOf(0);
    renderPuzzle();
}

function renderPuzzle() {
    puzzleContainer.innerHTML = '';
    tiles.forEach((num, index) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        if (num) {
            tile.style.backgroundImage = `url(${selectedImage})`;
            tile.style.backgroundSize = '400px 400px';
            tile.style.backgroundPosition = `${-(num - 1) % 4 * 100}px ${-Math.floor((num - 1) / 4) * 100}px`;
            const numberOverlay = document.createElement('span');
            numberOverlay.textContent = num;
            numberOverlay.style.position = 'absolute';
            numberOverlay.style.top = '5px';
            numberOverlay.style.left = '5px';
            numberOverlay.style.color = 'white';
            numberOverlay.style.textShadow = '1px 1px 2px black'; 
            numberOverlay.style.fontWeight = 'bold';
            numberOverlay.style.fontSize = '20px';
            tile.style.position = 'relative';
            tile.appendChild(numberOverlay);
            
            if (canTileBeMoved(index)) {
                tile.classList.add('movable');
            }
        } else {
            tile.classList.add('empty');
        }
        tile.addEventListener('click', () => moveTile(index));
        puzzleContainer.appendChild(tile);
    });
}
function canTileBeMoved(index) {
    const emptyRow = Math.floor(emptyTileIndex / 4);
    const emptyCol = emptyTileIndex % 4;
    const tileRow = Math.floor(index / 4);
    const tileCol = index % 4;
    return (emptyRow === tileRow || emptyCol === tileCol) && index !== emptyTileIndex;
}

function moveTile(index) {
    if (!isGameRunning) return;

    const emptyRow = Math.floor(emptyTileIndex / 4);
    const emptyCol = emptyTileIndex % 4;
    const clickedRow = Math.floor(index / 4);
    const clickedCol = index % 4;

    if (emptyRow !== clickedRow && emptyCol !== clickedCol) return;
    let slideTiles = [];
    
    if (emptyRow === clickedRow) {
        const minCol = Math.min(emptyCol, clickedCol);
        const maxCol = Math.max(emptyCol, clickedCol);
        for (let col = minCol; col <= maxCol; col++) {
            const tileIndex = clickedRow * 4 + col;
            if (tileIndex !== emptyTileIndex) {
                slideTiles.push(tileIndex);
            }
        }
        
        slideTiles.sort((a, b) => emptyCol < clickedCol ? a - b : b - a);
    } else {
        const minRow = Math.min(emptyRow, clickedRow);
        const maxRow = Math.max(emptyRow, clickedRow);
        for (let row = minRow; row <= maxRow; row++) {
            const tileIndex = row * 4 + clickedCol;
            if (tileIndex !== emptyTileIndex) {
                slideTiles.push(tileIndex);
            }
        }
        slideTiles.sort((a, b) => emptyRow < clickedRow ? a - b : b - a);
    }

    slideTiles.forEach(tileIndex => {
        tiles[emptyTileIndex] = tiles[tileIndex];
        emptyTileIndex = tileIndex;
        tiles[tileIndex] = 0;
    });

    moveCount++;
    updateMoveDisplay();
    renderPuzzle();
    checkWin();
}



function isAdjacent(index1, index2) {
    const adjacentTiles = getAdjacentTiles(index1);
    return adjacentTiles.includes(index2);
}


function getAdjacentTiles(index) {
    const adjTiles = [];
    const directions = [
        [-1, 0], 
        [1, 0],  
        [0, -1], 
        [0, 1],  
    ];

    const row = Math.floor(index / 4);
    const col = index % 4;

    directions.forEach(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        const newIndex = newRow * 4 + newCol;

        if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
            adjTiles.push(newIndex);
        }
    });

    return adjTiles;
}

function checkWin() {
    let isSolved = tiles.every((tile, index) => tile === (index + 1) % 16);

    if (isSolved) {
        console.log("You Win!"); 
        displayWinModal();
        isGameRunning = false;
        clearInterval(timerInterval); 
    }
}


function startTimer() {
    timeElapsed = 0;
    timerInterval = setInterval(() => {
        timeElapsed++;
        timerDisplay.textContent = `Time: ${formatTime(timeElapsed)} seconds`;
    }, 1000); 
}

function resetTimer() {
    clearInterval(timerInterval); 
    timerDisplay.textContent = "Time: 00:00 seconds"; 
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

function displayWinModal() {
    console.log("Displaying Modal");

    if (!modal) {
        console.error('Modal element not found!');
        return;
    }

    winMessage.textContent = "You Win!";
    timeTakenElement.textContent = `Time Taken: ${formatTime(timeElapsed)} | Moves: ${moveCount}`;
    
    modal.classList.remove('hidden');
}

restartButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    initPuzzle(); 
    startTimer();
});

backToHomeFromModalButton.addEventListener('click', () => {
    modal.classList.add('hidden');
    gamePage.classList.add('hidden');
    homePage.classList.remove('hidden');
    startGameButton.disabled = true;
    backgroundMusic.pause();
    tiles = [];
    isGameRunning = false;
    resetTimer();
    moveCount = 0;
    location.reload(); // Reload the page to reset the game
});











































