export const metadata = { title: "Privacy Policy (NDPR)" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 prose-neutral">
      <h1 className="text-2xl font-bold text-neutral-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-neutral-500">Draft — to be finalised before launch.</p>
      <div className="mt-4 space-y-3 text-neutral-700">
        <p>
          JosHomes processes personal data in line with the Nigeria Data Protection Act (NDPA
          2023) and NDPR. This page will set out: what we collect (contact details, agent KYC
          documents, listing and payment metadata), the lawful basis and consent for each use,
          how long we keep it, and how you can access or delete your data.
        </p>
        <p>
          Agent identity documents are stored privately and encrypted, with access logged and
          limited to verification staff. We never sell personal data. Marketing messages are sent
          only with consent, which you can withdraw at any time.
        </p>
        <p>
          Payment card details are handled entirely by Paystack and never touch our servers.
        </p>
      </div>
    </div>
  );
}
