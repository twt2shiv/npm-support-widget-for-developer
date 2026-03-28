import { useState, useEffect } from 'react';
import { RemoteChatData } from '../types';
import { fetchRemoteChatData } from '../config';

export function useRemoteConfig(apiKey: string, widgetId: string) {
  const [data,    setData]    = useState<RemoteChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRemoteChatData(apiKey, widgetId)
      .then(d  => { if (!cancelled) { setData(d); setError(null); setLoading(false); } })
      .catch(e => {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : String(e);
          setError(msg || 'Network error while loading configuration');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [apiKey, widgetId]);

  return { data, loading, error };
}
