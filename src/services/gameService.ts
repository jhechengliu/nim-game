export type Difficulty = 'random' | 'optimal'

export interface GameState {
  heaps: number[]
  currentPlayer: 'human' | 'ai'
  gameOver: boolean
  winner: 'human' | 'ai' | null
  maxTake: number | null
  misere: boolean
}

export interface Move {
  heapIndex: number
  count: number
}

function calculateNimSum(heaps: number[]): number {
  return heaps.reduce((sum, heap) => sum ^ heap, 0)
}

function isTerminalState(heaps: number[]): boolean {
  return heaps.every(heap => heap === 0)
}

export function makeMove(state: GameState, heapIndex: number, count: number): GameState {
  if (state.gameOver) return state
  if (heapIndex < 0 || heapIndex >= state.heaps.length) return state
  if (count <= 0 || count > state.heaps[heapIndex]) return state
  if (state.maxTake !== null && count > state.maxTake) return state

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

export function getOptimalMove(state: GameState, difficulty: Difficulty): Move | null {
  if (state.gameOver) return null

  if (difficulty === 'random') {
    // Find non-empty heaps
    const nonEmptyHeaps = state.heaps
      .map((size, index) => ({ size, index }))
      .filter(({ size }) => size > 0)

    if (nonEmptyHeaps.length === 0) return null

    // Pick a random heap
    const randomHeap = nonEmptyHeaps[Math.floor(Math.random() * nonEmptyHeaps.length)]
    const maxTake = state.maxTake !== null ? Math.min(randomHeap.size, state.maxTake) : randomHeap.size
    const count = Math.floor(Math.random() * maxTake) + 1

    return { heapIndex: randomHeap.index, count }
  }

  // Optimal play using nim-sum
  const nimSum = calculateNimSum(state.heaps)
  
  if (nimSum === 0) {
    // In a losing position, make a random move
    return getOptimalMove(state, 'random')
  }

  // Find a winning move
  for (let i = 0; i < state.heaps.length; i++) {
    const heapSize = state.heaps[i]
    const targetSize = heapSize ^ nimSum
    
    if (targetSize < heapSize) {
      const count = heapSize - targetSize
      if (state.maxTake === null || count <= state.maxTake) {
        return { heapIndex: i, count }
      }
    }
  }

  // Fallback to random move if no optimal move found
  return getOptimalMove(state, 'random')
} 