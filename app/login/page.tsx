import AuthShell from "../AuthShell"; import { LoginForm } from "@/components/Client";
export default function P() { return <AuthShell title="Welcome back" sub="Sign in with your username or email."><LoginForm /></AuthShell>; }
