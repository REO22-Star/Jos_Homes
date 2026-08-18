export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-neutral-500">Draft — to be finalised before launch.</p>
      <div className="mt-4 space-y-3 text-neutral-700">
        <p>
          JosHomes is a marketplace that connects renters with verified agents. We collect an{" "}
          <strong>inspection/agency fee only</strong>. We do not collect, hold, or process rent
          or deposits, and we are not a party to any tenancy agreement between a renter and an
          agent or landlord.
        </p>
        <p>
          Agents are responsible for the accuracy of their listings. Renters should always inspect
          a property in person before paying any rent or deposit directly to an agent. JosHomes
          is not liable for disputes arising from tenancy agreements, but will act on reports of
          fraud and may suspend offending agents.
        </p>
        <p>Inspection fees are non-refundable except where an agent fails to honour a booking.</p>
      </div>
    </div>
  );
}
