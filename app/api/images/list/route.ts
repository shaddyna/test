/*import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
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

    const images = await Image.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      images: images.map(img => ({
        id: img._id,
        url: img.cloudinaryUrl,
        createdAt: img.createdAt,
      })),
    });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}*/

// app/api/images/list/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Image from '@/app/models/Image';
import User from '@/app/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const viewAll = searchParams.get('viewAll') === 'true';

    await connectToDatabase();

    let query = {};
    
    if (!viewAll && userId) {
      query = { userId };
    }

    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name role')
      .lean();

    return NextResponse.json({
      success: true,
      images: images.map(img => ({
        id: img._id,
        url: img.cloudinaryUrl,
        createdAt: img.createdAt,
        user: img.userId ? {
          id: img.userId._id,
          name: img.userId.name,
          role: img.userId.role,
        } : null,
      })),
    });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}