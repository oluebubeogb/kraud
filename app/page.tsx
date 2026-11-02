import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
/** App opens straight into properties: phones → immersive feed, wide screens → grid. Relative redirect only (never 0.0.0.0). */
export default async function Root() {
  const h = await headers(); const ua = h.get("user-agent") || "";
  const mobile = h.get("sec-ch-ua-mobile") === "?1" || /Android|iPhone|iPod|Mobile|Opera Mini|IEMobile/i.test(ua);
  const pref = (await cookies()).get("kview")?.value;
  redirect(mobile && pref !== "grid" ? "/immersive" : mobile ? "/explore?view=grid" : "/explore");
}
