import AuthShell from "../AuthShell"; import { ForgotForm } from "@/components/Client";
export default function P() { return <AuthShell title="Forgot passphrase" sub="We'll email a Nigerian 2-word reset phrase, valid for 15 minutes."><ForgotForm /></AuthShell>; }
