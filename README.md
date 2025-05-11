# Nim Game

## Overview

This project is a modern web implementation of the classic impartial‑combinatorial game **Nim**. It features a beautiful Material-UI interface and a provably optimal computer opponent based on the nim‑sum algorithm.

## Features

* Human vs AI gameplay
* Configurable number of heaps with user‑defined sizes
* Optimal AI using Sprague–Grundy theory
* Game mode options: normal play and misère play
* Maximum‑take restriction option
* Modern, responsive web interface
* Dark theme for comfortable viewing

## Rules (Normal Play)

1. Start with *n* distinct heaps, each containing a positive number of objects.
2. Players alternate turns. On a turn a player selects **exactly one** heap and removes one or more objects from it (up to the whole heap).
3. The player who removes the last object **wins**.

## Optimal‑Play Algorithm

1. Express each heap size in binary; compute the **nim‑sum** (bitwise XOR) of all heap sizes.
2. If nim‑sum = 0, the position is a *P‑position*; the side to move will lose with optimal play.
3. Otherwise, identify a heap where `(heap ⊕ nim‑sum) < heap` and remove the difference, leaving a P‑position.

The algorithm runs in linear time in the number of heaps and constant space.

## Project Structure

```
/            Project root
|-- web/     Web front‑end (React + TypeScript)
    |-- src/
        |-- components/    React components
        |-- services/      Game logic and AI
```

## Requirements

* Node.js ≥ 18
* npm ≥ 9

## Installation

1. Install Node.js and npm:
   - Visit https://nodejs.org/
   - Download and install the LTS version
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. Install project dependencies:
   ```bash
   $ git clone https://example.com/nim‑game.git
   $ cd nim-game/web
   $ npm install
   ```

## Running

1. Start the development server:
   ```bash
   $ cd web
   $ npm run dev
   ```

2. Open your browser and navigate to:
   http://localhost:5173

3. To stop the server, press `Ctrl + C` in the terminal.

## Web UI Features

* Modern, responsive design using Material-UI
* Dark theme for comfortable viewing
* Interactive heap visualization
* Configurable game settings:
  - Number of heaps (3-5)
  - Optional maximum take restriction
  - Misère play toggle
  - AI difficulty levels (Random/Optimal)
* Real-time game state updates
* Clear game over notifications
* Intuitive controls:
  - Click heap to select
  - Use +/- buttons to adjust count
  - Click anywhere to deselect

## Contributing

1. Fork the repository and create a feature branch.
2. Follow TypeScript best practices
3. Include tests for new features
4. Submit a pull request with a concise description of changes.

## License

Released under the MIT License. See `LICENSE` for full text.

## Acknowledgments

* Charles L. Bouton for the original Nim theorem (1901).
* Surén Arakelov and John Conway for subsequent impartial‑game theory advances. 