// src/lib/url.ts
export function apiUrl(path: string) {
  const base = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
