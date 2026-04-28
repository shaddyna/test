import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import User from '@/app/models/User';

function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { pin, confirmPin } = await request.json();

    if (pin !== confirmPin) {
      return NextResponse.json(
        { error: 'PINs do not match' },
        { status: 400 }
      );
    }

    if (!pin || pin.length !== 4 || !/^\d+$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be 4 digits' },
        { status: 400 }
      );
    }

    let code = generateCode();
    let existingUser = await User.findOne({ code });

    while (existingUser) {
      code = generateCode();
      existingUser = await User.findOne({ code });
    }

    const user = await User.create({
      code,
      pin,
    });

    return NextResponse.json({
      success: true,
      code: user.code,
      userId: user._id,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate account' },
      { status: 500 }
    );
  }
}