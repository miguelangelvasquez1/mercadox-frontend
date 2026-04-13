import { apiClient } from '@/lib/services/apiClient';
import type {
  CreateTicketRequest,
  Page,
  RejectTicketRequest,
  ResolveWithRefundRequest,
  ResolveWithReplacementRequest,
  SendMessageRequest,
  TicketDetail,
  TicketStatus,
  TicketSummary,
  ValidateTicketRequest,
} from '@/lib/types/ticket.types';

export const ticketService = {

  // ── Cliente ────────────────────────────────────────────────────────────────

  async createTicket(data: CreateTicketRequest): Promise<TicketDetail> {
    return apiClient.post<TicketDetail>('/tickets', data);
  },

  async getMyTickets(page = 0, size = 10): Promise<Page<TicketSummary>> {
    return apiClient.get<Page<TicketSummary>>(`/tickets/my?page=${page}&size=${size}&sort=createdAt,desc`);
  },

  async getTicketDetail(ticketId: number): Promise<TicketDetail> {
    return apiClient.get<TicketDetail>(`/tickets/${ticketId}`);
  },

  async sendMessage(ticketId: number, data: SendMessageRequest): Promise<TicketDetail> {
    return apiClient.post<TicketDetail>(`/tickets/${ticketId}/messages`, data);
  },

  // ── Admin ──────────────────────────────────────────────────────────────────

  async getAllTickets(page = 0, size = 20, status?: TicketStatus): Promise<Page<TicketSummary>> {
    const statusParam = status ? `&status=${status}` : '';
    return apiClient.get<Page<TicketSummary>>(
      `/tickets/admin?page=${page}&size=${size}&sort=createdAt,desc${statusParam}`
    );
  },

  async validateTicket(ticketId: number, data: ValidateTicketRequest): Promise<TicketDetail> {
    return apiClient.put<TicketDetail>(`/tickets/${ticketId}/validate`, data);
  },

  async resolveWithReplacement(ticketId: number, data: ResolveWithReplacementRequest): Promise<TicketDetail> {
    return apiClient.put<TicketDetail>(`/tickets/${ticketId}/resolve/replacement`, data);
  },

  async resolveWithRefund(ticketId: number, data: ResolveWithRefundRequest): Promise<TicketDetail> {
    return apiClient.put<TicketDetail>(`/tickets/${ticketId}/resolve/refund`, data);
  },

  async rejectTicket(ticketId: number, data: RejectTicketRequest): Promise<TicketDetail> {
    return apiClient.put<TicketDetail>(`/tickets/${ticketId}/reject`, data);
  },

  async closeAsInvalid(ticketId: number): Promise<TicketDetail> {
    return apiClient.put<TicketDetail>(`/tickets/${ticketId}/close-invalid`, {});
  },
};