// lib/services/paymentService.ts

import type {
  PaymentHistoryPage,
  PaymentRequest,
  PaymentResponse } from '../types/payment.types';
import { apiClient } from './apiClient';

export const paymentService = {
  /**
   * Procesa un pago (recarga de saldo).
   */
  async pay(data: PaymentRequest): Promise<PaymentResponse> {
    const response = await apiClient.post<PaymentResponse>('/api/payments', data);
    return response;
  },

  /**
   * Obtiene el historial de transacciones paginado.
   */
  async getHistory(page = 0, size = 10): Promise<PaymentHistoryPage> {
    const response = await apiClient.get<PaymentHistoryPage>('/api/payments/history', {
      params: { page, size },
    });
    return response;
  },
};