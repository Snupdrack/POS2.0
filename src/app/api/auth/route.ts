import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

// POST /api/auth - Login
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const hashedPassword = createHash('sha256').update(password).digest('hex');

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || user.password !== hashedPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (!user.active) {
      return NextResponse.json({ error: 'Account is disabled' }, { status: 403 });
    }

    // Set a simple session cookie (in production, use JWT or NextAuth)
    const sessionData = JSON.stringify({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('nitopos-session', Buffer.from(sessionData).toString('base64'), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

// DELETE /api/auth - Logout
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('nitopos-session');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

// GET /api/auth - Check session
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('nitopos-session');

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const sessionData = JSON.parse(
      Buffer.from(session.value, 'base64').toString()
    );

    return NextResponse.json({
      authenticated: true,
      user: sessionData,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
