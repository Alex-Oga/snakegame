# Snake Game - Product Requirements Document (PRD)

## Overview

A classic Snake video game where the player maneuvers a growing line (themed as a snake) using arrow keys. The player must avoid collisions with the snake's own body while collecting food to grow longer.

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (vanilla)
- **Rendering**: HTML5 Canvas API
- **Storage**: None required (no high score persistence)
- **Platform**: Local browser-based (no server required)

## Core Requirements

### 1. Game Mechanics

| Requirement | Description |
|-------------|-------------|
| **Movement** | Snake moves continuously in current direction |
| **Controls** | Arrow keys (↑ ↓ ← →) to change direction |
| **Growth** | Snake grows by 1 segment when eating food |
| **Collision** | Game ends only on self-collision |
| **Boundaries** | Wrap-around (snake exits one side, enters opposite) |
| **Food Spawn** | Random position, never on snake body |

### 2. Game States

1. **Start Screen** - Title, speed selector, "Press any key to start"
2. **Playing** - Active gameplay
3. **Paused** - Press 'P' or 'Space' to pause/resume
4. **Game Over** - Final score, "Press any key to restart"

### 3. Speed Options

Available at start screen before game begins:

| Speed | Interval | Description |
|-------|----------|-------------|
| Slow | 200ms | Casual/beginner friendly |
| Medium | 120ms | Classic feel (default) |
| Fast | 80ms | Challenging |

### 4. Visual Design

#### Theme: Dark Mode

| Element | Color |
|---------|-------|
| Background | Dark gray (#1a1a1a) |
| Game board | Slightly lighter (#2d2d2d) |
| Snake body | Bright green (#4ade80) |
| Snake head | Lighter green (#86efac) |
| Food | Red (#ef4444) |
| Text/UI | White (#ffffff) |
| Grid lines | Subtle (#3d3d3d) - optional |

#### Layout

- Centered game canvas
- Score display above or below canvas
- Current speed indicator
- Clean, minimal UI

### 5. Game Grid

- **Grid size**: 20 x 20 cells
- **Cell size**: 20px x 20px
- **Canvas size**: 400px x 400px
- **Snake style**: Classic rectangles/squares

### 6. Scoring

- **Points per food**: +10 points
- **Display**: Current score only (no high score tracking)
- **Starting score**: 0

### 7. Initial Game State

- Snake starting length: 3 segments
- Snake starting position: Center of grid
- Snake starting direction: Right
- Initial food: Random position (not on snake)

## User Interface Elements

### Start Screen
```
┌─────────────────────────────┐
│                             │
│         🐍 SNAKE 🐍         │
│                             │
│     Select Speed:           │
│     [ ] Slow                │
│     [●] Medium              │
│     [ ] Fast                │
│                             │
│   Press ENTER to Start      │
│                             │
└─────────────────────────────┘
```

### Game Screen
```
┌─────────────────────────────┐
│  Score: 50    Speed: Medium │
├─────────────────────────────┤
│                             │
│    ■■■■■►                   │
│                             │
│              ●              │
│                             │
└─────────────────────────────┘
│      Press P to Pause       │
└─────────────────────────────┘
```

### Game Over Screen
```
┌─────────────────────────────┐
│                             │
│        GAME OVER            │
│                             │
│      Final Score: 120       │
│                             │
│   Press ENTER to Restart    │
│                             │
└─────────────────────────────┘
```

## Controls Reference

| Key | Action |
|-----|--------|
| ↑ | Move up |
| ↓ | Move down |
| ← | Move left |
| → | Move right |
| P / Space | Pause/Resume |
| Enter | Start/Restart game |

## Technical Specifications

### File Structure
```
snakegame/
├── index.html      # Main HTML file
├── style.css       # Dark mode styling
└── game.js         # Game logic
```

### Key Functions to Implement

1. **Game Loop** - requestAnimationFrame with speed-based timing
2. **Snake Movement** - Queue-based segment management
3. **Collision Detection** - Self-collision check
4. **Wrap-around Logic** - Boundary position recalculation
5. **Food Generation** - Random placement avoiding snake
6. **Input Handling** - Keyboard event listeners
7. **Rendering** - Canvas draw operations
8. **State Management** - Game state machine

## Out of Scope

- Sound effects / music
- High score persistence
- Multiple players
- Power-ups or obstacles
- Mobile touch controls
- Difficulty progression during gameplay
- Leaderboards

## Success Criteria

1. ✅ Game loads and displays start screen
2. ✅ Speed can be selected before starting
3. ✅ Arrow keys control snake movement smoothly
4. ✅ Snake grows when eating food
5. ✅ Snake wraps around screen edges
6. ✅ Game ends on self-collision
7. ✅ Score displays and updates correctly
8. ✅ Pause/resume functionality works
9. ✅ Game can be restarted after game over
10. ✅ Dark mode theme applied throughout

---

*This PRD is intended for implementation agents to reference when building the Snake game.*
