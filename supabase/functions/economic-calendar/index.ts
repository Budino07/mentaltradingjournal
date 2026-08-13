import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const FEEDS: Record<string, string> = {
  thisweek: 'https://nfs.faireconomy.media/ff_calendar_thisweek.json',
  nextweek: 'https://nfs.faireconomy.media/ff_calendar_nextweek.json',
  lastweek: 'https://nfs.faireconomy.media/ff_calendar_lastweek.json',
};

interface RawEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast?: string;
  previous?: string;
  actual?: string;
}

const CURRENCY_META: Record<string, { flag: string; country: string }> = {
  USD: { flag: '🇺🇸', country: 'United States' },
  EUR: { flag: '🇪🇺', country: 'Euro Zone' },
  GBP: { flag: '🇬🇧', country: 'United Kingdom' },
  JPY: { flag: '🇯🇵', country: 'Japan' },
  AUD: { flag: '🇦🇺', country: 'Australia' },
  NZD: { flag: '🇳🇿', country: 'New Zealand' },
  CAD: { flag: '🇨🇦', country: 'Canada' },
  CHF: { flag: '🇨🇭', country: 'Switzerland' },
  CNY: { flag: '🇨🇳', country: 'China' },
};

const normalizeImpact = (v: string): 'high' | 'medium' | 'low' => {
  const s = (v || '').toLowerCase();
  if (s === 'high') return 'high';
  if (s === 'medium') return 'medium';
  return 'low';
};

const clean = (v?: string) => (v && v.trim() !== '' ? v.trim() : null);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const week = url.searchParams.get('week') ?? 'thisweek';
    const feed = FEEDS[week];
    if (!feed) {
      return new Response(JSON.stringify({ error: 'Invalid week parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(feed, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TradingJournal/1.0)' },
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`ForexFactory feed failed [${res.status}]: ${body.slice(0, 300)}`);
      return new Response(
        JSON.stringify({ error: 'Calendar source request failed', status: res.status }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const raw: RawEvent[] = await res.json();
    const events = raw.map((e) => {
      const meta = CURRENCY_META[e.country] ?? { flag: '🌐', country: e.country };
      return {
        id: `${e.date}-${e.country}-${e.title}`,
        timestamp: e.date,
        currency: e.country,
        country: meta.country,
        flag: meta.flag,
        impact: normalizeImpact(e.impact),
        name: e.title,
        actual: clean(e.actual),
        forecast: clean(e.forecast),
        previous: clean(e.previous),
      };
    });

    return new Response(JSON.stringify({ week, fetchedAt: new Date().toISOString(), events }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=900',
      },
    });
  } catch (err) {
    console.error('economic-calendar error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
