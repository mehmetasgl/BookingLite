// src/pages/customer/Home.js

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

function Home() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom>
          🏨 Booking Lite
        </Typography>
        <Typography variant="h5" gutterBottom>
          Hoş geldiniz, {user.email}!
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Rolünüz: <strong>{user.role}</strong>
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Button variant="contained" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 3, border: '1px dashed gray', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            ✅ Frontend Çalışıyor!
          </Typography>
          <Typography variant="body2">
            • Login başarılı<br />
            • JWT token alındı ve saklandı<br />
            • Kullanıcı bilgileri gösteriliyor<br />
            • Protected route çalışıyor
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Sırada: Otel arama, rezervasyon sayfaları...
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default Home;
