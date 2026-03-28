import { useState, useEffect } from 'react';
import { fetchRemoteChatData } from '../config';
export function useRemoteConfig(apiKey, widgetId) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchRemoteChatData(apiKey, widgetId)
            .then(d => { if (!cancelled) {
            setData(d);
            setError(null);
            setLoading(false);
        } })
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
