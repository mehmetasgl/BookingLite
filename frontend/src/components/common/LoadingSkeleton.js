// src/components/common/LoadingSkeleton.js
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Grid,
} from '@mui/material';


export function HotelCardSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" width="80%" height={32} />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={36} />
        </Box>
      </CardContent>
    </Card>
  );
}

/**
 * HotelListSkeleton - Otel listesi skeleton
 */
export function HotelListSkeleton({ count = 6 }) {
  return (
    <Grid container spacing={3}>
      {[...Array(count)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <HotelCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * DetailPageSkeleton - Detay sayfası skeleton
 */
export function DetailPageSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="rectangular" height={400} sx={{ mb: 3, borderRadius: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="text" width="40%" />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Skeleton variant="rectangular" height={400} />
        </Grid>
      </Grid>
    </Box>
  );
}

/**
 * TableSkeleton - Tablo skeleton
 */
export function TableSkeleton({ rows = 5 }) {
  return (
    <Box>
      {[...Array(rows)].map((_, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton variant="rectangular" width="20%" height={50} />
          <Skeleton variant="rectangular" width="30%" height={50} />
          <Skeleton variant="rectangular" width="25%" height={50} />
          <Skeleton variant="rectangular" width="25%" height={50} />
        </Box>
      ))}
    </Box>
  );
}

export default {
  HotelCardSkeleton,
  HotelListSkeleton,
  DetailPageSkeleton,
  TableSkeleton,
};
