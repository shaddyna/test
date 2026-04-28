// app/components/CameraCapture.tsx
/*'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, Camera as CameraIcon, Upload, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  userId: string;
  onUploadSuccess: () => void;
}

export default function CameraCapture({ userId, onUploadSuccess }: CameraCaptureProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (showCamera && !capturedPhoto) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showCamera, capturedPhoto, facingMode]);

  const startCamera = async () => {
    stopCamera();
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: facingMode } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.setAttribute('playsinline', 'true');
      }
      setError('');
    } catch (err) {
      // Fallback: Try without exact facing mode constraint
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.setAttribute('playsinline', 'true');
        }
        setError('');
      } catch (fallbackErr) {
        setError('Unable to access camera. Please check permissions.');
        console.error('Camera error:', fallbackErr);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
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
        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedPhoto(photoDataUrl);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setError('');
    // Camera will restart via useEffect
  };

  const uploadPhoto = async () => {
    if (!capturedPhoto) return;

    setUploading(true);
    setError('');

    try {
      // Convert data URL to blob
      const blob = await fetch(capturedPhoto).then(res => res.blob());
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Upload failed');

      // Success
      onUploadSuccess();
      closeCamera();
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  /*const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (!response.ok) throw new Error(data.error || 'Upload failed');

      onUploadSuccess();
      closeCamera();
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };*

  const openCamera = () => {
    setShowCamera(true);
    setCapturedPhoto(null);
    setError('');
    setFacingMode('environment');
  };

  const closeCamera = () => {
    setShowCamera(false);
    setCapturedPhoto(null);
    setError('');
    stopCamera();
  };

  return (
    <>
      {/* Camera Button *
      <button
        onClick={openCamera}
        className="w-14 h-14 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        title="Take Photo"
      >
        <Camera className="w-6 h-6 text-white" />
      </button>

      {/* Hidden file input for gallery upload *
      {/*<input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />*

      {/* Camera Modal *
      {showCamera && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full relative overflow-hidden">
            {/* Header *
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#044536]">
                {capturedPhoto ? 'Preview Photo' : 'Take a Photo'}
              </h3>
              <button
                onClick={closeCamera}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Camera/Preview Area *
            <div className="relative bg-black aspect-video">
              {!capturedPhoto ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                  />
                  
                  {/* Camera Controls Overlay *
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
                    <button
                      onClick={switchCamera}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                      <RefreshCw className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-white rounded-full border-4 border-[#1f8d6f] flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                      <Upload className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={capturedPhoto}
                    alt="Captured preview"
                    className="w-full h-full object-contain bg-black"
                  />
                  
                  {/* Preview Controls *
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <button
                      onClick={retakePhoto}
                      disabled={uploading}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <RotateCcw size={20} />
                      Retake
                    </button>
                    <button
                      onClick={uploadPhoto}
                      disabled={uploading}
                      className="px-6 py-3 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={20} />
                          Upload Photo
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Error Message *
            {error && (
              <div className="p-4 bg-red-50 border-t border-red-200">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Hidden Canvas *
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}

{/*   {showCamera && (
  <div className="fixed inset-0 bg-black z-50 flex flex-col">

    {/* TOP BAR *
    <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/70 to-transparent">
      <h3 className="text-white font-semibold text-lg">
        {capturedPhoto ? 'Preview' : 'Camera'}
      </h3>

      <button onClick={closeCamera} className="text-white">
        <X size={28} />
      </button>
    </div>

    {/* CAMERA / PREVIEW *
    <div className="flex-1 relative flex items-center justify-center bg-black">

      {!capturedPhoto ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          }}
        />
      ) : (
        <img
          src={capturedPhoto}
          alt="Preview"
          className="w-full h-full object-contain bg-black"
        />
      )}

      {/* ERROR *
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
          <p className="text-red-400 text-center px-6">{error}</p>
        </div>
      )}
    </div>

    {/* BOTTOM CONTROLS *
    <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 pt-6 bg-gradient-to-t from-black/80 to-transparent">

      {!capturedPhoto ? (
        <div className="flex items-center justify-between px-8">

          {/* GALLERY *
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"
          >
            <Upload className="text-white" />
          </button>

          {/* CAPTURE *
          <button
            onClick={capturePhoto}
            className="relative"
          >
            <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
              <div className="w-14 h-14 bg-white rounded-full active:scale-90 transition" />
            </div>
          </button>

          {/* SWITCH CAMERA *
          <button
            onClick={switchCamera}
            className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"
          >
            <RefreshCw className="text-white" />
          </button>
        </div>
      ) : (
        <div className="flex gap-4 px-6">

          <button
            onClick={retakePhoto}
            disabled={uploading}
            className="flex-1 py-3 bg-gray-600 text-white rounded-xl font-semibold"
          >
            Retake
          </button>

          <button
            onClick={uploadPhoto}
            disabled={uploading}
            className="flex-1 py-3 bg-[#1f8d6f] text-white rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload
              </>
            )}
          </button>
        </div>
      )}
    </div>
  </div>
)}*
    </>
  );
}*/


'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCcw, Upload, RefreshCw } from 'lucide-react';

interface CameraCaptureProps {
  userId: string;
  onUploadSuccess: () => void;
}

export default function CameraCapture({ userId, onUploadSuccess }: CameraCaptureProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [initializing, setInitializing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (showCamera && !capturedPhoto) {
      startCamera();
    }
    return () => stopCamera();
  }, [showCamera, capturedPhoto, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setInitializing(true);
    setError('');

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode } // ✅ no "exact"
      });

      setStream(mediaStream);

      const video = videoRef.current;
      if (video) {
        video.srcObject = mediaStream;
        video.setAttribute('playsinline', 'true');

        await video.play().catch(() => {});
      }

      setInitializing(false);
    } catch (err) {
      try {
        const fallback = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(fallback);

        const video = videoRef.current;
        if (video) {
          video.srcObject = fallback;
          await video.play().catch(() => {});
        }

        setInitializing(false);
      } catch (e) {
        setError('Camera access denied or unavailable.');
        setInitializing(false);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const switchCamera = () => {
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // mirror front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);

    const photo = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(photo);
    stopCamera();
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setError('');
  };

  const uploadPhoto = async () => {
    if (!capturedPhoto) return;

    setUploading(true);
    setError('');

    try {
      const blob = await fetch(capturedPhoto).then(r => r.blob());
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      onUploadSuccess();
      closeCamera();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Invalid file type');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    try {
      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onUploadSuccess();
      closeCamera();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const openCamera = () => {
    setShowCamera(true);
    setCapturedPhoto(null);
    setError('');
  };

  const closeCamera = () => {
    setShowCamera(false);
    setCapturedPhoto(null);
    setError('');
    stopCamera();
  };

  return (
    <>
      {/* Open Button */}
      <button
        onClick={openCamera}
        className="w-14 h-14 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full flex items-center justify-center"
      >
        <Camera className="text-white" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">

          {/* TOP */}
          <div className="absolute top-0 left-0 right-0 z-20 flex justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
            <span className="text-white font-semibold">
              {capturedPhoto ? 'Preview' : 'Camera'}
            </span>
            <button onClick={closeCamera}>
              <X className="text-white" />
            </button>
          </div>

          {/* CONTENT */}
          <div className="flex-1 flex items-center justify-center relative">
            {!capturedPhoto ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : '' }}
              />
            ) : (
              <img src={capturedPhoto} className="w-full h-full object-contain" />
            )}

            {initializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* BOTTOM */}
          <div className="absolute bottom-0 left-0 right-0 pb-8 pt-6 bg-gradient-to-t from-black/80 to-transparent">

            {!capturedPhoto ? (
              <div className="flex justify-between px-8">

                <button onClick={() => fileInputRef.current?.click()} className="text-white">
                  <Upload />
                </button>

                <button onClick={capturePhoto}>
                  <div className="w-20 h-20 border-4 border-white rounded-full flex items-center justify-center">
                    <div className="w-14 h-14 bg-white rounded-full" />
                  </div>
                </button>

                <button onClick={switchCamera} className="text-white">
                  <RefreshCw />
                </button>

              </div>
            ) : (
              <div className="flex gap-4 px-6">

                <button onClick={retakePhoto} className="flex-1 bg-gray-600 text-white py-3 rounded-xl">
                  Retake
                </button>

                <button
                  onClick={uploadPhoto}
                  disabled={uploading}
                  className="flex-1 bg-[#1f8d6f] text-white py-3 rounded-xl"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>

              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </>
  );
}