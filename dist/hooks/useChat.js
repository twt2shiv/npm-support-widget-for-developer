import { useState, useCallback } from 'react';
export function useChat(initialMessages = []) {
    const [messages, setMessages] = useState(initialMessages);
    const [activeUser, setActiveUser] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isReported, setIsReported] = useState(false);
    const selectUser = useCallback((user, history = []) => {
        setActiveUser(user);
        setMessages(history);
        setIsPaused(false);
        setIsReported(false);
        // TODO: socket.emit('join', { roomId: user.uid });
        // TODO: socket.on('message', msg => setMessages(prev => [...prev, msg]));
    }, []);
    const sendMessage = useCallback((text, type = 'text', extra = {}) => {
        if (!activeUser || isPaused)
            return;
        const msg = Object.assign({ id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`, senderId: 'me', receiverId: activeUser.uid, text, timestamp: new Date().toISOString(), type, status: 'sent' }, extra);
        setMessages(prev => [...prev, msg]);
        // TODO: socket.emit('message', msg);
    }, [activeUser, isPaused]);
    const togglePause = useCallback(() => setIsPaused(p => !p), []);
    const reportChat = useCallback(() => { setIsReported(true); /* TODO: API call */ }, []);
    const clearChat = useCallback(() => { setMessages([]); setActiveUser(null); }, []);
    return {
        messages, activeUser, isPaused, isReported,
        selectUser, sendMessage, togglePause, reportChat, clearChat,
        setMessages,
    };
}
