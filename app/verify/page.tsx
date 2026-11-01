import AuthShell from "../AuthShell"; import { VerifyForm } from "@/components/Client";
export default async function P({ searchParams }: { searchParams: Promise<{ u?: string; p?: string }> }) { const s = await searchParams; return <AuthShell title="Verify email" sub="Confirming your verification phrase."><VerifyForm u={s.u || ""} p={s.p || ""} /></AuthShell>; }
