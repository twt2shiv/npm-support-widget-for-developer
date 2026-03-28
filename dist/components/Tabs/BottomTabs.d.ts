import React from 'react';
import { BottomTab } from '../../types';
interface BottomTabsProps {
    active: BottomTab;
    onChange: (tab: BottomTab) => void;
    primaryColor: string;
}
export declare const BottomTabs: React.FC<BottomTabsProps>;
export {};
