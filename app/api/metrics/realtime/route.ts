// app/api/metrics/realtime/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import PageView from '@/app/models/PageView';
import User from '@/app/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = request.nextUrl.searchParams;
    const requesterId = searchParams.get('requesterId');
    
    // Verify admin access
    const requester = await User.findById(requesterId);
    if (!requester || requester.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    // Get views in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const activeVisitors = await PageView.aggregate([
      {
        $match: {
          timestamp: { $gte: fiveMinutesAgo }
        }
      },
      {
        $group: {
          _id: '$sessionId',
          page: { $last: '$page' },
          userName: { $last: '$userName' },
          userRole: { $last: '$userRole' },
          lastSeen: { $max: '$timestamp' }
        }
      },
      {
        $project: {
          sessionId: '$_id',
          page: 1,
          userName: 1,
          userRole: 1,
          lastSeen: 1
        }
      },
      {
        $sort: { lastSeen: -1 }
      }
    ]);
    
    // Get views in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const hourlyViews = await PageView.countDocuments({
      timestamp: { $gte: oneHourAgo }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        activeVisitors: activeVisitors.length,
        activeVisitorsList: activeVisitors,
        hourlyViews
      }
    });
  } catch (error) {
    console.error('Realtime metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch realtime metrics' },
      { status: 500 }
    );
  }
}