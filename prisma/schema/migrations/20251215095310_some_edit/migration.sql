-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_listingId_fkey";

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "listingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
