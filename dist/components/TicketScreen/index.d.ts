import React from 'react';
import { Ticket, WidgetConfig } from '../../types';
interface TicketScreenProps {
    tickets: Ticket[];
    config: WidgetConfig;
    onNewTicket: () => void;
    onSelectTicket: (id: string) => void;
    animateEntrance?: boolean;
}
export declare const TicketScreen: React.FC<TicketScreenProps>;
export {};
