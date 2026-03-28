import React from 'react';
import { WidgetConfig } from '../../types';
interface ViewerBlockedScreenProps {
    config: WidgetConfig;
    apiKey: string;
    onClose: () => void;
}
export declare const ViewerBlockedScreen: React.FC<ViewerBlockedScreenProps>;
export {};
