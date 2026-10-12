-- Enable the extension required to use gist indexes with UUIDs
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add the exclusion constraint to prevent overlapping confirmed reservations
ALTER TABLE "Reservation"
ADD CONSTRAINT "no_overlapping_confirmed_reservations"
EXCLUDE USING gist (
    "resourceId" WITH =,
    tstzrange("startTime", "endTime", '[)') WITH &&
)
WHERE (status = 'CONFIRMED');