import { load } from "./db";
export const listings = () => load().listings.filter((l) => l.moderation !== "Hidden");
export const featured = (slot: string) => listings().filter((l) => l.featured?.includes(slot));
