// Game Constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

// Speed settings (ms between moves)
const SPEEDS = {
    slow: 200,
    medium: 120,
    fast: 80
};

// Colors
const COLORS = {
    background: '#2d2d2d',
    grid: '#3d3d3d',
    snakeHead: '#86efac',
    snakeBody: '#4ade80',
    food: '#ef4444'
};

// Direction vectors
const DIRECTIONS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};

// Game state
let gameState = 'start'; // start, playing, paused, gameover
let snake = [];
let food = { x: 0, y: 0 };
let direction = DIRECTIONS.right;
let inputQueue = []; // Queue for buffering multiple rapid inputs
let score = 0;
let speed = 'medium';
let lastMoveTime = 0;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const pauseOverlay = document.getElementById('pause-overlay');
const gameoverScreen = document.getElementById('gameover-screen');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const speedDisplay = document.getElementById('speed-display');
const finalScore = document.getElementById('final-score');
const speedInputs = document.querySelectorAll('input[name="speed"]');

// Initialize the game
function init() {
    // Set up event listeners
    document.addEventListener('keydown', handleKeyDown);
    speedInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            speed = e.target.value;
        });
    });

    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Handle keyboard input
function handleKeyDown(e) {
    switch (gameState) {
        case 'start':
            if (e.key === 'Enter') {
                startGame();
            }
            break;

        case 'playing':
            handleGameInput(e);
            break;

        case 'paused':
            if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
                resumeGame();
            }
            break;

        case 'gameover':
            if (e.key === 'Enter') {
                showStartScreen();
            }
            break;
    }
}

// Handle input during gameplay
function handleGameInput(e) {
    let newDirection = null;
    
    switch (e.key) {
        case 'ArrowUp':
            newDirection = DIRECTIONS.up;
            e.preventDefault();
            break;

        case 'ArrowDown':
            newDirection = DIRECTIONS.down;
            e.preventDefault();
            break;

        case 'ArrowLeft':
            newDirection = DIRECTIONS.left;
            e.preventDefault();
            break;

        case 'ArrowRight':
            newDirection = DIRECTIONS.right;
            e.preventDefault();
            break;

        case 'p':
        case 'P':
        case ' ':
            pauseGame();
            e.preventDefault();
            break;
    }
    
    // Add to input queue if valid direction change
    if (newDirection) {
        const lastDirection = inputQueue.length > 0 ? inputQueue[inputQueue.length - 1] : direction;
        
        // Prevent 180-degree turns and duplicate inputs
        if ((newDirection === DIRECTIONS.up && lastDirection !== DIRECTIONS.down) ||
            (newDirection === DIRECTIONS.down && lastDirection !== DIRECTIONS.up) ||
            (newDirection === DIRECTIONS.left && lastDirection !== DIRECTIONS.right) ||
            (newDirection === DIRECTIONS.right && lastDirection !== DIRECTIONS.left)) {
            
            // Only add if different from last queued direction
            if (newDirection !== lastDirection) {
                inputQueue.push(newDirection);
                // Limit queue size to prevent excessive buffering
                if (inputQueue.length > 3) {
                    inputQueue.shift();
                }
            }
        }
    }
}

// Start a new game
function startGame() {
    // Initialize snake in the center
    const centerX = Math.floor(GRID_SIZE / 2);
    const centerY = Math.floor(GRID_SIZE / 2);
    snake = [
        { x: centerX, y: centerY },
        { x: centerX - 1, y: centerY },
        { x: centerX - 2, y: centerY }
    ];

    // Reset game state
    direction = DIRECTIONS.right;
    inputQueue = [];
    score = 0;
    lastMoveTime = 0;

    // Spawn food
    spawnFood();

    // Update UI
    updateScore();
    speedDisplay.textContent = `Speed: ${speed.charAt(0).toUpperCase() + speed.slice(1)}`;

    // Show game screen
    showScreen('playing');
}

// Spawn food at random location
function spawnFood() {
    let validPosition = false;

    while (!validPosition) {
        food.x = Math.floor(Math.random() * GRID_SIZE);
        food.y = Math.floor(Math.random() * GRID_SIZE);

        // Check if food is on snake
        validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

// Main game loop
function gameLoop(timestamp) {
    if (gameState === 'playing') {
        const elapsed = timestamp - lastMoveTime;

        if (elapsed >= SPEEDS[speed]) {
            update();
            lastMoveTime = timestamp;
        }
    }

    render();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Apply next direction from queue
    if (inputQueue.length > 0) {
        direction = inputQueue.shift();
    }

    // Calculate new head position
    const head = snake[0];
    let newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
    };

    // Wrap around boundaries
    if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
    if (newHead.x >= GRID_SIZE) newHead.x = 0;
    if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
    if (newHead.y >= GRID_SIZE) newHead.y = 0;

    // Check self-collision
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return;
    }

    // Add new head
    snake.unshift(newHead);

    // Check if food eaten
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        updateScore();
        spawnFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Render the game
function render() {
    // Clear canvas with solid fill (faster than clearRect)
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw food
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(
        food.x * CELL_SIZE + 2,
        food.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
    );

    // Draw snake (batch operations for better performance)
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snakeBody;
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
    });
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

// Pause the game
function pauseGame() {
    gameState = 'paused';
    pauseOverlay.classList.remove('hidden');
}

// Resume the game
function resumeGame() {
    gameState = 'playing';
    pauseOverlay.classList.add('hidden');
    lastMoveTime = performance.now();
}

// Game over
function gameOver() {
    gameState = 'gameover';
    finalScore.textContent = `Final Score: ${score}`;
    showScreen('gameover');
}

// Show start screen
function showStartScreen() {
    showScreen('start');
}

// Show the appropriate screen
function showScreen(screen) {
    gameState = screen;

    startScreen.classList.toggle('hidden', screen !== 'start');
    gameScreen.classList.toggle('hidden', screen !== 'playing' && screen !== 'paused');
    gameoverScreen.classList.toggle('hidden', screen !== 'gameover');
    pauseOverlay.classList.add('hidden');
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', init);
