-- CreateTable
CREATE TABLE "sub_city_halls" (
    "id" TEXT NOT NULL,
    "city_hall_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "observation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sub_city_halls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sub_city_halls_email_key" ON "sub_city_halls"("email");

-- AddForeignKey
ALTER TABLE "sub_city_halls" ADD CONSTRAINT "sub_city_halls_city_hall_id_fkey" FOREIGN KEY ("city_hall_id") REFERENCES "city_halls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
