import { apiClient } from "./apiClient";

export interface AgentContextDto {
  user?: {
    id: number;
    name: string;
    email: string;
    balance: number;
  };
  recentPurchases?: Array<{
    referenceId: string;
    productName: string;
    deliveredCode?: string;
    price: number;
    purchasedAt: string;
    status: string;
  }>;
  activeTickets?: Array<{
    id: number;
    productName: string;
    status: string;
    type: string;
    reason: string;
    createdAt: string;
  }>;
  availableProducts?: Array<{
    id: number;
    name: string;
    category: string;
    price: number;
    inStock: boolean;
    description: string;
  }>;
}

export interface AgentMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export const agentService = {
  /** Fetch user context from Spring Boot backend */
  getContext: async (): Promise<AgentContextDto> => {
    const res = await apiClient.get<AgentContextDto>('/api/agent/context');
    return res;
  },

  /** Call Next.js API route which proxies to Gemini */
  chat: async (
    messages: AgentMessage[],
    context: AgentContextDto
  ): Promise<string> => {
    const res = await fetch('/ai-agent', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ messages, context }),
    });

    if (!res.ok) {
      throw new Error(`AI agent error: ${res.status}`);
    }

    const data = await res.json();
    return data.text as string;
  },
};