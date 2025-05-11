"""
Unit tests for the Nim game implementation.
"""
import pytest

from nim_game.game import NimGame


def test_game_initialization():
    """Test game initialization with valid and invalid inputs."""
    # Valid initialization
    game = NimGame([3, 4, 5])
    assert game.heaps == [3, 4, 5]
    assert not game.misere
    assert game.max_take is None

    # Valid initialization with misère and max_take
    game = NimGame([3, 4, 5], misere=True, max_take=2)
    assert game.heaps == [3, 4, 5]
    assert game.misere
    assert game.max_take == 2

    # Invalid initialization
    with pytest.raises(ValueError):
        NimGame([])  # Empty heaps
    with pytest.raises(ValueError):
        NimGame([0, 1, 2])  # Zero heap
    with pytest.raises(ValueError):
        NimGame([1, 2, 3], max_take=0)  # Invalid max_take


def test_nim_sum():
    """Test nim-sum calculation."""
    game = NimGame([3, 4, 5])
    assert game.get_nim_sum() == 3 ^ 4 ^ 5  # Should be 2

    game = NimGame([1, 1, 1])
    assert game.get_nim_sum() == 1 ^ 1 ^ 1  # Should be 1

    game = NimGame([2, 2])
    assert game.get_nim_sum() == 2 ^ 2  # Should be 0


def test_optimal_move():
    """Test optimal move calculation."""
    # P-position (nim-sum = 0)
    game = NimGame([2, 2])
    heap_idx, count = game.get_optimal_move()
    assert 0 <= heap_idx < len(game.heaps)
    assert 1 <= count <= game.heaps[heap_idx]

    # N-position (nim-sum != 0)
    game = NimGame([3, 4, 5])
    heap_idx, count = game.get_optimal_move()
    assert 0 <= heap_idx < len(game.heaps)
    assert 1 <= count <= game.heaps[heap_idx]
    # After the move, the position should be a P-position
    game.make_move(heap_idx, count)
    assert game.get_nim_sum() == 0


def test_make_move():
    """Test making moves."""
    game = NimGame([3, 4, 5])

    # Valid move
    game.make_move(0, 2)
    assert game.heaps == [1, 4, 5]

    # Invalid moves
    with pytest.raises(ValueError):
        game.make_move(0, 0)  # Zero objects
    with pytest.raises(ValueError):
        game.make_move(0, 2)  # More than available
    with pytest.raises(ValueError):
        game.make_move(3, 1)  # Invalid heap index


def test_max_take():
    """Test maximum take restriction."""
    game = NimGame([3, 4, 5], max_take=2)

    # Valid move within max_take
    game.make_move(0, 2)
    assert game.heaps == [1, 4, 5]

    # Invalid move exceeding max_take
    with pytest.raises(ValueError):
        game.make_move(1, 3)


def test_terminal_state():
    """Test terminal state detection."""
    game = NimGame([1, 1])
    assert not game.is_terminal()

    game.make_move(0, 1)
    assert not game.is_terminal()

    game.make_move(1, 1)
    assert game.is_terminal()


def test_winner():
    """Test winner determination."""
    # Normal play
    game = NimGame([1, 1])
    assert game.get_winner() is None  # Game not over

    game.make_move(0, 1)
    game.make_move(1, 1)
    assert game.get_winner() is True  # Last player wins in normal play

    # Misère play
    game = NimGame([1, 1], misere=True)
    game.make_move(0, 1)
    game.make_move(1, 1)
    assert game.get_winner() is False  # Last player loses in misère play 