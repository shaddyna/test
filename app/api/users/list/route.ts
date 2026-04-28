// app/api/users/list/route.ts
/*import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId');

    if (!requesterId) {
      return NextResponse.json(
        { error: 'Requester ID required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const requester = await User.findById(requesterId);
    if (!requester || requester.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const users = await User.find({}).select('-pin').lean();

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        code: user.code,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}*/

// app/api/users/list/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId');

    if (!requesterId) {
      return NextResponse.json(
        { error: 'Requester ID required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if requester exists
    const requester = await User.findById(requesterId);
    if (!requester) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all users - no admin check needed for viewing
    const users = await User.find({}).select('-pin').lean();

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        code: user.code,
        role: user.role,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}