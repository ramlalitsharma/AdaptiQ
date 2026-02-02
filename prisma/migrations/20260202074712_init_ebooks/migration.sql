-- CreateTable
CREATE TABLE "Ebook" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "audience" TEXT,
    "tone" TEXT,
    "focus" TEXT,
    "chapters" JSONB NOT NULL,
    "requestedChapters" INTEGER,
    "tags" TEXT[],
    "releaseAt" TIMESTAMP(3),
    "seo" JSONB,
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ebook_pkey" PRIMARY KEY ("id")
);
