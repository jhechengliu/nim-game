/**
 * AI strategies and optimal play implementation
 */

import { GameState, Move, Difficulty } from './gameState'

/**
 * Calculate the nim-sum (bitwise XOR) of all heap sizes
 */
function calculateNimSum(heaps: number[]): number {
  return heaps.reduce((sum, heap) => sum ^ heap, 0)
}

/**
 * Check if all heaps are of size 0 or 1 (endgame condition)
 */
function isEndgame(heaps: number[]): boolean {
  return heaps.every(heap => heap <= 1)
}

/**
 * Count heaps of size 1
 */
function countHeapsOfSizeOne(heaps: number[]): number {
  return heaps.filter(heap => heap === 1).length
}

/**
 * Find the optimal move for normal play using nim-sum strategy
 */
function findOptimalNormalMove(heaps: number[]): Move | null {
  const nimSum = calculateNimSum(heaps)
  
  // If nim-sum is 0, any move will lead to a losing position
  if (nimSum === 0) {
    // Find the largest heap to make the game last longer
    const maxHeap = Math.max(...heaps)
    const heapIndex = heaps.indexOf(maxHeap)
    return { heapIndex, count: 1 }
  }

  // Find a heap where (heap ⊕ nim-sum) < heap
  for (let i = 0; i < heaps.length; i++) {
    const heap = heaps[i]
    const targetSize = heap ^ nimSum
    if (targetSize < heap) {
      return { heapIndex: i, count: heap - targetSize }
    }
  }

  return null
}

/**
 * Find the optimal move for misère play
 * Uses a special strategy that differs from normal play
 */
function findOptimalMisereMove(heaps: number[]): Move | null {
  // Count non-empty heaps
  const nonEmptyHeaps = heaps.filter(heap => heap > 0)
  const nonEmptyCount = nonEmptyHeaps.length

  // If only one heap remains, take all but one object (or 1 if only 1 left)
  if (nonEmptyCount === 1) {
    const heapIndex = heaps.findIndex(heap => heap > 0)
    if (heaps[heapIndex] === 1) {
      return { heapIndex, count: 1 }
    } else {
      return { heapIndex, count: heaps[heapIndex] - 1 }
    }
  }

  // If all heaps are of size 1, take a whole heap if count is odd
  if (isEndgame(heaps)) {
    const onesCount = countHeapsOfSizeOne(heaps)
    if (onesCount % 2 === 1) {
      const heapIndex = heaps.findIndex(heap => heap === 1)
      if (heapIndex !== -1) {
        return { heapIndex, count: 1 }
      }
    }
  }

  // If only one heap > 1, take from it so that after your move, the number of heaps of size 1 is even
  const heapsGT1 = heaps.filter(h => h > 1)
  if (heapsGT1.length === 1) {
    const heapIndex = heaps.findIndex(h => h > 1)
    const ones = heaps.filter(h => h === 1).length
    // We want to leave an even number of 1s after our move
    // So, leave (ones % 2 === 0 ? 1 : 0) in the heap
    let leave = (ones % 2 === 0 ? 1 : 0)
    let take = heaps[heapIndex] - leave
    if (take < 1) take = 1
    return { heapIndex, count: take }
  }

  // For positions with multiple heaps of size > 1
  const nimSum = calculateNimSum(heaps)
  if (nimSum === 0) {
    // In a losing position, try to leave an odd number of heaps of size 1
    const heapIndex = heaps.findIndex(heap => heap > 1)
    if (heapIndex !== -1) {
      return { heapIndex, count: heaps[heapIndex] - 1 }
    }
  } else {
    // Find a winning move that maintains optimal misère strategy
    for (let i = 0; i < heaps.length; i++) {
      const heap = heaps[i]
      if (heap > 1) {
        const targetSize = heap ^ nimSum
        if (targetSize < heap) {
          // Only take the move if it doesn't leave a single heap
          if (nonEmptyCount > 2 || targetSize > 0) {
            return { heapIndex: i, count: heap - targetSize }
          }
        }
      }
    }
  }

  // If no optimal move found, take one from the largest heap
  const maxHeap = Math.max(...heaps)
  const heapIndex = heaps.indexOf(maxHeap)
  return { heapIndex, count: 1 }
}

/**
 * Make a random move
 */
function makeRandomMove(state: GameState): Move | null {
  const nonEmptyHeaps = state.heaps
    .map((size, index) => ({ size, index }))
    .filter(({ size }) => size > 0)
  
  if (nonEmptyHeaps.length === 0) return null
  
  const randomHeap = nonEmptyHeaps[Math.floor(Math.random() * nonEmptyHeaps.length)]
  const maxTake = state.maxTake 
    ? Math.min(randomHeap.size, state.maxTake)
    : randomHeap.size
  
  return {
    heapIndex: randomHeap.index,
    count: Math.floor(Math.random() * maxTake) + 1
  }
}

/**
 * Get the optimal move for the current game state
 */
export function getOptimalMove(state: GameState, difficulty: Difficulty): Move | null {
  if (state.gameOver) return null

  if (difficulty === 'random') {
    return makeRandomMove(state)
  }

  // Apply max take restriction if set
  const restrictedHeaps = state.maxTake 
    ? state.heaps.map(heap => Math.min(heap, state.maxTake!))
    : state.heaps

  // Get optimal move based on game mode
  const move = state.misere 
    ? findOptimalMisereMove(restrictedHeaps)
    : findOptimalNormalMove(restrictedHeaps)

  // If no optimal move found, make a random move
  return move || makeRandomMove(state)
} 