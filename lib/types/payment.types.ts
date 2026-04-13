export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PSE';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface PaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  cardLastFour: string;
  cardHolder: string;
  expiryDate: string;
}

export interface PaymentResponse {
  id: number;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  cardLastFour: string;
  cardHolder: string;
  gatewayReference: string;
  createdAt: string;
}

export interface PaymentHistoryPage {
  content: PaymentResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
}