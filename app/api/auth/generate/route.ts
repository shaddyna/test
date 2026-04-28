/*import { NextResponse } from 'next/server';
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
}*/

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
    const { name, pin, confirmPin } = await request.json();

    // Validate name
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if name already exists
    const existingName = await User.findOne({ name: name.trim() });
    if (existingName) {
      return NextResponse.json(
        { error: 'Username already taken. Please choose another name.' },
        { status: 400 }
      );
    }

    // Validate PIN
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

    // Generate unique code (for internal use/recovery)
    let code = generateCode();
    let existingUser = await User.findOne({ code });

    while (existingUser) {
      code = generateCode();
      existingUser = await User.findOne({ code });
    }

    const user = await User.create({
      name: name.trim(),
      code,
      pin,
    });

    return NextResponse.json({
      success: true,
      userId: user._id,
      name: user.name,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}