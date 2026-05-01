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

type AdminAction = 'validate' | 'replacement' | 'refund' | 'reject' | 'invalid' | null;

export default function AdminTicketDetailPage() {
  const params               = useParams();
  const ticketId             = Number(params.id);
  const [ticket, setTicket]  = useState<TicketDetail | null>(null);
  const [loading, setLoading]= useState(true);
  const [error, setError]    = useState('');
  const [action, setAction]  = useState<AdminAction>(null);
  const [working, setWorking]= useState(false);
  const [message, setMessage]= useState('');
  const [sending, setSending]= useState(false);

  // Action form fields
  const [adminNotes, setAdminNotes]         = useState('');
  const [stockId, setStockId]               = useState('');
  const [justification, setJustification]   = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);

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

  const refresh = async () => {
    const data = await ticketService.getTicketDetail(ticketId);
    setTicket(data);
  };

  const isClosed = ticket
    ? ['RESOLVED', 'REJECTED', 'CLOSED_INVALID'].includes(ticket.status)
    : false;

  // ── Admin actions ──────────────────────────────────────────────────────────

  const handleAction = async (e: FormEvent) => {
    e.preventDefault();
    if (!ticket || !action) return;
    setWorking(true);
    setError('');
    try {
      switch (action) {
        case 'validate':
          await ticketService.validateTicket(ticketId, { adminNotes: adminNotes || undefined });
          break;
        case 'replacement':
          if (!stockId) { setError('Ingresa el ID del nuevo stock.'); setWorking(false); return; }
          await ticketService.resolveWithReplacement(ticketId, {
            newProductStockId: Number(stockId),
            adminNotes: adminNotes || undefined,
          });
          break;
        case 'refund':
          await ticketService.resolveWithRefund(ticketId, { adminNotes: adminNotes || undefined });
          break;
        case 'reject':
          if (!justification) { setError('La justificación es obligatoria.'); setWorking(false); return; }
          await ticketService.rejectTicket(ticketId, {
            justification,
            adminNotes: adminNotes || undefined,
          });
          break;
        case 'invalid':
          await ticketService.closeAsInvalid(ticketId);
          break;
      }
      await refresh();
      setAction(null);
      setAdminNotes('');
      setStockId('');
      setJustification('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Error al ejecutar la acción.');
    } finally {
      setWorking(false);
    }
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
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

  if (error && !ticket) return (
    <div className="tk-page" style={{ padding: '32px 20px', textAlign: 'center' }}>
      <style>{SHARED_STYLES}</style>
      <p style={{ color: T.red }}>{error}</p>
      <Link href="/tickets" className="tk-btn tk-btn-ghost" style={{ marginTop: 16, display: 'inline-flex' }}>← Volver</Link>
    </div>
  );

  const sb = statusBadge(ticket!.status);
  const tb = typeBadge(ticket!.type);

  return (
    <div className="tk-page" style={{ padding: '32px 20px' }}>
      <style>{SHARED_STYLES}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Back */}
        <Link href="/tickets" className="tk-btn tk-btn-ghost tk-f1" style={{ display: 'inline-flex', alignSelf: 'flex-start' }}>
          ← Todos los tickets
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Ticket header */}
            <div className="tk-card-flat tk-f2" style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="tk-badge" style={{ color: tb.color, background: tb.bg }}>{tb.label}</span>
                <span className="tk-badge" style={{ color: sb.color, background: sb.bg }}>{sb.label}</span>
              </div>
              <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.35rem', marginBottom: 4 }}>
                {ticket!.productName}
              </h1>
              <p style={{ color: T.muted, fontSize: 13, marginBottom: 18 }}>
                Ticket #{ticket!.id} · Ref: {ticket!.purchaseReferenceId} · Creado {formatDate(ticket!.createdAt)}
              </p>

              {/* Info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  { label: 'Código original', value: ticket!.deliveredCode || '—' },
                  { label: 'Precio',          value: formatCurrency(ticket!.priceAtPurchase) },
                  { label: 'Resolución',      value: resolutionLabel(ticket!.resolution) },
                  { label: 'Resuelto',        value: formatDate(ticket!.resolvedAt) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: T.surface2, borderRadius: 11, padding: '11px 14px' }}>
                    <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, wordBreak: 'break-all' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Reason */}
              <div style={{ marginTop: 16, background: T.surface2, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>Descripción del problema</div>
                <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>{ticket!.reason}</p>
              </div>

              {/* Admin notes */}
              {ticket!.adminNotes && (
                <div style={{ marginTop: 12, background: 'rgba(255,107,43,.06)', border: '1px solid rgba(255,107,43,.15)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ color: T.accentSoft, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>Notas internas</div>
                  <p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>{ticket!.adminNotes}</p>
                </div>
              )}

              {/* New code banner */}
              {ticket!.newDeliveredCode && (
                <div style={{ marginTop: 14, background: 'rgba(34,216,122,.08)', border: '1px solid rgba(34,216,122,.25)', borderRadius: 13, padding: '14px 16px', display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <div>
                    <div style={{ color: T.green, fontWeight: 700, fontSize: 13, marginBottom: 3 }}>Nuevo código asignado</div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13 }}>{ticket!.newDeliveredCode}</div>
                  </div>
                </div>
              )}

              {/* Rejection banner */}
              {ticket!.rejectionJustification && (
                <div style={{ marginTop: 14, background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.25)', borderRadius: 13, padding: '14px 16px' }}>
                  <div style={{ color: T.red, fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Justificación de rechazo</div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{ticket!.rejectionJustification}</p>
                </div>
              )}
            </div>

            {/* Message thread */}
            <div className="tk-card-flat tk-f3">
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${T.border}` }}>
                <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1rem' }}>Conversación</h2>
              </div>

              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto' }}>
                {ticket!.messages.map((msg) => {
                  const isAdmin = msg.senderRole === 'ADMIN';
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: isAdmin ? 'row' : 'row-reverse', gap: 10, alignItems: 'flex-end' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: isAdmin ? 'rgba(255,107,43,.15)' : 'rgba(96,165,250,.15)', border: `1px solid ${isAdmin ? 'rgba(255,107,43,.3)' : 'rgba(96,165,250,.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                        {isAdmin ? '🛡️' : '👤'}
                      </div>
                      <div style={{ maxWidth: '72%' }}>
                        <div style={{ background: isAdmin ? 'rgba(255,107,43,.08)' : T.surface2, border: `1px solid ${isAdmin ? 'rgba(255,107,43,.2)' : T.border}`, borderRadius: isAdmin ? '14px 14px 14px 4px' : '14px 14px 4px 14px', padding: '9px 13px' }}>
                          <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{msg.message}</p>
                        </div>
                        <div style={{ color: T.muted, fontSize: 11, marginTop: 3, textAlign: isAdmin ? 'left' : 'right' }}>
                          {isAdmin ? `Soporte · ${msg.senderName}` : 'Cliente'} · {formatDate(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {!isClosed && (
                <form onSubmit={handleSendMessage} style={{ padding: '12px 22px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 10 }}>
                  <textarea className="tk-input" rows={2} placeholder="Responder al cliente..." value={message} onChange={(e) => setMessage(e.target.value)} style={{ flex: 1 }} />
                  <button type="submit" className="tk-btn tk-btn-primary" disabled={sending || !message.trim()} style={{ alignSelf: 'flex-end', padding: '9px 16px' }}>
                    {sending ? <div className="tk-spinner" /> : 'Enviar'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN — Actions */}
          <div className="tk-f4" style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 }}>

            <div className="tk-card-flat" style={{ padding: '18px 20px' }}>
              <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Acciones del admin</h2>

              {isClosed ? (
                <div style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                  Ticket cerrado — sin acciones disponibles.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ticket!.status === 'OPEN' && (
                    <button className="tk-btn tk-btn-ghost" style={{ width: '100%' }} onClick={() => setAction('validate')}>
                      🔍 Marcar en revisión
                    </button>
                  )}
                  {ticket!.status === 'VALIDATING' && (
                    <>
                      <button className="tk-btn tk-btn-success" style={{ width: '100%' }} onClick={() => setAction('replacement')}>
                        🔄 Asignar nuevo código
                      </button>
                      <button className="tk-btn tk-btn-success" style={{ width: '100%' }} onClick={() => setAction('refund')}>
                        💸 Procesar reembolso
                      </button>
                      <button className="tk-btn tk-btn-danger" style={{ width: '100%' }} onClick={() => setAction('reject')}>
                        ✗ Rechazar solicitud
                      </button>
                    </>
                  )}
                  {(ticket!.status === 'OPEN' || ticket!.status === 'VALIDATING') && (
                    <button className="tk-btn tk-btn-ghost" style={{ width: '100%', color: T.muted }} onClick={() => setAction('invalid')}>
                      ⊘ Cerrar como inválido
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Action form panel */}
            {action && (
              <div className="tk-card-flat tk-fade" style={{ padding: '18px 20px' }}>
                <h3 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '.95rem', marginBottom: 16 }}>
                  {{
                    validate:    '🔍 Confirmar revisión',
                    replacement: '🔄 Asignar nuevo código',
                    refund:      '💸 Confirmar reembolso',
                    reject:      '✗ Rechazar ticket',
                    invalid:     '⊘ Cerrar como inválido',
                  }[action]}
                </h3>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 10, padding: '10px 14px', color: T.red, fontSize: 12, marginBottom: 14 }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleAction} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                  {action === 'replacement' && (
                    <div>
                      <label className="tk-label">ID del nuevo stock</label>
                      <input
                        type="number"
                        className="tk-input"
                        placeholder="Ej: 789"
                        value={stockId}
                        onChange={(e) => setStockId(e.target.value)}
                        style={{ resize: 'none' }}
                        required
                      />
                    </div>
                  )}

                  {action === 'reject' && (
                    <div>
                      <label className="tk-label">Justificación para el cliente</label>
                      <textarea className="tk-input" rows={3} placeholder="Explica por qué se rechaza..." value={justification} onChange={(e) => setJustification(e.target.value)} required />
                    </div>
                  )}

                  {action !== 'invalid' && (
                    <div>
                      <label className="tk-label">Notas internas (opcional)</label>
                      <textarea className="tk-input" rows={2} placeholder="Solo visibles para el equipo..." value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="tk-btn tk-btn-ghost"
                      style={{ flex: 1 }}
                      onClick={() => { setAction(null); setError(''); }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className={`tk-btn ${action === 'reject' || action === 'invalid' ? 'tk-btn-danger' : 'tk-btn-primary'}`}
                      disabled={working}
                      style={{ flex: 1 }}
                    >
                      {working ? <div className="tk-spinner" /> : 'Confirmar'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}