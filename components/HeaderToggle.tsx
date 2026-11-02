"use client";
import { usePathname } from "next/navigation";
import ViewToggle from "./ViewToggle";
/** Shows the grid→immersive toggle in the guest header while on explore. */
export function HeaderToggle() { return usePathname() === "/explore" ? <ViewToggle to="immersive" /> : null; }
