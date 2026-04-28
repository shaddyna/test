// app/api/users/profile/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Image from '@/app/models/Image';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(userId).select('-pin');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const images = await Image.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        code: user.code,
        role: user.role,
        createdAt: user.createdAt,
      },
      images: images.map(img => ({
        id: img._id,
        url: img.cloudinaryUrl,
        createdAt: img.createdAt,
      })),
    });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}