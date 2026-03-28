import React from 'react';
import { Ticket, WidgetConfig } from '../../types';
interface TicketFormScreenProps {
    config: WidgetConfig;
    onSubmit: (title: string, desc: string, priority: Ticket['priority']) => void;
    onCancel: () => void;
}
export declare const TicketFormScreen: React.FC<TicketFormScreenProps>;
export {};
