// app/components/AdminGalleryUpload.tsx
'use client';

import { useState, useRef } from 'react';
import { Plus, Upload, X } from 'lucide-react';

interface AdminGalleryUploadProps {
  userId: string;
  onUploadSuccess: () => void;
}

export default function AdminGalleryUpload({ userId, onUploadSuccess }: AdminGalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      onUploadSuccess();
      setShowOptions(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Floating Plus Button - Only for Admin */}
      <button
        onClick={() => setShowOptions(true)}
        className="w-14 h-14 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        title="Upload from Gallery"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Gallery Upload Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => {
                setShowOptions(false);
                setError('');
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-[#044536] mb-6">Upload from Gallery</h2>

            <div className="space-y-4">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Upload size={20} />
                Choose from Gallery
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {error && (
                <div className="text-red-500 text-sm text-center mt-2">{error}</div>
              )}

              {uploading && (
                <div className="text-center text-[#1f8d6f] mt-2">
                  <div className="inline-block w-6 h-6 border-2 border-[#1f8d6f] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}