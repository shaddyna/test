'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, FlipHorizontalIcon } from 'lucide-react';

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

  const startCamera = async () => {
    setError('');
    setIsCameraReady(false);
    
    try {
      // Stop any existing stream
      if (photoStreamRef.current) {
        photoStreamRef.current.getTracks().forEach(track => track.stop());
        photoStreamRef.current = null;
      }
      
      // Simple camera constraints for photo capture
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      console.log('Opening camera for photo capture...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      photoStreamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Camera ready, taking photos now');
          setIsCameraReady(true);
        };
      }
      
      setShowCamera(true);
      setCapturedImage(null);
      setShowPreview(false);
    } catch (err) {
      console.error('Camera access error:', err);
      
      // Fallback: try any camera
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        photoStreamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            console.log('Camera ready with fallback');
            setIsCameraReady(true);
          };
        }
        setShowCamera(true);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setError('Unable to access camera. Please check permissions.');
      }
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    setIsCameraReady(false);
    
    // Restart camera with new facing mode
    if (photoStreamRef.current) {
      photoStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    try {
      const constraints = {
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      photoStreamRef.current = mediaStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Camera switched, ready for photos');
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Error switching camera:', err);
      // Fallback: just use any camera
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
        photoStreamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
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
    
    // Get video dimensions
    const photoWidth = video.videoWidth;
    const photoHeight = video.videoHeight;
    
    if (photoWidth === 0 || photoHeight === 0) {
      setError('Camera not ready. Please wait a moment.');
      return;
    }
    
    // Set canvas dimensions for photo
    canvas.width = photoWidth;
    canvas.height = photoHeight;
    
    const context = canvas.getContext('2d');
    if (context) {
      // Apply mirror effect for front camera (so it looks like a mirror selfie)
      if (facingMode === 'user') {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
      }
      
      // Capture the photo from video stream
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Reset transform
      if (facingMode === 'user') {
        context.setTransform(1, 0, 0, 1, 0, 0);
      }
      
      // Add camera flash effect
      const flashDiv = document.createElement('div');
      flashDiv.style.position = 'fixed';
      flashDiv.style.top = '0';
      flashDiv.style.left = '0';
      flashDiv.style.width = '100%';
      flashDiv.style.height = '100%';
      flashDiv.style.backgroundColor = 'white';
      flashDiv.style.opacity = '0';
      flashDiv.style.pointerEvents = 'none';
      flashDiv.style.zIndex = '9999';
      flashDiv.style.transition = 'opacity 0.1s ease-out';
      document.body.appendChild(flashDiv);
      
      setTimeout(() => {
        flashDiv.style.opacity = '0.8';
        setTimeout(() => {
          flashDiv.style.opacity = '0';
          setTimeout(() => {
            flashDiv.remove();
          }, 200);
        }, 50);
      }, 10);
      
      // Get the captured photo as JPEG
      const photoData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(photoData);
      setShowPreview(true);
      console.log('Photo captured successfully');
    } else {
      setError('Failed to capture photo');
    }
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
    
    // Convert base64 to file
    const blob = await (await fetch(capturedImage)).blob();
    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
    
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
      
      console.log('Photo uploaded successfully');
      onUploadSuccess();
      closeCamera();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };
  
  const closeCamera = () => {
    if (photoStreamRef.current) {
      photoStreamRef.current.getTracks().forEach(track => track.stop());
      photoStreamRef.current = null;
    }
    setShowCamera(false);
    setShowPreview(false);
    setCapturedImage(null);
    setError('');
    setIsCameraReady(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (photoStreamRef.current) {
        photoStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
          <div className="flex-1 flex items-center justify-center relative bg-black">
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
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all active:scale-95"
                  disabled={!isCameraReady}
                  title="Switch camera"
                >
                  <FlipHorizontalIcon className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={takePhoto}
                  disabled={!isCameraReady}
                  className="relative group"
                  title="Take photo"
                >
                  <div className={`w-20 h-20 rounded-full border-4 border-white bg-white/10 hover:bg-white/20 transition-all active:scale-95 ${!isCameraReady && 'opacity-50 cursor-not-allowed'}`}>
                    <div className="absolute inset-2 rounded-full bg-white group-active:scale-95 transition-transform" />
                  </div>
                </button>
                
                <div className="w-12" />
              </div>
              <p className="text-center text-white/60 text-xs mt-4">
                📸 {facingMode === 'environment' ? 'Back Camera' : 'Front Camera (Selfie)'}
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