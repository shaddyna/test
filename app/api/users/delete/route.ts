// app/api/users/delete/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import User from '@/app/models/User';
import Image from '@/app/models/Image';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requesterId = searchParams.get('requesterId');
    const targetUserId = searchParams.get('targetUserId');

    if (!requesterId || !targetUserId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
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

    // Get user's images to delete from Cloudinary
    const userImages = await Image.find({ userId: targetUserId });
    
    for (const image of userImages) {
      await cloudinary.uploader.destroy(image.cloudinaryPublicId);
    }

    // Delete user's images from database
    await Image.deleteMany({ userId: targetUserId });
    
    // Delete user
    await User.findByIdAndDelete(targetUserId);

    return NextResponse.json({
      success: true,
      message: 'User and all associated images deleted',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}