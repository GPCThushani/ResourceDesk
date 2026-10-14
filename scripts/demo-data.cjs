
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEMO_PREFIX = "DEMO-2026-";

function dateAt(dayOffset, hour, minute = 0) {
  const date = new Date();

  // Use Sri Lanka calendar dates for consistent demo times.
  const todayInSriLanka = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const [year, month, day] = todayInSriLanka
    .split("-")
    .map(Number);

  // Sri Lanka is UTC+05:30.
  const base = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(base + dayOffset * 86400000 - 330 * 60000);
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Demo data creation is disabled when NODE_ENV=production."
    );
  }

  if (process.env.ALLOW_DEMO_SEED !== "true") {
    throw new Error(
      "Set ALLOW_DEMO_SEED=true explicitly before running."
    );
  }

  console.log("Starting ResourceDesk demo data setup...");

  // 1. Find existing departments.
  const engineering = await prisma.department.findUniqueOrThrow({
    where: { departmentCode: "ENG" },
  });

  const operations = await prisma.department.findUniqueOrThrow({
    where: { departmentCode: "OPS" },
  });

  // 2. Update display names without changing passwords or roles.
  const nameUpdates = [
    ["employee@resourcedesk.local", "Ajith Perera"],
    ["manager@resourcedesk.local", "Ryan Fernando"],
    ["operations.employee@resourcedesk.local", "Anne Roshell"],
    ["admin@resourcedesk.local", "Daniel Herath"],
  ];

  for (const [email, name] of nameUpdates) {
    const result = await prisma.user.updateMany({
      where: { email },
      data: { name },
    });

    if (result.count !== 1) {
      throw new Error(`Expected user not found: ${email}`);
    }

    console.log(`Updated user: ${name}`);
  }

  // 3. Fetch all five existing users.
  const emails = {
    admin: "admin@resourcedesk.local",
    engHead: "manager@resourcedesk.local",
    opsHead: "operations.head@resourcedesk.local",
    engEmployee: "employee@resourcedesk.local",
    opsEmployee: "operations.employee@resourcedesk.local",
  };

  const users = {};

  for (const [key, email] of Object.entries(emails)) {
    users[key] = await prisma.user.findUniqueOrThrow({
      where: { email },
    });
  }

  // 4. Ensure department head assignments remain correct.
  await prisma.department.update({
    where: { id: engineering.id },
    data: { headId: users.engHead.id },
  });

  await prisma.department.update({
    where: { id: operations.id },
    data: { headId: users.opsHead.id },
  });

  // 5. Define 10 resources.
  const resourceDefinitions = [
    {
      resourceCode: "ROOM-001",
      name: "Main Conference Hall",
      category: "Room",
      description: "Organization-wide conference and meeting hall",
      location: "Floor 2",
      capacity: 20,
      status: "ACTIVE",
      accessScope: "ORGANIZATION",
      requiresApproval: true,
      ownerDepartmentId: null,
    },
    {
      resourceCode: "ROOM-002",
      name: "Engineering Training Room",
      category: "Room",
      description: "Training and technical workshops",
      location: "Floor 3",
      capacity: 12,
      status: "ACTIVE",
      accessScope: "DEPARTMENT",
      requiresApproval: true,
      ownerDepartmentId: engineering.id,
    },
    {
      resourceCode: "ROOM-003",
      name: "Executive Meeting Room",
      category: "Room",
      description: "Executive and cross-department meetings",
      location: "Floor 2",
      capacity: 8,
      status: "ACTIVE",
      accessScope: "ORGANIZATION",
      requiresApproval: true,
      ownerDepartmentId: null,
    },
    {
      resourceCode: "ROOM-004",
      name: "Operations Meeting Room",
      category: "Room",
      description: "Operations department meetings",
      location: "Floor 1",
      capacity: 10,
      status: "ACTIVE",
      accessScope: "DEPARTMENT",
      requiresApproval: true,
      ownerDepartmentId: operations.id,
    },
    {
      resourceCode: "ROOM-005",
      name: "Interview Room",
      category: "Room",
      description: "Private interviews and discussions",
      location: "Floor 2",
      capacity: 4,
      status: "ACTIVE",
      accessScope: "ORGANIZATION",
      requiresApproval: false,
      ownerDepartmentId: null,
    },
    {
      resourceCode: "EQP-001",
      name: "Epson Projector P1",
      category: "Equipment",
      description: "Shared portable projector",
      location: "IT Storage",
      capacity: null,
      status: "ACTIVE",
      accessScope: "ORGANIZATION",
      requiresApproval: false,
      ownerDepartmentId: engineering.id,
    },
    {
      resourceCode: "EQP-002",
      name: "Spare MacBook Pro",
      category: "Equipment",
      description: "Currently undergoing maintenance",
      location: "IT Storage",
      capacity: null,
      status: "MAINTENANCE",
      accessScope: "ORGANIZATION",
      requiresApproval: false,
      ownerDepartmentId: engineering.id,
    },
    {
      resourceCode: "EQP-003",
      name: "Portable Speaker System",
      category: "Equipment",
      description: "Portable audio system for events",
      location: "Equipment Room",
      capacity: null,
      status: "ACTIVE",
      accessScope: "ORGANIZATION",
      requiresApproval: false,
      ownerDepartmentId: operations.id,
    },
    {
      resourceCode: "EQP-004",
      name: "Conference Webcam",
      category: "Equipment",
      description: "HD webcam for hybrid meetings",
      location: "IT Storage",
      capacity: null,
      status: "ACTIVE",
      accessScope: "ORGANIZATION",
      requiresApproval: false,
      ownerDepartmentId: engineering.id,
    },
    {
      resourceCode: "EQP-005",
      name: "Presentation Laptop",
      category: "Equipment",
      description: "Temporarily unavailable for booking",
      location: "IT Storage",
      capacity: null,
      status: "INACTIVE",
      accessScope: "ORGANIZATION",
      requiresApproval: false,
      ownerDepartmentId: engineering.id,
    },
  ];

  const resources = {};

  for (const definition of resourceDefinitions) {
    const { resourceCode, ...data } = definition;

    let resource = await prisma.resource.findUnique({
      where: { resourceCode },
    });

    if (!resource) {
      // Avoid creating duplicates if a resource already
      // exists under another code.
      const matchingName = await prisma.resource.findFirst({
        where: { name: data.name },
      });

      if (matchingName) {
        resource = matchingName;
        console.log(
          `Reusing existing resource: ${data.name} (${resource.resourceCode})`
        );
      } else {
        resource = await prisma.resource.create({
          data: { resourceCode, ...data },
        });
        console.log(`Created resource: ${resourceCode}`);
      }
    } else {
      console.log(`Resource exists: ${resourceCode}`);
    }

    resources[resourceCode] = resource;
  }

  // 6. Define 18 demo reservations.
  //
  // Each record has a unique booking reference.
  // Positive dayOffset = future booking.
  // Negative dayOffset = historical booking.
  //
  // Different times/resources are used to avoid
  // overlaps among the generated confirmed bookings.
  const bookings = [
    // 8 CONFIRMED
    {
      resource: "ROOM-001",
      user: "engEmployee",
      status: "CONFIRMED",
      day: 2,
      start: 9,
      end: 11,
      purpose: "Engineering project planning meeting",
      approver: "engHead",
    },
    {
      resource: "ROOM-002",
      user: "engEmployee",
      status: "CONFIRMED",
      day: 4,
      start: 10,
      end: 12,
      purpose: "Technical skills training workshop",
      approver: "engHead",
    },
    {
      resource: "ROOM-004",
      user: "opsEmployee",
      status: "CONFIRMED",
      day: 5,
      start: 9,
      end: 11,
      purpose: "Operations weekly coordination meeting",
      approver: "opsHead",
    },
    {
      resource: "EQP-001",
      user: "engEmployee",
      status: "CONFIRMED",
      day: 6,
      start: 13,
      end: 15,
      purpose: "Project demonstration and presentation",
    },
    {
      resource: "ROOM-003",
      user: "opsEmployee",
      status: "CONFIRMED",
      day: 8,
      start: 10,
      end: 12,
      purpose: "Quarterly performance review",
      approver: "opsHead",
    },
    {
      resource: "EQP-003",
      user: "opsEmployee",
      status: "CONFIRMED",
      day: 10,
      start: 9,
      end: 12,
      purpose: "Internal employee engagement event",
    },
    {
      resource: "EQP-004",
      user: "engEmployee",
      status: "CONFIRMED",
      day: 12,
      start: 14,
      end: 16,
      purpose: "Remote client demonstration",
    },
    {
      resource: "ROOM-005",
      user: "engHead",
      status: "CONFIRMED",
      day: 14,
      start: 11,
      end: 12,
      purpose: "Technical internship interview",
    },

    // 4 PENDING
    {
      resource: "ROOM-001",
      user: "engEmployee",
      status: "PENDING",
      day: 3,
      start: 13,
      end: 15,
      purpose: "Engineering team sprint review",
      approver: "engHead",
    },
    {
      resource: "ROOM-002",
      user: "engEmployee",
      status: "PENDING",
      day: 7,
      start: 9,
      end: 11,
      purpose: "Internal developer training",
      approver: "engHead",
    },
    {
      resource: "ROOM-004",
      user: "opsEmployee",
      status: "PENDING",
      day: 9,
      start: 13,
      end: 15,
      purpose: "Operations process improvement session",
      approver: "opsHead",
    },
    {
      resource: "ROOM-003",
      user: "opsEmployee",
      status: "PENDING",
      day: 11,
      start: 9,
      end: 11,
      purpose: "Department coordination discussion",
      approver: "opsHead",
    },

    // 3 CANCELLED
    {
      resource: "EQP-001",
      user: "engEmployee",
      status: "CANCELLED",
      day: 15,
      start: 9,
      end: 11,
      purpose: "Cancelled product demonstration",
    },
    {
      resource: "ROOM-005",
      user: "opsEmployee",
      status: "CANCELLED",
      day: 16,
      start: 13,
      end: 14,
      purpose: "Interview session rescheduled",
    },
    {
      resource: "EQP-003",
      user: "opsEmployee",
      status: "CANCELLED",
      day: -2,
      start: 10,
      end: 12,
      purpose: "Cancelled staff awareness program",
    },

    // 3 REJECTED
    {
      resource: "ROOM-001",
      user: "engEmployee",
      status: "REJECTED",
      day: 17,
      start: 9,
      end: 11,
      purpose: "Additional conference hall request",
      approver: "engHead",
      reason: "Requested schedule is not suitable.",
    },
    {
      resource: "ROOM-004",
      user: "opsEmployee",
      status: "REJECTED",
      day: 18,
      start: 10,
      end: 12,
      purpose: "Extended operations planning meeting",
      approver: "opsHead",
      reason: "Department meeting schedule changed.",
    },
    {
      resource: "ROOM-003",
      user: "opsEmployee",
      status: "REJECTED",
      day: -3,
      start: 9,
      end: 11,
      purpose: "Previous executive meeting request",
      approver: "opsHead",
      reason: "Request was not approved.",
    },
  ];

  // 7. Create or update only our own demo reservations.
  let created = 0;
  let existing = 0;

  for (let index = 0; index < bookings.length; index++) {
    const booking = bookings[index];

    const bookingReference =
      `${DEMO_PREFIX}${String(index + 1).padStart(3, "0")}`;

    const existingBooking = await prisma.reservation.findUnique({
      where: { bookingReference },
    });

    if (existingBooking) {
      existing++;
      continue;
    }

    const resource = resources[booking.resource];
    const requester = users[booking.user];
    const approver = booking.approver
      ? users[booking.approver]
      : null;

    if (!resource || !requester) {
      throw new Error(
        `Invalid demo booking setup: ${bookingReference}`
      );
    }

    const reviewed =
      booking.status === "REJECTED" ||
      (booking.status === "CONFIRMED" && Boolean(approver));

    const startTime = dateAt(booking.day, booking.start);
    const endTime = dateAt(booking.day, booking.end);

    try {
      await prisma.reservation.create({
        data: {
          bookingReference,
          purpose: booking.purpose,
          startTime,
          endTime,
          status: booking.status,
          userId: requester.id,
          resourceId: resource.id,
          approverId: approver?.id ?? null,
          reviewedById: reviewed ? approver?.id ?? null : null,
          reviewedAt: reviewed ? new Date() : null,
          rejectionReason: booking.reason ?? null,
        },
      });

      created++;
      console.log(
        `Created ${bookingReference}: ${booking.status}`
      );
    } catch (error) {
      console.error(
        `Failed to create ${bookingReference}:`,
        error.message
      );
      throw error;
    }
  }

  console.log("");
  console.log("======================================");
  console.log("ResourceDesk demo setup completed");
  console.log("======================================");
  console.log("Updated user names: 4");
  console.log("Expected demo resources: 10");
  console.log(`New demo reservations: ${created}`);
  console.log(`Existing demo reservations: ${existing}`);
  console.log("Demo reservation statuses:");
  console.log("  Confirmed: 8");
  console.log("  Pending:   4");
  console.log("  Cancelled: 3");
  console.log("  Rejected:  3");
  console.log("======================================");
}

main()
  .catch((error) => {
    console.error("Demo setup failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
