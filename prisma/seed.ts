
import {
  PrismaClient,
  Role,
  UserStatus,
  ResourceStatus,
  AccessScope,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo seeding is disabled in production.");
  }

  const passwordHash = await bcrypt.hash("password123", 12);

  
  // 1. SEED DEPARTMENTS

  console.log("Seeding departments...");

  const engineering = await prisma.department.upsert({
    where: { name: "Engineering" },
    update: {
      departmentCode: "ENG",
    },
    create: {
      departmentCode: "ENG",
      name: "Engineering",
    },
  });

  const operations = await prisma.department.upsert({
    where: { name: "Operations" },
    update: {
      departmentCode: "OPS",
    },
    create: {
      departmentCode: "OPS",
      name: "Operations",
    },
  });

  
  // 2. SEED USERS

  console.log("Seeding users...");

  const users = [
    {
      employeeId: "ADM-001",
      name: "System Admin",
      email: "admin@resourcedesk.local",
      role: Role.ADMIN,
      departmentId: null,
    },
    {
      employeeId: "ENG-001",
      name: "Sarah Manager",
      email: "manager@resourcedesk.local",
      role: Role.DEPARTMENT_HEAD,
      departmentId: engineering.id,
    },
    {
      employeeId: "OPS-001",
      name: "Olivia Manager",
      email: "operations.head@resourcedesk.local",
      role: Role.DEPARTMENT_HEAD,
      departmentId: operations.id,
    },
    {
      employeeId: "ENG-002",
      name: "John Employee",
      email: "employee@resourcedesk.local",
      role: Role.EMPLOYEE,
      departmentId: engineering.id,
    },
    {
      employeeId: "OPS-002",
      name: "Maya Employee",
      email: "operations.employee@resourcedesk.local",
      role: Role.EMPLOYEE,
      departmentId: operations.id,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        departmentId: user.departmentId,
        status: UserStatus.ACTIVE,
        // Reset demo accounts to a known password.
        // Only use this script for local development.
        passwordHash,
      },
      create: {
        ...user,
        passwordHash,
        status: UserStatus.ACTIVE,
      },
    });
  }

  // 3. ASSIGN DEPARTMENT HEADS

  console.log("Assigning department heads...");

  const engineeringHead = await prisma.user.findUniqueOrThrow({
    where: {
      email: "manager@resourcedesk.local",
    },
  });

  const operationsHead = await prisma.user.findUniqueOrThrow({
    where: {
      email: "operations.head@resourcedesk.local",
    },
  });

  await prisma.department.update({
    where: { id: engineering.id },
    data: { headId: engineeringHead.id },
  });

  await prisma.department.update({
    where: { id: operations.id },
    data: { headId: operationsHead.id },
  });

  // 4. SEED RESOURCES

  console.log("Seeding resources...");

  const resources = [
    {
      resourceCode: "ROOM-001",
      name: "Main Conference Hall",
      category: "Room",
      description: "Organization-wide meeting room",
      location: "Floor 2",
      capacity: 20,
      status: ResourceStatus.ACTIVE,
      accessScope: AccessScope.ORGANIZATION,
      requiresApproval: true,
      ownerDepartmentId: null,
    },
    {
      resourceCode: "EQP-001",
      name: "Epson Projector P1",
      category: "Equipment",
      description: "Shared projector",
      location: "IT Storage",
      capacity: null,
      status: ResourceStatus.ACTIVE,
      accessScope: AccessScope.ORGANIZATION,
      requiresApproval: false,
      ownerDepartmentId: engineering.id,
    },
    {
      resourceCode: "ROOM-002",
      name: "Engineering Training Room",
      category: "Room",
      description: "Engineering department training room",
      location: "Floor 3",
      capacity: 12,
      status: ResourceStatus.ACTIVE,
      accessScope: AccessScope.DEPARTMENT,
      requiresApproval: true,
      ownerDepartmentId: engineering.id,
    },
    {
      resourceCode: "EQP-002",
      name: "Spare MacBook Pro",
      category: "Equipment",
      description: "Unavailable while undergoing repairs",
      location: "IT Storage",
      capacity: null,
      status: ResourceStatus.MAINTENANCE,
      accessScope: AccessScope.ORGANIZATION,
      requiresApproval: false,
      ownerDepartmentId: engineering.id,
    },
  ];

  for (const resource of resources) {
    const { resourceCode, ...data } = resource;

    // First look for a resource with its intended code.
    const existingByCode = await prisma.resource.findUnique({
      where: { resourceCode },
    });

    if (existingByCode) {
      await prisma.resource.update({
        where: { id: existingByCode.id },
        data,
      });

      continue;
    }

    // Reuse an older resource with the same name if one exists.
    const existingByName = await prisma.resource.findFirst({
      where: { name: resource.name },
      orderBy: { createdAt: "asc" },
    });

    if (existingByName) {
      await prisma.resource.update({
        where: { id: existingByName.id },
        data: {
          ...data,
          resourceCode,
        },
      });
    } else {
      await prisma.resource.create({
        data: {
          resourceCode,
          ...data,
        },
      });
    }
  }

  // 5. COMPLETION

  console.log("");
  console.log("========================================");
  console.log("ResourceDesk seed completed successfully!");
  console.log("========================================");
  console.log("Departments: Engineering, Operations");
  console.log("Demo users: 5");
  console.log("Demo resources: 4");
  console.log("Demo password: password123");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
