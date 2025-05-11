import { useState, useEffect } from 'react'
import { Container, Typography, Box, Button, Stack, Paper, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Divider, IconButton, Menu, MenuItem as MuiMenuItem } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import Heap from './components/Heap'
import { GameState, Difficulty, makeMove, getOptimalMove } from './services/gameService'

type GameMode = 'normal' | 'misere'
type GamePhase = 'lobby' | 'settings' | 'playing' | 'gameOver'

function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby')
  const [gameState, setGameState] = useState<GameState>({
    heaps: [3, 4, 5],
    currentPlayer: 'human',
    gameOver: false,
    winner: null,
    maxTake: null,
    misere: false
  })

  const [selectedHeap, setSelectedHeap] = useState<number | null>(null)
  const [selectedCount, setSelectedCount] = useState<number>(0)
  const [difficulty, setDifficulty] = useState<Difficulty>('optimal')
  const [gameMode, setGameMode] = useState<GameMode>('normal')
  const [heapCount, setHeapCount] = useState<number>(3)
  const [maxTake, setMaxTake] = useState<number | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleDifficultyChange = (event: SelectChangeEvent) => {
    setDifficulty(event.target.value as Difficulty)
  }

  const handleGameModeChange = (event: SelectChangeEvent) => {
    setGameMode(event.target.value as GameMode)
  }

  const handleHeapCountChange = (event: SelectChangeEvent) => {
    setHeapCount(Number(event.target.value))
  }

  const handleMaxTakeChange = (event: SelectChangeEvent) => {
    const value = event.target.value
    setMaxTake(value === 'unlimited' ? null : Number(value))
  }

  const handleStartGame = () => {
    const initialHeaps = Array.from({ length: heapCount }, (_, i) => i + 3)
    setGameState({
      heaps: initialHeaps,
      currentPlayer: 'human',
      gameOver: false,
      winner: null,
      maxTake,
      misere: gameMode === 'misere'
    })
    setGamePhase('playing')
  }

  const handleHeapSelect = (heapIndex: number) => {
    if (gameState.currentPlayer !== 'human' || gameState.gameOver) return
    setSelectedHeap(heapIndex)
  }

  const handleCountChange = (count: number) => {
    if (gameState.currentPlayer !== 'human' || gameState.gameOver) return
    setSelectedCount(count)
  }

  const handleMove = () => {
    if (selectedHeap === null || selectedCount === 0) return
    
    const newState = makeMove(gameState, selectedHeap, selectedCount)
    setGameState(newState)
    setSelectedHeap(null)
    setSelectedCount(0)

    if (!newState.gameOver && newState.currentPlayer === 'ai') {
      // AI's turn
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
    setGameState({
      heaps: [3, 4, 5],
      currentPlayer: 'human',
      gameOver: false,
      winner: null,
      maxTake: null,
      misere: false
    })
    setSelectedHeap(null)
    setSelectedCount(0)
    setGamePhase('settings')
    handleSettingsClose()
  }

  const handleBackToLobby = () => {
    setGamePhase('lobby')
    handleSettingsClose()
  }

  const handleStartSettings = () => {
    setGamePhase('settings')
  }

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
                  { label: 'Misère', desc: 'Take last to lose' }
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
                  { label: '', desc: 'Leave even number of heaps' },
                  { label: '', desc: 'Make nim-sum zero for optimal play' },
                  { label: '', desc: 'Watch max take limit if set' }
                ]
              }
            ].map((section, sectionIndex) => (
              <Box key={sectionIndex} sx={{ mt: sectionIndex > 0 ? 2 : 0 }}>
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
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Nim Game Settings
      </Typography>
      <Stack spacing={3}>
        <FormControl fullWidth>
          <InputLabel>Difficulty</InputLabel>
          <Select value={difficulty} label="Difficulty" onChange={handleDifficultyChange}>
            <MenuItem value="random">Random</MenuItem>
            <MenuItem value="optimal">Optimal</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Game Mode</InputLabel>
          <Select value={gameMode} label="Game Mode" onChange={handleGameModeChange}>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="misere">Misère</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Number of Heaps</InputLabel>
          <Select value={String(heapCount)} label="Number of Heaps" onChange={handleHeapCountChange}>
            <MenuItem value="3">3</MenuItem>
            <MenuItem value="4">4</MenuItem>
            <MenuItem value="5">5</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Maximum Take</InputLabel>
          <Select value={maxTake === null ? 'unlimited' : String(maxTake)} label="Maximum Take" onChange={handleMaxTakeChange}>
            <MenuItem value="unlimited">Unlimited</MenuItem>
            <MenuItem value="1">1</MenuItem>
            <MenuItem value="2">2</MenuItem>
            <MenuItem value="3">3</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" size="large" onClick={handleStartGame}>
          Start Game
        </Button>
      </Stack>
    </Paper>
  )

  const renderGame = () => (
    <Container maxWidth="lg" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1">
          Nim Game
        </Typography>
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
            New Game
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
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
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
            backgroundColor: 'rgba(0, 255, 0, 0.1)',
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
              disabled={gameState.currentPlayer !== 'human' || gameState.gameOver}
            />
          ))}
        </Stack>

        <Box sx={{ mt: 'auto', textAlign: 'center', width: '100%' }}>
          <Typography variant="h5" gutterBottom>
            {gameState.gameOver
              ? `Game Over! ${gameState.winner === 'human' ? 'You won!' : 'AI won!'}`
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
            disabled={selectedHeap === null || selectedCount === 0 || gameState.gameOver}
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
        <Typography variant="h4" gutterBottom color={gameState.winner === 'human' ? 'success.main' : 'error.main'}>
          {gameState.winner === 'human' ? 'You Won!' : 'AI Won!'}
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