-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "wa_account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contacts_phone_key" ON "contacts"("phone");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_wa_account_id_fkey" FOREIGN KEY ("wa_account_id") REFERENCES "wa_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
