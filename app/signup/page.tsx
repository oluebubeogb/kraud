import AuthShell from "../AuthShell"; import { SignupForm } from "@/components/Client";
export default function P() { return <AuthShell title="Create your Kraud account" sub="Pick a password. We'll email a Nigerian-word phrase to verify your email."><SignupForm /></AuthShell>; }
