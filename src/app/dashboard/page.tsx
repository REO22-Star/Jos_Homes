import Link from 'next/link';

export const metadata = {
  title: 'Agent Dashboard — JosHomes',
};

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Agent Dashboard</h1>
          <Link
            href="/sign-in"
            className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
          >
            Sign out
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-8">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-6">
            <p className="text-sm text-emerald-600">Active Listings</p>
            <p className="text-2xl font-bold text-emerald-900 mt-1">0</p>
          </div>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-6">
            <p className="text-sm text-blue-600">Total Views</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">0</p>
          </div>
          <div className="rounded-lg bg-purple-50 border border-purple-200 p-6">
            <p className="text-sm text-purple-600">Inquiries</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">0</p>
          </div>
          <div className="rounded-lg bg-orange-50 border border-orange-200 p-6">
            <p className="text-sm text-orange-600">Pending Inspections</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">0</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* New Listing */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">Post a Listing</h2>
            <p className="text-neutral-600 text-sm mt-1">Add a new property to your portfolio</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              Create Listing
            </button>
          </div>

          {/* My Listings */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">My Listings</h2>
            <p className="text-neutral-600 text-sm mt-1">View and manage your properties</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              View Listings
            </button>
          </div>

          {/* Inquiries */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">Inquiries</h2>
            <p className="text-neutral-600 text-sm mt-1">Respond to buyer messages</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              View Inquiries
            </button>
          </div>

          {/* Inspections */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">Inspections</h2>
            <p className="text-neutral-600 text-sm mt-1">Schedule and track property viewings</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              View Schedule
            </button>
          </div>

          {/* Analytics */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">Analytics</h2>
            <p className="text-neutral-600 text-sm mt-1">View your listing performance</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              View Stats
            </button>
          </div>

          {/* Profile */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">Profile</h2>
            <p className="text-neutral-600 text-sm mt-1">Manage your account settings</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
