// src/components/common/ImageGallery.js
import React, { useState } from 'react';
import {
  Box,
  Dialog,
  IconButton,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from '@mui/icons-material';


function ImageGallery({ images, mainImage }) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allImages = mainImage
    ? [mainImage, ...images] 
    : images;

  const handleOpen = (index) => {
    setCurrentIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/400x300?text=No+Image';
    if (url.startsWith('http')) return url;
    return 'http://localhost:8080' + url;
  };

  if (!allImages || allImages.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.200',
          borderRadius: 2,
        }}
      >
        <img
          src="https://via.placeholder.com/400x300?text=No+Images"
          alt="No images"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </Box>
    );
  }

  return (
    <>
      {/* Ana Fotoğraf */}
      <Box
        onClick={() => handleOpen(0)}
        sx={{
          width: '100%',
          height: 400,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          mb: 2,
          '&:hover': {
            opacity: 0.9,
          },
        }}
      >
        <img
          src={getImageUrl(allImages[0])}
          alt="Main"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {allImages.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'white',
              px: 2,
              py: 1,
              borderRadius: 1,
              fontSize: '0.875rem',
            }}
          >
            {allImages.length} fotoğraf
          </Box>
        )}
      </Box>

      {/* Thumbnail Grid */}
      {allImages.length > 1 && (
        <ImageList cols={4} gap={8} sx={{ mb: 2 }}>
          {allImages.slice(1, 5).map((image, index) => (
            <ImageListItem
              key={index}
              onClick={() => handleOpen(index + 1)}
              sx={{
                cursor: 'pointer',
                borderRadius: 1,
                overflow: 'hidden',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <img
                src={getImageUrl(image)}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: 100,
                  objectFit: 'cover',
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Lightbox Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'black',
            boxShadow: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', width: '100%', height: '80vh' }}>
          {/* Close Button */}
          <IconButton
            onClick={handleClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
              zIndex: 2,
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Previous Button */}
          {allImages.length > 1 && (
            <IconButton
              onClick={handlePrev}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
                zIndex: 2,
              }}
            >
              <PrevIcon />
            </IconButton>
          )}

          {/* Image */}
          <img
            src={getImageUrl(allImages[currentIndex])}
            alt={`Image ${currentIndex + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />

          {/* Next Button */}
          {allImages.length > 1 && (
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                bgcolor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                },
                zIndex: 2,
              }}
            >
              <NextIcon />
            </IconButton>
          )}

          {/* Image Counter */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.6)',
              px: 2,
              py: 1,
              borderRadius: 1,
              fontSize: '0.875rem',
            }}
          >
            {currentIndex + 1} / {allImages.length}
          </Box>
        </Box>
      </Dialog>
    </>
  );
}

export default ImageGallery;
