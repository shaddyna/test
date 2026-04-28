'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface ImageUploadProps {
  userId: string;
  userRole: string;
  onUploadSuccess: () => void;
}

export default function CameraCapture({ userId, userRole, onUploadSuccess }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
      setShowOptions(false);
      setError('');
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
            await uploadImage(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
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
      setShowCamera(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Camera Modal - Available to ALL users */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 relative">
            <button
              onClick={stopCamera}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>

            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={capturePhoto}
                  disabled={uploading}
                  className="px-6 py-3 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Capture Photo'}
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
              
              {error && (
                <div className="text-red-500 text-sm text-center mt-4">{error}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Options Modal - Admin only */}
      {showOptions && userRole === 'admin' && (
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

            <h2 className="text-2xl font-bold text-[#044536] mb-6">Add Photo</h2>

            <div className="space-y-4">
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Camera size={20} />
                Take Photo with Camera
              </button>

              <button
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-[#1f8d6f] text-[#1f8d6f] rounded-lg font-semibold hover:bg-[#1f8d6f] hover:text-white transition-all"
              >
                <Upload size={20} />
                Upload from Gallery
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