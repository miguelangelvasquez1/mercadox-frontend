'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ticketService } from '@/lib/services/ticketservice';
import type { TicketSummary, TicketStatus } from '@/lib/types/ticket.types';
import { T, SHARED_STYLES, statusBadge, typeBadge, formatDate } from '@/lib/utils/tickethelpers';

const STATUS_FILTERS: { label: string; value: TicketStatus | '' }[] = [
  { label: 'Todos',       value: ''               },
  { label: 'Abiertos',    value: 'OPEN'           },
  { label: 'En revisión', value: 'VALIDATING'     },
  { label: 'Resueltos',   value: 'RESOLVED'       },
  { label: 'Rechazados',  value: 'REJECTED'       },
  { label: 'Inválidos',   value: 'CLOSED_INVALID' },
];

const PAGE_SIZE = 15;

export default function AdminTicketsPage() {
  const searchParams              = useSearchParams();
  const router                    = useRouter();
  const initialStatus             = (searchParams.get('status') as TicketStatus) || '';

  const [tickets,  setTickets]    = useState<TicketSummary[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [total,    setTotal]      = useState(0);
  const [page,     setPage]       = useState(0);
  const [status,   setStatus]     = useState<TicketStatus | ''>(initialStatus);

  useEffect(() => {
    setPage(0);
  }, [status]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await ticketService.getAllTickets(page, PAGE_SIZE, status || undefined);
        setTickets(res.content);
        setTotal(res.totalElements);
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [page, status]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleStatus = (val: TicketStatus | '') => {
    setStatus(val);
    const params = val ? `?status=${val}` : '';
    router.replace(`/admin/tickets${params}`);
  };

  return (
    <div className="tk-page" style={{ padding: '32px 20px' }}>
      <style>{SHARED_STYLES}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Header ── */}
        <div className="tk-f1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: T.accentSoft, fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              ADMIN · POSTVENTA
            </p>
            <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '2rem', letterSpacing: '-.02em', marginBottom: 4 }}>
              Tickets
            </h1>
            <p style={{ color: T.muted, fontSize: 14 }}>
              {loading ? '...' : `${total} ticket${total !== 1 ? 's' : ''} en total`}
            </p>
          </div>
          <Link href="/admin/dashboard" className="tk-btn tk-btn-ghost" style={{ fontSize: 13, padding: '8px 16px' }}>
            ← Dashboard
          </Link>
        </div>

        {/* ── Filtros ── */}
        <div className="tk-f2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(({ label, value }) => {
            const active = status === value;
            return (
              <button
                key={value}
                onClick={() => handleStatus(value)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 99,
                  border: `1px solid ${active ? T.accent : T.border}`,
                  background: active ? `${T.accent}18` : 'transparent',
                  color: active ? T.accentSoft : T.muted,
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Tabla ── */}
        <div className="tk-f3">
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 110px 110px', gap: 12, padding: '8px 18px', color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            <span>#</span>
            <span>Producto / Compra</span>
            <span>Tipo</span>
            <span>Estado</span>
            <span>Fecha</span>
            <span />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              [1,2,3,4,5].map(i => (
                <div key={i} className="tk-card-flat" style={{ height: 62, borderRadius: 14 }} />
              ))
            ) : tickets.length === 0 ? (
              <div className="tk-card-flat tk-fade" style={{ padding: '40px 24px', textAlign: 'center', color: T.muted }}>
                No hay tickets{status ? ' con este estado' : ''}.
              </div>
            ) : (
              tickets.map((ticket, i) => {
                const sb = statusBadge(ticket.status);
                const tb = typeBadge(ticket.type);
                return (
                  <div
                    key={ticket.id}
                    className={`tk-card tk-f${Math.min(i + 1, 5) as 1|2|3|4|5}`}
                    style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 110px 110px', gap: 12, padding: '14px 18px', alignItems: 'center' }}
                  >
                    <span style={{ color: T.muted, fontFamily: 'monospace', fontSize: 13 }}>
                      #{ticket.id}
                    </span>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.productName}
                      </div>
                      <div style={{ color: T.muted, fontSize: 12 }}>Ref: {ticket.purchaseReferenceId}</div>
                    </div>

                    <span className="tk-badge" style={{ color: tb.color, background: tb.bg, width: 'fit-content' }}>
                      {tb.label}
                    </span>

                    <span className="tk-badge" style={{ color: sb.color, background: sb.bg, width: 'fit-content' }}>
                      {sb.label}
                    </span>

                    <span style={{ color: T.muted, fontSize: 12 }}>{formatDate(ticket.createdAt)}</span>

                    <Link
                      href={`/admin/tickets/${ticket.id}`}
                      className="tk-btn tk-btn-ghost"
                      style={{ fontSize: 12, padding: '6px 14px', justifySelf: 'end' }}
                    >
                      Ver →
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Paginación ── */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            <button
              className="tk-btn tk-btn-ghost"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              style={{ padding: '7px 16px', fontSize: 13 }}
            >
              ← Anterior
            </button>
            <span style={{ color: T.muted, fontSize: 13 }}>
              Página {page + 1} de {totalPages}
            </span>
            <button
              className="tk-btn tk-btn-ghost"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{ padding: '7px 16px', fontSize: 13 }}
            >
              Siguiente →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}