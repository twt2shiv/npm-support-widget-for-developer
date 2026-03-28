/**
 * Same-origin proxy to avoid CORS when loading chat config from window.mscorpres.com.
 *
 * 1. Copy this file to: app/api/chat-config/route.ts (Next.js App Router)
 * 2. In your app .env:
 *    REACT_APP_CHAT_CONFIG_URL=/api/chat-config
 *    (or NEXT_PUBLIC_CHAT_CONFIG_URL=/api/chat-config)
 *
 * The widget will call /api/chat-config?key=...&widget=... on YOUR domain (no CORS).
 * This route fetches the remote JSON server-side (CORS does not apply).
 */

import { NextRequest, NextResponse } from 'next/server';

const UPSTREAM_BASE = 'https://window.mscorpres.com/TEST/chatData.json';

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key') ?? '';
  const widget = req.nextUrl.searchParams.get('widget') ?? '';

  const upstream = new URL(UPSTREAM_BASE);
  upstream.searchParams.set('key', key);
  upstream.searchParams.set('widget', widget);

  const res = await fetch(upstream.toString(), {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: 'Upstream error', status: res.status },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
