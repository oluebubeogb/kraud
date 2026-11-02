import fs from "fs";
import path from "path";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { UPLOAD_DIR, prisma } from "@/lib/db";
const TYPES: Record<string, [string, number[]]> = { "image/jpeg": [".jpg", [0xff, 0xd8, 0xff]], "image/png": [".png", [0x89, 0x50, 0x4e, 0x47]], "image/webp": [".webp", [0x52, 0x49, 0x46, 0x46]] };
/**
 * Photo upload → KRAUD_DATA_DIR/uploads (persistent volume). Magic-byte checked, 8 MB max.
 * ?kind=avatar: any signed-in user, saved to uploads/avatars and set as the profile photo (served at /media/avatars/…).
 * default: seller listing photos → uploads/listings.
 */
export async function POST(req: NextRequest) {
  const avatar = req.nextUrl.searchParams.get("kind") === "avatar";
  const u = await currentUser(); if (!u) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  if (!avatar && u.role !== "SELLER") return NextResponse.json({ error: "Seller account required" }, { status: 403 });
  const f = (await req.formData()).get("file"); if (!(f instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (f.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Max 8 MB" }, { status: 400 });
  const t = TYPES[f.type]; const buf = Buffer.from(await f.arrayBuffer());
  if (!t || !t[1].every((b, i) => buf[i] === b)) return NextResponse.json({ error: "JPG, PNG or WEBP only" }, { status: 400 });
  const sub = avatar ? "avatars" : "listings";
  const dir = path.join(UPLOAD_DIR, sub); fs.mkdirSync(dir, { recursive: true });
  const name = `${u.id}-${crypto.randomBytes(8).toString("hex")}${t[0]}`; fs.writeFileSync(path.join(dir, name), buf);
  const url = `/media/${sub}/${name}`;
  if (avatar) {
    const old = u.profileImageUrl; await prisma.user.update({ where: { id: u.id }, data: { profileImageUrl: url } });
    if (old?.startsWith("/media/avatars/")) fs.rmSync(path.join(UPLOAD_DIR, "avatars", path.basename(old)), { force: true });
  }
  return NextResponse.json({ ok: true, url });
}
