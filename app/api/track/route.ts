// app/api/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import PageView from '@/app/models/PageView';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { page, userId, userName, userRole, sessionId } = body;
    
    // Get IP address (handle various proxy headers)
    const headersList = headers();
    const forwardedFor = (await headersList).get('x-forwarded-for');
    const realIp = (await headersList).get('x-real-ip');
    let ipAddress = realIp || (forwardedFor ? forwardedFor.split(',')[0] : null);
    
    // Get user agent
    const userAgent = (await headersList).get('user-agent');
    
    // Get referrer
    const referrer = (await headersList).get('referer');
    
    // Create page view record
    const pageView = await PageView.create({
      page,
      userId: userId || null,
      userName: userName || 'Guest',
      userRole: userRole || 'guest',
      ipAddress,
      userAgent,
      referrer,
      sessionId: sessionId || `session_${Date.now()}_${Math.random()}`,
    });
    
    return NextResponse.json({ success: true, viewId: pageView._id });
  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}