// src/components/common/ImageUpload.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import api from '../../services/api';

function ImageUpload({ folder = 'hotels', multiple = false, onUploadSuccess, existingImages = [] }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      setPreviews(existingImages);
    }
  }, [existingImages]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);

    if (!multiple && files.length > 1) {
      setError('Sadece tek dosya seçebilirsiniz!');
      return;
    }

    if (multiple && files.length > 10) {
      setError('En fazla 10 dosya seçebilirsiniz!');
      return;
    }

    const invalidFiles = files.filter(file =>
      !['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)
    );
    if (invalidFiles.length > 0) {
      setError('Sadece JPEG, PNG, WEBP dosyaları yüklenebilir!');
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Dosya boyutu en fazla 5MB olabilir!');
      return;
    }

    setError('');
    setSelectedFiles(files);

    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      isNew: true,
    }));

    if (multiple) {
      setPreviews(prev => [...prev, ...newPreviews]);
    } else {
      setPreviews(newPreviews);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Lütfen dosya seçin!');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();

      if (multiple) {
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        formData.append('folder', folder);

        const response = await api.post('/files/upload-multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uploadedUrls = response.data.data.urls;

        setPreviews(prev => {
          let urlIndex = 0;
          return prev.map(preview => {
            if (preview.isNew && preview.file) {
              const newUrl = 'http://localhost:8080' + uploadedUrls[urlIndex];
              urlIndex++;
              return { url: newUrl, isNew: false };
            }
            return preview;
          });
        });

        if (onUploadSuccess) {
          onUploadSuccess(uploadedUrls);
        }

      } else {
        formData.append('file', selectedFiles[0]);
        formData.append('folder', folder);

        const response = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uploadedUrl = response.data.data.url;
        setPreviews([{ url: 'http://localhost:8080' + uploadedUrl, isNew: false }]);

        if (onUploadSuccess) {
          onUploadSuccess(uploadedUrl);
        }
      }

      setSelectedFiles([]);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Dosya yüklenirken hata oluştu!');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index) => {
    const removedPreview = previews[index];

    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);

    if (removedPreview.isNew && removedPreview.file) {
      const newFiles = selectedFiles.filter(f => f !== removedPreview.file);
      setSelectedFiles(newFiles);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Upload Button */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadIcon />}
          disabled={uploading}
        >
          Fotoğraf Seç
          <input
            type="file"
            hidden
            accept="image/jpeg,image/png,image/jpg,image/webp"
            multiple={multiple}
            onChange={handleFileSelect}
          />
        </Button>

        {selectedFiles.length > 0 && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {uploading ? 'Yükleniyor...' : `Yükle (${selectedFiles.length})`}
          </Button>
        )}
      </Box>

      {/* Image Previews */}
      {previews.length > 0 && (
        <ImageList cols={multiple ? 3 : 1} gap={8}>
          {previews.map((preview, index) => (
            <ImageListItem key={index} sx={{ position: 'relative' }}>
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                loading="lazy"
                style={{
                  height: 200,
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: preview.isNew ? '2px solid #1976d2' : 'none',
                }}
              />
              {preview.isNew && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  Yeni
                </Box>
              )}
              <ImageListItemBar
                sx={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                }}
                actionIcon={
                  <IconButton
                    sx={{ color: 'white' }}
                    onClick={() => handleRemove(index)}
                  >
                    {preview.isNew ? <CloseIcon /> : <DeleteIcon />}
                  </IconButton>
                }
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Info */}
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
        {multiple
          ? 'JPEG, PNG, WEBP - En fazla 10 dosya - Her biri max 5MB'
          : 'JPEG, PNG, WEBP - Max 5MB'
        }
      </Typography>
    </Box>
  );
}

export default ImageUpload;