import { ChatMessage, ChatUser } from '../types';
export declare function useChat(initialMessages?: ChatMessage[]): {
    messages: ChatMessage[];
    activeUser: ChatUser | null;
    isPaused: boolean;
    isReported: boolean;
    selectUser: (user: ChatUser, history?: ChatMessage[]) => void;
    sendMessage: (text: string, type?: ChatMessage["type"], extra?: Partial<ChatMessage>) => void;
    togglePause: () => void;
    reportChat: () => void;
    clearChat: () => void;
    setMessages: import("react").Dispatch<import("react").SetStateAction<ChatMessage[]>>;
};
