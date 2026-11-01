import fs from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/db";
export async function GET(_: Request, { params }: { params: Promise<{ p: string[] }> }) {
  const { p } = await params; const root = path.join(DATA_DIR, "uploads"); const f = path.resolve(root, ...p);
  if (!f.startsWith(root + path.sep) || !fs.existsSync(f)) return new Response("Not found", { status: 404 });
  const type = f.endsWith(".svg") ? "image/svg+xml" : f.endsWith(".png") ? "image/png" : f.endsWith(".jpg") ? "image/jpeg" : "application/octet-stream";
  return new Response(fs.readFileSync(f), { headers: { "content-type": type, "cache-control": "public, max-age=3600", "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'" } });
}
