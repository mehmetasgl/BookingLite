// src/pages/admin/AllHotels.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import Navbar from '../../components/layout/Navbar';
import hotelService from '../../services/hotelService';

function AllHotels() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [hotels, searchTerm, statusFilter]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelService.getAllHotels();
      const data = response.data?.data || response.data || [];
      setHotels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Oteller yüklenemedi:', error);
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...hotels];

    if (searchTerm) {
      result = result.filter(hotel =>
        hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(hotel => hotel.status === statusFilter);
    }

    setFilteredHotels(result);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu oteli silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      await hotelService.deleteHotel(id);
      alert('Otel silindi');
      fetchHotels();
    } catch (error) {
      alert('Otel silinemedi');
    }
  };

  const getImageUrl = (hotel) => {
    if (hotel.mainImageUrl) {
      if (hotel.mainImageUrl.startsWith('http')) {
        return hotel.mainImageUrl;
      }
      return 'http://localhost:8080' + hotel.mainImageUrl;
    }
    return 'https://via.placeholder.com/400x200?text=No+Image';
  };

  const getStatusColor = (status) => {
    const colors = {
      'PUBLISHED': 'success',
      'PENDING': 'warning',
      'DRAFT': 'default',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          🏨 Tüm Oteller ({filteredHotels.length})
        </Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Otel veya şehir ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Durum</InputLabel>
            <Select
              value={statusFilter}
              label="Durum"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">Tümü</MenuItem>
              <MenuItem value="PUBLISHED">Yayında</MenuItem>
              <MenuItem value="PENDING">Beklemede</MenuItem>
              <MenuItem value="DRAFT">Taslak</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Hotels Grid */}
        {filteredHotels.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Otel bulunamadı
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredHotels.map((hotel) => (
              <Grid item xs={12} sm={6} md={4} key={hotel.id}>
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
                  {/* Image */}
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={getImageUrl(hotel)}
                      alt={hotel.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    {/* Status Badge */}
                    <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                      <Chip
                        label={hotel.status}
                        color={getStatusColor(hotel.status)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Hotel Name */}
                    <Typography variant="h6" gutterBottom>
                      {hotel.name}
                    </Typography>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {hotel.city}
                      </Typography>
                    </Box>

                    {/* Address */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                      noWrap
                    >
                      {hotel.address}
                    </Typography>

                    {/* Partner Info */}
                    <Typography variant="caption" color="text.secondary">
                      Partner ID: {hotel.partnerUserId}
                    </Typography>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                    >
                      Görüntüle
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(hotel.id)}
                    >
                      Sil
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}

export default AllHotels;