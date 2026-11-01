import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
/** Smart browse entry: phones land in immersive feed, desktop in explore grid. */
export function GET(req: NextRequest) {
  const ua = req.headers.get("user-agent") || ""; const ch = req.headers.get("sec-ch-ua-mobile");
  const mobile = ch === "?1" || /Android|iPhone|iPod|Mobile|Opera Mini|IEMobile/i.test(ua);
  return NextResponse.redirect(new URL(mobile ? "/immersive" : "/explore", req.url));
}
