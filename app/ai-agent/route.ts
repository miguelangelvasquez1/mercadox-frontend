// app/api/ai-agent/route.ts
import { NextRequest, NextResponse } from 'next/server';

// export const runtime = 'edge'; // optional: faster cold starts

const GEMINI_MODEL   = 'gemini-2.5-flash';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── Types ─────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface RequestBody {
  messages:  ChatMessage[];       // full history from the client
  context:   Record<string, unknown>; // AgentContextDto from backend
}

// ── System prompt builder ─────────────────────────────────────────────────

function buildSystemPrompt(context: Record<string, unknown>): string {
  const ctx = context as {
    user?: { name?: string; email?: string; balance?: number };
    recentPurchases?: Array<{
      referenceId?: string;
      productName?: string;
      deliveredCode?: string;
      price?: number;
      purchasedAt?: string;
      status?: string;
    }>;
    activeTickets?: Array<{
      id?: number;
      productName?: string;
      status?: string;
      type?: string;
      reason?: string;
    }>;
    availableProducts?: Array<{
      id?: number;
      name?: string;
      category?: string;
      price?: number;
      inStock?: boolean;
      description?: string;
    }>;
  };

  const user       = ctx.user ?? {};
  const purchases  = ctx.recentPurchases ?? [];
  const tickets    = ctx.activeTickets ?? [];
  const products   = ctx.availableProducts ?? [];

  const formatCOP = (n?: number) =>
    n != null
      ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
      : 'N/A';

  const purchasesBlock = purchases.length
    ? purchases.map(p =>
        `  • ${p.productName} | Ref: ${p.referenceId} | Código: ${p.deliveredCode ?? 'entregado'} | ${formatCOP(p.price)} | ${p.status}`
      ).join('\n')
    : '  (sin compras recientes)';

  const ticketsBlock = tickets.length
    ? tickets.map(t =>
        `  • Ticket #${t.id} — ${t.productName} | Estado: ${t.status} | Tipo: ${t.type} | Motivo: ${t.reason}`
      ).join('\n')
    : '  (sin tickets activos)';

  const productsBlock = products
    .filter(p => p.inStock)
    .slice(0, 15)
    .map(p =>
      `  • [ID:${p.id}] ${p.name} | ${p.category} | ${formatCOP(p.price)} | ${p.description?.slice(0, 60) ?? ''}`
    ).join('\n');

  return `Eres MercaBot, el asistente inteligente de Mercadox — un marketplace de códigos digitales (juegos, software, suscripciones).

## Tu personalidad
- Amable, conciso y muy útil
- Hablas en español colombiano natural (tuteo, sin ser informal en exceso)
- Respondes SIEMPRE en español, sin importar el idioma del usuario
- Usas emojis con moderación para hacer la conversación más cálida
- Nunca inventas información: si no sabes algo, lo dices claramente

## Capacidades
1. **Soporte postventa**: puedes ayudar al usuario con sus compras y guiarlos para abrir tickets
2. **Catálogo de productos**: conoces los productos disponibles y puedes recomendarlos
3. **Estado de tickets**: puedes explicar en qué estado está un ticket y qué significa
4. **Saldo y pagos**: puedes informar sobre el saldo disponible
5. **Guía general**: ayudas con cualquier duda sobre la plataforma

## Acciones que PUEDES sugerir (con deeplinks)
- Abrir un ticket: "/tickets/new"
- Ver sus tickets: "/tickets/my"
- Ver el catálogo: "/products"
- Ver un producto específico: "/products/{id}"
- Ver pagos: "/payment"
- Ir al carrito: "/cart"

Cuando sugieras navegar, usa este formato exacto para que la UI renderice un botón:
[LINK:/ruta|Texto del botón]

## Contexto del usuario actual

**Usuario**: ${user.name ?? 'Invitado'} (${user.email ?? ''})
**Saldo disponible**: ${formatCOP(user.balance)}

**Compras recientes** (últimas 10):
${purchasesBlock}

**Tickets activos**:
${ticketsBlock}

**Productos en stock** (muestra actualizada):
${productsBlock}

## Reglas importantes
- NUNCA compartas el código de activación de otro usuario
- Si el usuario pregunta por su código de activación, muéstraselo desde sus compras recientes
- Si reporta un problema con un código, guíalo a abrir un ticket en /tickets/new
- Los tickets tipo CODE_NOT_WORKING = código no funciona; WRONG_PRODUCT = producto incorrecto; NOT_DELIVERED = no recibió el código
- Responde de forma concisa (máximo 3-4 párrafos); si necesitas listar más, usa bullets
- Fecha y hora actual: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`;
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const body: RequestBody = await req.json();
    const { messages, context } = body;

    if (!messages?.length) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(context ?? {});

    // Gemini API payload
    const geminiPayload = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: messages.map((m) => ({
        role: m.role,
        parts: m.parts,
      })),
      generationConfig: {
        temperature:     0.7,
        topK:            40,
        topP:            0.95,
        maxOutputTokens: 1024,
        responseMimeType: 'text/plain',
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', errText);
      return NextResponse.json(
        { error: 'Gemini API error', detail: errText },
        { status: geminiRes.status }
      );
    }

    const data = await geminiRes.json();
    const text: string =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 
      'Lo siento, no pude generar una respuesta en este momento.';

    return NextResponse.json({ text });
  } catch (err) {
    console.error('AI agent route error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}