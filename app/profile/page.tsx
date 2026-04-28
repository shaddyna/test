// app/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Shield, Trash2, Camera } from 'lucide-react';

interface ImageType {
  id: string;
  url: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  name: string;
  code: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [images, setImages] = useState<ImageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (!userId) {
      window.location.href = '/';
      return;
    }
    
    setCurrentUserId(userId);
    setCurrentUserRole(userRole);
    fetchProfile(userId);
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/profile?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.user);
        setImages(data.images);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`/api/images/delete?requesterId=${currentUserId}&imageId=${imageId}`, {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f4] to-[#cfe0db] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#cfe0db] border-t-[#1f8d6f] rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f4] to-[#cfe0db] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/" className="text-[#1f8d6f] hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf6f4] to-[#cfe0db]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#4e7c6f] hover:text-[#1f8d6f] transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="w-24 h-24 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-[#044536]">{profile.name}</h1>
                {profile.role === 'admin' && (
                  <span className="bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Shield size={14} />
                    Admin
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="font-semibold">Access Code:</span>
                  <span className="font-mono">{profile.code}</span>
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <Calendar size={16} />
                  Joined: {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <h2 className="text-2xl font-bold text-[#044536] mb-4">My Photos</h2>
        
        {images.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <Camera className="w-16 h-16 mx-auto text-[#86b2a5] mb-3" />
            <p className="text-[#4e7c6f]">No photos yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
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
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => window.open(image.url, '_blank')}
                    className="px-3 py-2 bg-white rounded-lg text-[#1f8d6f] font-semibold hover:bg-[#1f8d6f] hover:text-white transition-colors"
                  >
                    View Full
                  </button>
                  {(currentUserRole === 'admin' || true) && (
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="px-3 py-2 bg-red-500 rounded-lg text-white font-semibold hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
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
      </div>
    </div>
  );
}