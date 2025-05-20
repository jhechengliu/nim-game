import { useState, useEffect, useRef } from 'react'
import { Container, Typography, Box, Button, Stack, Paper, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Divider, IconButton, Menu, MenuItem as MuiMenuItem, ToggleButton, ToggleButtonGroup } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import Heap from './components/Heap'
import { GameState, Difficulty, makeMove, createGameState, FirstMove } from './services/gameState'
import { getOptimalMove } from './services/gameAI'

type GamePhase = 'lobby' | 'settings' | 'playing' | 'gameOver'

interface GameOption {
  title: string;
  items: Array<{
    label: string;
    desc: string;
  }>;
}

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby')
  const [gameState, setGameState] = useState<GameState>(createGameState(3, 'player'))
  const [selectedHeap, setSelectedHeap] = useState<number | null>(null)
  const [selectedCount, setSelectedCount] = useState<number>(0)
  const [difficulty, setDifficulty] = useState<Difficulty>('optimal')
  const [gameMode, setGameMode] = useState<'normal' | 'misere'>('normal')
  const [playMode, setPlayMode] = useState<'pvp' | 'pve'>('pve')
  const [pvpNames] = useState<{ player1: string; player2: string }>({ player1: 'Player 1', player2: 'Player 2' })
  const [baseHeapSize, setBaseHeapSize] = useState<number>(3)
  const [firstMove, setFirstMove] = useState<FirstMove>('player')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const aiTimeoutRef = useRef<number | null>(null)

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setDifficulty(event.target.value as Difficulty)
  }

  const handleGameModeChange = (_: React.MouseEvent<HTMLElement>, value: 'normal' | 'misere') => {
    if (value !== null) setGameMode(value)
  }

  const handlePlayModeChange = (_: React.MouseEvent<HTMLElement>, value: 'pvp' | 'pve') => {
    if (value !== null) setPlayMode(value)
  }

  const handleBaseHeapSizeChange = (event: SelectChangeEvent) => {
    setBaseHeapSize(Number(event.target.value))
  }

  const handleFirstMoveChange = (event: SelectChangeEvent) => {
    setFirstMove(event.target.value as FirstMove)
  }

  const handleStartGame = () => {
    if (playMode === 'pvp') {
      const pvpState: GameState = {
        heaps: [baseHeapSize, baseHeapSize + 1, baseHeapSize + 2],
        currentPlayer: 'player1',
        gameOver: false,
        winner: null,
        maxTake: 3,
        misere: gameMode === 'misere',
        baseHeapSize
      };
      setGameState(pvpState);
    } else {
      setGameState(createGameState(baseHeapSize, firstMove, gameMode === 'misere'))
    }
    setGamePhase('playing')
  }

  const handleHeapSelect = (heapIndex: number) => {
    if (gameState.gameOver) return;
    if (
      ((playMode === 'pvp' && (gameState.currentPlayer === 'player1' || gameState.currentPlayer === 'player2')) ||
      (playMode !== 'pvp' && gameState.currentPlayer === 'human')) &&
      gameState.heaps[heapIndex] > 0
    ) {
      setSelectedHeap(heapIndex);
      if (selectedHeap !== heapIndex) {
        setSelectedCount(Math.min(1, gameState.heaps[heapIndex], gameState.maxTake));
      }
    }
  }

  const handleCountChange = (count: number) => {
    if (gameState.gameOver) return;
    if (
      (playMode === 'pvp' && (gameState.currentPlayer === 'player1' || gameState.currentPlayer === 'player2')) ||
      (playMode !== 'pvp' && gameState.currentPlayer === 'human')
    ) {
      if (selectedHeap !== null) {
        const maxAllowed = Math.min(gameState.heaps[selectedHeap], gameState.maxTake);
        let clamped = count;
        if (clamped < 1) clamped = 1;
        if (clamped > maxAllowed) clamped = maxAllowed;
        setSelectedCount(clamped);
      }
    }
  }

  // Final clamp: ensure selectedCount is always valid
  useEffect(() => {
    if (selectedHeap !== null) {
      const maxAllowed = Math.min(gameState.heaps[selectedHeap], gameState.maxTake);
      if (selectedCount > maxAllowed) {
        setSelectedCount(maxAllowed);
      }
      if (selectedCount < 1 && maxAllowed > 0) {
        setSelectedCount(1);
      }
    }
  }, [selectedCount, selectedHeap, gameState.heaps, gameState.maxTake]);

  const handleMove = () => {
    if (selectedHeap === null || selectedCount === 0) return
    let newState
    if (playMode === 'pvp') {
      // PvP: alternate between player1 and player2
      const nextPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1'
      const heaps = [...gameState.heaps]
      heaps[selectedHeap] -= selectedCount
      const isTerminal = heaps.every(h => h === 0)
      newState = {
        ...gameState,
        heaps,
        currentPlayer: isTerminal ? gameState.currentPlayer : nextPlayer,
        gameOver: isTerminal,
        winner: isTerminal ? gameState.currentPlayer : null
      }
      setGameState(newState)
      setSelectedHeap(null)
      setSelectedCount(0)
      if (newState.gameOver) setGamePhase('gameOver')
      return
    }
    // Normal/AI mode
    newState = makeMove(gameState, selectedHeap, selectedCount)
    setGameState(newState)
    setSelectedHeap(null)
    setSelectedCount(0)
    if (!newState.gameOver && newState.currentPlayer === 'ai') {
      setTimeout(() => {
        const aiMove = getOptimalMove(newState, difficulty)
        if (aiMove) {
          const aiState = makeMove(newState, aiMove.heapIndex, aiMove.count)
          setGameState(aiState)
          if (aiState.gameOver) {
            setGamePhase('gameOver')
          }
        }
      }, 500)
    } else if (newState.gameOver) {
      setGamePhase('gameOver')
    }
  }

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleSettingsClose = () => {
    setAnchorEl(null)
  }

  const handleNewGame = () => {
    setGameState(createGameState(baseHeapSize, firstMove, gameMode === 'misere'))
    setSelectedHeap(null)
    setSelectedCount(0)
    setGamePhase('playing')
    handleSettingsClose()
  }

  const handleBackToLobby = () => {
    setGamePhase('lobby')
    handleSettingsClose()
  }

  const handleStartSettings = () => {
    setAnchorEl(null);
    setGamePhase('settings')
  }

  // Automatically trigger AI move when it's AI's turn and game is not over
  useEffect(() => {
    if (gameState.currentPlayer === 'ai' && !gameState.gameOver) {
      // Prevent multiple timeouts
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current)
      }
      aiTimeoutRef.current = window.setTimeout(() => {
        const aiMove = getOptimalMove(gameState, difficulty)
        if (aiMove) {
          const aiState = makeMove(gameState, aiMove.heapIndex, aiMove.count)
          setGameState(aiState)
          if (aiState.gameOver) {
            setGamePhase('gameOver')
          }
        }
      }, 500)
    }
    // Cleanup on unmount or when gameState changes
    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current)
        aiTimeoutRef.current = null
      }
    }
  }, [gameState, difficulty])

  // Clamp selectedCount if heap size shrinks
  useEffect(() => {
    if (selectedHeap !== null) {
      const maxAllowed = Math.min(gameState.heaps[selectedHeap], gameState.maxTake)
      if (selectedCount > maxAllowed) {
        setSelectedCount(maxAllowed)
      }
    }
  }, [gameState.heaps, gameState.maxTake, selectedHeap])

  const renderLobby = () => (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 1, sm: 2 }
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center" 
          color="primary"
          sx={{
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Welcome to Nim Game
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr',
            md: '1fr 1fr' 
          },
          gap: { xs: 3, sm: 4 },
          my: { xs: 2, sm: 3 }
        }}>
          {/* Left Column */}
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom 
              color="primary"
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
              }}
            >
              How to Play
            </Typography>
            <Typography 
              variant="body1" 
              paragraph
              sx={{
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}
            >
              Nim is a mathematical game of strategy in which two players take turns removing objects from distinct heaps.
            </Typography>
            
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mt: 2, 
                fontWeight: 'bold',
                fontSize: { xs: '1.2rem', sm: '1.3rem' }
              }}
            >
              Basic Rules:
            </Typography>
            <Stack spacing={1.5}>
              {[
                'Remove at least one object per turn',
                'Take any number from a single heap',
                'Last object wins (Normal mode)',
                'Last object loses (Misère mode)'
              ].map((rule, index) => (
                <Typography 
                  key={index}
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem' }
                  }}
                >
                  • {rule}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* Right Column */}
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom 
              color="primary"
              sx={{
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
              }}
            >
              Game Options
            </Typography>
            
            {[
              {
                title: 'Modes:',
                items: [
                  { label: 'Normal', desc: 'Take last to win' },
                  { label: 'Misère', desc: 'Take last to lose' },
                  { label: 'PvP', desc: 'Player vs Player' }
                ]
              },
              {
                title: 'AI Difficulty:',
                items: [
                  { label: 'Random', desc: 'Makes random moves' },
                  { label: 'Optimal', desc: 'Uses nim-sum strategy' }
                ]
              },
              {
                title: 'Tips:',
                items: [
                  { label: 'Tip 1', desc: 'Leave even number of heaps' },
                  { label: 'Tip 2', desc: 'Make nim-sum zero for optimal play' },
                  { label: 'Tip 3', desc: 'Watch max take limit if set' }
                ]
              }
            ].map((section: GameOption, index) => (
              <Box key={index} sx={{ mt: index > 0 ? 2 : 0 }}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.2rem', sm: '1.3rem' }
                  }}
                >
                  {section.title}
                </Typography>
                <Stack spacing={1.5}>
                  {section.items.map((item, itemIndex) => (
                    <Typography 
                      key={itemIndex}
                      variant="body1"
                      sx={{
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      • {item.label && <strong>{item.label}:</strong>} {item.desc}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartSettings}
            sx={{ 
              px: { xs: 3, sm: 4 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '1rem', sm: '1.1rem' }
            }}
          >
            Start Game
          </Button>
        </Box>
      </Paper>
    </Container>
  )

  const renderSettings = () => (
    <Box>
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3" component="h1">
            Nim Game
          </Typography>
          <Box sx={{ ml: 3, flex: 1 }} />
          <IconButton
            size="large"
            onClick={handleSettingsClick}
            sx={{ color: 'primary.main' }}
          >
            <SettingsIcon fontSize="large" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleSettingsClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MuiMenuItem onClick={handleNewGame}>
              Restart
            </MuiMenuItem>
            <MuiMenuItem onClick={handleStartSettings}>
              Game Settings
            </MuiMenuItem>
            <MuiMenuItem onClick={handleBackToLobby}>
              Back to Lobby
            </MuiMenuItem>
          </Menu>
        </Box>
      </Container>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Nim Game Settings
        </Typography>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Play Mode</Typography>
            <ToggleButtonGroup
              value={playMode}
              exclusive
              onChange={handlePlayModeChange}
              aria-label="play mode"
              fullWidth
            >
              <ToggleButton value="pve" aria-label="PvE">PvE (Player vs AI)</ToggleButton>
              <ToggleButton value="pvp" aria-label="PvP">PvP (Player vs Player)</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Game Mode</Typography>
            <ToggleButtonGroup
              value={gameMode}
              exclusive
              onChange={handleGameModeChange}
              aria-label="game mode"
              fullWidth
            >
              <ToggleButton value="normal" aria-label="Normal">Normal</ToggleButton>
              <ToggleButton value="misere" aria-label="Misère">Misère</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <FormControl fullWidth>
            <InputLabel>Base Heap Size</InputLabel>
            <Select value={String(baseHeapSize)} label="Base Heap Size" onChange={handleBaseHeapSizeChange}>
              <MenuItem value="3">3 (Heaps: 3,4,5)</MenuItem>
              <MenuItem value="4">4 (Heaps: 4,5,6)</MenuItem>
              <MenuItem value="5">5 (Heaps: 5,6,7)</MenuItem>
              <MenuItem value="6">6 (Heaps: 6,7,8)</MenuItem>
            </Select>
          </FormControl>
          {playMode === 'pve' && (
            <>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select value={difficulty} label="Difficulty" onChange={handleDifficultyChange}>
                  <MenuItem value="random">Random</MenuItem>
                  <MenuItem value="optimal">Optimal</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>First Move</InputLabel>
                <Select value={firstMove} label="First Move" onChange={handleFirstMoveChange}>
                  <MenuItem value="player">Player First</MenuItem>
                  <MenuItem value="ai">AI First</MenuItem>
                  <MenuItem value="random">Random</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
          <Button variant="contained" size="large" onClick={handleStartGame}>
            Start Game
          </Button>
        </Stack>
      </Paper>
    </Box>
  )

  const renderGame = () => (
    <Container maxWidth="lg" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1">
          Nim Game
        </Typography>
        <Box sx={{ ml: 3, flex: 1 }}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Mode: {playMode === 'pvp' ? 'PvP' : 'PvE'}, {gameMode === 'normal' ? 'Normal' : 'Misère'}
          </Typography>
        </Box>
        <IconButton
          size="large"
          onClick={handleSettingsClick}
          sx={{ color: 'primary.main' }}
        >
          <SettingsIcon fontSize="large" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleSettingsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MuiMenuItem onClick={handleNewGame}>
            Restart
          </MuiMenuItem>
          <MuiMenuItem onClick={handleStartSettings}>
            Game Settings
          </MuiMenuItem>
          <MuiMenuItem onClick={handleBackToLobby}>
            Back to Lobby
          </MuiMenuItem>
        </Menu>
      </Box>

      <Box 
        sx={{ 
          flex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 8,
        }}
        onClick={(e) => {
          // Only deselect if clicking on the background
          if (e.target === e.currentTarget) {
            setSelectedHeap(null)
            setSelectedCount(0)
          }
        }}
      >
        <Stack 
          direction="row" 
          spacing={2}
          justifyContent="center" 
          alignItems="center"
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            p: 1,
          }}
        >
          {gameState.heaps.map((size, index) => (
            <Heap
              key={index}
              size={size}
              selected={selectedHeap === index}
              onSelect={() => handleHeapSelect(index)}
              selectedCount={selectedHeap === index ? selectedCount : 0}
              onCountChange={handleCountChange}
              disabled={
                playMode === 'pvp'
                  ? gameState.gameOver ||
                    !((gameState.currentPlayer === 'player1' && gamePhase === 'playing') || (gameState.currentPlayer === 'player2' && gamePhase === 'playing'))
                  : gameState.currentPlayer !== 'human' || gameState.gameOver
              }
            />
          ))}
        </Stack>

        <Box sx={{ mt: 'auto', textAlign: 'center', width: '100%' }}>
          <Typography variant="h5" gutterBottom>
            {gameState.gameOver
              ? playMode === 'pvp'
                ? `Game Over! ${gameState.winner === 'player1' ? pvpNames.player1 : pvpNames.player2} won!`
                : `Game Over! ${gameState.winner === 'human' ? 'You won!' : 'AI won!'}`
              : playMode === 'pvp'
                ? `Current Player: ${gameState.currentPlayer === 'player1' ? pvpNames.player1 : pvpNames.player2}`
                : `Current Player: ${gameState.currentPlayer === 'human' ? 'You' : 'AI'}`}
          </Typography>
          {gameState.maxTake !== null && (
            <Typography variant="subtitle1" color="text.secondary">
              Maximum take: {gameState.maxTake}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center', width: '100%' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleMove}
            disabled={
              selectedHeap === null ||
              selectedCount < 1 ||
              (selectedHeap !== null && selectedCount > gameState.heaps[selectedHeap]) ||
              (selectedHeap !== null && selectedCount > gameState.maxTake) ||
              gameState.gameOver
            }
          >
            Make Move
          </Button>
        </Box>
      </Box>
    </Container>
  )

  const renderGameOver = () => (
    <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Game Over!
        </Typography>
        <Typography variant="h4" gutterBottom color={playMode === 'pvp' ? 'primary.main' : (gameState.winner === 'human' ? 'success.main' : 'error.main')}>
          {playMode === 'pvp'
            ? `${gameState.winner === 'player1' ? pvpNames.player1 : pvpNames.player2} Won!`
            : (gameState.winner === 'human' ? 'You Won!' : 'AI Won!')}
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            size="large" 
            onClick={handleNewGame}
            sx={{ px: 4 }}
          >
            Play Again
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={handleStartSettings}
            sx={{ px: 4 }}
          >
            Game Settings
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => setGamePhase('lobby')}
            sx={{ px: 4 }}
          >
            Back to Lobby
          </Button>
        </Box>
      </Paper>
    </Container>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      {gamePhase === 'lobby' && renderLobby()}
      {gamePhase === 'settings' && renderSettings()}
      {gamePhase === 'playing' && renderGame()}
      {gamePhase === 'gameOver' && renderGameOver()}
    </Box>
  )
}

export default App 