import React from 'react';
import { WidgetConfig, UserListContext, Ticket } from '../../types';
export interface HomeNavigateOptions {
    /** When true, list screens play stagger animation (home burger menu only) */
    fromMenu?: boolean;
}
interface HomeScreenProps {
    config: WidgetConfig;
    onNavigate: (ctx: UserListContext | 'ticket', options?: HomeNavigateOptions) => void;
    /** Open a specific pending ticket (full detail) */
    onOpenTicket: (ticketId: string) => void;
    tickets: Ticket[];
}
export declare const HomeScreen: React.FC<HomeScreenProps>;
export {};
