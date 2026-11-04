let bannk = ""; try { const u = process.env.MONNIFY_BASE_URL; if (u) bannk = " " + new URL(u).origin; } catch {}
const csp = ["default-src 'self'", "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com" + (process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"), "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", "img-src 'self' data: blob: https:", "font-src 'self' data: https://fonts.gstatic.com", "connect-src 'self' https://images.unsplash.com https://cloudflareinsights.com https://*.cloudflareinsights.com" + bannk, "frame-ancestors 'none'", "form-action 'self'" + bannk, "base-uri 'self'"].join("; ");
export default {
  output: "standalone",
  serverExternalPackages: ["pdfkit", "@prisma/client", "prisma"],
  outputFileTracingIncludes: { "/**": ["./assets/**/*", "./node_modules/pdfkit/js/data/**/*"] },
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
      { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
    ]}, { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] }];
  },
};
