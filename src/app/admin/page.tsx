import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard — JosHomes',
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
          <Link
            href="/sign-in"
            className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
          >
            Sign out
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Users Management */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">Users</h2>
            <p className="text-neutral-600 text-sm mt-1">Manage user accounts and roles</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              View Users
            </button>
          </div>

          {/* Listings Management */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">Listings</h2>
            <p className="text-neutral-600 text-sm mt-1">Review and moderate property listings</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              View Listings
            </button>
          </div>

          {/* Verification */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">Verification</h2>
            <p className="text-neutral-600 text-sm mt-1">Approve or reject agent verification</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              Review Documents
            </button>
          </div>

          {/* Analytics */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">Analytics</h2>
            <p className="text-neutral-600 text-sm mt-1">View platform statistics</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              View Stats
            </button>
          </div>

          {/* Reports */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">Reports</h2>
            <p className="text-neutral-600 text-sm mt-1">View user complaints and issues</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              View Reports
            </button>
          </div>

          {/* Settings */}
          <div className="rounded-lg border border-neutral-200 p-6 hover:shadow-lg transition">
            <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
            <p className="text-neutral-600 text-sm mt-1">Configure platform settings</p>
            <button className="mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
              Edit Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
