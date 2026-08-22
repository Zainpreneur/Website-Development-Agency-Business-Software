/**
 * Demo data seed for the Forge & Co. agency application.
 * Run with: npm run db:seed
 *
 * All seeded accounts use the password: password123
 * (bcrypt-hashed below — never store plaintext passwords in a real app).
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { resolveDatabaseUrl } from "../src/lib/db-url";

const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "password123";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9, 0, 0, 0);
  return d;
}

function daysFromNow(n: number) {
  return daysAgo(-n);
}

async function main() {
  console.log("Seeding database…");

  // Wipe existing data (children first) so this script is re-runnable.
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.invoiceItem.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.proposal.deleteMany(),
    prisma.timeEntry.deleteMany(),
    prisma.task.deleteMany(),
    prisma.projectMember.deleteMany(),
    prisma.project.deleteMany(),
    prisma.activity.deleteMany(),
    prisma.client.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [ava, marcus, priya, diego, sofia] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Ava Chen",
        email: "ava@forgeco.dev",
        passwordHash,
        role: "ADMIN",
        title: "Agency Director",
        avatarColor: "#6366f1",
      },
    }),
    prisma.user.create({
      data: {
        name: "Marcus Reyes",
        email: "marcus@forgeco.dev",
        passwordHash,
        role: "MANAGER",
        title: "Project Manager",
        avatarColor: "#0ea5e9",
      },
    }),
    prisma.user.create({
      data: {
        name: "Priya Nair",
        email: "priya@forgeco.dev",
        passwordHash,
        role: "MEMBER",
        title: "Lead Developer",
        avatarColor: "#10b981",
      },
    }),
    prisma.user.create({
      data: {
        name: "Diego Fernandez",
        email: "diego@forgeco.dev",
        passwordHash,
        role: "MEMBER",
        title: "UI/UX Designer",
        avatarColor: "#f59e0b",
      },
    }),
    prisma.user.create({
      data: {
        name: "Sofia Marchetti",
        email: "sofia@forgeco.dev",
        passwordHash,
        role: "MEMBER",
        title: "Frontend Developer",
        avatarColor: "#ec4899",
      },
    }),
  ]);

  const brightleaf = await prisma.client.create({
    data: {
      name: "Jordan Blake",
      company: "Brightleaf Coffee Co.",
      email: "jordan@brightleafcoffee.com",
      phone: "(503) 555-0142",
      address: "118 Alder St, Portland, OR",
      website: "https://brightleafcoffee.com",
      status: "ACTIVE",
      ownerId: marcus.id,
      notes: "Wholesale + retail roaster. Wants online ordering with subscriptions.",
    },
  });

  const summitRidge = await prisma.client.create({
    data: {
      name: "Casey Whitfield",
      company: "Summit Ridge Outfitters",
      email: "casey@summitridgeoutfitters.com",
      phone: "(406) 555-0119",
      address: "44 Trailhead Rd, Bozeman, MT",
      website: "https://summitridgeoutfitters.com",
      status: "ACTIVE",
      ownerId: marcus.id,
      notes: "Outdoor gear retailer, seasonal marketing pushes.",
    },
  });

  const novaHealth = await prisma.client.create({
    data: {
      name: "Dr. Elena Ruiz",
      company: "Nova Health Clinic",
      email: "elena.ruiz@novahealthclinic.com",
      phone: "(212) 555-0187",
      address: "900 Park Ave, New York, NY",
      website: "https://novahealthclinic.com",
      status: "ACTIVE",
      ownerId: ava.id,
      notes: "HIPAA-adjacent patient portal work. Slow approval cycles.",
    },
  });

  const pixelPine = await prisma.client.create({
    data: {
      name: "Sam Okafor",
      company: "Pixel & Pine Studio",
      email: "sam@pixelandpine.studio",
      phone: "(720) 555-0163",
      address: "12 Birch Ln, Denver, CO",
      website: "https://pixelandpine.studio",
      status: "LEAD",
      ownerId: marcus.id,
      notes: "Referral from Summit Ridge. Wants a full rebuild, budget TBD.",
    },
  });

  const harbor = await prisma.client.create({
    data: {
      name: "Renee Castillo",
      company: "Harbor & Co. Realty",
      email: "renee@harborandco.com",
      phone: "(619) 555-0108",
      address: "301 Bay St, San Diego, CA",
      website: "https://harborandco.com",
      status: "ACTIVE",
      ownerId: ava.id,
      notes: "Large listings platform. Phase 1 on hold pending their internal budget approval.",
    },
  });

  const wildflower = await prisma.client.create({
    data: {
      name: "Maya Lindqvist",
      company: "Wildflower Botanicals",
      email: "maya@wildflowerbotanicals.com",
      phone: "(206) 555-0176",
      address: "77 Moss Ave, Seattle, WA",
      status: "INACTIVE",
      ownerId: marcus.id,
      notes: "Project wrapped last quarter. Declined the retainer offer.",
    },
  });

  // ---------------------------------------------------------------------
  // Projects
  // ---------------------------------------------------------------------

  const ecommerce = await prisma.project.create({
    data: {
      name: "Brightleaf E-commerce Relaunch",
      description: "Headless storefront with subscription-based coffee ordering.",
      status: "IN_PROGRESS",
      budget: 18000,
      startDate: daysAgo(35),
      dueDate: daysFromNow(20),
      clientId: brightleaf.id,
      members: {
        create: [{ userId: priya.id }, { userId: sofia.id }, { userId: marcus.id }],
      },
    },
  });

  const marketingSite = await prisma.project.create({
    data: {
      name: "Summit Ridge Marketing Site",
      description: "Seasonal campaign landing pages plus a refreshed core site.",
      status: "REVIEW",
      budget: 12000,
      startDate: daysAgo(50),
      dueDate: daysFromNow(5),
      clientId: summitRidge.id,
      members: {
        create: [{ userId: diego.id }, { userId: sofia.id }, { userId: marcus.id }],
      },
    },
  });

  const patientPortal = await prisma.project.create({
    data: {
      name: "Nova Health Patient Portal",
      description: "Secure scheduling and intake forms integrated with their EHR.",
      status: "IN_PROGRESS",
      budget: 32000,
      startDate: daysAgo(60),
      dueDate: daysFromNow(40),
      clientId: novaHealth.id,
      members: {
        create: [{ userId: priya.id }, { userId: ava.id }],
      },
    },
  });

  const brandRefresh = await prisma.project.create({
    data: {
      name: "Nova Health Brand Refresh (Web)",
      description: "New visual identity applied across the marketing site.",
      status: "COMPLETED",
      budget: 9000,
      startDate: daysAgo(140),
      dueDate: daysAgo(80),
      clientId: novaHealth.id,
      members: {
        create: [{ userId: diego.id }],
      },
    },
  });

  const discoverySprint = await prisma.project.create({
    data: {
      name: "Pixel & Pine Discovery Sprint",
      description: "Two-week discovery to scope the full rebuild.",
      status: "PLANNING",
      budget: 4000,
      startDate: daysFromNow(7),
      dueDate: daysFromNow(21),
      clientId: pixelPine.id,
      members: {
        create: [{ userId: marcus.id }, { userId: diego.id }],
      },
    },
  });

  const listingsPlatform = await prisma.project.create({
    data: {
      name: "Harbor & Co. Listings Platform",
      description: "Custom listings + CRM integration for their agent network.",
      status: "ON_HOLD",
      budget: 26000,
      startDate: daysAgo(20),
      dueDate: daysFromNow(90),
      clientId: harbor.id,
      members: {
        create: [{ userId: priya.id }, { userId: ava.id }],
      },
    },
  });

  const wildflowerStorefront = await prisma.project.create({
    data: {
      name: "Wildflower Storefront",
      description: "Shopify-alternative storefront with local delivery zones.",
      status: "COMPLETED",
      budget: 8000,
      startDate: daysAgo(200),
      dueDate: daysAgo(150),
      clientId: wildflower.id,
      members: {
        create: [{ userId: sofia.id }],
      },
    },
  });

  // ---------------------------------------------------------------------
  // Tasks
  // ---------------------------------------------------------------------

  const taskSeed: Array<{
    projectId: string;
    title: string;
    description?: string;
    status: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assigneeId?: string;
    dueDate?: Date;
  }> = [
    // Brightleaf
    { projectId: ecommerce.id, title: "Design subscription checkout flow", status: "DONE", priority: "HIGH", assigneeId: diego.id, dueDate: daysAgo(20) },
    { projectId: ecommerce.id, title: "Build product catalog API", status: "DONE", priority: "HIGH", assigneeId: priya.id, dueDate: daysAgo(12) },
    { projectId: ecommerce.id, title: "Stripe subscriptions integration", status: "IN_PROGRESS", priority: "URGENT", assigneeId: priya.id, dueDate: daysFromNow(4) },
    { projectId: ecommerce.id, title: "Cart & checkout UI polish", status: "IN_PROGRESS", priority: "MEDIUM", assigneeId: sofia.id, dueDate: daysFromNow(6) },
    { projectId: ecommerce.id, title: "Roast subscription email flows", status: "TODO", priority: "MEDIUM", assigneeId: sofia.id, dueDate: daysFromNow(10) },
    { projectId: ecommerce.id, title: "QA pass on mobile Safari", status: "TODO", priority: "LOW", dueDate: daysFromNow(18) },
    { projectId: ecommerce.id, title: "Client review of staging build", status: "REVIEW", priority: "HIGH", assigneeId: marcus.id, dueDate: daysFromNow(2) },

    // Summit Ridge
    { projectId: marketingSite.id, title: "Homepage hero + campaign banner", status: "DONE", priority: "MEDIUM", assigneeId: diego.id, dueDate: daysAgo(15) },
    { projectId: marketingSite.id, title: "Build seasonal landing page template", status: "DONE", priority: "MEDIUM", assigneeId: sofia.id, dueDate: daysAgo(8) },
    { projectId: marketingSite.id, title: "SEO metadata + sitemap", status: "REVIEW", priority: "MEDIUM", assigneeId: sofia.id, dueDate: daysFromNow(1) },
    { projectId: marketingSite.id, title: "Client feedback round 2", status: "REVIEW", priority: "HIGH", assigneeId: marcus.id, dueDate: daysFromNow(2) },
    { projectId: marketingSite.id, title: "Launch checklist & DNS cutover", status: "TODO", priority: "URGENT", assigneeId: marcus.id, dueDate: daysFromNow(5) },

    // Nova Health Patient Portal
    { projectId: patientPortal.id, title: "Auth + patient identity verification", status: "DONE", priority: "URGENT", assigneeId: priya.id, dueDate: daysAgo(25) },
    { projectId: patientPortal.id, title: "Appointment scheduling UI", status: "IN_PROGRESS", priority: "HIGH", assigneeId: priya.id, dueDate: daysFromNow(9) },
    { projectId: patientPortal.id, title: "Intake form builder", status: "IN_PROGRESS", priority: "HIGH", assigneeId: priya.id, dueDate: daysFromNow(15) },
    { projectId: patientPortal.id, title: "EHR integration spec review", status: "TODO", priority: "URGENT", assigneeId: ava.id, dueDate: daysFromNow(3) },
    { projectId: patientPortal.id, title: "Accessibility audit (WCAG 2.2 AA)", status: "TODO", priority: "MEDIUM", dueDate: daysFromNow(30) },
    { projectId: patientPortal.id, title: "Security review with compliance team", status: "TODO", priority: "URGENT", assigneeId: ava.id, dueDate: daysFromNow(12) },

    // Discovery sprint
    { projectId: discoverySprint.id, title: "Stakeholder interviews", status: "TODO", priority: "HIGH", assigneeId: marcus.id, dueDate: daysFromNow(9) },
    { projectId: discoverySprint.id, title: "Competitive audit", status: "TODO", priority: "MEDIUM", assigneeId: diego.id, dueDate: daysFromNow(12) },
    { projectId: discoverySprint.id, title: "Sitemap & scope proposal draft", status: "TODO", priority: "MEDIUM", assigneeId: marcus.id, dueDate: daysFromNow(20) },

    // Listings platform (on hold, mostly planning left in place)
    { projectId: listingsPlatform.id, title: "Data model for MLS sync", status: "DONE", priority: "HIGH", assigneeId: priya.id, dueDate: daysAgo(10) },
    { projectId: listingsPlatform.id, title: "Agent dashboard wireframes", status: "REVIEW", priority: "MEDIUM", assigneeId: ava.id, dueDate: daysFromNow(25) },
    { projectId: listingsPlatform.id, title: "Awaiting client budget sign-off", status: "TODO", priority: "URGENT", assigneeId: ava.id, dueDate: daysFromNow(14) },
  ];

  await Promise.all(
    taskSeed.map((t, i) =>
      prisma.task.create({
        data: {
          projectId: t.projectId,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: t.assigneeId,
          dueDate: t.dueDate,
          position: i,
        },
      }),
    ),
  );

  // ---------------------------------------------------------------------
  // Time entries (last ~3 weeks, mixed billable)
  // ---------------------------------------------------------------------

  const timeEntrySeed = [
    { userId: priya.id, projectId: ecommerce.id, minutes: 240, date: daysAgo(1), note: "Stripe subscriptions integration" },
    { userId: priya.id, projectId: ecommerce.id, minutes: 180, date: daysAgo(2), note: "Product catalog API" },
    { userId: sofia.id, projectId: ecommerce.id, minutes: 210, date: daysAgo(1), note: "Cart UI polish" },
    { userId: sofia.id, projectId: ecommerce.id, minutes: 150, date: daysAgo(3), note: "Checkout responsiveness" },
    { userId: diego.id, projectId: ecommerce.id, minutes: 90, date: daysAgo(6), note: "Subscription checkout mockups" },
    { userId: marcus.id, projectId: ecommerce.id, minutes: 60, date: daysAgo(2), note: "Client status call", billable: false },

    { userId: diego.id, projectId: marketingSite.id, minutes: 300, date: daysAgo(9), note: "Hero + campaign banner design" },
    { userId: sofia.id, projectId: marketingSite.id, minutes: 260, date: daysAgo(7), note: "Landing page template build" },
    { userId: sofia.id, projectId: marketingSite.id, minutes: 120, date: daysAgo(1), note: "SEO metadata pass" },
    { userId: marcus.id, projectId: marketingSite.id, minutes: 45, date: daysAgo(1), note: "Client feedback review", billable: false },

    { userId: priya.id, projectId: patientPortal.id, minutes: 480, date: daysAgo(4), note: "Patient identity verification" },
    { userId: priya.id, projectId: patientPortal.id, minutes: 300, date: daysAgo(2), note: "Appointment scheduling UI" },
    { userId: priya.id, projectId: patientPortal.id, minutes: 210, date: daysAgo(1), note: "Intake form builder" },
    { userId: ava.id, projectId: patientPortal.id, minutes: 90, date: daysAgo(3), note: "EHR integration spec review", billable: false },

    { userId: priya.id, projectId: listingsPlatform.id, minutes: 360, date: daysAgo(18), note: "MLS sync data model" },
    { userId: ava.id, projectId: listingsPlatform.id, minutes: 120, date: daysAgo(16), note: "Agent dashboard wireframes" },

    { userId: marcus.id, projectId: discoverySprint.id, minutes: 60, date: daysAgo(1), note: "Kickoff prep", billable: false },
  ];

  await Promise.all(
    timeEntrySeed.map((t) =>
      prisma.timeEntry.create({
        data: {
          userId: t.userId,
          projectId: t.projectId,
          minutes: t.minutes,
          date: t.date,
          note: t.note,
          billable: t.billable ?? true,
        },
      }),
    ),
  );

  // ---------------------------------------------------------------------
  // Proposals
  // ---------------------------------------------------------------------

  await prisma.proposal.createMany({
    data: [
      {
        clientId: pixelPine.id,
        title: "Pixel & Pine Full Site Rebuild",
        status: "SENT",
        amount: 15000,
        validUntil: daysFromNow(14),
        ownerId: marcus.id,
        content:
          "Full-scope rebuild covering brand-aligned design system, headless CMS, and a portfolio filtering experience. 6-week timeline from kickoff.",
      },
      {
        clientId: harbor.id,
        title: "Harbor & Co. Phase 2: Agent Dashboard",
        status: "DRAFT",
        amount: 14000,
        validUntil: daysFromNow(30),
        ownerId: ava.id,
        content: "Agent-facing dashboard for lead management once Phase 1 listings platform ships.",
      },
      {
        clientId: wildflower.id,
        title: "Wildflower Storefront Retainer 2026",
        status: "DECLINED",
        amount: 6000,
        validUntil: daysAgo(10),
        ownerId: marcus.id,
        content: "Monthly retainer for seasonal storefront updates and email campaigns.",
      },
      {
        clientId: brightleaf.id,
        title: "Brightleaf SEO & Content Retainer",
        status: "ACCEPTED",
        amount: 3000,
        validUntil: daysFromNow(60),
        ownerId: marcus.id,
        content: "Ongoing monthly SEO, blog content, and conversion tuning after the relaunch ships.",
      },
    ],
  });

  // ---------------------------------------------------------------------
  // Invoices
  // ---------------------------------------------------------------------

  const invPaid = await prisma.invoice.create({
    data: {
      number: "INV-1001",
      status: "PAID",
      clientId: novaHealth.id,
      projectId: brandRefresh.id,
      ownerId: ava.id,
      issueDate: daysAgo(90),
      dueDate: daysAgo(60),
      taxRate: 0,
      notes: "Final invoice for the brand refresh engagement. Thank you!",
      items: {
        create: [
          { description: "Brand discovery & design system", quantity: 1, rate: 4000, position: 0 },
          { description: "Website template implementation", quantity: 1, rate: 5000, position: 1 },
        ],
      },
    },
  });
  await prisma.payment.create({
    data: { invoiceId: invPaid.id, amount: 9000, method: "Bank Transfer", paidAt: daysAgo(58) },
  });

  await prisma.invoice.create({
    data: {
      number: "INV-1002",
      status: "OVERDUE",
      clientId: wildflower.id,
      projectId: wildflowerStorefront.id,
      ownerId: marcus.id,
      issueDate: daysAgo(75),
      dueDate: daysAgo(45),
      taxRate: 8.5,
      notes: "Second reminder sent — please remit at your earliest convenience.",
      items: {
        create: [
          { description: "Storefront build - final milestone", quantity: 1, rate: 3200, position: 0 },
          { description: "Local delivery zone integration", quantity: 1, rate: 800, position: 1 },
        ],
      },
    },
  });

  const invSent1 = await prisma.invoice.create({
    data: {
      number: "INV-1003",
      status: "SENT",
      clientId: brightleaf.id,
      projectId: ecommerce.id,
      ownerId: marcus.id,
      issueDate: daysAgo(10),
      dueDate: daysFromNow(20),
      taxRate: 0,
      notes: "Milestone 2 of 3 — subscription checkout complete.",
      items: {
        create: [
          { description: "Milestone 2: Subscription checkout", quantity: 1, rate: 6000, position: 0 },
          { description: "Additional design revisions", quantity: 3, rate: 150, position: 1 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: "INV-1004",
      status: "SENT",
      clientId: summitRidge.id,
      projectId: marketingSite.id,
      ownerId: marcus.id,
      issueDate: daysAgo(5),
      dueDate: daysFromNow(25),
      taxRate: 6,
      notes: "Final invoice pending launch sign-off.",
      items: {
        create: [{ description: "Marketing site build - final milestone", quantity: 1, rate: 5000, position: 0 }],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: "INV-1005",
      status: "DRAFT",
      clientId: novaHealth.id,
      projectId: patientPortal.id,
      ownerId: ava.id,
      issueDate: daysAgo(0),
      dueDate: daysFromNow(30),
      taxRate: 0,
      notes: "Draft for milestone 1 — pending internal review before sending.",
      items: {
        create: [{ description: "Milestone 1: Auth & identity verification", quantity: 1, rate: 8000, position: 0 }],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: "INV-0998",
      status: "CANCELLED",
      clientId: wildflower.id,
      ownerId: marcus.id,
      issueDate: daysAgo(160),
      dueDate: daysAgo(130),
      taxRate: 0,
      notes: "Duplicate invoice, cancelled and reissued as INV-1002.",
      items: {
        create: [{ description: "Storefront build - milestone 1", quantity: 1, rate: 2500, position: 0 }],
      },
    },
  });

  await prisma.payment.create({
    data: { invoiceId: invSent1.id, amount: 3000, method: "Credit Card", paidAt: daysAgo(2), reference: "partial deposit" },
  });

  // ---------------------------------------------------------------------
  // Activity feed
  // ---------------------------------------------------------------------

  await prisma.activity.createMany({
    data: [
      { userId: priya.id, message: "Priya Nair completed \"Product catalog API\"", entity: "task", createdAt: daysAgo(12) },
      { userId: marcus.id, message: "Marcus Reyes sent invoice INV-1003 to Brightleaf Coffee Co.", entity: "invoice", createdAt: daysAgo(10) },
      { userId: diego.id, message: "Diego Fernandez uploaded homepage designs for Summit Ridge", entity: "project", createdAt: daysAgo(9) },
      { userId: ava.id, message: "Ava Chen moved Nova Health Patient Portal budget to $32,000", entity: "project", createdAt: daysAgo(8) },
      { userId: marcus.id, message: "Marcus Reyes created proposal \"Pixel & Pine Full Site Rebuild\"", entity: "proposal", createdAt: daysAgo(6) },
      { userId: priya.id, message: "Priya Nair logged 8h on Nova Health Patient Portal", entity: "time", createdAt: daysAgo(4) },
      { userId: ava.id, message: "Ava Chen recorded a $9,000 payment on INV-1001", entity: "payment", createdAt: daysAgo(58) },
      { userId: marcus.id, message: "Marcus Reyes moved Harbor & Co. Listings Platform to On Hold", entity: "project", createdAt: daysAgo(20) },
      { userId: sofia.id, message: "Sofia Marchetti completed \"SEO metadata + sitemap\"", entity: "task", createdAt: daysAgo(1) },
      { userId: marcus.id, message: "Marcus Reyes added Sam Okafor (Pixel & Pine Studio) as a new lead", entity: "client", createdAt: daysAgo(15) },
    ],
  });

  console.log("Seed complete.");
  console.log("");
  console.log("Demo accounts (all use password: password123)");
  console.log("  ADMIN    ava@forgeco.dev");
  console.log("  MANAGER  marcus@forgeco.dev");
  console.log("  MEMBER   priya@forgeco.dev");
  console.log("  MEMBER   diego@forgeco.dev");
  console.log("  MEMBER   sofia@forgeco.dev");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
