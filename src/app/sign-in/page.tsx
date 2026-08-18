import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'Sign in — JosHomes',
};

async function handleSignIn(formData: FormData) {
  'use server';

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    throw new Error('Email and password required');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Get user role from metadata
    const role = data.user?.user_metadata?.role || 'RENTER';

    // Redirect based on role
    if (role === 'ADMIN') {
      redirect('/admin');
    } else if (role === 'AGENT') {
      redirect('/dashboard');
    } else {
      redirect('/');
    }
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Welcome back</h1>
          <p className="text-neutral-600 mt-2">Sign in to your account</p>
        </div>

        <form action={handleSignIn} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Sign In
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-2">Demo Accounts:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Seeker: seeker@example.com</li>
            <li>• Agent: agent@example.com</li>
            <li>• Admin: admin@example.com</li>
            <li>• Password: demo123456</li>
          </ul>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-neutral-600 mt-6">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-emerald-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
