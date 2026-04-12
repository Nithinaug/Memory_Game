const ICONS = ['🍎', '🍌', '🍒', '🍓', '🥑', '🍍', '🥝', '🍉', '🍋', '🍐', '��', '🫐'];
const LOGO_CONTENT = '🎮'; // Decorative card for the 9th slot

let highScore = JSON.parse(localStorage.getItem('highscore')) || 0;
let round = 1;
let lives = 3;
let flippedCards = [];
let matchedPairs = 0;
let isChecking = false;

// Navigation
function play() {
    location.href = 'Main.html';
}

function start() {
    location.href = 'Gamepage.html';
}

function gohome() {
    location.href = 'Home.html';
}

// Initialization
window.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid-container');
    if (grid) {
        initGame();
    }
});

function initGame() {
    lives = 3;
    matchedPairs = 0;
    flippedCards = [];
    isChecking = false;
    
    updateDisplay();
    createBoard();
}

function updateDisplay() {
    const roundEl = document.getElementById('round');
    const livesEl = document.getElementById('lives');
    const highscoreEl = document.getElementById('highscore');

    if (roundEl) roundEl.innerText = `Round: ${round}`;
    if (livesEl) livesEl.innerText = `Lives: ${lives}`;
    if (highscoreEl) highscoreEl.innerText = `Highscore: ${highScore}`;
}

function createBoard() {
    const grid = document.getElementById('grid-container');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // 3x3 Grid = 9 slots. 
    // We'll use 4 pairs (8 cards) + 1 logo card to fill the space.
    const numPairs = 4;
    const selectedIcons = ICONS.sort(() => Math.random() - 0.5).slice(0, numPairs);
    let gameIcons = [...selectedIcons, ...selectedIcons];
    gameIcons.sort(() => Math.random() - 0.5);
    
    // Insert the logo card in the last position (or random)
    gameIcons.push(LOGO_CONTENT);
    
    gameIcons.forEach((icon, index) => {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card');
        cardContainer.dataset.icon = icon;
        
        if (icon === LOGO_CONTENT) {
            cardContainer.classList.add('logo-card');
            cardContainer.innerHTML = `
                <div class="card-face card-front">${icon}</div>
                <div class="card-face card-back">${icon}</div>
            `;
        } else {
            cardContainer.innerHTML = `
                <div class="card-face card-front"></div>
                <div class="card-face card-back">${icon}</div>
            `;
            cardContainer.addEventListener('click', () => flipCard(cardContainer));
        }
        
        grid.appendChild(cardContainer);
    });
}

function flipCard(card) {
    if (isChecking || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }
    
    card.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        isChecking = true;
        setTimeout(checkForMatch, 600);
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.icon === card2.dataset.icon) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        
        if (matchedPairs === 4) {
            setTimeout(() => {
                showModal('Cleared!', `Round ${round} Complete`, () => {
                    round++;
                    updateHighScore();
                    initGame();
                });
            }, 500);
        }
    } else {
        lives--;
        updateDisplay();
        if (lives === 0) {
            showModal('Game Over', `You reached Round ${round}`, () => {
                round = 1;
                initGame();
            });
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 800);
        }
    }
    
    flippedCards = [];
    isChecking = false;
}

function showModal(title, text, callback) {
    let modal = document.getElementById('game-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'game-modal';
        modal.classList.add('modal');
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${title}</h2>
            <p>${text}</p>
            <button class="modal-button" id="modal-btn">Continue</button>
        </div>
    `;
    
    modal.style.display = 'block';
    
    const btn = document.getElementById('modal-btn');
    btn.onclick = () => {
        modal.style.display = 'none';
        if (callback) callback();
    };
}

function updateHighScore() {
    if (round > highScore) {
        highScore = round;
        localStorage.setItem('highscore', JSON.stringify(highScore));
        updateDisplay();
    }
}
