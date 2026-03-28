import React from 'react';
import { Ticket, WidgetConfig } from '../../types';
interface TicketDetailScreenProps {
    ticket: Ticket;
    config: WidgetConfig;
    onBack: () => void;
}
export declare const TicketDetailScreen: React.FC<TicketDetailScreenProps>;
export {};
