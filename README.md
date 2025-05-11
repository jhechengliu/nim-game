# Nim Game

## Overview

This project is a reference implementation of the classic impartial‑combinatorial game **Nim**. It includes a fully‑functional command‑line version, an optional web UI, and a provably optimal computer opponent based on the nim‑sum algorithm.

## Features

* Two‑player local or Human vs AI play
* Any number of heaps with user‑defined sizes
* Optimal, O(h)‑time AI using Sprague–Grundy theory
* Optional rule toggles: misère play and maximum‑take restriction
* Clean separation of UI, game logic, and AI layers
* 95%+ unit‑test coverage
* Modern web interface with Material-UI components

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
|-- src/     Core game logic and AI
|-- ui/      Web front‑end (React + TypeScript)
|-- tests/   PyTest unit tests
|-- docs/    Design notes and variant analysis
```

## Requirements

* Python ≥ 3.9
* Node.js ≥ 18
* npm ≥ 9

## Installation

### Command‑Line Version

```bash
$ git clone https://example.com/nim‑game.git
$ cd nim‑game
$ python -m venv .venv && source .venv/bin/activate
$ pip install -r requirements.txt
```

### Web UI

1. Install Node.js and npm:
   - Visit https://nodejs.org/
   - Download and install the LTS version
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. Install UI dependencies:
   ```bash
   $ cd ui
   $ npm install
   ```

## Running

### Command‑Line Version

```bash
$ python -m nim_game.cli --heaps 3 4 5 --mode human‑vs‑ai
```

### Web UI

1. Start the development server:
   ```bash
   $ cd ui
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
  - Custom heap sizes
  - Optional maximum take restriction
  - Misère play toggle
* Real-time game state updates
* Clear game over notifications

## Testing

```bash
$ pytest -q
```

## Contributing

1. Fork the repository and create a feature branch.
2. Adhere to PEP 8; run `black` and `isort` before committing.
3. Include unit tests for all new logic.
4. Submit a pull request with a concise description of changes.

## License

Released under the MIT License. See `LICENSE` for full text.

## Acknowledgments

* Charles L. Bouton for the original Nim theorem (1901).
* Surén Arakelov and John Conway for subsequent impartial‑game theory advances. 