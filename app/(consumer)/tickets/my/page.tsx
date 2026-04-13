'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ticketService } from '@/lib/services/ticketservice';
import type { TicketSummary } from '@/lib/types/ticket.types';
import {
  T, SHARED_STYLES,
  statusBadge, typeBadge, formatDate,
} from '@/lib/utils/tickethelpers';

export default function MyTicketsPage() {
  const [tickets, setTickets]   = useState<TicketSummary[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [page, setPage]         = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await ticketService.getMyTickets(page);
        setTickets(res.content);
        setTotalPages(res.totalPages);
      } catch {
        setError('No se pudieron cargar tus tickets.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [page]);

  return (
    <div className="tk-page" style={{ padding: '32px 20px' }}>
      <style>{SHARED_STYLES}</style>

      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header */}
        <div className="tk-f1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: T.accentSoft, fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>SOPORTE</p>
            <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-.02em' }}>Mis tickets</h1>
          </div>
          <Link href="/tickets/new" className="tk-btn tk-btn-primary">
            + Abrir ticket
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 14, padding: '14px 18px', color: T.red, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="tk-card-flat" style={{ padding: 20, display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ height: 16, width: '40%', borderRadius: 8, background: 'rgba(255,255,255,.05)' }} />
                  <div style={{ height: 13, width: '60%', borderRadius: 8, background: 'rgba(255,255,255,.04)' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && tickets.length === 0 && !error && (
          <div className="tk-card-flat tk-fade" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🎫</div>
            <p style={{ color: T.muted, fontSize: 15, marginBottom: 20 }}>No tienes tickets de soporte aún.</p>
            <Link href="/tickets/new" className="tk-btn tk-btn-primary">Abrir primer ticket</Link>
          </div>
        )}

        {/* List */}
        {!loading && tickets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tickets.map((ticket, i) => {
              const sb = statusBadge(ticket.status);
              const tb = typeBadge(ticket.type);
              return (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  style={{ textDecoration: 'none' }}
                  className={`tk-card tk-f${Math.min(i + 1, 5) as 1 | 2 | 3 | 4 | 5}`}
                >
                  <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

                    {/* Icon */}
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: tb.bg, border: `1px solid ${tb.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                      {ticket.type === 'REPLACEMENT' ? '🔄' : '💸'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.productName}
                      </div>
                      <div style={{ color: T.muted, fontSize: 12 }}>
                        Ref: {ticket.purchaseReferenceId} · {formatDate(ticket.createdAt)}
                      </div>
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <span className="tk-badge" style={{ color: tb.color, background: tb.bg }}>
                        {tb.label}
                      </span>
                      <span className="tk-badge" style={{ color: sb.color, background: sb.bg }}>
                        {sb.label}
                      </span>
                    </div>

                    <span style={{ color: T.muted, fontSize: 18 }}>›</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 28 }}>
            <button className="tk-btn tk-btn-ghost" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Anterior</button>
            <span style={{ color: T.muted, fontSize: 13, alignSelf: 'center' }}>{page + 1} / {totalPages}</span>
            <button className="tk-btn tk-btn-ghost" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Siguiente →</button>
          </div>
        )}
      </div>
    </div>
  );
}