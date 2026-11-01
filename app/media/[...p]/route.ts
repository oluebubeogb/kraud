import fs from "fs";
import path from "path";
import { DATA_DIR } from "@/lib/db";
export async function GET(_: Request, { params }: { params: Promise<{ p: string[] }> }) {
  const { p } = await params; const root = path.join(DATA_DIR, "uploads"); const f = path.resolve(root, ...p);
  if (!f.startsWith(root + path.sep) || !fs.existsSync(f)) return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
  const type = f.endsWith(".svg") ? "image/svg+xml" : f.endsWith(".png") ? "image/png" : /\.jpe?g$/.test(f) ? "image/jpeg" : f.endsWith(".webp") ? "image/webp" : f.endsWith(".json") ? "application/json" : "application/octet-stream";
  return new Response(fs.readFileSync(f), { headers: { "content-type": type, "cache-control": "public, max-age=86400, must-revalidate", "cross-origin-resource-policy": "same-origin", "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'" } });
}
