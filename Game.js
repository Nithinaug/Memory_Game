const ICONS = ['🍎', '🍌', '🍒', '🍓', '🥑', '🍍', '🥝', '🍉', '🍋', '🍐', '��', '🫐'];
const LOGO_CONTENT = '🎮'; 

let highScore = JSON.parse(localStorage.getItem('highscore')) || 0;
let round = 1;
let lives = 4;
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
    
    const numPairs = 4;
    const selectedIcons = ICONS.sort(() => Math.random() - 0.5).slice(0, numPairs);
    let gameIcons = [...selectedIcons, ...selectedIcons];
    gameIcons.sort(() => Math.random() - 0.5);
    
    // Add the wildcard card
    gameIcons.push(LOGO_CONTENT);
    gameIcons.sort(() => Math.random() - 0.5); // Shuffle again to hide position
    
    gameIcons.forEach((icon, index) => {
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card');
        cardContainer.dataset.icon = icon;
        
        if (icon === LOGO_CONTENT) {
            cardContainer.classList.add('logo-card');
        }

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
    
    // Wildcard Logic: 🎮 matches with ANYTHING
    const isWildcardMatch = (card1.dataset.icon === LOGO_CONTENT || card2.dataset.icon === LOGO_CONTENT);
    const isStandardMatch = (card1.dataset.icon === card2.dataset.icon);

    if (isWildcardMatch || isStandardMatch) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        
        // If matched with wildcard, we might have an odd card left eventually.
        // But for 9 cards, matching 4 pairs (8 cards) leaves 1. 
        // With wildcard, you match 2 cards even if they are different. 
        // Total matched will reach 8 cards (4 matches). The 9th will be left.
        // Actually, if you match wildcard with an 'apple', you still have one 'apple' left.
        // This means you'll need one more match with that 'apple'.
        // Wait, 9 cards = 4 pairs + 1 wildcard.
        // Total matches possible: 4 matches of 2 cards = 8 cards. 1 card extra.
        // Or if you match wildcard (1) with something (1), you have 7 cards left.
        // 7 cards = 3 pairs + 1 single.
        // You'll eventually have 1 pair match, then 1 pair match, then 1 pair match... 
        // Actually, the game ends when all cards that can be matched are matched.
        
        checkWin();
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

function checkWin() {
    const matchedCount = document.querySelectorAll('.card.matched').length;
    // For 9 cards, if 8 are matched, the 9th one is left over.
    // Or if 4 "matches" happened, we are done.
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
