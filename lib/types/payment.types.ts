// lib/types/payment.types.ts

export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE';
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'FAILED';

export interface PaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  cardLastFour: string;
  cardHolder: string;
  expiryDate: string;
}

export interface PaymentResponse {
  data: PaymentResponse | PromiseLike<PaymentResponse>;
  id: number;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  cardLastFour: string;
  gatewayReference: string;
  createdAt: string;
}

export interface PaymentHistoryPage {
  data: PaymentHistoryPage | PromiseLike<PaymentHistoryPage>;
  content: PaymentResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
}