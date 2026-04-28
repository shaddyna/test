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

  const startCamera = async () => {
    setError('');
    setIsCameraReady(false);
    stopStream();
    
    try {
      const constraints = {
        video: {
          facingMode: { exact: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      console.log('Requesting camera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      photoStreamRef.current = mediaStream;
      
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;
        video.setAttribute('playsinline', 'true'); // Important for iOS
        
        // Wait for video to be ready
        video.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          video.play().then(() => {
            console.log('Video playing');
            // Give it a moment to get the first frame
            setTimeout(() => {
              if (video.videoWidth > 0 && video.videoHeight > 0) {
                console.log('Camera ready:', video.videoWidth, 'x', video.videoHeight);
                setIsCameraReady(true);
              } else {
                setError('Camera failed to initialize');
              }
            }, 500);
          }).catch((err) => {
            console.error('Video play failed:', err);
            setError('Failed to start camera. Please check permissions.');
          });
        };
        
        video.onerror = () => {
          setError('Video error occurred');
        };
      }
      
      setShowCamera(true);
      setCapturedImage(null);
      setShowPreview(false);
    } catch (err: any) {
      console.error('Camera access error:', err);
      
      // Try fallback without facingMode constraint
      try {
        console.log('Trying fallback camera...');
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false 
        });
        photoStreamRef.current = fallbackStream;
        
        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = fallbackStream;
          video.setAttribute('playsinline', 'true');
          await video.play();
          setTimeout(() => {
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              setIsCameraReady(true);
            }
          }, 500);
        }
        setShowCamera(true);
      } catch (fallbackErr) {
        console.error('Fallback failed:', fallbackErr);
        setError('Unable to access camera. Please check permissions and ensure you are on HTTPS.');
      }
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    setIsCameraReady(false);
    stopStream();
    
    setTimeout(async () => {
      try {
        const constraints = {
          video: {
            facingMode: { exact: newFacingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        photoStreamRef.current = mediaStream;
        
        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = mediaStream;
          video.setAttribute('playsinline', 'true');
          
          video.onloadedmetadata = () => {
            video.play().then(() => {
              setTimeout(() => {
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                  setIsCameraReady(true);
                }
              }, 500);
            }).catch(console.error);
          };
        }
      } catch (err) {
        console.error('Error switching camera:', err);
        setError('Unable to switch camera');
        // Try to restart with current facing mode
        startCamera();
      }
    }, 100);
  };

  const takePhoto = () => {
    console.log('takePhoto called, isCameraReady:', isCameraReady);
    
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera components not ready');
      console.log('Missing refs:', { video: !!videoRef.current, canvas: !!canvasRef.current });
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
    
    console.log('Video dimensions:', photoWidth, photoHeight);
    
    if (photoWidth === 0 || photoHeight === 0) {
      setError('Camera not ready. Please wait a moment.');
      return;
    }
    
    // Set canvas to video dimensions
    canvas.width = photoWidth;
    canvas.height = photoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) {
      setError('Failed to get canvas context');
      return;
    }
    
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply mirror effect for front camera
    if (facingMode === 'user') {
      context.save();
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      context.restore();
    } else {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    
    // Convert to data URL
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    
    if (!photoData || photoData === 'data:,') {
      setError('Failed to capture photo');
      return;
    }
    
    console.log('Photo captured successfully');
    setCapturedImage(photoData);
    setShowPreview(true);
    
    // Flash effect
    const flashDiv = document.createElement('div');
    flashDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:white;opacity:0;pointer-events:none;z-index:9999;';
    document.body.appendChild(flashDiv);
    flashDiv.style.transition = 'opacity 0.1s';
    flashDiv.style.opacity = '0.8';
    setTimeout(() => {
      flashDiv.style.opacity = '0';
      setTimeout(() => flashDiv.remove(), 200);
    }, 100);
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
      // Convert data URL to blob
      const blob = await fetch(capturedImage).then(res => res.blob());
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      
      console.log('Uploading photo...');
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
      console.error('Upload error:', err);
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
                {isCameraReady ? 'READY' : 'Initializing...'}
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
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
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
                      <button
                        onClick={closeCamera}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-2"
                      >
                        Cancel
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