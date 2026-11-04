/** Vertical-aware key specs for any listing (property, automobile/machinery, other). Client-safe. */
export type SpecSrc = { kind?: string | null; beds: number; baths: number; sqm: number; type: string; attrs?: unknown };
const A = (l: SpecSrc) => (l.attrs && typeof l.attrs === "object" ? (l.attrs as Record<string, string | number>) : {});
export const isAuto = (l: { kind?: string | null }) => l.kind === "AUTO";
export const kindNoun = (l: { kind?: string | null }) => (l.kind === "AUTO" ? "vehicle" : l.kind === "OTHER" ? "asset" : "property");
/** [icon, label] triples shown in the specs strip. */
export function specs(l: SpecSrc): [string, string][] {
  const a = A(l);
  if (l.kind === "AUTO") {
    const out: [string, string][] = [];
    if (a.year) out.push(["clock", String(a.year)]);
    if (a.mileage) out.push(["trend", Number(a.mileage).toLocaleString("en-NG") + " km"]);
    else if (a.hours) out.push(["trend", Number(a.hours).toLocaleString("en-NG") + " hrs"]);
    if (a.seats) out.push(["users", a.seats + " seats"]);
    else if (a.fuel) out.push(["sparkle", String(a.fuel)]);
    if (out.length < 3 && a.transmission) out.push(["key", String(a.transmission)]);
    if (out.length < 3) out.push(["car", l.type]);
    return out.slice(0, 3);
  }
  if (l.kind === "OTHER") return Object.entries(a).slice(0, 3).map(([k, v]) => ["info", `${v} ${k}`]);
  return [["bed", l.beds + " beds"], ["bath", l.baths + " baths"], ["area", l.sqm + " m²"]];
}
/** Extra attribute rows for detail pages (make, model, fuel…). */
export const attrRows = (l: SpecSrc) => Object.entries(A(l)).map(([k, v]) => [k.replace(/^./, (c) => c.toUpperCase()), typeof v === "number" && v > 3000 ? v.toLocaleString("en-NG") : String(v)] as [string, string]);
export const specTag = (l: SpecSrc) => specs(l).map((s) => s[1]).join(" · ");
export const searchText = (l: SpecSrc) => `${l.kind === "AUTO" ? "car auto vehicle automobile machinery" : "property house home"} ${specTag(l)} ${Object.values(A(l)).join(" ")}`;
