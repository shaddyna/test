/*'use client';

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
      {/* Navigation *
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-[#cfe0db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
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

      {/* Main Content *
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
}*/

// app/page.tsx
/*'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthModal from './components/AuthModal';
import ImageUpload from './components/ImageUpload';
import { Camera, LogOut, Sparkles, Users, Plus, User } from 'lucide-react';

interface ImageType {
  id: string;
  url: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewAll, setViewAll] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedUserName = localStorage.getItem('userName');
    const savedUserRole = localStorage.getItem('userRole');
    
    if (savedUserId && savedUserName) {
      setUserId(savedUserId);
      setUserName(savedUserName);
      setUserRole(savedUserRole);
    } else {
      setShowAuth(true);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchImages();
    }
  }, [userId, viewAll]);

  const fetchImages = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/images/list?userId=${userId}&viewAll=${viewAll}`);
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

  const handleAuthSuccess = (id: string, name: string, role: string) => {
    setUserId(id);
    setUserName(name);
    setUserRole(role);
    localStorage.setItem('userId', id);
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setUserId(null);
    setUserName(null);
    setUserRole(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setShowAuth(true);
    setImages([]);
  };

  const handleUploadSuccess = () => {
    setShowUpload(false);
    fetchImages();
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`/api/images/delete?requesterId=${userId}&imageId=${imageId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setImages(images.filter(img => img.id !== imageId));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to delete image');
    }
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
                Login              </button>
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
      {/* Navigation *
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-[#cfe0db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] bg-clip-text text-transparent">
                FireUpNow
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#cfe0db] rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {userName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline text-[#4e7c6f] font-medium">{userName}</span>
              </Link>
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

      {/* Main Content *
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Toggle *
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setViewAll(true)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              viewAll
                ? 'bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white shadow-lg'
                : 'bg-white text-[#4e7c6f] hover:shadow-md'
            }`}
          >
            <Sparkles size={18} />
            All Photos
          </button>
          <button
            onClick={() => setViewAll(false)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              !viewAll
                ? 'bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white shadow-lg'
                : 'bg-white text-[#4e7c6f] hover:shadow-md'
            }`}
          >
            <Camera size={18} />
            My Photos
          </button>
        </div>

        {loading && images.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#cfe0db] border-t-[#1f8d6f] rounded-full animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <Camera className="w-20 h-20 mx-auto text-[#86b2a5] mb-4" />
            <h3 className="text-2xl font-semibold text-[#044536] mb-2">No photos yet</h3>
            <p className="text-[#4e7c6f]">
              {viewAll ? "No photos have been uploaded yet!" : "Upload your first photo!"}
            </p>
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => window.open(image.url, '_blank')}
                    className="px-3 py-2 bg-white rounded-lg text-[#1f8d6f] font-semibold hover:bg-[#1f8d6f] hover:text-white transition-colors"
                  >
                    View Full
                  </button>
                  {(userRole === 'admin' || image.user?.id === userId) && (
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="px-3 py-2 bg-red-500 rounded-lg text-white font-semibold hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
                {viewAll && image.user && (
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                    <p className="text-xs text-white font-medium">
                      {image.user.name}
                      {image.user.role === 'admin' && ' 👑'}
                    </p>
                  </div>
                )}
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

      {/* Floating Buttons *
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        {/* Users Button *
        {userRole === 'admin' && (
          <Link
            href="/users"
            className="w-14 h-14 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Users className="w-6 h-6 text-white" />
          </Link>
        )}
        
        {/* Upload Button (Admin only) *
        {userRole === 'admin' && (
          <button
            onClick={() => setShowUpload(true)}
            className="w-14 h-14 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Upload Modal for Admin *
      {showUpload && userRole === 'admin' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <Camera size={24} />
            </button>
            <h2 className="text-2xl font-bold text-[#044536] mb-4">Upload Photo</h2>
            <ImageUpload userId={userId} onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      )}
    </div>
  );
}*/

// app/page.tsx
/*'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthModal from './components/AuthModal';
import ImageUpload from './components/ImageUpload';
import { Camera, LogOut, Sparkles, Users, Trash2, X } from 'lucide-react';

interface ImageType {
  id: string;
  url: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewAll, setViewAll] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedUserName = localStorage.getItem('userName');
    const savedUserRole = localStorage.getItem('userRole');
    
    if (savedUserId && savedUserName) {
      setUserId(savedUserId);
      setUserName(savedUserName);
      setUserRole(savedUserRole);
    } else {
      setShowAuth(true);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchImages();
    }
  }, [userId, viewAll]);

  const fetchImages = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/images/list?userId=${userId}&viewAll=${viewAll}`);
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

  const handleAuthSuccess = (id: string, name: string, role: string) => {
    setUserId(id);
    setUserName(name);
    setUserRole(role);
    localStorage.setItem('userId', id);
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setUserId(null);
    setUserName(null);
    setUserRole(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setShowAuth(true);
    setImages([]);
  };

  const handleUploadSuccess = () => {
    fetchImages();
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/delete?requesterId=${userId}&imageId=${imageId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setImages(images.filter(img => img.id !== imageId));
        setShowDeleteConfirm(null);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to delete image');
    }
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
      {/* Navigation *
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-[#cfe0db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] bg-clip-text text-transparent">
                FireUpNow
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <ImageUpload userId={userId} onUploadSuccess={handleUploadSuccess} />
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#cfe0db] rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {userName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline text-[#4e7c6f] font-medium">{userName}</span>
              </Link>
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

      {/* Main Content *
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* View Toggle *
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setViewAll(true)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              viewAll
                ? 'bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white shadow-lg'
                : 'bg-white text-[#4e7c6f] hover:shadow-md'
            }`}
          >
            <Sparkles size={18} />
            All Photos
          </button>
          <button
            onClick={() => setViewAll(false)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              !viewAll
                ? 'bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white shadow-lg'
                : 'bg-white text-[#4e7c6f] hover:shadow-md'
            }`}
          >
            <Camera size={18} />
            My Photos
          </button>
        </div>

        {loading && images.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#cfe0db] border-t-[#1f8d6f] rounded-full animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <Camera className="w-20 h-20 mx-auto text-[#86b2a5] mb-4" />
            <h3 className="text-2xl font-semibold text-[#044536] mb-2">No photos yet</h3>
            <p className="text-[#4e7c6f]">
              {viewAll ? "No photos have been uploaded yet!" : "Upload your first photo!"}
            </p>
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => window.open(image.url, '_blank')}
                    className="px-3 py-2 bg-white rounded-lg text-[#1f8d6f] font-semibold hover:bg-[#1f8d6f] hover:text-white transition-colors"
                  >
                    View Full
                  </button>
                  {/* Admin can delete any image, users can only delete their own *
                  {(userRole === 'admin' || image.user?.id === userId) && (
                    <button
                      onClick={() => setShowDeleteConfirm(image.id)}
                      className="px-3 py-2 bg-red-500 rounded-lg text-white font-semibold hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
                {viewAll && image.user && (
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                    <p className="text-xs text-white font-medium">
                      {image.user.name}
                      {image.user.role === 'admin' && ' 👑'}
                    </p>
                  </div>
                )}
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

      {/* Floating Users Button - Visible to ALL users *
      <div className="fixed bottom-8 right-8">
        <Link
          href="/users"
          className="w-14 h-14 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Users className="w-6 h-6 text-white" />
        </Link>
      </div>

      {/* Delete Confirmation Modal *
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-[#044536] mb-3">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this image? This action cannot be undone.</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteImage(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}*/

// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthModal from './components/AuthModal';
import ImageUpload from './components/ImageUpload';
import { Camera, LogOut, Sparkles, Users, Trash2, X, Plus } from 'lucide-react';

interface ImageType {
  id: string;
  url: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    role: string;
  };
}

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewAll, setViewAll] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCameraUpload, setShowCameraUpload] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedUserName = localStorage.getItem('userName');
    const savedUserRole = localStorage.getItem('userRole');
    
    if (savedUserId && savedUserName) {
      setUserId(savedUserId);
      setUserName(savedUserName);
      setUserRole(savedUserRole);
    } else {
      setShowAuth(true);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchImages();
    }
  }, [userId, viewAll]);

  const fetchImages = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/images/list?userId=${userId}&viewAll=${viewAll}`);
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

  const handleAuthSuccess = (id: string, name: string, role: string) => {
    setUserId(id);
    setUserName(name);
    setUserRole(role);
    localStorage.setItem('userId', id);
    localStorage.setItem('userName', name);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    setUserId(null);
    setUserName(null);
    setUserRole(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setShowAuth(true);
    setImages([]);
  };

  const handleUploadSuccess = () => {
    setShowCameraUpload(false);
    fetchImages();
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/images/delete?requesterId=${userId}&imageId=${imageId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setImages(images.filter(img => img.id !== imageId));
        setShowDeleteConfirm(null);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to delete image');
    }
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] bg-clip-text text-transparent">
                FireUpNow
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#cfe0db] rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {userName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline text-[#4e7c6f] font-medium">{userName}</span>
              </Link>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* View Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setViewAll(true)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              viewAll
                ? 'bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white shadow-lg'
                : 'bg-white text-[#4e7c6f] hover:shadow-md'
            }`}
          >
            <Sparkles size={18} />
            All Photos
          </button>
          <button
            onClick={() => setViewAll(false)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              !viewAll
                ? 'bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white shadow-lg'
                : 'bg-white text-[#4e7c6f] hover:shadow-md'
            }`}
          >
            <Camera size={18} />
            My Photos
          </button>
        </div>

        {loading && images.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#cfe0db] border-t-[#1f8d6f] rounded-full animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <Camera className="w-20 h-20 mx-auto text-[#86b2a5] mb-4" />
            <h3 className="text-2xl font-semibold text-[#044536] mb-2">No photos yet</h3>
            <p className="text-[#4e7c6f]">
              {viewAll ? "No photos have been uploaded yet!" : "Upload your first photo!"}
            </p>
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={() => window.open(image.url, '_blank')}
                    className="px-3 py-2 bg-white rounded-lg text-[#1f8d6f] font-semibold hover:bg-[#1f8d6f] hover:text-white transition-colors"
                  >
                    View Full
                  </button>
                  {/* Admin can delete any image, users can only delete their own */}
                  {(userRole === 'admin' || image.user?.id === userId) && (
                    <button
                      onClick={() => setShowDeleteConfirm(image.id)}
                      className="px-3 py-2 bg-red-500 rounded-lg text-white font-semibold hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
                {viewAll && image.user && (
                  <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                    <p className="text-xs text-white font-medium">
                      {image.user.name}
                      {image.user.role === 'admin' && ' 👑'}
                    </p>
                  </div>
                )}
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

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        {/* Camera Button - Visible to ALL users */}
        <button
          onClick={() => setShowCameraUpload(true)}
          className="w-14 h-14 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Camera className="w-6 h-6 text-white" />
        </button>

        {/* Users Button - Visible to ALL users */}
        <Link
          href="/users"
          className="w-14 h-14 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Users className="w-6 h-6 text-white" />
        </Link>

        {/* Admin Plus Button - Only for Admin (upload from gallery) */}
        {userRole === 'admin' && (
          <ImageUpload 
            userId={userId} 
            userRole={userRole}
            onUploadSuccess={handleUploadSuccess} 
          />
        )}
      </div>

      {/* Camera Upload Modal for All Users */}
      {showCameraUpload && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 relative">
            <button
              onClick={() => setShowCameraUpload(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>

            <div className="relative">
              <video
                id="camera-video"
                autoPlay
                playsInline
                className="w-full rounded-lg"
                style={{ transform: 'scaleX(-1)' }}
              />
              <canvas id="camera-canvas" className="hidden" />
              
              <div className="flex justify-center gap-4 mt-4">
                <button
                  id="capture-photo"
                  className="px-6 py-3 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Capture Photo
                </button>
                <button
                  onClick={() => setShowCameraUpload(false)}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-[#044536] mb-3">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this image? This action cannot be undone.</p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteImage(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}