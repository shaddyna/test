import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { code, pin } = await request.json();

    const user = await User.findOne({ code, pin });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid code or PIN' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user._id,
      code: user.code,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}