'use client';

import React, { useState, useCallback } from 'react';
import { Image, UploadResponse } from '@/types';

// Props cho ImageUploader
interface ImageUploaderProps {
  onUpload: (image: Image) => void;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
}

// Props cho ImagePreview
interface ImagePreviewProps {
  image: Image;
  onRemove: () => void;
  className?: string;
}

// Props cho ImageGallery
interface ImageGalleryProps {
  images: Image[];
  onSelect: (image: Image) => void;
  selectedId?: string;
  className?: string;
}

// ImageUploader Component
export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  maxSize = 10,
  accept = 'image/*',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) {
      console.error('No file provided to handleFileUpload');
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(`File quá lớn. Tối đa ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Chỉ chấp nhận file hình ảnh');
      return;
    }

    setUploading(true);

    try {
      console.log('📤 Uploading file:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Upload response:', data);

      if (data.success && data.file) {
        // ✅ Tạo Image object đúng format nếu API chưa có
        const imageObject: Image = {
          id: data.file.id || `img_${Date.now()}`,
          url: data.file.url,
          name: data.file.name || data.file.originalName || file.name,
          size: data.file.size || file.size,
          type: data.file.type || file.type,
          uploadedAt: data.file.uploadedAt || new Date().toISOString()
        };

        console.log('✅ Created image object:', imageObject);
        onUpload(imageObject);
      } else {
        throw new Error(data.error || 'Upload failed - no file data');
      }
    } catch (error) {
      console.error('💥 Upload error:', error);
      alert(`Upload thất bại: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  }, [maxSize, onUpload]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? 'border-bnb-yellow bg-bnb-yellow/10' : 'border-gray-600 hover:border-gray-500'}
          ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && document.getElementById('file-input')?.click()}
      >
        {uploading ? (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bnb-yellow mx-auto mb-2"></div>
            <p className="text-gray-300">Đang upload...</p>
          </div>
        ) : (
          <div>
            <div className="text-4xl mb-2">📸</div>
            <p className="text-gray-300 mb-1">Click hoặc kéo thả để upload hình ảnh</p>
            <p className="text-gray-500 text-sm">Tối đa {maxSize}MB</p>
          </div>
        )}
      </div>
      
      <input
        id="file-input"
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};

// ImagePreview Component
export const ImagePreview: React.FC<ImagePreviewProps> = ({
  image,
  onRemove,
  className = ''
}) => {
  if (!image || !image.url) {
    return null;
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={image.url}
        alt={image.name || 'Uploaded image'}
        className="w-32 h-32 object-cover rounded-lg border border-gray-600"
      />
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 transition-colors"
        type="button"
      >
        ✕
      </button>
      <div className="mt-2 text-xs text-gray-400">
        {image.name && <p>{image.name}</p>}
        {image.size && <p>{(image.size / 1024).toFixed(1)} KB</p>}
      </div>
    </div>
  );
};

// ImageGallery Component
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onSelect,
  selectedId,
  className = ''
}) => {
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-2">📁</div>
        <p>Chưa có hình ảnh nào</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {images.map((image) => (
        <div
          key={image.id}
          className={`
            relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors
            ${selectedId === image.id ? 'border-bnb-yellow' : 'border-gray-600 hover:border-gray-500'}
          `}
          onClick={() => onSelect(image)}
        >
          <img
            src={image.url}
            alt={image.name || 'Gallery image'}
            className="w-full h-24 object-cover"
          />
          {selectedId === image.id && (
            <div className="absolute inset-0 bg-bnb-yellow/20 flex items-center justify-center">
              <div className="w-6 h-6 bg-bnb-yellow rounded-full flex items-center justify-center">
                <span className="text-bnb-black text-sm">✓</span>
              </div>
            </div>
          )}
          <div className="p-2 bg-bnb-black/80">
            <p className="text-xs text-gray-300 truncate">
              {image.name || 'Unnamed'}
            </p>
            {image.size && (
              <p className="text-xs text-gray-500">
                {(image.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};