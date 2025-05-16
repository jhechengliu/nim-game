/**
 * Game state management and move validation
 */

export type Difficulty = 'random' | 'optimal'
export type FirstMove = 'player' | 'ai' | 'random'

export interface GameState {
  heaps: number[]
  currentPlayer: 'human' | 'ai' | 'player1' | 'player2'
  gameOver: boolean
  winner: 'human' | 'ai' | 'player1' | 'player2' | null
  maxTake: number
  misere: boolean
  baseHeapSize: number
}

export interface Move {
  heapIndex: number
  count: number
}

/**
 * Check if a move is valid for the current game state
 */
export function isValidMove(state: GameState, heapIndex: number, count: number): boolean {
  if (state.gameOver) return false
  if (heapIndex < 0 || heapIndex >= state.heaps.length) return false
  if (count < 1 || count > Math.min(3, state.heaps[heapIndex])) return false
  return true
}

/**
 * Check if the game is in a terminal state (all heaps empty)
 */
function isTerminalState(heaps: number[]): boolean {
  return heaps.every(heap => heap === 0)
}

/**
 * Make a move in the game and update the state
 */
export function makeMove(state: GameState, heapIndex: number, count: number): GameState {
  if (!isValidMove(state, heapIndex, count)) return state

  const newHeaps = [...state.heaps]
  newHeaps[heapIndex] -= count

  const isTerminal = isTerminalState(newHeaps)
  const currentPlayer = state.currentPlayer
  const nextPlayer = currentPlayer === 'human' ? 'ai' : 'human'

  // In normal mode, the player who takes the last object wins
  // In misère mode, the player who takes the last object loses
  const winner = isTerminal 
    ? (state.misere ? nextPlayer : currentPlayer)
    : null

  return {
    ...state,
    heaps: newHeaps,
    currentPlayer: nextPlayer,
    gameOver: isTerminal,
    winner
  }
}

/**
 * Create a new game state with the given configuration
 */
export function createGameState(
  baseHeapSize: number,
  firstMove: FirstMove,
  misere: boolean = false
): GameState {
  // Create heaps with n, n+1, n+2 balls
  const heaps = [
    baseHeapSize,
    baseHeapSize + 1,
    baseHeapSize + 2
  ]

  // Determine who moves first
  let currentPlayer: 'human' | 'ai' = 'human'
  if (firstMove === 'ai') {
    currentPlayer = 'ai'
  } else if (firstMove === 'random') {
    currentPlayer = Math.random() < 0.5 ? 'human' : 'ai'
  }

  return {
    heaps,
    currentPlayer,
    gameOver: false,
    winner: null,
    maxTake: 3,
    misere,
    baseHeapSize
  }
} 