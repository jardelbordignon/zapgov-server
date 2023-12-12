/*
  Warnings:

  - Made the column `bg_image` on table `city_halls` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "city_halls" ALTER COLUMN "bg_image" SET NOT NULL;

-- AlterTable
ALTER TABLE "sub_city_halls" ALTER COLUMN "observation" DROP NOT NULL;

-- CreateTable
CREATE TABLE "neighborhoods" (
    "id" TEXT NOT NULL,
    "city_hall_id" TEXT NOT NULL,
    "sub_city_hall_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "locality" TEXT,
    "observation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "neighborhoods_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_city_hall_id_fkey" FOREIGN KEY ("city_hall_id") REFERENCES "city_halls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_sub_city_hall_id_fkey" FOREIGN KEY ("sub_city_hall_id") REFERENCES "sub_city_halls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
