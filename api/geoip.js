/**
 * GET /api/geoip
 * Reads the client IP from request headers and returns geolocation data.
 * Called server-to-server so viewer IPs are never sent to third parties directly.
 */
export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // CORS — allow from same origin (the Vite app)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  const ip = getClientIp(req);

  // Localhost / private IPs — return Unknown immediately
  if (!ip || isPrivateIp(ip)) {
    return res.status(200).json({
      country: "Unknown",
      countryCode: "",
      city: "Unknown",
      region: "Unknown",
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const geoRes = await fetch(
      `https://ipinfo.io/${ip}/json`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!geoRes.ok) throw new Error(`ipinfo responded ${geoRes.status}`);

    const data = await geoRes.json();

    // ipinfo returns country as a 2-letter code (e.g. "US"), city and region as strings
    return res.status(200).json({
      country: codeToName(data.country) ?? "Unknown",
      countryCode: data.country ?? "",
      city: data.city ?? "Unknown",
      region: data.region ?? "Unknown",
    });
  } catch {
    return res.status(200).json({
      country: "Unknown",
      countryCode: "",
      city: "Unknown",
      region: "Unknown",
    });
  }
}

/**
 * Extract client IP from Vercel / standard proxy headers.
 */
function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    // x-forwarded-for can be a comma-separated list; first one is the client
    return forwarded.split(",")[0].trim();
  }
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || null;
}

const COUNTRY_NAMES = new Intl.DisplayNames(["en"], { type: "region" });
function codeToName(code) {
  if (!code || code.length !== 2) return null;
  try { return COUNTRY_NAMES.of(code.toUpperCase()); } catch { return null; }
}

/**
 * Returns true for loopback, private, and link-local addresses.
 */
function isPrivateIp(ip) {
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    ip.startsWith("169.254.") ||
    ip.startsWith("fc") ||
    ip.startsWith("fd") ||
    ip.startsWith("fe80")
  );
}
