"use client";

import { Camera, RefreshCw, X, Check } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  userId: string;
  onUploadSuccess: () => void;
}

export default function ImageUpload({ userId, onUploadSuccess }: ImageUploadProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // START CAMERA
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });

      setStream(mediaStream);
      setShowCamera(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

    } catch (err) {
      alert("Camera not available");
    }
  };

  // STOP CAMERA
  const stopCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setShowCamera(false);
    setCapturedImage(null);
    setIsReady(false);
  };

  // CAPTURE IMAGE (instant preview)
  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(image);
  };

  // RETAKE
  const retake = () => setCapturedImage(null);

  // UPLOAD
  const upload = async () => {
    if (!capturedImage) return;

    setUploading(true);

    try {
      const res = await fetch(capturedImage);
      const blob = await res.blob();

      const file = new File([blob], `photo.jpg`, { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
      );

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await uploadRes.json();

      await fetch("/api/images/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: data.secure_url,
          userId,
          publicId: data.public_id
        })
      });

      stopCamera();
      onUploadSuccess();

    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* OPEN CAMERA BUTTON */}
      <button
        onClick={startCamera}
        className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shadow-lg hover:scale-105 transition"
      >
        <Camera className="text-white" />
      </button>

      {/* MODAL */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            {/* TOP BAR */}
            <div className="flex justify-between p-4 text-white">
              <button onClick={stopCamera}><X /></button>
              <p>Camera</p>
              <div />
            </div>

            {/* CAMERA / PREVIEW */}
            <div className="flex-1 flex items-center justify-center relative">

              {!capturedImage ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <motion.img
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  src={capturedImage}
                  className="w-full h-full object-cover"
                />
              )}

              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* CONTROLS */}
            <div className="p-6 flex justify-center gap-8 items-center bg-black">

              {!capturedImage ? (
                <button
                  onClick={capture}
                  className="w-20 h-20 rounded-full border-4 border-white bg-white"
                />
              ) : (
                <>
                  <button
                    onClick={retake}
                    className="text-white text-sm"
                  >
                    Retake
                  </button>

                  <button
                    onClick={upload}
                    disabled={uploading}
                    className="bg-green-500 px-6 py-2 rounded-full text-white flex items-center gap-2"
                  >
                    {uploading ? "Uploading..." : "Send"}
                    <Check size={16} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}