'use client';

import { useState } from 'react';
import { Upload, Image, Video, X } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GlowButton } from '@/components/ui/glow-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const clubs = [
  'Club Example - Nairobi',
  'Venue Example - Mombasa', 
  'Lounge Example - Kisumu',
  'Bar Example - Nakuru',
  'Club Example - Eldoret',
  // Real clubs will be loaded from your database
];

export default function UploadMomentPage() {
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    location: '',
    file: null as File | null
  });
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

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
    setFormData({ ...formData, file });
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFormData({ ...formData, file: null });
    setPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.file) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Mock upload logic
    console.log('Uploading moment:', formData);
    toast.success('Moment uploaded successfully! 🎉');
    
    // Reset form
    setFormData({
      title: '',
      caption: '',
      location: '',
      file: null
    });
    setPreview(null);
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-app-text mb-4">
            Share Your <span className="text-electric-pink">Moment</span>
          </h1>
          <p className="text-app-text/70 max-w-2xl mx-auto">
            Capture and share your epic nightlife experiences. Let the community see what&apos;s happening!
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-2xl text-app-text">Upload Moment</CardTitle>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div className="space-y-2">
                <Label>Photo or Video *</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-electric-pink bg-electric-pink/5' 
                      : 'border-electric-pink/30 hover:border-electric-pink/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {preview ? (
                    <div className="relative">
                      <div className="max-w-md mx-auto">
                        {formData.file?.type.startsWith('video/') ? (
                          <video 
                            src={preview} 
                            className="w-full rounded-lg"
                            controls
                          />
                        ) : (
                          <img 
                            src={preview} 
                            alt="Preview"
                            className="w-full rounded-lg"
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center mb-4">
                        <Upload className="h-12 w-12 text-electric-pink" />
                      </div>
                      <h3 className="text-lg font-medium text-app-text mb-2">
                        Drag and drop your file here
                      </h3>
                      <p className="text-app-text/60 mb-4">
                        or click to browse your files
                      </p>
                      <div className="flex justify-center space-x-4 mb-4">
                        <div className="flex items-center space-x-1 text-sm text-app-text/60">
                          {/* eslint-disable-next-line jsx-a11y/alt-text */}
                          <Image className="h-4 w-4" />
                          <span>JPG, PNG</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-app-text/60">
                          <Video className="h-4 w-4" />
                          <span>MP4, MOV</span>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Give your moment a catchy title..."
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="bg-app-surface border-electric-pink/30 focus:border-electric-pink"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                  <SelectTrigger className="bg-app-surface border-electric-pink/30">
                    <SelectValue placeholder="Where was this taken?" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map(club => (
                      <SelectItem key={club} value={club}>{club}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  placeholder="Tell us about your moment... (optional)"
                  value={formData.caption}
                  onChange={(e) => setFormData({...formData, caption: e.target.value})}
                  className="bg-app-surface border-electric-pink/30 focus:border-electric-pink min-h-[100px]"
                  rows={4}
                />
              </div>

              {/* Upload Button */}
              <div className="flex justify-end pt-4">
                <GlowButton 
                  type="submit" 
                  size="lg"
                  disabled={!formData.title || !formData.file}
                >
                  Share Moment
                </GlowButton>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
