import { apiClient } from './apiClient';

export interface ChatMessageDto {
  id: number;
  content: string;
  senderRole: 'USER' | 'ADMIN';
  senderName: string | null;
  readByOther: boolean;
  createdAt: string;
}

export interface ConversationSummaryDto {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  status: 'OPEN' | 'CLOSED';
  unreadByAdmin: number;
  unreadByUser: number;
  updatedAt: string;
  createdAt: string;
  lastMessage: ChatMessageDto | null;
}

export interface ConversationDetailDto extends ConversationSummaryDto {
  messages: ChatMessageDto[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export const chatService = {
  // ── User ───────────────────────────────────────────────────────────────

  getMyConversation: async (): Promise<ConversationDetailDto> => {
    const res = await apiClient.get<ConversationDetailDto>('/api/chat/my');
    return res;
  },

  userSendMessage: async (content: string): Promise<ChatMessageDto> => {
    const res = await apiClient.post<ChatMessageDto>('/api/chat/my/messages', { content });
    return res;
  },

  userMarkAsRead: async (): Promise<void> => {
    await apiClient.post<void>('/api/chat/my/read');
  },

  getUserUnread: async (): Promise<number> => {
    const res = await apiClient.get<number>('/api/chat/my/unread');
    return res;
  },

  // ── Admin ──────────────────────────────────────────────────────────────

  getAllConversations: async (
    page = 0,
    size = 20
  ): Promise<PageResponse<ConversationSummaryDto>> => {
    const res = await apiClient.get<PageResponse<ConversationSummaryDto>>('/api/chat/admin/conversations', {
      params: { page, size },
    });
    return res;
  },

  getConversation: async (id: number): Promise<ConversationDetailDto> => {
    const res = await apiClient.get<ConversationDetailDto>(`/api/chat/admin/conversations/${id}`);
    return res;
  },

  adminSendMessage: async (
    conversationId: number,
    content: string
  ): Promise<ChatMessageDto> => {
    const res = await apiClient.post<ChatMessageDto>(
      `/api/chat/admin/conversations/${conversationId}/messages`,
      { content }
    );
    return res;
  },

  adminMarkAsRead: async (conversationId: number): Promise<void> => {
    await apiClient.post(`/api/chat/admin/conversations/${conversationId}/read`);
  },
};