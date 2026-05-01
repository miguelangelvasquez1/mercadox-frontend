// lib/hooks/useChat.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { chatService, ChatMessageDto, ConversationDetailDto } from '@/lib/services/chatService';

const POLL_INTERVAL = 3000; // ms

// ── User-side hook ────────────────────────────────────────────────────────

export function useUserChat() {
  const [conversation, setConversation] = useState<ConversationDetailDto | null>(null);
  const [loading, setLoading]           = useState(true);
  const [sending, setSending]           = useState(false);
  const [error, setError]               = useState('');
  const pollRef                         = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await chatService.getMyConversation();
      setConversation(data);
    } catch {
      // silent on poll, show error only on first load
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
    pollRef.current = setInterval(load, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    setSending(true);
    setError('');

    // Optimistic update
    const optimistic: ChatMessageDto = {
      id: Date.now(),
      content,
      senderRole: 'USER',
      senderName: null,
      readByOther: false,
      createdAt: new Date().toISOString(),
    };
    setConversation(prev =>
      prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev
    );

    try {
      const real = await chatService.userSendMessage(content);
      setConversation(prev =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map(m =>
                m.id === optimistic.id ? real : m
              ),
            }
          : prev
      );
    } catch {
      setError('No se pudo enviar el mensaje.');
      setConversation(prev =>
        prev
          ? { ...prev, messages: prev.messages.filter(m => m.id !== optimistic.id) }
          : prev
      );
    } finally {
      setSending(false);
    }
  }, []);

  const markAsRead = useCallback(async () => {
    try { await chatService.userMarkAsRead(); } catch { /* silent */ }
  }, []);

  return { conversation, loading, sending, error, sendMessage, markAsRead };
}

// ── Admin-side hook ────────────────────────────────────────────────────────

export function useAdminConversation(conversationId: number | null) {
  const [conversation, setConversation] = useState<ConversationDetailDto | null>(null);
  const [loading, setLoading]           = useState(false);
  const [sending, setSending]           = useState(false);
  const [error, setError]               = useState('');
  const pollRef                         = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (id: number) => {
    try {
      const data = await chatService.getConversation(id);
      setConversation(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!conversationId) { setConversation(null); return; }
    setLoading(true);
    load(conversationId).finally(() => setLoading(false));
    pollRef.current = setInterval(() => load(conversationId), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [conversationId, load]);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId || !content.trim()) return;
    setSending(true);
    setError('');

    const optimistic: ChatMessageDto = {
      id: Date.now(),
      content,
      senderRole: 'ADMIN',
      senderName: 'Soporte',
      readByOther: false,
      createdAt: new Date().toISOString(),
    };
    setConversation(prev =>
      prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev
    );

    try {
      const real = await chatService.adminSendMessage(conversationId, content);
      setConversation(prev =>
        prev
          ? { ...prev, messages: prev.messages.map(m => m.id === optimistic.id ? real : m) }
          : prev
      );
    } catch {
      setError('Error al enviar.');
      setConversation(prev =>
        prev
          ? { ...prev, messages: prev.messages.filter(m => m.id !== optimistic.id) }
          : prev
      );
    } finally {
      setSending(false);
    }
  }, [conversationId]);

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    try { await chatService.adminMarkAsRead(conversationId); } catch { /* silent */ }
  }, [conversationId]);

  return { conversation, loading, sending, error, sendMessage, markAsRead };
}