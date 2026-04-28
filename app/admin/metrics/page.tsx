// app/admin/metrics/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Eye, Activity, Clock, TrendingUp } from 'lucide-react';

interface MetricsData {
  totalViews: number;
  uniqueVisitors: number;
  viewsByDay: Array<{ date: string; views: number; uniqueUsers: number }>;
  topPages: Array<{ page: string; views: number }>;
  recentViews: Array<any>;
  userActivity: Array<any>;
}

interface RealtimeData {
  activeVisitors: number;
  activeVisitorsList: Array<any>;
  hourlyViews: number;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [realtime, setRealtime] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedUserRole = localStorage.getItem('userRole');
    
    if (savedUserId && savedUserRole === 'admin') {
      setUserId(savedUserId);
      setUserRole(savedUserRole);
    } else {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    if (userId && userRole === 'admin') {
      fetchMetrics();
      fetchRealtime();
      
      // Refresh realtime data every 10 seconds
      const interval = setInterval(fetchRealtime, 10000);
      return () => clearInterval(interval);
    }
  }, [userId, days]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/metrics/overview?requesterId=${userId}&days=${days}`);
      const data = await response.json();
      if (data.success) {
        setMetrics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtime = async () => {
    try {
      const response = await fetch(`/api/metrics/realtime?requesterId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setRealtime(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch realtime metrics:', error);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#edf6f4] to-[#cfe0db] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#cfe0db] border-t-[#1f8d6f] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edf6f4] to-[#cfe0db]">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-[#cfe0db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-[#cfe0db] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#4e7c6f]" />
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] bg-clip-text text-transparent">
                Analytics Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="px-3 py-2 bg-white border border-[#cfe0db] rounded-lg text-[#4e7c6f] focus:outline-none focus:ring-2 focus:ring-[#1f8d6f]"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Realtime Stats */}
        {realtime && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#044536] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#1f8d6f]" />
                  Real-time Activity
                </h3>
                <span className="text-sm text-green-600 animate-pulse">● Live</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-[#1f8d6f]">{realtime.activeVisitors}</p>
                  <p className="text-sm text-gray-600">Active Now</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#1f8d6f]">{realtime.hourlyViews}</p>
                  <p className="text-sm text-gray-600">Views (Last Hour)</p>
                </div>
              </div>
              {realtime.activeVisitorsList.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Currently Active:</p>
                  <div className="space-y-1">
                    {realtime.activeVisitorsList.slice(0, 5).map((visitor, idx) => (
                      <div key={idx} className="text-sm text-gray-600 flex justify-between">
                        <span>{visitor.userName}</span>
                        <span className="text-xs">{visitor.page}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-[#044536] flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#1f8d6f]" />
                Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-[#1f8d6f]">{metrics.totalViews}</p>
                  <p className="text-sm text-gray-600">Total Views</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#1f8d6f]">{metrics.uniqueVisitors}</p>
                  <p className="text-sm text-gray-600">Unique Visitors</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Views Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-[#044536] mb-4">Daily Views</h3>
          <div className="space-y-3">
            {metrics.viewsByDay.map((day) => (
              <div key={day.date}>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{new Date(day.date).toLocaleDateString()}</span>
                  <span>{day.views} views ({day.uniqueUsers} unique)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#1f8d6f] to-[#0f6d54] h-4 rounded-full transition-all"
                    style={{
                      width: `${(day.views / Math.max(...metrics.viewsByDay.map(d => d.views))) * 100}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#044536] mb-4">Top Pages</h3>
            <div className="space-y-3">
              {metrics.topPages.map((page) => (
                <div key={page.page}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="font-mono">{page.page || '/'}</span>
                    <span>{page.views} views</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#1f8d6f] h-2 rounded-full transition-all"
                      style={{
                        width: `${(page.views / metrics.topPages[0].views) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#044536] mb-4">Top Users</h3>
            <div className="space-y-3">
              {metrics.userActivity.map((user) => (
                <div key={user._id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{user.userName}</p>
                    <p className="text-xs text-gray-500">
                      Last seen: {new Date(user.lastSeen).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[#1f8d6f] font-semibold">{user.views} views</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-[#044536] mb-4">Recent Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr className="text-left text-sm text-gray-600">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Page</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.recentViews.slice(0, 20).map((view) => (
                  <tr key={view._id} className="text-sm">
                    <td className="py-3 text-gray-800">{view.userName}</td>
                    <td className="py-3 font-mono text-xs text-gray-600">{view.page || '/'}</td>
                    <td className="py-3 text-gray-500">
                      {new Date(view.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        view.userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {view.userRole}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}