"use client";
export function Avatar({ src, name, size = 36, className = "" }: { src?: string | null; name: string; size?: number; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src || "/avatars/default.webp"} alt={name} width={size} height={size} className={`rounded-full object-cover ring-2 ring-white shrink-0 ${className}`} style={{ width: size, height: size }} decoding="async" onError={(e) => { const i = e.currentTarget; if (!i.src.endsWith("/avatars/default.webp")) i.src = "/avatars/default.webp"; }} />;
}
