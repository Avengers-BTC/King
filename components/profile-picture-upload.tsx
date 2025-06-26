'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProfilePictureUploadProps {
  currentImage?: string | null;
  userId: string;
  onImageUpdate: (imageUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ProfilePictureUpload({ 
  currentImage, 
  userId, 
  onImageUpdate,
  size = 'md' 
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/users/${userId}/profile-picture`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onImageUpdate(result.imageUrl);
        setPreview(null);
        toast.success('Profile picture updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload profile picture');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removePreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayImage = preview || currentImage;

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-electric-pink/20 to-neon-cyan/20 border-2 border-electric-pink/30 relative group cursor-pointer`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          {displayImage ? (
            <img 
              src={displayImage} 
              alt="Profile picture" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="h-8 w-8 text-electric-pink/60" />
            </div>
          )}
          
          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isUploading ? 'opacity-100' : ''}`}>
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <Upload className="h-6 w-6 text-white" />
            )}
          </div>

          {/* Drag overlay */}
          {dragActive && (
            <div className="absolute inset-0 bg-electric-pink/20 border-2 border-electric-pink border-dashed flex items-center justify-center">
              <Upload className="h-6 w-6 text-electric-pink" />
            </div>
          )}
        </div>

        {/* Remove preview button */}
        {preview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePreview();
            }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Upload button */}
      <Button
        onClick={triggerFileInput}
        variant="outline"
        size="sm"
        disabled={isUploading}
        className="text-xs border-electric-pink/30 text-electric-pink hover:bg-electric-pink/10"
      >
        {isUploading ? 'Uploading...' : 'Change Photo'}
      </Button>

      <p className="text-xs text-app-text/60 text-center">
        JPG, PNG up to 5MB
      </p>
    </div>
  );
} 