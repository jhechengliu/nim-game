import { Box, Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'

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

    // For + button
    if (delta > 0) {
      if (!selected) {
        onSelect()
      }
      // Only increment if we haven't reached the heap size
      if (selectedCount < size) {
        onCountChange(selectedCount + 1)
      }
      return
    }

    // For - button
    if (selected) {
      const newCount = selectedCount + delta
      if (newCount >= 0) {
        onCountChange(newCount)
      }
    }
  }

  return (
    <Box
      sx={{
        p: 3,
        border: '3px solid',
        borderColor: selected ? 'primary.main' : 'grey.500',
        borderRadius: 3,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        transition: 'all 0.2s',
        bgcolor: 'background.paper',
        boxShadow: selected ? 3 : 1,
        '&:hover': {
          borderColor: disabled ? 'grey.500' : 'primary.main',
          transform: disabled ? 'none' : 'translateY(-4px)',
          boxShadow: disabled ? 1 : 4,
        },
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) {
          onSelect()
        }
      }}
    >
      <Stack spacing={3} alignItems="center">
        <Typography variant="h6" color={selected ? 'primary' : 'text.secondary'}>
          Heap Size: {size}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            maxWidth: 200,
            justifyContent: 'center',
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 2,
          }}
        >
          {Array.from({ length: size }, (_, i) => (
            <Box
              key={i}
              sx={{
                width: 24,
                height: 24,
                bgcolor: i < selectedCount ? 'primary.main' : 'grey.700',
                borderRadius: '50%',
                transition: 'all 0.2s',
                transform: i < selectedCount ? 'scale(1.1)' : 'scale(1)',
                boxShadow: i < selectedCount ? 2 : 0,
              }}
              role="presentation"
            />
          ))}
        </Box>

        <Stack direction="row" spacing={2}>
          <Button
            size="large"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation()
              handleCountChange(-1)
            }}
            disabled={disabled || selectedCount === 0}
            sx={{ minWidth: 60 }}
          >
            -
          </Button>
          <Typography variant="h5" sx={{ minWidth: 40, textAlign: 'center' }}>
            {selectedCount}
          </Typography>
          <Button
            size="large"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation()
              handleCountChange(1)
            }}
            disabled={disabled || selectedCount === size}
            sx={{ minWidth: 60 }}
          >
            +
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
} 