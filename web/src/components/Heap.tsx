import { Box, IconButton, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

interface HeapProps {
  size: number
  selected: boolean
  onSelect: () => void
  selectedCount: number
  onCountChange: (count: number) => void
  disabled: boolean
}

export default function Heap({ size, selected, onSelect, selectedCount, onCountChange, disabled }: HeapProps) {
  const handleCountChange = (delta: number) => {
    if (disabled) return
    const maxCount = Math.min(3, size)
    if (delta > 0 && selectedCount >= maxCount) return
    const newCount = selectedCount + delta
    if (newCount >= 1 && newCount <= maxCount) {
      onCountChange(newCount)
    }
  }

  const handleSelect = () => {
    if (disabled) return
    onSelect()
    if (!selected) {
      onCountChange(1)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        minWidth: 180,
        minHeight: 220,
        p: 2,
        border: '3px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        borderRadius: 3,
        backgroundColor: selected ? 'action.selected' : 'background.paper',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        boxShadow: selected ? 4 : 1,
        transition: 'all 0.2s',
        m: 1,
      }}
      onClick={handleSelect}
    >
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        Heap Size: {size}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', mb: 2, minHeight: 32 }}>
        {Array.from({ length: size }).map((_, i) => (
          <Box key={i} sx={{ mx: 0.5, fontSize: 28, color: 'text.primary' }}>●</Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', mt: 2, width: '100%' }}>
        <IconButton
          size="small"
          onClick={e => { e.stopPropagation(); handleCountChange(-1) }}
          disabled={!selected || selectedCount <= 1}
          sx={{ mx: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
        >
          <RemoveIcon />
        </IconButton>
        <Typography variant="h5" component="div" sx={{ minWidth: 32, textAlign: 'center', mx: 1 }}>
          {selected ? selectedCount : 0}
        </Typography>
        <IconButton
          size="small"
          onClick={e => { e.stopPropagation(); handleCountChange(1) }}
          disabled={!selected || selectedCount >= Math.min(3, size)}
          sx={{ mx: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  )
} 