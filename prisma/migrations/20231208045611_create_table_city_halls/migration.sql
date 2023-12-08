-- CreateTable
CREATE TABLE "city_halls" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "txt_color" TEXT NOT NULL,
    "bg_image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "city_halls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "city_halls_email_key" ON "city_halls"("email");

-- CreateIndex
CREATE UNIQUE INDEX "city_halls_slug_key" ON "city_halls"("slug");
