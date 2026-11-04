-- Generic listing verticals (real estate, automobiles & machinery, other)
ALTER TABLE "Listing" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'PROPERTY';
ALTER TABLE "Listing" ADD COLUMN "attrs" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Listing" ADD COLUMN "videos" TEXT[] DEFAULT ARRAY[]::TEXT[];
CREATE INDEX "Listing_kind_idx" ON "Listing"("kind");
