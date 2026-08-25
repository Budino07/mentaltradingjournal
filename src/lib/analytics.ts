import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

const SESSION_KEY = "mtj_analytics_session";
const VISITOR_KEY = "mtj_visitor_id";
const ATTRIBUTION_KEY = "mtj_attribution";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

type SessionState = { id: string; at: number; index: number };

function randomId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Stable per-browser id so an anonymous visitor can be tied to a later signup. */
export function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = randomId();
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return "unknown";
  }
}

export function isNewVisitor(): boolean {
  try {
    return !localStorage.getItem(VISITOR_KEY);
  } catch {
    return false;
  }
}

function readSession(): SessionState {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SessionState;
      if (parsed?.id && Date.now() - parsed.at < SESSION_TIMEOUT_MS) return parsed;
    }
  } catch {
    // ignore
  }
  return { id: randomId(), at: Date.now(), index: 0 };
}

function writeSession(s: SessionState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
}

export function getOrCreateSessionId(): string {
  const s = readSession();
  writeSession({ ...s, at: Date.now() });
  return s.id;
}

function nextEventIndex(): { sessionId: string; index: number } {
  const s = readSession();
  const next = { id: s.id, at: Date.now(), index: (s.index ?? 0) + 1 };
  writeSession(next);
  return { sessionId: next.id, index: next.index };
}

export function resetSessionId() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export type Attribution = {
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

/**
 * First-touch attribution for the current session: the referrer / UTM tags the
 * visitor arrived with, kept for the whole session so every event carries them.
 */
export function getAttribution(): Attribution {
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_KEY);
    if (raw) return JSON.parse(raw) as Attribution;
  } catch {
    // ignore
  }

  const params = new URLSearchParams(window.location.search);
  const referrer =
    document.referrer && !document.referrer.includes(window.location.host)
      ? document.referrer
      : null;

  const attribution: Attribution = {
    referrer,
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };

  try {
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch {
    // ignore
  }
  return attribution;
}

export function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|IEMobile|Opera Mini/i.test(ua)) return "mobile";
  return "desktop";
}

export async function trackEvent(
  eventName: string,
  metadata: { [key: string]: Json | undefined } = {},
  eventType: "page_view" | "feature" | "engagement" | "conversion" = "feature"
) {
  try {
    const visitorId = getVisitorId();
    const { sessionId, index } = nextEventIndex();
    const attribution = getAttribution();
    const user = await supabase.auth.getUser().then(({ data }) => data.user);

    await supabase.from("analytics_events").insert({
      user_id: user?.id ?? null,
      visitor_id: visitorId,
      session_id: sessionId,
      event_index: index,
      event_type: eventType,
      event_name: eventName,
      path: typeof window !== "undefined" ? window.location.pathname : null,
      device_type: getDeviceType(),
      referrer: attribution.referrer,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      metadata,
    });
  } catch (err) {
    // Analytics should never break the app
    console.error("Analytics track error:", err);
  }
}

export function trackPageView(path?: string) {
  return trackEvent(path ?? window.location.pathname, {}, "page_view");
}

/** Funnel helpers */
export function trackSignupStarted(method: string) {
  return trackEvent("signup_started", { method }, "conversion");
}

export function trackSignupCompleted(method: string) {
  return trackEvent("signup_completed", { method }, "conversion");
}

export function trackLogin(method: string) {
  return trackEvent("login", { method }, "conversion");
}

export function trackUpgradePromptShown(source: string) {
  return trackEvent("upgrade_prompt_shown", { source }, "conversion");
}

export function trackUpgradeClicked(source: string, plan?: string) {
  return trackEvent("upgrade_clicked", { source, plan: plan ?? null }, "conversion");
}
