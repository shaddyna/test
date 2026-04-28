'use client';

import { Camera, RefreshCw } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

interface ImageUploadProps {
  userId: string;
  onUploadSuccess: () => void;
}

export default function ImageUpload({ userId, onUploadSuccess }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isVideoReady, setIsVideoReady] = useState(false);

  const startCamera = async () => {
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      setIsVideoReady(false);
      
      // Simple constraints without exact to avoid OverconstrainedError
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      console.log('Requesting camera with constraints:', constraints);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video loaded, dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          setIsVideoReady(true);
        };
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      
      // Fallback: try without any facing mode constraint
      try {
        const fallbackConstraints = {
          video: true
        };
        
        const mediaStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            console.log('Video loaded with fallback');
            setIsVideoReady(true);
          };
        }
        setShowCamera(true);
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        alert('Unable to access camera. Please ensure you have granted camera permissions and are using HTTPS.');
      }
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    setIsVideoReady(false);
    
    // Restart camera with new facing mode
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    try {
      const constraints = {
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video loaded after switch');
          setIsVideoReady(true);
        };
      }
    } catch (err) {
      console.error('Error switching camera:', err);
      alert('Unable to switch camera. The requested camera might not be available.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setIsVideoReady(false);
  };

  const capturePhoto = () => {
    console.log('Capturing photo...');
    
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref missing');
      alert('Camera not ready');
      return;
    }
    
    if (!isVideoReady) {
      console.error('Video not ready');
      alert('Please wait for camera to be ready');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Get video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    console.log('Video dimensions:', videoWidth, 'x', videoHeight);
    
    if (videoWidth === 0 || videoHeight === 0) {
      console.error('Invalid video dimensions');
      alert('Camera not ready. Please wait a moment and try again.');
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      // Draw the video frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Add flash effect
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
      
      // Trigger flash
      setTimeout(() => {
        flashDiv.style.opacity = '0.8';
        setTimeout(() => {
          flashDiv.style.opacity = '0';
          setTimeout(() => {
            flashDiv.remove();
          }, 200);
        }, 50);
      }, 10);
      
      // Convert canvas to blob and upload
      canvas.toBlob(async (blob) => {
        if (blob) {
          console.log('Photo captured, size:', blob.size, 'bytes');
          await uploadPhoto(blob);
        } else {
          console.error('Failed to create blob from canvas');
          alert('Failed to capture photo');
        }
      }, 'image/jpeg', 0.9);
    } else {
      console.error('Could not get canvas 2D context');
      alert('Failed to capture image');
    }
  };

  const uploadPhoto = async (blob: Blob) => {
    setUploading(true);
    try {
      // Create file from blob
      const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
      console.log('Uploading file:', file.name, 'Size:', file.size);
      
      // Send to backend API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Upload error:', data);
        throw new Error(data.error || 'Upload failed');
      }

      console.log('Upload successful:', data.image.url);

      // Stop camera and close modal
      stopCamera();
      
      // Show success message
      alert('Photo uploaded successfully!');
      
      // Refresh the gallery
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
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
      {/* Camera Button */}
      <button
        onClick={startCamera}
        className="relative group"
        aria-label="Take a photo"
      >
        <div className="w-12 h-12 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <Camera className="w-5 h-5 text-white" />
        </div>
      </button>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Camera Header */}
          <div className="bg-black/90 backdrop-blur-sm p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${isVideoReady ? 'bg-green-500' : 'bg-yellow-500'} rounded-full animate-pulse`} />
              <span className="text-white text-sm font-medium">
                {isVideoReady ? 'READY' : 'STARTING...'}
              </span>
            </div>
            <h3 className="text-white font-semibold">Take a Photo</h3>
            <button
              onClick={stopCamera}
              className="text-white hover:text-gray-300 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Camera View */}
          <div className="flex-1 relative bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
              onCanPlay={() => {
                console.log('Video can play event');
                setIsVideoReady(true);
              }}
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camera Controls */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-12 items-center px-8">
              {/* Switch Camera Button */}
              <button
                onClick={switchCamera}
                className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-all flex items-center justify-center border border-white/20"
                aria-label="Switch camera"
              >
                <RefreshCw className="w-6 h-6 text-white" />
              </button>

              {/* Capture Button */}
              <button
                onClick={capturePhoto}
                disabled={uploading || !isVideoReady}
                className="relative group"
              >
                <div className={`w-20 h-20 rounded-full border-4 border-white bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center ${(!isVideoReady || uploading) && 'opacity-50 cursor-not-allowed'}`}>
                  <div className={`w-16 h-16 rounded-full bg-white transition-transform ${!uploading && isVideoReady ? 'group-hover:scale-95' : ''}`} />
                </div>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>

              {/* Placeholder for balance */}
              <div className="w-14" />
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-black/90 backdrop-blur-sm p-4 text-center">
            <p className="text-white text-sm">
              📸 {facingMode === 'environment' ? 'Using back camera' : 'Using front camera'} • Tap the circle to capture
            </p>
            <p className="text-white/60 text-xs mt-1">
              {!isVideoReady && 'Initializing camera...'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}