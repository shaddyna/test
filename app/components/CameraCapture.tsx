'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, FlipHorizontal } from 'lucide-react';

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
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoStreamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (photoStreamRef.current) {
      photoStreamRef.current.getTracks().forEach(track => track.stop());
      photoStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const checkVideoReady = useCallback(() => {
    const video = videoRef.current;
    if (!video) return false;
    
    // Video must be playing AND have dimensions
    const ready = video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0;
    
    if (ready && !isCameraReady) {
      console.log('Camera ready:', video.videoWidth, 'x', video.videoHeight);
      setIsCameraReady(true);
    }
    
    return ready;
  }, [isCameraReady]);

  const startCamera = async () => {
    setError('');
    setIsCameraReady(false);
    stopStream();
    
    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      
      console.log('Opening camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      photoStreamRef.current = mediaStream;
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        
        // Explicit play is REQUIRED on mobile Safari/Chrome
        await video.play();
        
        // Poll for readiness since onloadedmetadata is unreliable with streams
        const checkInterval = setInterval(() => {
          if (checkVideoReady()) {
            clearInterval(checkInterval);
          }
        }, 100);
        
        // Fallback timeout
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!isCameraReady) {
            setError('Camera is taking too long to initialize. Please try again.');
          }
        }, 5000);
      }
      
      setShowCamera(true);
      setCapturedImage(null);
      setShowPreview(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      
      // Fallback: try any camera without facingMode constraint
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
        photoStreamRef.current = fallbackStream;
        
        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = fallbackStream;
          await video.play();
          
          const checkInterval = setInterval(() => {
            if (checkVideoReady()) {
              clearInterval(checkInterval);
            }
          }, 100);
          
          setTimeout(() => clearInterval(checkInterval), 5000);
        }
        setShowCamera(true);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setError('Unable to access camera. Please check permissions and ensure you are on HTTPS or localhost.');
      }
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    setIsCameraReady(false);
    stopStream();
    
    try {
      const constraints = {
        video: {
          facingMode: { ideal: newFacingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      photoStreamRef.current = mediaStream;
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        await video.play();
        
        const checkInterval = setInterval(() => {
          if (checkVideoReady()) {
            clearInterval(checkInterval);
          }
        }, 100);
        
        setTimeout(() => clearInterval(checkInterval), 5000);
      }
    } catch (err) {
      console.error('Error switching camera:', err);
      // Fallback
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        photoStreamRef.current = fallbackStream;
        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = fallbackStream;
          await video.play();
          
          const checkInterval = setInterval(() => {
            if (checkVideoReady()) {
              clearInterval(checkInterval);
            }
          }, 100);
          
          setTimeout(() => clearInterval(checkInterval), 5000);
        }
      } catch (fallbackErr) {
        setError('Unable to switch camera');
      }
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready');
      return;
    }
    
    if (!isCameraReady) {
      setError('Please wait for camera to be ready');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Double-check dimensions right before capture
    const photoWidth = video.videoWidth;
    const photoHeight = video.videoHeight;
    
    if (photoWidth === 0 || photoHeight === 0) {
      setError('Camera still initializing. Please wait a moment and try again.');
      setIsCameraReady(false);
      // Retry readiness check
      setTimeout(() => checkVideoReady(), 500);
      return;
    }
    
    canvas.width = photoWidth;
    canvas.height = photoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) {
      setError('Failed to capture photo');
      return;
    }

    // Apply mirror effect for front camera
    if (facingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Reset transform
    if (facingMode === 'user') {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    // Camera flash effect
    const flashDiv = document.createElement('div');
    flashDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:white;opacity:0;pointer-events:none;z-index:9999;transition:opacity 0.1s ease-out;';
    document.body.appendChild(flashDiv);
    
    requestAnimationFrame(() => {
      flashDiv.style.opacity = '0.8';
      setTimeout(() => {
        flashDiv.style.opacity = '0';
        setTimeout(() => flashDiv.remove(), 200);
      }, 50);
    });
    
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(photoData);
    setShowPreview(true);
    console.log('Photo captured:', photoWidth, 'x', photoHeight);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setShowPreview(false);
    setError('');
  };

  const uploadPhoto = async () => {
    if (!capturedImage) return;
    
    setUploading(true);
    setError('');
    
    try {
      const blob = await (await fetch(capturedImage)).blob();
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      
      console.log('Photo uploaded successfully');
      onUploadSuccess();
      closeCamera();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  const closeCamera = () => {
    stopStream();
    setShowCamera(false);
    setShowPreview(false);
    setCapturedImage(null);
    setError('');
    setIsCameraReady(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return (
    <>
      {/* Camera Button */}
      <button
        onClick={startCamera}
        className="w-14 h-14 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 active:scale-95"
        title="Take a Photo"
      >
        <Camera className="w-6 h-6 text-white" />
      </button>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg-black/50 backdrop-blur-md">
            <button
              onClick={closeCamera}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <X size={28} />
            </button>
            <h3 className="text-white font-semibold">
              {showPreview ? 'Photo Preview' : 'Take a Photo'}
            </h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${isCameraReady ? 'bg-green-500' : 'bg-yellow-500'} rounded-full animate-pulse`} />
              <span className="text-white text-xs">
                {isCameraReady ? 'READY' : '...'}
              </span>
            </div>
          </div>

          {/* Camera/Preview View */}
          <div className="flex-1 flex items-center justify-center relative bg-black overflow-hidden">
            {!showPreview ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Error Overlay */}
                {error && (
                  <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-10">
                    <div className="text-center">
                      <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      <p className="text-white mb-4">{error}</p>
                      <button
                        onClick={startCamera}
                        className="px-6 py-2 bg-[#1f8d6f] text-white rounded-lg hover:bg-[#1a7a60] transition-colors"
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
                  alt="Captured"
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
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all active:scale-95 disabled:opacity-30"
                  disabled={!isCameraReady}
                  title="Switch camera"
                >
                  <FlipHorizontal className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={takePhoto}
                  disabled={!isCameraReady}
                  className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Take photo"
                >
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-white/10 hover:bg-white/20 transition-all active:scale-95">
                    <div className="absolute inset-2 rounded-full bg-white group-active:scale-90 transition-transform" />
                  </div>
                </button>
                
                <div className="w-12" />
              </div>
              <p className="text-center text-white/60 text-xs mt-4">
                {facingMode === 'environment' ? 'Back Camera' : 'Front Camera (Selfie)'}
              </p>
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
                      Upload Photo
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