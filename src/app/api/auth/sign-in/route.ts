import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    const role = data.user?.user_metadata?.role || 'RENTER';

    return NextResponse.json({
      success: true,
      user: data.user,
      role,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Sign in failed' },
      { status: 500 }
    );
  }
}
