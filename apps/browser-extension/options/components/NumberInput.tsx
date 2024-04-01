import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Box, Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export type OnChange = (value: number) => void;

export interface NumberInputProps {
  label: string;
  value: number;
  onChange: OnChange;
  max: number;
  min: number;
}

const NumberInput = ({ label, value, onChange, max, min }: NumberInputProps) => {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleChange = (event) => {
    let newValue = parseInt(event.target.value, 10);
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <FormControl variant="outlined" fullWidth sx={{ flexDirection: 'row', alignItems: 'center', margin: '8px 0' }}>
      <InputLabel htmlFor="component-outlined">{label}</InputLabel>
      <OutlinedInput
        id="component-outlined"
        value={value}
        onChange={handleChange}
        label={label}
        endAdornment={
          <Box>
            <Stack direction="column">
              <IconButton
                aria-label="increase value"
                onClick={handleIncrement}
                disabled={value >= max} 
                size="small"
              >
                <AddIcon />
              </IconButton>
              <IconButton
                aria-label="decrease value"
                onClick={handleDecrement}
                size="small"
                disabled={value <= min} 
                sx={{ padding: '5px' }} // Adjust padding here
              >
                <RemoveIcon />
              </IconButton>
            </Stack>
          </Box>
        }
      />
    </FormControl>
  );
};

export { NumberInput };