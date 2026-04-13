'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ticketService } from '@/lib/services/ticketservice';
import type { TicketDetail } from '@/lib/types/ticket.types';
import {
  T, SHARED_STYLES,
  statusBadge, typeBadge, resolutionLabel,
  formatDate, formatCurrency,
} from '@/lib/utils/tickethelpers';

export default function TicketDetailPage() {
  const params               = useParams();
  const ticketId             = Number(params.id);
  const [ticket, setTicket]  = useState<TicketDetail | null>(null);
  const [loading, setLoading]= useState(true);
  const [error, setError]    = useState('');
  const [message, setMessage]= useState('');
  const [sending, setSending]= useState(false);
  const bottomRef            = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ticketService.getTicketDetail(ticketId);
        setTicket(data);
      } catch {
        setError('No se pudo cargar el ticket.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [ticketId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const isClosed = ticket
    ? ['RESOLVED', 'REJECTED', 'CLOSED_INVALID'].includes(ticket.status)
    : false;

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !ticket) return;
    setSending(true);
    try {
      const updated = await ticketService.sendMessage(ticketId, { message });
      setTicket(updated);
      setMessage('');
    } catch {
      setError('Error al enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <div className="tk-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <style>{SHARED_STYLES}</style>
      <div className="tk-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
    </div>
  );

  if (error || !ticket) return (
    <div className="tk-page" style={{ padding: '32px 20px', textAlign: 'center' }}>
      <style>{SHARED_STYLES}</style>
      <p style={{ color: T.red }}>{error || 'Ticket no encontrado.'}</p>
      <Link href="/tickets/my" className="tk-btn tk-btn-ghost" style={{ marginTop: 16, display: 'inline-flex' }}>← Volver</Link>
    </div>
  );

  const sb = statusBadge(ticket.status);
  const tb = typeBadge(ticket.type);

  return (
    <div className="tk-page" style={{ padding: '32px 20px' }}>
      <style>{SHARED_STYLES}</style>

      <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Back */}
        <Link href="/tickets/my" className="tk-btn tk-btn-ghost tk-f1" style={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
          ← Mis tickets
        </Link>

        {/* Header card */}
        <div className="tk-card-flat tk-f2" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span className="tk-badge" style={{ color: tb.color, background: tb.bg }}>{tb.label}</span>
                <span className="tk-badge" style={{ color: sb.color, background: sb.bg }}>{sb.label}</span>
              </div>
              <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.4rem', marginBottom: 4 }}>
                {ticket.productName}
              </h1>
              <p style={{ color: T.muted, fontSize: 13 }}>Ticket #{ticket.id} · Ref: {ticket.purchaseReferenceId}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: T.muted, fontSize: 12, marginBottom: 4 }}>Creado</div>
              <div style={{ fontSize: 13 }}>{formatDate(ticket.createdAt)}</div>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
            {[
              { label: 'Código entregado', value: ticket.deliveredCode || '—' },
              { label: 'Precio pagado',    value: formatCurrency(ticket.priceAtPurchase) },
              { label: 'Resolución',       value: resolutionLabel(ticket.resolution) },
              { label: 'Resuelto',         value: formatDate(ticket.resolvedAt) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: T.surface2, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 5 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, wordBreak: 'break-all' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* New code banner */}
          {ticket.newDeliveredCode && (
            <div style={{ marginTop: 16, background: 'rgba(34,216,122,.08)', border: '1px solid rgba(34,216,122,.25)', borderRadius: 13, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <div>
                <div style={{ color: T.green, fontWeight: 700, fontSize: 13, marginBottom: 3 }}>Nuevo código asignado</div>
                <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, letterSpacing: '.05em' }}>{ticket.newDeliveredCode}</div>
              </div>
            </div>
          )}

          {/* Rejection banner */}
          {ticket.rejectionJustification && (
            <div style={{ marginTop: 16, background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.25)', borderRadius: 13, padding: '14px 18px' }}>
              <div style={{ color: T.red, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Motivo de rechazo</div>
              <div style={{ color: T.text, fontSize: 13, lineHeight: 1.6 }}>{ticket.rejectionJustification}</div>
            </div>
          )}
        </div>

        {/* Message thread */}
        <div className="tk-card-flat tk-f3">
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border}` }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1.05rem' }}>Conversación</h2>
          </div>

          <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: 420, overflowY: 'auto' }}>
            {ticket.messages.map((msg) => {
              const isAdmin = msg.senderRole === 'ADMIN';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: isAdmin ? 'row' : 'row-reverse',
                    gap: 10, alignItems: 'flex-end',
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isAdmin ? 'rgba(255,107,43,.15)' : 'rgba(96,165,250,.15)',
                    border: `1px solid ${isAdmin ? 'rgba(255,107,43,.3)' : 'rgba(96,165,250,.3)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>
                    {isAdmin ? '🛡️' : '👤'}
                  </div>

                  {/* Bubble */}
                  <div style={{ maxWidth: '72%' }}>
                    <div style={{
                      background: isAdmin ? 'rgba(255,107,43,.08)' : T.surface2,
                      border: `1px solid ${isAdmin ? 'rgba(255,107,43,.2)' : T.border}`,
                      borderRadius: isAdmin ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                      padding: '10px 14px',
                    }}>
                      <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{msg.message}</p>
                    </div>
                    <div style={{ color: T.muted, fontSize: 11, marginTop: 4, textAlign: isAdmin ? 'left' : 'right' }}>
                      {isAdmin ? 'Soporte' : 'Tú'} · {formatDate(msg.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          {!isClosed && (
            <form onSubmit={handleSend} style={{ padding: '14px 22px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 12 }}>
              <textarea
                className="tk-input"
                rows={2}
                placeholder="Escribe un mensaje..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ flex: 1 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend(e as unknown as FormEvent);
                  }
                }}
              />
              <button type="submit" className="tk-btn tk-btn-primary" disabled={sending || !message.trim()} style={{ alignSelf: 'flex-end', padding: '10px 18px' }}>
                {sending ? <div className="tk-spinner" /> : 'Enviar'}
              </button>
            </form>
          )}

          {isClosed && (
            <div style={{ padding: '14px 22px', borderTop: `1px solid ${T.border}`, textAlign: 'center', color: T.muted, fontSize: 13 }}>
              Este ticket está cerrado y no acepta más mensajes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}