-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
