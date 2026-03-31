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
let interpolation = 0; // For smooth movement (0 to 1)

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
            handleStartScreenInput(e);
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

// Handle input on start screen (speed selection)
function handleStartScreenInput(e) {
    const speedOptions = ['slow', 'medium', 'fast'];
    const currentIndex = speedOptions.indexOf(speed);
    
    switch (e.key) {
        case 'ArrowUp':
            if (currentIndex > 0) {
                speed = speedOptions[currentIndex - 1];
                updateSpeedSelection();
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (currentIndex < speedOptions.length - 1) {
                speed = speedOptions[currentIndex + 1];
                updateSpeedSelection();
            }
            e.preventDefault();
            break;
        case 'Enter':
            startGame();
            break;
    }
}

// Update radio button selection to match current speed
function updateSpeedSelection() {
    speedInputs.forEach(input => {
        input.checked = (input.value === speed);
    });
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
        const moveInterval = SPEEDS[speed];

        if (elapsed >= moveInterval) {
            update();
            lastMoveTime = timestamp;
            interpolation = 0;
        } else {
            // Calculate interpolation for smooth movement
            interpolation = elapsed / moveInterval;
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

// Helper function to check if two segments are adjacent (handling wrap-around)
function areSegmentsAdjacent(seg1, seg2) {
    const dx = Math.abs(seg1.x - seg2.x);
    const dy = Math.abs(seg1.y - seg2.y);
    // Adjacent if diff is 1, or if wrapping (diff is GRID_SIZE - 1)
    const adjX = dx <= 1 || dx === GRID_SIZE - 1;
    const adjY = dy <= 1 || dy === GRID_SIZE - 1;
    return adjX && adjY && (dx + dy <= 2);
}

// Check if head is about to wrap
function isHeadWrapping() {
    if (snake.length === 0) return false;
    const head = snake[0];
    const nextX = head.x + direction.x;
    const nextY = head.y + direction.y;
    return nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE;
}

// Check if segments are on opposite sides (wrapped)
function segmentsAreWrapped(seg1, seg2) {
    const dx = Math.abs(seg1.x - seg2.x);
    const dy = Math.abs(seg1.y - seg2.y);
    return dx > 1 || dy > 1;
}

// Helper function to get interpolated position
function getInterpolatedPosition(segment, index) {
    // Don't interpolate during wrap-around
    if (index === 0 && gameState === 'playing' && !isHeadWrapping()) {
        // Interpolate head position based on direction
        return {
            x: segment.x * CELL_SIZE + direction.x * CELL_SIZE * interpolation,
            y: segment.y * CELL_SIZE + direction.y * CELL_SIZE * interpolation
        };
    } else if (index > 0 && index < snake.length && gameState === 'playing') {
        const prev = snake[index - 1];
        
        // Don't interpolate if wrapped
        if (segmentsAreWrapped(segment, prev)) {
            return {
                x: segment.x * CELL_SIZE,
                y: segment.y * CELL_SIZE
            };
        }
        
        // Interpolate body towards previous segment
        const dx = prev.x - segment.x;
        const dy = prev.y - segment.y;
        
        return {
            x: segment.x * CELL_SIZE + dx * CELL_SIZE * interpolation,
            y: segment.y * CELL_SIZE + dy * CELL_SIZE * interpolation
        };
    }
    
    return {
        x: segment.x * CELL_SIZE,
        y: segment.y * CELL_SIZE
    };
}

// Render the game
function render() {
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw food with glow effect and pulse animation
    const foodPulse = Math.sin(Date.now() / 300) * 2 + 8;
    const foodGradient = ctx.createRadialGradient(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        2,
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2
    );
    foodGradient.addColorStop(0, '#ef4444');
    foodGradient.addColorStop(0.7, '#dc2626');
    foodGradient.addColorStop(1, '#991b1b');
    
    ctx.shadowBlur = foodPulse + 10;
    ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw snake with smooth, connected segments
    if (snake.length > 0) {
        // Draw connecting lines between segments (skip wrap-around connections)
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = CELL_SIZE * 0.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(74, 222, 128, 0.6)';
        
        ctx.beginPath();
        let pathStarted = false;
        
        snake.forEach((segment, index) => {
            const pos = getInterpolatedPosition(segment, index);
            const centerX = pos.x + CELL_SIZE / 2;
            const centerY = pos.y + CELL_SIZE / 2;
            
            if (index === 0) {
                ctx.moveTo(centerX, centerY);
                pathStarted = true;
            } else {
                // Check if this segment is wrapping around (grid distance > 1)
                const prevSeg = snake[index - 1];
                const dx = Math.abs(segment.x - prevSeg.x);
                const dy = Math.abs(segment.y - prevSeg.y);
                const isWrapping = dx > 1 || dy > 1;
                
                if (isWrapping) {
                    // Start a new path segment (don't connect across wrap)
                    ctx.moveTo(centerX, centerY);
                } else {
                    ctx.lineTo(centerX, centerY);
                }
            }
        });
        ctx.stroke();
        
        // Draw circular segments on top
        snake.forEach((segment, index) => {
            const pos = getInterpolatedPosition(segment, index);
            const centerX = pos.x + CELL_SIZE / 2;
            const centerY = pos.y + CELL_SIZE / 2;
            const isHead = index === 0;
            const radius = CELL_SIZE / 2 - 1;
            
            if (isHead) {
                // Head with brighter glow and larger size
                const headGradient = ctx.createRadialGradient(
                    centerX, centerY, 2,
                    centerX, centerY, radius + 2
                );
                headGradient.addColorStop(0, '#86efac');
                headGradient.addColorStop(0.6, '#4ade80');
                headGradient.addColorStop(1, '#22c55e');
                
                ctx.shadowBlur = 25;
                ctx.shadowColor = 'rgba(74, 222, 128, 0.9)';
                ctx.fillStyle = headGradient;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius + 1, 0, Math.PI * 2);
                ctx.fill();
                
                // Add eyes to head
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#0f172a';
                const eyeOffset = radius * 0.4;
                const eyeSize = radius * 0.25;
                
                // Determine eye position based on direction
                let eyeX1, eyeY1, eyeX2, eyeY2;
                if (direction === DIRECTIONS.right || direction === DIRECTIONS.left) {
                    eyeX1 = centerX + (direction.x * eyeOffset || eyeOffset);
                    eyeY1 = centerY - eyeOffset / 2;
                    eyeX2 = centerX + (direction.x * eyeOffset || eyeOffset);
                    eyeY2 = centerY + eyeOffset / 2;
                } else {
                    eyeX1 = centerX - eyeOffset / 2;
                    eyeY1 = centerY + (direction.y * eyeOffset || eyeOffset);
                    eyeX2 = centerX + eyeOffset / 2;
                    eyeY2 = centerY + (direction.y * eyeOffset || eyeOffset);
                }
                
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, eyeSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(eyeX2, eyeY2, eyeSize, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Body with subtle glow
                const bodyGradient = ctx.createRadialGradient(
                    centerX, centerY, 2,
                    centerX, centerY, radius
                );
                bodyGradient.addColorStop(0, '#4ade80');
                bodyGradient.addColorStop(0.7, '#22c55e');
                bodyGradient.addColorStop(1, '#16a34a');
                
                ctx.shadowBlur = 12;
                ctx.shadowColor = 'rgba(74, 222, 128, 0.5)';
                ctx.fillStyle = bodyGradient;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    ctx.shadowBlur = 0;
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
