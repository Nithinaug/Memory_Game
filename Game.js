const ICONS = ['🍎', '🍌', '🍒', '🍓', '🥑', '🍍', '🥝', '🍉', '🍋', '🍐', '��', '🫐'];

let highScore = JSON.parse(localStorage.getItem('highscore')) || 0;
let round = 1;
let lives = 4;
let flippedCards = [];
let matchedPairs = 0;
let isChecking = false;
let wildcardIcon = '';

function play() { location.href = 'Main.html'; }
function start() { location.href = 'Gamepage.html'; }
function gohome() { location.href = 'Home.html'; }
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

    if (livesEl) livesEl.innerText = `Lives: ${lives}`;
    if (highscoreEl) highscoreEl.innerText = `Highscore: ${highScore}`;
    if (roundEl) roundEl.innerText = `Round: ${round}`;
}

function createBoard() {
    const grid = document.getElementById('grid-container');
    if (!grid) return;
    grid.innerHTML = '';

    const shuffledIcons = [...ICONS].sort(() => Math.random() - 0.5);
    const selectedFruits = shuffledIcons.slice(0, 4);
    wildcardIcon = shuffledIcons[4];
    let gameIcons = [...selectedFruits, ...selectedFruits];
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
    if (isChecking || flippedCards.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
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
    if (flippedCards.length !== 2) {
        isChecking = false;
        return;
    }

    const [card1, card2] = flippedCards;

    const isWildcardMatch = (card1.dataset.icon === wildcardIcon || card2.dataset.icon === wildcardIcon);
    const isStandardMatch = (card1.dataset.icon === card2.dataset.icon);

    if (isWildcardMatch || isStandardMatch) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;

        if (matchedPairs === 4) {
            setTimeout(() => {
                showModal('Winner!', `Round ${round} Complete`, () => {
                    round++;
                    updateHighScore();
                    initGame();
                });
            }, 500);
        }
        isChecking = false;
        flippedCards = [];
    } else {
        lives--;
        updateDisplay();
        if (lives <= 0) {
            showModal('Game Over', `You reached Round ${round}`, () => {
                round = 1;
                initGame();
            });
            isChecking = false;
            flippedCards = [];
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                isChecking = false;
            }, 1000);
        }
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
        const highscoreEl = document.getElementById('highscore');
        if (highscoreEl) highscoreEl.innerText = `Highscore: ${highScore}`;
    }
}
