// app/api/metrics/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import PageView from '@/app/models/PageView';
import User from '@/app/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const requesterId = searchParams.get('requesterId');
    const days = parseInt(searchParams.get('days') || '7');
    
    // Verify admin access
    const requester = await User.findById(requesterId);
    if (!requester || requester.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get total views
    const totalViews = await PageView.countDocuments({
      timestamp: { $gte: startDate }
    });
    
    // Get unique visitors (by sessionId)
    const uniqueVisitors = await PageView.distinct('sessionId', {
      timestamp: { $gte: startDate }
    });
    
    // Get views by day
    const viewsByDay = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$sessionId' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);
    
    // Get top pages
    const topPages = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$page',
          views: { $sum: 1 }
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get recent views
    const recentViews = await PageView.find({
      timestamp: { $gte: startDate }
    })
    .sort({ timestamp: -1 })
    .limit(50)
    .lean();
    
    // Get user activity
    const userActivity = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          userId: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$userId',
          userName: { $first: '$userName' },
          userRole: { $first: '$userRole' },
          views: { $sum: 1 },
          lastSeen: { $max: '$timestamp' }
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: 20
      }
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        totalViews,
        uniqueVisitors: uniqueVisitors.length,
        viewsByDay: viewsByDay.map(day => ({
          date: `${day._id.year}-${day._id.month}-${day._id.day}`,
          views: day.count,
          uniqueUsers: day.uniqueUsers.length
        })),
        topPages: topPages.map(page => ({
          page: page._id,
          views: page.views
        })),
        recentViews,
        userActivity
      }
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}