import { ShieldCheck, Upload, BadgeCheck, MessageSquare } from "lucide-react";

export const metadata = { title: "List your property — for agents" };

const steps = [
  {
    icon: <Upload className="size-5" />,
    title: "Create an account & verify your phone",
    body: "Sign up as an agent and confirm your phone number with a one-time code.",
  },
  {
    icon: <ShieldCheck className="size-5" />,
    title: "Upload your ID / CAC",
    body: "Submit your NIN or CAC and a selfie. Our team reviews it — this is what earns you the Verified badge renters trust.",
  },
  {
    icon: <BadgeCheck className="size-5" />,
    title: "Post your listings",
    body: "Add houses, flats, self-contains or shops with photos and video. Each listing is checked before it goes live.",
  },
  {
    icon: <MessageSquare className="size-5" />,
    title: "Get paid leads",
    body: "Renters pay an inspection fee to unlock your contact and book a viewing — you receive serious, verified enquiries.",
  },
];

export default function AgentsLanding() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-neutral-900">List your property on JosHomes</h1>
      <p className="mt-2 text-neutral-600">
        Reach thousands of renters looking for homes and shops across Jos. Verified agents get a
        trust badge, higher visibility, and qualified, pre-paid inspection leads.
      </p>

      <ol className="mt-8 space-y-4">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-4 rounded-xl border border-neutral-200 bg-white p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              {s.icon}
            </span>
            <div>
              <h2 className="font-semibold text-neutral-900">
                {i + 1}. {s.title}
              </h2>
              <p className="mt-0.5 text-sm text-neutral-600">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-xl bg-emerald-600 p-5 text-white">
        <p className="font-medium">Agent onboarding goes live in the next phase.</p>
        <p className="mt-1 text-sm text-emerald-50">
          Sign-up, phone OTP, document upload and the admin approval dashboard are the first
          feature slice being built on top of this foundation.
        </p>
      </div>
    </div>
  );
}
