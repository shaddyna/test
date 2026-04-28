/*'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSuccess: (userId: string, code: string) => void;
}

export default function AuthModal({ isOpen, onClose, mode, onSuccess }: AuthModalProps) {
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin, confirmPin }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        onSuccess(data.userId, data.code);
        onClose();
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: code.toUpperCase(), pin }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        onSuccess(data.userId, data.code);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-[#044536] mb-6">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'login' && (
            <div>
              <label className="block text-sm font-medium text-[#4e7c6f] mb-2">
                Your Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-[#cfe0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f8d6f] text-gray-900 uppercase"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#4e7c6f] mb-2">
              4-Digit PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2 border border-[#cfe0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f8d6f] text-gray-900"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              required
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-[#4e7c6f] mb-2">
                Confirm PIN
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-[#cfe0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f8d6f] text-gray-900"
                placeholder="Confirm 4-digit PIN"
                maxLength={4}
                required
              />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Generate Account' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setError('');
              setCode('');
              setPin('');
              setConfirmPin('');
            }}
            className="text-[#1f8d6f] font-semibold hover:underline"
          >
            {mode === 'login' ? 'Create one' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}*/

/*'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSuccess: (userId: string, name: string) => void;
}

export default function AuthModal({ isOpen, onClose, mode, onSuccess }: AuthModalProps) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, pin, confirmPin }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        onSuccess(data.userId, data.name);
        onClose();
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, pin }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        onSuccess(data.userId, data.name);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-[#044536] mb-6">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4e7c6f] mb-2">
              {mode === 'signup' ? 'Your Name' : 'Username'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#cfe0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f8d6f] text-gray-900"
              placeholder={mode === 'signup' ? "Enter your name" : "Enter your username"}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4e7c6f] mb-2">
              4-Digit PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2 border border-[#cfe0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f8d6f] text-gray-900"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              required
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-[#4e7c6f] mb-2">
                Confirm PIN
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-[#cfe0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f8d6f] text-gray-900"
                placeholder="Confirm 4-digit PIN"
                maxLength={4}
                required
              />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setError('');
              setName('');
              setPin('');
              setConfirmPin('');
            }}
            className="text-[#1f8d6f] font-semibold hover:underline"
          >
            {mode === 'login' ? 'Create one' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}*/

// app/components/AuthModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup';
  onSuccess: (userId: string, name: string, role: string) => void;
}

export default function AuthModal({ isOpen, onClose, mode, onSuccess }: AuthModalProps) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, pin, confirmPin }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        onSuccess(data.userId, data.name, data.role);
        onClose();
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, pin }),
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error);

        onSuccess(data.userId, data.name, data.role);
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-[#044536] mb-6">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4e7c6f] mb-2">
              {mode === 'signup' ? 'Your Name' : 'Username'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#cfe0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f8d6f] text-gray-900"
              placeholder={mode === 'signup' ? "Enter your name" : "Enter your username"}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4e7c6f] mb-2">
              4-Digit PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-2 border border-[#cfe0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f8d6f] text-gray-900"
              placeholder="Enter 4-digit PIN"
              maxLength={4}
              required
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-[#4e7c6f] mb-2">
                Confirm PIN
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-[#cfe0db] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f8d6f] text-gray-900"
                placeholder="Confirm 4-digit PIN"
                maxLength={4}
                required
              />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setError('');
              setName('');
              setPin('');
              setConfirmPin('');
            }}
            className="text-[#1f8d6f] font-semibold hover:underline"
          >
            {mode === 'login' ? 'Click X to Create' : 'Click X to Login'}
          </button>
        </p>
      </div>
    </div>
  );
}