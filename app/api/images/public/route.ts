// app/api/images/public/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Image from '@/app/models/Image';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const viewAll = searchParams.get('viewAll') === 'true';
    
    // For public access, always show approved images
    // You can add a status field later for moderation
    const query = viewAll ? {} : { isPublic: true }; // Adjust based on your model
    
    const images = await Image.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name role')
      .lean();
    
    return NextResponse.json({
      success: true,
      images: images.map(img => ({
        id: img._id,
        url: img.url,
        createdAt: img.createdAt,
        user: img.user ? {
          id: img.user._id,
          name: img.user.name,
          role: img.user.role,
        } : null,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch public images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}