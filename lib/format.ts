export const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");
export const nairaShort = (n: number) => n >= 1e9 ? `₦${(n/1e9).toFixed(n%1e9?1:0)}B` : n >= 1e6 ? `₦${(n/1e6).toFixed(n%1e6?1:0)}M` : naira(n);
export const wat = (t: number | string | Date) => new Date(t).toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" }) + " WAT";
