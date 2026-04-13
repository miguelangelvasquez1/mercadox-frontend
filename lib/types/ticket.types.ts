export type TicketStatus = 'OPEN' | 'VALIDATING' | 'RESOLVED' | 'REJECTED' | 'CLOSED_INVALID';
export type TicketType = 'REPLACEMENT' | 'REFUND';
export type TicketResolution = 'REPLACEMENT_SENT' | 'REFUND_PROCESSED' | 'REJECTED' | 'CLOSED_INVALID';
export type MessageSenderRole = 'CLIENT' | 'ADMIN';

export interface TicketMessage {
  id: number;
  senderName: string;
  senderRole: MessageSenderRole;
  message: string;
  createdAt: string;
}

export interface TicketSummary {
  id: number;
  purchaseReferenceId: string;
  productName: string;
  type: TicketType;
  status: TicketStatus;
  resolution: TicketResolution | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface TicketDetail extends TicketSummary {
  purchaseId: number;
  purchaseItemId: number;
  deliveredCode: string;
  priceAtPurchase: number;
  reason: string;
  adminNotes: string | null;
  rejectionJustification: string | null;
  newDeliveredCode: string | null;
  updatedAt: string | null;
  messages: TicketMessage[];
}

// ── Requests ──────────────────────────────────────────────────────────────────

export interface CreateTicketRequest {
  purchaseId: number;
  purchaseItemId: number;
  type: TicketType;
  reason: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface ValidateTicketRequest {
  adminNotes?: string;
}

export interface ResolveWithReplacementRequest {
  newProductStockId: number;
  adminNotes?: string;
}

export interface ResolveWithRefundRequest {
  adminNotes?: string;
}

export interface RejectTicketRequest {
  justification: string;
  adminNotes?: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}