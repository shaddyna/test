/*import { NextResponse } from 'next/server';
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
}*/

/*import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { name, pin } = await request.json();

    // Validate inputs
    if (!name || !pin) {
      return NextResponse.json(
        { error: 'Username and PIN are required' },
        { status: 400 }
      );
    }

    // Find user by name and PIN
    const user = await User.findOne({ name: name.trim(), pin });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or PIN' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user._id,
      name: user.name,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}*/

// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { name, pin } = await request.json();

    if (!name || !pin) {
      return NextResponse.json(
        { error: 'Username and PIN are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ name: name.trim(), pin });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or PIN' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user._id,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}