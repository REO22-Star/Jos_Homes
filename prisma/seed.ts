import { PrismaClient } from "@prisma/client";
import { JOS_AREAS, DEMO_LISTINGS } from "../src/lib/data/demo";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Jos areas…");
  for (const a of JOS_AREAS) {
    await prisma.area.upsert({
      where: { slug: a.slug },
      update: { name: a.name, lga: a.lga, lat: a.lat, lng: a.lng },
      create: { id: a.id, name: a.name, slug: a.slug, lga: a.lga, lat: a.lat, lng: a.lng },
    });
  }

  console.log("Seeding demo admin + agents…");
  const admin = await prisma.user.upsert({
    where: { email: "admin@josrentals.ng" },
    update: { role: "ADMIN" },
    create: { email: "admin@josrentals.ng", fullName: "Platform Admin", role: "ADMIN" },
  });

  // Build unique agents from the demo listings.
  const agentSeeds = new Map<string, (typeof DEMO_LISTINGS)[number]["agent"]>();
  for (const l of DEMO_LISTINGS) agentSeeds.set(l.agent.id, l.agent);

  const agentProfileByDemoId = new Map<string, string>();
  for (const [demoId, ag] of agentSeeds) {
    const email = `${ag.businessName.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@example.ng`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: "AGENT" },
      create: { email, fullName: ag.businessName, role: "AGENT", phone: null },
    });
    const profile = await prisma.agentProfile.upsert({
      where: { userId: user.id },
      update: {
        businessName: ag.businessName,
        verificationStatus: ag.verified ? "APPROVED" : "PENDING",
        approvedById: ag.verified ? admin.id : null,
        approvedAt: ag.verified ? new Date("2026-06-01") : null,
        ratingAvg: ag.ratingAvg,
        ratingCount: ag.ratingCount,
      },
      create: {
        userId: user.id,
        businessName: ag.businessName,
        verificationStatus: ag.verified ? "APPROVED" : "PENDING",
        approvedById: ag.verified ? admin.id : null,
        approvedAt: ag.verified ? new Date("2026-06-01") : null,
        ratingAvg: ag.ratingAvg,
        ratingCount: ag.ratingCount,
      },
    });
    agentProfileByDemoId.set(demoId, profile.id);
  }

  console.log("Seeding demo listings…");
  for (const l of DEMO_LISTINGS) {
    const agentProfileId = agentProfileByDemoId.get(l.agent.id)!;
    const created = await prisma.listing.upsert({
      where: { slug: l.slug },
      update: { status: "ACTIVE" },
      create: {
        slug: l.slug,
        agentProfileId,
        areaId: l.area.id,
        type: l.type,
        title: l.title,
        description: l.description,
        bedrooms: l.bedrooms ?? null,
        bathrooms: l.bathrooms ?? null,
        toilets: l.toilets ?? null,
        furnished: l.furnished,
        amenities: l.amenities,
        annualRent: l.annualRentKobo,
        agencyFee: l.agencyFeeKobo,
        cautionFee: l.cautionFeeKobo ?? null,
        inspectionFee: l.inspectionFeeKobo,
        addressText: l.addressText,
        status: "ACTIVE",
        publishedAt: new Date(l.createdAt),
      },
    });
    // media
    await prisma.listingMedia.deleteMany({ where: { listingId: created.id } });
    await prisma.listingMedia.createMany({
      data: l.media.map((m, idx) => ({
        listingId: created.id,
        kind: m.kind,
        storageKey: m.url,
        thumbnailUrl: m.thumbnailUrl ?? null,
        isCover: m.isCover,
        order: idx,
        status: "READY" as const,
      })),
    });
  }

  // Keep agent listingCount denormalized field accurate.
  for (const [, agentProfileId] of agentProfileByDemoId) {
    const count = await prisma.listing.count({ where: { agentProfileId } });
    await prisma.agentProfile.update({ where: { id: agentProfileId }, data: { listingCount: count } });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
