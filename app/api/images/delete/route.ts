// app/api/images/delete/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Image from '@/app/models/Image';
import User from '@/app/models/User';
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
    const imageId = searchParams.get('imageId');

    if (!requesterId || !imageId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const requester = await User.findById(requesterId);
    const image = await Image.findById(imageId);

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Check if requester is admin or image owner
    if (requester.role !== 'admin' && image.userId.toString() !== requesterId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this image' },
        { status: 403 }
      );
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.cloudinaryPublicId);
    
    // Delete from database
    await Image.findByIdAndDelete(imageId);

    return NextResponse.json({
      success: true,
      message: 'Image deleted',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}