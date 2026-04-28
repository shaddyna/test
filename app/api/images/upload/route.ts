import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Image from '@/app/models/Image';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: file and userId' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'fireupnow',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const result = uploadResult as any;

    await connectToDatabase();

    // Save to database
    const image = await Image.create({
      userId,
      cloudinaryUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
    });

    return NextResponse.json({
      success: true,
      image: {
        id: image._id,
        url: image.cloudinaryUrl,
        createdAt: image.createdAt,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}