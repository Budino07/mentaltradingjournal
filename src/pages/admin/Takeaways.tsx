import { useOutletContext } from "react-router-dom";
import {
  DateRange,
  useAdminAcquisition,
  useAdminActivation,
  useAdminEngagementQuality,
  useAdminLandingPages,
  useAdminMonetization,
  useAdminRetentionDn,
  useAdminSignupFunnel,
  useAdminTrafficSources,
} from "@/hooks/useAdminAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

type Item = { title: string; detail: string };

export default function Takeaways() {
  const { range } = useOutletContext<{ range: DateRange }>();
  const acq = useAdminAcquisition(range);
  const sources = useAdminTrafficSources(range);
  const landing = useAdminLandingPages(range);
  const eng = useAdminEngagementQuality(range);
  const funnel = useAdminSignupFunnel(range);
  const activation = useAdminActivation(range);
  const retention = useAdminRetentionDn(range);
  const money = useAdminMonetization(range);

  const loading =
    acq.isLoading ||
    sources.isLoading ||
    landing.isLoading ||
    eng.isLoading ||
    funnel.isLoading ||
    activation.isLoading ||
    retention.isLoading ||
    money.isLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    );
  }

  const f = funnel.data;
  const a = activation.data;
  const r = retention.data;
  const q = eng.data;
  const m = money.data;
  const pct = (part?: number, whole?: number) =>
    whole && whole > 0 ? Math.round(((part ?? 0) / whole) * 1000) / 10 : 0;

  const working: Item[] = [];
  const leaks: Item[] = [];
  const actions: Item[] = [];

  const topSource = (sources.data ?? [])[0];
  if (topSource) {
    working.push({
      title: `${topSource.source} is your biggest traffic source`,
      detail: `${topSource.visits.toLocaleString()} visits and ${topSource.signups.toLocaleString()} signups (${pct(
        topSource.signups,
        topSource.visits
      )}% visit → signup).`,
    });
  }

  const signupRate = pct(f?.signups, f?.visitors);
  if (signupRate >= 5) {
    working.push({
      title: "Visitor → signup rate is healthy",
      detail: `${signupRate}% of visitors created an account in this period.`,
    });
  } else if (f?.visitors) {
    leaks.push({
      title: "Weak visitor → signup conversion",
      detail: `Only ${signupRate}% of ${f.visitors.toLocaleString()} visitors signed up.`,
    });
    actions.push({
      title: "Sharpen the landing page promise",
      detail:
        "Test a single, specific headline plus one visible signup CTA above the fold and compare the visitor → signup rate next period.",
    });
  }

  const act7 = pct(a?.entry_7d, a?.cohort);
  if (act7 >= 40) {
    working.push({
      title: "New users start journaling quickly",
      detail: `${act7}% of new signups logged a trade within 7 days.`,
    });
  } else if (a?.cohort) {
    leaks.push({
      title: "Signup → first trade entry is the main drop-off",
      detail: `${a.signed_up_never_journaled.toLocaleString()} of ${a.cohort.toLocaleString()} new users never logged a trade (${act7}% activated in 7 days).`,
    });
    actions.push({
      title: "Guide the first entry",
      detail:
        "Add a one-screen onboarding that drops the user straight into a prefilled journal entry after signup, then measure 24h activation.",
    });
  }

  if (q && q.bounce_rate > 60) {
    const worst = (landing.data ?? [])
      .filter((p) => p.visits >= 5)
      .sort((x, y) => (y.bounce_rate ?? 0) - (x.bounce_rate ?? 0))[0];
    leaks.push({
      title: `Bounce rate is high (${q.bounce_rate}%)`,
      detail: worst
        ? `Worst landing page: ${worst.path} at ${worst.bounce_rate}% bounce over ${worst.visits} visits.`
        : "Most sessions end on the first page.",
    });
  } else if (q) {
    working.push({
      title: "Sessions have depth",
      detail: `${q.pages_per_session} pages per session, average duration ${Math.round(
        (q.avg_duration_sec ?? 0) / 60
      )} min, ${q.bounce_rate}% bounce.`,
    });
  }

  if (r) {
    if (r.d7 >= 30) {
      working.push({
        title: "Week-one habit is forming",
        detail: `Day-7 retention is ${r.d7}% and day-30 is ${r.d30}%.`,
      });
    } else {
      leaks.push({
        title: "Users don't come back in week one",
        detail: `Day-1 ${r.d1}%, day-7 ${r.d7}%, day-30 ${r.d30}%.`,
      });
      actions.push({
        title: "Bring people back on day 2",
        detail:
          "Send a next-morning recap email/notification prompting the pre-session journal, and track day-1 retention against this period's baseline.",
      });
    }
  }

  if (m) {
    if (m.free_to_paid_rate >= 3) {
      working.push({
        title: "Paid conversion is working",
        detail: `${m.free_to_paid_rate}% of users are paying, upgrading after a median of ${
          m.median_days_to_upgrade || "—"
        } days.`,
      });
    } else {
      leaks.push({
        title: "Low free → paid conversion",
        detail: `${m.free_to_paid_rate}% of users pay. ${
          m.upgrade_sources?.length
            ? `Most upgrade clicks come from "${m.upgrade_sources[0].source}".`
            : "No upgrade prompts are being tracked yet."
        }`,
      });
      actions.push({
        title: "Put the upgrade prompt where value lands",
        detail:
          "Trigger the upgrade nudge right after a user's 5th logged trade (peak perceived value) instead of only on the pricing page, and compare upgrade clicks per source.",
      });
    }
  }

  const Section = ({
    title,
    icon,
    items,
    tone,
    empty,
  }: {
    title: string;
    icon: React.ReactNode;
    items: Item[];
    tone: string;
    empty: string;
  }) => (
    <Card className="bg-card/60 border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span className={tone}>{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ol className="space-y-4">
            {items.slice(0, 3).map((it, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-sm font-semibold text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                <div>
                  <p className="font-medium text-sm">{it.title}</p>
                  <p className="text-sm text-muted-foreground">{it.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Key takeaways</h1>
        <p className="text-muted-foreground">
          Automatically generated from this period's funnel data — refreshes with the date range.
        </p>
      </div>

      <Section
        title="Working well"
        icon={<CheckCircle2 className="h-4 w-4" />}
        tone="text-emerald-500"
        items={working}
        empty="Not enough data yet to call anything a win."
      />
      <Section
        title="Drop-off points"
        icon={<AlertTriangle className="h-4 w-4" />}
        tone="text-amber-500"
        items={leaks}
        empty="No obvious leaks detected in this range."
      />
      <Section
        title="Recommendations to test next period"
        icon={<Lightbulb className="h-4 w-4" />}
        tone="text-primary"
        items={actions}
        empty="No recommendations — metrics look stable."
      />
    </div>
  );
}
