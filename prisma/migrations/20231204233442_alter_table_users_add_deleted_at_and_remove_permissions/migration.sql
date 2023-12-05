/*
  Warnings:

  - You are about to drop the column `permissions` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "permissions",
ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- DropEnum
DROP TYPE "Permission";
