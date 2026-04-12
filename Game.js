const ICONS = ['🍎', '🍌', '🍒', '🍓', '🥑', '🍍', '🥝', '🍉', '🍋', '🍐', '��', '🫐'];

let highScore = JSON.parse(localStorage.getItem('highscore')) || 0;
let round = 1;
let lives = 4;
let flippedCards = [];
let matchedPairs = 0;
let isChecking = false;
let wildcardIcon = '';

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
    lives = 4;
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
    
    // Shuffle all icons
    const shuffledIcons = [...ICONS].sort(() => Math.random() - 0.5);
    
    // Pick 4 icons for the 4 pairs
    const selectedPairs = shuffledIcons.slice(0, 4);
    // Pick 1 different icon for the wildcard
    wildcardIcon = shuffledIcons[4];
    
    let gameIcons = [...selectedPairs, ...selectedPairs, wildcardIcon];
    gameIcons.sort(() => Math.random() - 0.5);
    
    gameIcons.forEach((icon, index) => {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card');
        cardContainer.dataset.icon = icon;
        
        cardContainer.innerHTML = `
            <div class="card-face card-front"></div>
            <div class="card-face card-back">${icon}</div>
        `;
        
        cardContainer.addEventListener('click', () => flipCard(cardContainer));
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
    
    // Wildcard Logic: wildcardIcon matches with ANYTHING
    const isWildcardMatch = (card1.dataset.icon === wildcardIcon || card2.dataset.icon === wildcardIcon);
    const isStandardMatch = (card1.dataset.icon === card2.dataset.icon);

    if (isWildcardMatch || isStandardMatch) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        
        checkWin();
    } else {
        lives--;
        updateDisplay();
        if (livesReachZero()) {
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

function livesReachZero() {
    return lives <= 0;
}

function checkWin() {
    if (matchedPairs === 4) {
        setTimeout(() => {
            showModal('Cleared!', `Round ${round} Complete`, () => {
                round++;
                updateHighScore();
                initGame();
            });
        }, 500);
    }
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
