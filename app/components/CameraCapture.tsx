// app/components/CameraCapture.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, FlipHorizontalIcon,  } from 'lucide-react';

interface CameraCaptureProps {
  userId: string;
  onUploadSuccess: () => void;
}

export default function CameraCapture({ userId, onUploadSuccess }: CameraCaptureProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    setIsInitializing(true);
    setError('');
    
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          facingMode: { exact: facingMode }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsInitializing(false);
        };
      }
      
      setShowCamera(true);
      setCapturedImage(null);
      setShowPreview(false);
    } catch (err) {
      // Fallback if exact facing mode fails
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsInitializing(false);
          };
        }
        setShowCamera(true);
      } catch (fallbackErr) {
        setError('Unable to access camera. Please check permissions.');
        setIsInitializing(false);
      }
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      await startCamera();
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Apply mirror effect for front camera preview
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reset transform
        if (facingMode === 'user') {
          context.setTransform(1, 0, 0, 1, 0, 0);
        }
        
        // Get image data
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        setShowPreview(true);
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowPreview(false);
  };

  const uploadPhoto = async () => {
    if (!capturedImage) return;
    
    setUploading(true);
    setError('');
    
    // Convert base64 to file
    const blob = await (await fetch(capturedImage)).blob();
    const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
    
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
      closeCamera();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };
  
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setShowPreview(false);
    setCapturedImage(null);
    setError('');
    setIsInitializing(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <>
      {/* Floating Camera Button */}
      <button
        onClick={startCamera}
        className="w-14 h-14 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 active:scale-95"
        title="Take Photo"
      >
        <Camera className="w-6 h-6 text-white" />
      </button>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-black/50 backdrop-blur-md">
            <button
              onClick={closeCamera}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X size={28} />
            </button>
            <h3 className="text-white font-semibold">
              {showPreview ? 'Preview' : 'Take Photo'}
            </h3>
            <div className="w-8" />
          </div>

          {/* Camera/Preview Content */}
          <div className="flex-1 flex items-center justify-center relative">
            {!showPreview ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                />
                
                {/* Initializing Overlay */}
                {isInitializing && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-[#1f8d6f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-white">Initializing camera...</p>
                    </div>
                  </div>
                )}
                
                {/* Error Overlay */}
                {error && (
                  <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4">
                    <div className="text-center">
                      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <p className="text-white mb-4">{error}</p>
                      <button
                        onClick={startCamera}
                        className="px-6 py-2 bg-[#1f8d6f] text-white rounded-lg"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={capturedImage!}
                  alt="Preview"
                  className="w-full h-full object-contain bg-black"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          {!showPreview ? (
            <div className="bg-black/50 backdrop-blur-md p-6">
              <div className="flex justify-center items-center gap-8">
                <button
                  onClick={switchCamera}
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all active:scale-95"
                  disabled={isInitializing}
                >
                  <FlipHorizontalIcon className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={capturePhoto}
                  disabled={isInitializing}
                  className="relative group"
                >
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-white/10 hover:bg-white/20 transition-all active:scale-95">
                    <div className="absolute inset-2 rounded-full bg-white group-active:scale-95 transition-transform" />
                  </div>
                </button>
                
                <div className="w-12" />
              </div>
            </div>
          ) : (
            <div className="bg-black/50 backdrop-blur-md p-6">
              <div className="flex justify-center gap-6">
                <button
                  onClick={retakePhoto}
                  className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  Retake
                </button>
                <button
                  onClick={uploadPhoto}
                  disabled={uploading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Upload
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-sm text-center mt-3">{error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}