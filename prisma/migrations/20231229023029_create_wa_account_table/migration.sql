-- CreateTable
CREATE TABLE "wa_accounts" (
    "id" TEXT NOT NULL,
    "city_hall_id" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "contacts_qty" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "wa_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wa_accounts_phone_key" ON "wa_accounts"("phone");

-- AddForeignKey
ALTER TABLE "wa_accounts" ADD CONSTRAINT "wa_accounts_city_hall_id_fkey" FOREIGN KEY ("city_hall_id") REFERENCES "city_halls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
