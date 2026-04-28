// app/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, User, Calendar, Shield } from 'lucide-react';

interface UserType {
  id: string;
  name: string;
  code: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (!userId || userRole !== 'admin') {
      window.location.href = '/';
      return;
    }
    
    setCurrentUserId(userId);
    fetchUsers(userId);
  }, []);

  const fetchUsers = async (requesterId: string) => {
    try {
      const response = await fetch(`/api/users/list?requesterId=${requesterId}`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to delete this user? All their images will also be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/delete?requesterId=${currentUserId}&targetUserId=${targetUserId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(users.filter(user => user.id !== targetUserId));
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f4] to-[#cfe0db] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#cfe0db] border-t-[#1f8d6f] rounded-full animate-spin" />
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
          <h1 className="text-3xl font-bold text-[#044536] mt-4">All Users</h1>
          <p className="text-[#4e7c6f] mt-2">Manage all registered users</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-[#044536]">{user.name}</h3>
                      {user.role === 'admin' && (
                        <span className="bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Shield size={12} />
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>Code: {user.code}</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete User
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}