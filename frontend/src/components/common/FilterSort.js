// src/components/common/FilterSort.js
import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Typography,
  Paper,
} from '@mui/material';


function FilterSort({ filters, onFilterChange, onSortChange }) {
  const { city, minPrice, maxPrice, sort } = filters;

  const handlePriceChange = (event, newValue) => {
    onFilterChange({
      ...filters,
      minPrice: newValue[0],
      maxPrice: newValue[1],
    });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        🔍 Filtrele & Sırala
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Şehir */}
        <TextField
          label="Şehir"
          value={city}
          onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
          fullWidth
          variant="outlined"
        />

        {/* Fiyat Aralığı */}
        <Box>
          <Typography gutterBottom>
            Fiyat Aralığı: ${minPrice} - ${maxPrice}
          </Typography>
          <Slider
            value={[minPrice, maxPrice]}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            sx={{ mt: 2 }}
          />
        </Box>

        {/* Sıralama */}
        <FormControl fullWidth>
          <InputLabel>Sırala</InputLabel>
          <Select
            value={sort}
            label="Sırala"
            onChange={(e) => onSortChange(e.target.value)}
          >
            <MenuItem value="name-asc">İsim (A-Z)</MenuItem>
            <MenuItem value="name-desc">İsim (Z-A)</MenuItem>
            <MenuItem value="price-asc">Fiyat (Düşük → Yüksek)</MenuItem>
            <MenuItem value="price-desc">Fiyat (Yüksek → Düşük)</MenuItem>
            <MenuItem value="newest">En Yeni</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
}

export default FilterSort;
