import { useState, useCallback } from 'react';
import { ChatMessage, ChatUser } from '../types';

export function useChat(initialMessages: ChatMessage[] = []) {
  const [messages,   setMessages]   = useState<ChatMessage[]>(initialMessages);
  const [activeUser, setActiveUser] = useState<ChatUser | null>(null);
  const [isPaused,   setIsPaused]   = useState(false);
  const [isReported, setIsReported] = useState(false);

  const selectUser = useCallback((user: ChatUser, history: ChatMessage[] = []) => {
    setActiveUser(user);
    setMessages(history);
    setIsPaused(false);
    setIsReported(false);
    // TODO: socket.emit('join', { roomId: user.uid });
    // TODO: socket.on('message', msg => setMessages(prev => [...prev, msg]));
  }, []);

  const sendMessage = useCallback((
    text: string,
    type: ChatMessage['type'] = 'text',
    extra: Partial<ChatMessage> = {}
  ) => {
    if (!activeUser || isPaused) return;
    const msg: ChatMessage = {
      id:         `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      senderId:   'me',
      receiverId: activeUser.uid,
      text,
      timestamp:  new Date().toISOString(),
      type,
      status:     'sent',
      ...extra,
    };
    setMessages(prev => [...prev, msg]);
    // TODO: socket.emit('message', msg);
  }, [activeUser, isPaused]);

  const togglePause   = useCallback(() => setIsPaused(p => !p), []);
  const reportChat    = useCallback(() => { setIsReported(true); /* TODO: API call */ }, []);
  const clearChat     = useCallback(() => { setMessages([]); setActiveUser(null); }, []);

  return {
    messages, activeUser, isPaused, isReported,
    selectUser, sendMessage, togglePause, reportChat, clearChat,
    setMessages,
  };
}
