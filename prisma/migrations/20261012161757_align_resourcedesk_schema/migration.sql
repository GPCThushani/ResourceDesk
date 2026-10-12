
-- 1. Create new enums
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TYPE "AccessScope" AS ENUM ('ORGANIZATION', 'DEPARTMENT');

-- 2. Add department fields
ALTER TABLE "Department"
ADD COLUMN "departmentCode" TEXT,
ADD COLUMN "headId" UUID;

-- Assign unique codes to existing departments
WITH numbered AS (
    SELECT "id",
           ROW_NUMBER() OVER (ORDER BY "id") AS rn
    FROM "Department"
)
UPDATE "Department" AS d
SET "departmentCode" = 'DEPT-' || numbered.rn
FROM numbered
WHERE d."id" = numbered."id";

ALTER TABLE "Department"
ALTER COLUMN "departmentCode" SET NOT NULL;

-- 3. Add reservation fields
ALTER TABLE "Reservation"
ADD COLUMN "approverId" UUID,
ADD COLUMN "bookingReference" TEXT;

-- Assign unique references to existing reservations
WITH numbered AS (
    SELECT "id",
           ROW_NUMBER() OVER (ORDER BY "id") AS rn
    FROM "Reservation"
)
UPDATE "Reservation" AS r
SET "bookingReference" = 'BOOK-' || numbered.rn
FROM numbered
WHERE r."id" = numbered."id";

ALTER TABLE "Reservation"
ALTER COLUMN "bookingReference" SET NOT NULL;

-- 4. Preserve resource ownership
ALTER TABLE "Resource"
DROP CONSTRAINT "Resource_departmentId_fkey";

ALTER TABLE "Resource"
RENAME COLUMN "departmentId" TO "ownerDepartmentId";

-- 5. Add resource fields
ALTER TABLE "Resource"
ADD COLUMN "accessScope" "AccessScope"
    NOT NULL DEFAULT 'ORGANIZATION',
ADD COLUMN "resourceCode" TEXT;

-- Assign unique codes to existing resources
WITH numbered AS (
    SELECT "id",
           ROW_NUMBER() OVER (ORDER BY "id") AS rn
    FROM "Resource"
)
UPDATE "Resource" AS r
SET "resourceCode" = 'RES-' || numbered.rn
FROM numbered
WHERE r."id" = numbered."id";

ALTER TABLE "Resource"
ALTER COLUMN "resourceCode" SET NOT NULL;

-- 6. Preserve existing pending approval assignments
UPDATE "Reservation" AS r
SET "approverId" = res."approverId"
FROM "Resource" AS res
WHERE r."resourceId" = res."id"
  AND r."status" = 'PENDING'
  AND res."approverId" IS NOT NULL;

-- Remove obsolete resource-level approver relationship
ALTER TABLE "Resource"
DROP CONSTRAINT "Resource_approverId_fkey";

ALTER TABLE "Resource"
DROP COLUMN "approverId";

-- 7. Add user fields
ALTER TABLE "User"
ADD COLUMN "employeeId" TEXT,
ADD COLUMN "status" "UserStatus"
    NOT NULL DEFAULT 'ACTIVE';

-- 8. Create unique indexes
CREATE UNIQUE INDEX "Department_departmentCode_key"
ON "Department"("departmentCode");

CREATE UNIQUE INDEX "Department_headId_key"
ON "Department"("headId");

CREATE UNIQUE INDEX "Reservation_bookingReference_key"
ON "Reservation"("bookingReference");

CREATE UNIQUE INDEX "Resource_resourceCode_key"
ON "Resource"("resourceCode");

CREATE UNIQUE INDEX "User_employeeId_key"
ON "User"("employeeId");

-- 9. Create reservation indexes
CREATE INDEX "Reservation_resourceId_startTime_endTime_idx"
ON "Reservation"("resourceId", "startTime", "endTime");

CREATE INDEX "Reservation_userId_createdAt_idx"
ON "Reservation"("userId", "createdAt");

CREATE INDEX "Reservation_approverId_status_idx"
ON "Reservation"("approverId", "status");

-- 10. Add foreign keys
ALTER TABLE "Department"
ADD CONSTRAINT "Department_headId_fkey"
FOREIGN KEY ("headId")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Resource"
ADD CONSTRAINT "Resource_ownerDepartmentId_fkey"
FOREIGN KEY ("ownerDepartmentId")
REFERENCES "Department"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Reservation"
ADD CONSTRAINT "Reservation_approverId_fkey"
FOREIGN KEY ("approverId")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
