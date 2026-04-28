// app/page.tsx
/*'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthModal from './components/AuthModal';
import CameraCapture from './components/CameraCapture';
import AdminGalleryUpload from './components/AdminGalleryUpload';
import { LogOut, Sparkles, Users, Trash2, X, TrendingUp } from 'lucide-react';
import { usePageTracking } from './hooks/usePageTracking';

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

    // Listen for auth mode switching
    const handleSwitchMode = (event: CustomEvent) => {
      setAuthMode(event.detail);
      setShowAuth(true);
    };
    window.addEventListener('switchAuthMode', handleSwitchMode as EventListener);
    return () => window.removeEventListener('switchAuthMode', handleSwitchMode as EventListener);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchImages();
    }
  }, [userId, viewAll]);

  usePageTracking(userId, userName, userRole);

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
                title="Logout"
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
            <LogOut size={18} className="rotate-90" />
            My Photos
          </button>
        </div>

        {loading && images.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#cfe0db] border-t-[#1f8d6f] rounded-full animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <CameraCapture userId={userId} onUploadSuccess={handleUploadSuccess} />
            <h3 className="text-2xl font-semibold text-[#044536] mt-4 mb-2">No photos yet</h3>
            <p className="text-[#4e7c6f]">
              {viewAll ? "No photos have been uploaded yet!" : "Click the camera button to take your first photo!"}
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

      {/* Floating Buttons *
      {userRole === 'admin' && (
      <Link
        href="/admin/metrics"
        className="w-14 h-14 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        title="Analytics Dashboard"
      >
        <TrendingUp className="w-6 h-6 text-white" />
      </Link>
    )}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        {/* Camera Button - ALL users *
        <CameraCapture userId={userId} onUploadSuccess={handleUploadSuccess} />

        {/* Users Button - ALL users *
        <Link
          href="/users"
          className="w-14 h-14 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
          title="View All Users"
        >
          <Users className="w-6 h-6 text-white" />
        </Link>

        {/* Admin Gallery Upload - ONLY Admin *
        {userRole === 'admin' && (
          <AdminGalleryUpload userId={userId} onUploadSuccess={handleUploadSuccess} />
        )}
      </div>

      {/* Delete Confirmation Modal *
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
}*/

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthModal from './components/AuthModal';
import CameraCapture from './components/CameraCapture';
import AdminGalleryUpload from './components/AdminGalleryUpload';
import { LogOut, Sparkles, Users, Trash2, X, TrendingUp, Lock, Eye } from 'lucide-react';
import { usePageTracking } from './hooks/usePageTracking';

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
  const [showAuthForAction, setShowAuthForAction] = useState<string | null>(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedUserName = localStorage.getItem('userName');
    const savedUserRole = localStorage.getItem('userRole');
    
    if (savedUserId && savedUserName) {
      setUserId(savedUserId);
      setUserName(savedUserName);
      setUserRole(savedUserRole);
    }

    // Listen for auth mode switching
    const handleSwitchMode = (event: CustomEvent) => {
      setAuthMode(event.detail);
      setShowAuth(true);
    };
    window.addEventListener('switchAuthMode', handleSwitchMode as EventListener);
    return () => window.removeEventListener('switchAuthMode', handleSwitchMode as EventListener);
  }, []);

  useEffect(() => {
    // Fetch images regardless of login status
    fetchPublicImages();
  }, [viewAll]);

  useEffect(() => {
    // Fetch user-specific images only when logged in
    if (userId) {
      fetchUserImages();
    }
  }, [userId, viewAll]);

  usePageTracking(userId, userName, userRole);

  const fetchPublicImages = async () => {
    setLoading(true);
    try {
      // New endpoint for public images
      const response = await fetch(`/api/images/public?viewAll=${viewAll}`);
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Failed to fetch public images:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserImages = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/images/list?userId=${userId}&viewAll=${viewAll}`);
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
      }
    } catch (error) {
      console.error('Failed to fetch user images:', error);
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
    
    // Close any pending auth modal
    setShowAuth(false);
    setShowAuthForAction(null);
    
    // Refresh images with user context
    fetchUserImages();
  };

  const handleLogout = () => {
    setUserId(null);
    setUserName(null);
    setUserRole(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setImages([]);
    fetchPublicImages(); // Reload public images
  };

  const handleUploadSuccess = () => {
    if (userId) {
      fetchUserImages();
    } else {
      fetchPublicImages();
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!userId) {
      setShowAuthForAction('delete');
      setAuthMode('login');
      setShowAuth(true);
      return;
    }
    
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

  const handleCameraClick = () => {
    if (!userId) {
      setShowAuthForAction('upload');
      setAuthMode('signup');
      setShowAuth(true);
    }
  };

  const handleUsersClick = (e: React.MouseEvent) => {
    if (!userId) {
      e.preventDefault();
      setShowAuthForAction('viewUsers');
      setAuthMode('login');
      setShowAuth(true);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!userId) {
      e.preventDefault();
      setShowAuthForAction('viewProfile');
      setAuthMode('login');
      setShowAuth(true);
    }
  };

  const handleViewToggle = (view: boolean) => {
    if (!userId && !view) {
      // "My Photos" requires login
      setShowAuthForAction('myPhotos');
      setAuthMode('login');
      setShowAuth(true);
      return;
    }
    setViewAll(view);
  };

  // Navigation component (reused for both states)
  const Navigation = () => (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-[#cfe0db]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] bg-clip-text text-transparent">
              FireUpNow
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {userId ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-2 hover:bg-[#cfe0db] rounded-lg transition-colors"
                  onClick={handleProfileClick}
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
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-[#4e7c6f]" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-sm text-[#4e7c6f] flex items-center gap-1">
                  <Eye size={16} />
                  <span>Guest Viewing</span>
                </div>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuth(true);
                  }}
                  className="px-4 py-2 bg-white text-[#1f8d6f] rounded-lg font-semibold hover:shadow-md transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuth(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white rounded-lg font-semibold hover:shadow-md transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf6f4] to-[#cfe0db]">
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* View Toggle */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => handleViewToggle(true)}
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
            onClick={() => handleViewToggle(false)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 relative ${
              !viewAll && userId
                ? 'bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white shadow-lg'
                : 'bg-white text-[#4e7c6f] hover:shadow-md'
            }`}
          >
            <LogOut size={18} className="rotate-90" />
            My Photos
            {!userId && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                <Lock size={10} />
              </div>
            )}
          </button>
        </div>

        {loading && images.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#cfe0db] border-t-[#1f8d6f] rounded-full animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            {!userId && viewAll === false ? (
              <>
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Lock size={40} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-[#044536] mt-4 mb-2">Login to see your photos</h3>
                <p className="text-[#4e7c6f] mb-4">Create an account or login to view and upload your photos</p>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuth(true);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white rounded-lg font-semibold"
                >
                  Get Started
                </button>
              </>
            ) : (
              <>
                {userId && <CameraCapture userId={userId} onUploadSuccess={handleUploadSuccess} />}
                <h3 className="text-2xl font-semibold text-[#044536] mt-4 mb-2">No photos yet</h3>
                <p className="text-[#4e7c6f]">
                  {viewAll ? "No photos have been uploaded yet!" : "Click the camera button to take your first photo!"}
                </p>
                {!userId && (
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuth(true);
                    }}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white rounded-lg font-semibold"
                  >
                    Sign Up to Upload
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            {/* Info banner for guests */}
            {!userId && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-sm text-blue-800">
                  👋 You're viewing as a guest. <button 
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuth(true);
                    }}
                    className="font-semibold underline hover:text-blue-600"
                  >
                    Login
                  </button> or <button
                    onClick={() => {
                      setAuthMode('signup');
                      setShowAuth(true);
                    }}
                    className="font-semibold underline hover:text-blue-600"
                  >
                    Sign Up
                  </button> to upload your own photos!
                </p>
              </div>
            )}
            
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
                    {(userRole === 'admin' || (userId && image.user?.id === userId)) && (
                      <button
                        onClick={() => setShowDeleteConfirm(image.id)}
                        className="px-3 py-2 bg-red-500 rounded-lg text-white font-semibold hover:bg-red-600 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                    {!userId && (userRole === 'admin' || image.user?.id === userId) && (
                      <button
                        onClick={() => {
                          setShowAuthForAction('delete');
                          setAuthMode('login');
                          setShowAuth(true);
                        }}
                        className="px-3 py-2 bg-gray-500 rounded-lg text-white font-semibold hover:bg-gray-600 transition-colors flex items-center gap-1"
                      >
                        <Lock size={14} />
                        Login to Delete
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
          </>
        )}
      </main>

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        {/* Camera Button */}
        {userId ? (
          <CameraCapture userId={userId} onUploadSuccess={handleUploadSuccess} />
        ) : (
          <button
            onClick={handleCameraClick}
            className="w-14 h-14 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform relative group"
            title="Login to upload"
          >
            <div className="absolute -top-8 right-0 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Login to upload
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock size={20} className="text-white" />
              </div>
              <div className="opacity-30">
                <CameraCapture userId="" onUploadSuccess={() => {}} />
              </div>
            </div>
          </button>
        )}

        {/* Users Button */}
        <Link
          href={userId ? "/users" : "#"}
          onClick={handleUsersClick}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform ${
            userId 
              ? 'bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54]' 
              : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-pointer'
          }`}
          title={userId ? "View All Users" : "Login to view users"}
        >
          <Users className="w-6 h-6 text-white" />
        </Link>

        {/* Admin Gallery Upload - ONLY Admin */}
        {userRole === 'admin' && (
          <AdminGalleryUpload userId={userId} onUploadSuccess={handleUploadSuccess} />
        )}

        {/* Admin Metrics - ONLY Admin */}
        {userRole === 'admin' && (
          <Link
            href="/admin/metrics"
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
            title="Analytics Dashboard"
          >
            <TrendingUp className="w-6 h-6 text-white" />
          </Link>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => {
          setShowAuth(false);
          setShowAuthForAction(null);
        }}
        mode={authMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Login Required Modal (for better UX) */}
      {showAuthForAction && !showAuth && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowAuthForAction(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#044536] mb-2">Login Required</h3>
              <p className="text-gray-600 mb-6">
                {showAuthForAction === 'upload' && "You need to be logged in to upload photos"}
                {showAuthForAction === 'delete' && "You need to be logged in to delete photos"}
                {showAuthForAction === 'myPhotos' && "You need to be logged in to view your photos"}
                {showAuthForAction === 'viewUsers' && "You need to be logged in to view other users"}
                {showAuthForAction === 'viewProfile' && "You need to be logged in to view your profile"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAuthForAction(null);
                    setAuthMode('login');
                    setShowAuth(true);
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white rounded-lg font-semibold hover:shadow-md transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowAuthForAction(null);
                    setAuthMode('signup');
                    setShowAuth(true);
                  }}
                  className="flex-1 px-4 py-2 bg-white text-[#1f8d6f] border border-[#1f8d6f] rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Sign Up
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