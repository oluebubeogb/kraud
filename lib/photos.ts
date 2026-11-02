/** All displayable photos for a listing: cover first, then gallery files (uploads or remote URLs). Client-safe. */
export const isPhoto = (f: string) => /^\/media\/listings\//.test(f) || /^https:\/\/images\.unsplash\.com\//.test(f) || (/\.(jpe?g|png|webp|avif|gif)(\?|$)/i.test(f) && !f.startsWith("/data"));
export function photos(l: { img: string; files?: string[] }) { const out: string[] = []; for (const f of [l.img, ...(l.files || [])]) if (f && isPhoto(f) && !out.includes(f)) out.push(f); return out; }
