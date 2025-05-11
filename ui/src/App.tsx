import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

interface GameState {
  heaps: number[];
  misere: boolean;
  maxTake: number | null;
  currentPlayer: number;
  gameOver: boolean;
  winner: boolean | null;
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

function App() {
  const [gameState, setGameState] = useState<GameState>({
    heaps: [3, 4, 5],
    misere: false,
    maxTake: null,
    currentPlayer: 0,
    gameOver: false,
    winner: null,
  });

  const [heapInput, setHeapInput] = useState('3 4 5');
  const [maxTakeInput, setMaxTakeInput] = useState('');

  const handleNewGame = () => {
    const heaps = heapInput.split(' ').map(Number);
    const maxTake = maxTakeInput ? Number(maxTakeInput) : null;
    
    if (heaps.some(isNaN) || heaps.some(h => h <= 0)) {
      alert('Please enter valid heap sizes (positive numbers)');
      return;
    }
    
    if (maxTake !== null && (isNaN(maxTake) || maxTake <= 0)) {
      alert('Please enter a valid maximum take (positive number)');
      return;
    }

    setGameState({
      heaps,
      misere: gameState.misere,
      maxTake,
      currentPlayer: 0,
      gameOver: false,
      winner: null,
    });
  };

  const handleMove = (heapIndex: number, count: number) => {
    if (gameState.gameOver) return;
    
    const newHeaps = [...gameState.heaps];
    if (count > newHeaps[heapIndex]) return;
    if (gameState.maxTake !== null && count > gameState.maxTake) return;
    
    newHeaps[heapIndex] -= count;
    const gameOver = newHeaps.every(h => h === 0);
    
    setGameState({
      ...gameState,
      heaps: newHeaps,
      currentPlayer: 1 - gameState.currentPlayer,
      gameOver,
      winner: gameOver ? !gameState.misere : null,
    });
  };

  const renderHeap = (size: number, index: number) => (
    <Paper
      key={index}
      elevation={3}
      sx={{
        p: 2,
        m: 1,
        minWidth: 100,
        textAlign: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h4" gutterBottom>
        {size}
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="center">
        {[...Array(Math.min(5, size))].map((_, i) => (
          <Button
            key={i}
            variant="contained"
            size="small"
            onClick={() => handleMove(index, i + 1)}
            disabled={gameState.gameOver || gameState.currentPlayer === 1}
          >
            {i + 1}
          </Button>
        ))}
      </Stack>
    </Paper>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Nim Game
          </Typography>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Heap Sizes"
                value={heapInput}
                onChange={(e) => setHeapInput(e.target.value)}
                helperText="Enter heap sizes separated by spaces"
              />
              <TextField
                label="Maximum Take (optional)"
                value={maxTakeInput}
                onChange={(e) => setMaxTakeInput(e.target.value)}
                helperText="Enter maximum number of objects that can be taken in one move"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={gameState.misere}
                    onChange={(e) => setGameState({ ...gameState, misere: e.target.checked })}
                  />
                }
                label="Misère Play (last player loses)"
              />
              <Button variant="contained" onClick={handleNewGame}>
                New Game
              </Button>
            </Stack>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {gameState.heaps.map(renderHeap)}
          </Box>

          {gameState.gameOver && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Game Over! {gameState.winner ? 'Player 1 wins!' : 'Player 2 wins!'}
            </Alert>
          )}

          {!gameState.gameOver && (
            <Typography variant="h6" align="center" sx={{ mt: 2 }}>
              Current Player: {gameState.currentPlayer + 1}
            </Typography>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 