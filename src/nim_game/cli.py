"""
Command-line interface for the Nim game.
"""
import argparse
from typing import List

from .game import NimGame


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Play the game of Nim")
    parser.add_argument(
        "--heaps",
        type=int,
        nargs="+",
        required=True,
        help="Initial sizes of the heaps",
    )
    parser.add_argument(
        "--mode",
        choices=["human-vs-human", "human-vs-ai"],
        default="human-vs-ai",
        help="Game mode",
    )
    parser.add_argument(
        "--misere",
        action="store_true",
        help="Play in misère mode (last player to move loses)",
    )
    parser.add_argument(
        "--max-take",
        type=int,
        help="Maximum number of objects that can be taken in one move",
    )
    return parser.parse_args()


def get_human_move(game: NimGame) -> tuple[int, int]:
    """Get a move from a human player."""
    while True:
        try:
            heap_idx = int(input("Enter heap index (0-based): "))
            count = int(input("Enter number of objects to remove: "))
            # Validate move
            if not 0 <= heap_idx < len(game.heaps):
                print(f"Heap index must be between 0 and {len(game.heaps) - 1}")
                continue
            if count <= 0:
                print("Must remove at least one object")
                continue
            if count > game.heaps[heap_idx]:
                print(f"Heap {heap_idx} only has {game.heaps[heap_idx]} objects")
                continue
            if game.max_take is not None and count > game.max_take:
                print(f"Cannot remove more than {game.max_take} objects")
                continue
            return heap_idx, count
        except ValueError:
            print("Please enter valid numbers")


def print_game_state(game: NimGame) -> None:
    """Print the current state of the game."""
    print("\nCurrent heaps:")
    for i, size in enumerate(game.heaps):
        print(f"Heap {i}: {size}")


def main() -> None:
    """Main game loop."""
    args = parse_args()
    game = NimGame(args.heaps, misere=args.misere, max_take=args.max_take)
    current_player = 0  # 0 for human, 1 for AI (in human-vs-ai mode)

    print("Welcome to Nim!")
    if game.misere:
        print("Playing in misère mode (last player to move loses)")
    if game.max_take is not None:
        print(f"Maximum objects per move: {game.max_take}")

    while not game.is_terminal():
        print_game_state(game)
        print(f"\nPlayer {current_player + 1}'s turn")

        if args.mode == "human-vs-ai" and current_player == 1:
            # AI's turn
            heap_idx, count = game.get_optimal_move()
            print(f"AI removes {count} objects from heap {heap_idx}")
        else:
            # Human's turn
            heap_idx, count = get_human_move(game)
            print(f"Removing {count} objects from heap {heap_idx}")

        game.make_move(heap_idx, count)
        current_player = 1 - current_player  # Switch players

    # Game over
    winner = game.get_winner()
    if args.mode == "human-vs-ai":
        print("\nGame over!")
        if winner:
            print("Human wins!" if current_player == 1 else "AI wins!")
        else:
            print("Human loses!" if current_player == 1 else "AI loses!")
    else:
        print(f"\nPlayer {2 - current_player} wins!")


if __name__ == "__main__":
    main() 