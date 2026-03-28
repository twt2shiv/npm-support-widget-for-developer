import { RemoteChatData } from '../types';
export declare function useRemoteConfig(apiKey: string, widgetId: string): {
    data: RemoteChatData | null;
    loading: boolean;
    error: string | null;
};
