/*
  Warnings:

  - Added the required column `category` to the `listings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ListingCategory" AS ENUM ('Food', 'Adventure', 'Culture', 'Photography', 'Nature');

-- AlterTable
ALTER TABLE "listings" ADD COLUMN     "category" "ListingCategory" NOT NULL;
