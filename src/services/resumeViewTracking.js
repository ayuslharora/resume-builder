const VIEWER_ID_KEY = "resumeforge_resume_viewer_id";

export function getOrCreateResumeViewerId() {
  if (typeof window === "undefined") return "";

  try {
    const existing = window.localStorage.getItem(VIEWER_ID_KEY);
    if (existing) return existing;

    const nextId = createViewerId();
    window.localStorage.setItem(VIEWER_ID_KEY, nextId);
    return nextId;
  } catch {
    return createViewerId();
  }
}

function createViewerId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
}

/**
 * Returns referrer domain, device type, and OS detected from the browser.
 * Never throws.
 */
export function getViewerContext() {
  try {
    const rawReferrer = document.referrer;
    let referrer = "Direct";
    if (rawReferrer) {
      try {
        referrer = new URL(rawReferrer).hostname.replace(/^www\./, "");
      } catch {
        referrer = rawReferrer.slice(0, 60);
      }
    }

    const ua = navigator.userAgent;

    let device = "Desktop";
    if (/Mobi|Android/i.test(ua) && !/iPad/i.test(ua)) {
      device = "Mobile";
    } else if (/Tablet|iPad/i.test(ua)) {
      device = "Tablet";
    }

    let os = "Unknown";
    if (/iPhone|iPad/.test(ua)) {
      os = "iOS";
    } else if (/Mac/.test(ua) && !/iPhone|iPad/.test(ua)) {
      os = "macOS";
    } else if (/Android/.test(ua)) {
      os = "Android";
    } else if (/Windows/.test(ua)) {
      os = "Windows";
    } else if (/Linux/.test(ua)) {
      os = "Linux";
    }

    return { referrer, device, os };
  } catch {
    return { referrer: "Direct", device: "Desktop", os: "Unknown" };
  }
}

/**
 * Calls our server-side /api/geoip endpoint and returns geo data.
 * Falls back to Unknown values on any error or timeout.
 */
export async function fetchGeoData() {
  const fallback = { country: "Unknown", countryCode: "", city: "Unknown", region: "Unknown" };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("/api/geoip", { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return fallback;
    const data = await res.json();
    return {
      country: data.country ?? "Unknown",
      countryCode: data.countryCode ?? "",
      city: data.city ?? "Unknown",
      region: data.region ?? "Unknown",
    };
  } catch {
    return fallback;
  }
}
