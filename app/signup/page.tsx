import AuthShell from "../AuthShell"; import { SignupForm } from "@/components/Client";
export default async function P({ searchParams }: { searchParams: Promise<{ ref?: string }> }) { const { ref } = await searchParams; const code = (ref || "").replace(/[^a-z0-9]/gi, "").slice(0, 20).toUpperCase();
  return <AuthShell title="Join Kraud" sub="Own Together. Grow Together." tip="We'll email a Nigerian-word phrase to verify your email."><SignupForm ref0={code} /></AuthShell>; }
