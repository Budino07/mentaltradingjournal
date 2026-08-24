import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "mtj_analytics_session";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export function getOrCreateSessionId(): string {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; at: number };
      if (Date.now() - parsed.at < SESSION_TIMEOUT_MS) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id: parsed.id, at: Date.now() }));
        return parsed.id;
      }
    }
  } catch {
    // ignore
  }
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, at: Date.now() }));
  return id;
}

export function resetSessionId() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function trackEvent(
  eventName: string,
  eventType: "page_view" | "feature" | "engagement" = "feature",
  metadata: Record<string, unknown> = {}
) {
  try {
    const user = await supabase.auth.getUser().then(({ data }) => data.user);
    const sessionId = getOrCreateSessionId();
    await supabase.from("analytics_events").insert({
      user_id: user?.id ?? null,
      session_id: sessionId,
      event_type: eventType,
      event_name: eventName,
      path: typeof window !== "undefined" ? window.location.pathname : null,
      metadata,
    });
  } catch (err) {
    // Analytics should never break the app
    console.error("Analytics track error:", err);
  }
}

export function trackPageView(path?: string) {
  return trackEvent(path ?? window.location.pathname, "page_view", {});
}
