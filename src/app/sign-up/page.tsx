import { redirect } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'Sign up — JosHomes',
};

async function handleSignUp(formData: FormData) {
  'use server';

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;

  if (!email || !password || !role) {
    return { error: 'Missing required fields' };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (error) throw error;

    // Redirect to login
    redirect('/sign-in?message=Check your email to confirm your account');
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Create an account</h1>
          <p className="text-neutral-600 mt-2">Join JosHomes today</p>
        </div>

        <form action={handleSignUp} className="space-y-4">
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

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              I am a...
            </label>
            <select
              name="role"
              required
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select a role</option>
              <option value="RENTER">Home Seeker</option>
              <option value="AGENT">Agent / Landlord</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-neutral-600 mt-6">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-emerald-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
