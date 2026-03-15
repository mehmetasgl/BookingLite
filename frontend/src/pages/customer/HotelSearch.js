// src/pages/customer/HotelSearch.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Alert,
  InputAdornment,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Skeleton,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import hotelService from '../../services/hotelService';

function HotelSearch() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 1000,
    sort: 'name-asc',
  });

  useEffect(() => {
    applyFiltersAndSort();
  }, [hotels, filters, searchTerm]);

  const applyFiltersAndSort = () => {
    let result = [...hotels];

    if (searchTerm) {
      result = result.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (filters.sort) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredHotels(result);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const response = await hotelService.searchHotels(city);
      console.log('Search response:', response.data);

      const hotelsData = response.data?.data || response.data || [];

      if (Array.isArray(hotelsData)) {
        setHotels(hotelsData);
      } else {
        console.error('Hotels data is not an array:', hotelsData);
        setHotels([]);
      }

    } catch (err) {
      console.error('Search error:', err);
      setError('Arama yapılırken hata oluştu!');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (hotel) => {
    if (hotel.mainImageUrl) {
      return 'http://localhost:8080' + hotel.mainImageUrl;
    }
    return 'https://via.placeholder.com/400x200?text=Hotel+Image';
  };

  const HotelCardSkeleton = () => (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" width="80%" height={32} />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </CardContent>
      <CardActions>
        <Skeleton variant="rectangular" width="100%" height={36} />
      </CardActions>
    </Card>
  );

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          🏨 Otel Ara
        </Typography>

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Şehir"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Örn: Istanbul, Antalya"
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SearchIcon />}
              disabled={loading}
            >
              Ara
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {searched && (
          <Grid container spacing={3}>
            {/* Sol Sidebar */}
            <Grid item xs={12} md={3}>
              <Paper elevation={2} sx={{ p: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h6" gutterBottom>
                  🔍 Filtrele & Sırala
                </Typography>

                <TextField
                  fullWidth
                  placeholder="Otel ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ mb: 3 }}>
                  <Typography gutterBottom>
                    Fiyat: ${filters.minPrice} - ${filters.maxPrice}
                  </Typography>
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onChange={(e, newValue) =>
                      setFilters({ ...filters, minPrice: newValue[0], maxPrice: newValue[1] })
                    }
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Sırala</InputLabel>
                  <Select
                    value={filters.sort}
                    label="Sırala"
                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                  >
                    <MenuItem value="name-asc">İsim (A-Z)</MenuItem>
                    <MenuItem value="name-desc">İsim (Z-A)</MenuItem>
                    <MenuItem value="newest">En Yeni</MenuItem>
                  </Select>
                </FormControl>
              </Paper>
            </Grid>

            {/* Otel Listesi */}
            <Grid item xs={12} md={9}>
              {loading && (
                <Grid container spacing={3}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Grid item xs={12} sm={6} lg={4} key={i}>
                      <HotelCardSkeleton />
                    </Grid>
                  ))}
                </Grid>
              )}

              {!loading && filteredHotels.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary">
                    Otel bulunamadı
                  </Typography>
                  <Typography color="text.secondary">
                    "{city}" şehrinde otel bulunamadı. Farklı bir şehir deneyin.
                  </Typography>
                </Box>
              )}

              {!loading && filteredHotels.length > 0 && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    {filteredHotels.length} otel bulundu
                  </Typography>

                  <Grid container spacing={3}>
                    {filteredHotels.map((hotel) => (
                      <Grid item xs={12} sm={6} lg={4} key={hotel.id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 4,
                            },
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="200"
                            image={getImageUrl(hotel)}
                            alt={hotel.name}
                            sx={{ objectFit: 'cover' }}
                          />

                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {hotel.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              📍 {hotel.city}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {hotel.address}
                            </Typography>
                            {hotel.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1 }}
                              >
                                {hotel.description.substring(0, 80)}
                                {hotel.description.length > 80 && '...'}
                              </Typography>
                            )}
                          </CardContent>

                          <CardActions>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={() => {
                                console.log('Navigating to:', `/hotel/${hotel.id}`);
                                navigate(`/hotel/${hotel.id}`);
                              }}
                            >
                              Detayları Gör
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Toplam {filteredHotels.length} otel
                    </Typography>
                  </Box>
                </>
              )}
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
}

export default HotelSearch;