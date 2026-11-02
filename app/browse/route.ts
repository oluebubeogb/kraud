import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
/** Smart browse entry: phones land in immersive feed, desktop in explore grid. */
export function GET(req: NextRequest) {
  const ua = req.headers.get("user-agent") || ""; const ch = req.headers.get("sec-ch-ua-mobile");
  const mobile = ch === "?1" || /Android|iPhone|iPod|Mobile|Opera Mini|IEMobile/i.test(ua);
  // Relative Location: never derive host from req.url (it is 0.0.0.0:3000 behind Coolify proxy).
  return new NextResponse(null, { status: 307, headers: { Location: mobile ? "/immersive" : "/explore", "Cache-Control": "no-store", Vary: "User-Agent, Sec-CH-UA-Mobile" } });
}
