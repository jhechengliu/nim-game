"""
Core Nim game logic implementation.
"""
from typing import List, Optional, Tuple


class NimGame:
    """Implementation of the Nim game with optimal play strategy."""

    def __init__(self, heaps: List[int], misere: bool = False, max_take: Optional[int] = None):
        """
        Initialize a new Nim game.

        Args:
            heaps: List of heap sizes
            misere: If True, last player to move loses (misère play)
            max_take: Maximum number of objects that can be taken in one move
        """
        if not heaps or any(h <= 0 for h in heaps):
            raise ValueError("All heap sizes must be positive")
        if max_take is not None and max_take <= 0:
            raise ValueError("max_take must be positive")

        self.heaps = heaps.copy()
        self.misere = misere
        self.max_take = max_take

    def get_nim_sum(self) -> int:
        """Calculate the nim-sum (bitwise XOR) of all heap sizes."""
        return 0 if not self.heaps else self.heaps[0] ^ self.get_nim_sum(self.heaps[1:])

    def is_terminal(self) -> bool:
        """Check if the game is in a terminal state (all heaps empty)."""
        return all(h == 0 for h in self.heaps)

    def get_optimal_move(self) -> Tuple[int, int]:
        """
        Calculate the optimal move using the nim-sum strategy.

        Returns:
            Tuple of (heap_index, number_of_objects_to_remove)
        """
        if self.is_terminal():
            raise ValueError("Game is already in terminal state")

        nim_sum = self.get_nim_sum()
        if nim_sum == 0:
            # In a P-position, any legal move is fine
            heap_idx = next(i for i, h in enumerate(self.heaps) if h > 0)
            take = 1
        else:
            # Find a heap where (heap ⊕ nim_sum) < heap
            for i, heap in enumerate(self.heaps):
                if heap == 0:
                    continue
                target = heap ^ nim_sum
                if target < heap:
                    take = heap - target
                    if self.max_take is not None:
                        take = min(take, self.max_take)
                    return i, take

        # If no optimal move found, take 1 from first non-empty heap
        heap_idx = next(i for i, h in enumerate(self.heaps) if h > 0)
        take = 1
        if self.max_take is not None:
            take = min(take, self.max_take)
        return heap_idx, take

    def make_move(self, heap_idx: int, count: int) -> None:
        """
        Make a move in the game.

        Args:
            heap_idx: Index of the heap to take from
            count: Number of objects to remove

        Raises:
            ValueError: If the move is illegal
        """
        if not 0 <= heap_idx < len(self.heaps):
            raise ValueError("Invalid heap index")
        if count <= 0:
            raise ValueError("Must remove at least one object")
        if count > self.heaps[heap_idx]:
            raise ValueError("Cannot remove more objects than available")
        if self.max_take is not None and count > self.max_take:
            raise ValueError(f"Cannot remove more than {self.max_take} objects")

        self.heaps[heap_idx] -= count

    def get_winner(self) -> Optional[bool]:
        """
        Determine the winner of the game.

        Returns:
            True if the last player to move won, False if they lost (in misère play),
            None if the game is not over
        """
        if not self.is_terminal():
            return None
        return not self.misere  # In normal play, last player wins; in misère, they lose 