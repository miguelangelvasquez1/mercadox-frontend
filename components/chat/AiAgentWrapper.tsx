// components/AIAgentChatWrapper.tsx
'use client';
import { useAuth } from '@/lib/auth/AuthContext';
import AIAgentChat from './AiAgentChat';

export default function AIAgentChatWrapper() {
  const { isAuthenticated } = useAuth();
  return <AIAgentChat isAuthenticated={isAuthenticated} />;
}