'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AuthModal from './components/AuthModal';
import ImageUpload from './components/ImageUpload';
import { Camera, LogOut, Sparkles } from 'lucide-react';

interface ImageType {
  id: string;
  url: string;
  createdAt: string;
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedUserCode = localStorage.getItem('userCode');
    
    if (savedUserId && savedUserCode) {
      setUserId(savedUserId);
      setUserCode(savedUserCode);
    } else {
      setShowAuth(true);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchImages();
    }
  }, [userId]);

  const fetchImages = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/images/list?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = (id: string, code: string) => {
    setUserId(id);
    setUserCode(code);
    localStorage.setItem('userId', id);
    localStorage.setItem('userCode', code);
  };

  const handleLogout = () => {
    setUserId(null);
    setUserCode(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userCode');
    setShowAuth(true);
    setImages([]);
  };

  const handleUploadSuccess = () => {
    fetchImages();
  };

  if (!userId) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-[#edf6f4] to-[#cfe0db] flex items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] bg-clip-text text-transparent">
                FireUpNow
              </h1>
              <p className="text-[#4e7c6f] mt-2">Share your moments</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuth(true);
                }}
                className="px-6 py-3 bg-white text-[#1f8d6f] rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuth(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          mode={authMode}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf6f4] to-[#cfe0db]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-[#cfe0db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#1f8d6f]" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] bg-clip-text text-transparent">
                FireUpNow
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-[#4e7c6f]">
                Code: <span className="font-mono font-semibold">{userCode}</span>
              </div>
              <ImageUpload userId={userId} onUploadSuccess={handleUploadSuccess} />
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-[#cfe0db] rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5 text-[#4e7c6f]" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && images.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#cfe0db] border-t-[#1f8d6f] rounded-full animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-20 h-20 mx-auto text-[#86b2a5] mb-4" />
            <h3 className="text-2xl font-semibold text-[#044536] mb-2">No photos yet</h3>
            <p className="text-[#4e7c6f]">Click the camera icon to upload your first photo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative aspect-square">
                  <Image
                    src={image.url}
                    alt="Uploaded content"
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => window.open(image.url, '_blank')}
                    className="px-4 py-2 bg-white rounded-lg text-[#1f8d6f] font-semibold hover:bg-[#1f8d6f] hover:text-white transition-colors"
                  >
                    View Full
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                  <p className="text-xs text-white">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}