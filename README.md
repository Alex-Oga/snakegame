# 🐍 Snake Game

A modern, visually polished Snake game built with HTML5 Canvas and JavaScript. Features smooth animations, glowing effects, and a sleek dark mode interface.

![Snake Game](https://img.shields.io/badge/Game-Snake-4ade80?style=flat-square)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow?style=flat-square)

## ✨ Features

- **Smooth Movement** - Fluid interpolated animation between grid positions
- **Modern Visuals** - Glowing effects, gradients, and a polished dark theme
- **Speed Selection** - Choose between Slow, Medium, or Fast before starting
- **Wrap-Around Walls** - Snake seamlessly teleports to the opposite side
- **Responsive Controls** - Input buffering for quick direction changes
- **Animated Snake** - Round segments with eyes that follow movement direction

## 🎮 Controls

| Key | Action |
|-----|--------|
| ↑ ↓ | Select speed (start screen) / Move up/down |
| ← → | Move left/right |
| Enter | Start / Restart game |
| P / Space | Pause / Resume |

## 🚀 Getting Started

### Option 1: Open directly
Simply open `index.html` in any modern web browser.

### Option 2: Local server
```bash
cd snakegame
python3 -m http.server 8080
# Then visit http://localhost:8080
```

## 📁 Project Structure

```
snakegame/
├── index.html    # Game HTML structure
├── style.css     # Dark mode styling & animations
├── game.js       # Game logic & rendering
├── PRD.md        # Product requirements document
└── README.md     # This file
```

## 🎨 Visual Design

- **Background**: Dark gradient (#0f172a → #1e293b)
- **Snake**: Glowing green with gradient segments (#4ade80)
- **Food**: Pulsing red orb (#ef4444)
- **UI**: Glass-morphism effects with subtle borders

## 🕹️ Gameplay

1. Select your preferred speed using ↑/↓ arrows
2. Press Enter to start
3. Guide the snake to eat the red food
4. Each food eaten adds +10 points and grows the snake
5. Avoid colliding with yourself!
6. Snake wraps around screen edges

## 📋 Requirements

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No dependencies or installation required

## 📄 License

MIT License - feel free to use and modify!
