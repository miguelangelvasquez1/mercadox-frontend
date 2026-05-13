'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ticketService } from '@/lib/services/ticketservice';
import type { TicketSummary, TicketStatus } from '@/lib/types/ticket.types';
import { T, SHARED_STYLES, statusBadge, typeBadge, formatDate } from '@/lib/utils/tickethelpers';

const STATUS_FILTERS: { label: string; value: TicketStatus | '' }[] = [
  { label: 'Todos', value: '' },
  { label: 'Abiertos', value: 'OPEN' },
  { label: 'En revisión', value: 'VALIDATING' },
  { label: 'Resueltos', value: 'RESOLVED' },
  { label: 'Rechazados', value: 'REJECTED' },
  { label: 'Inválidos', value: 'CLOSED_INVALID' },
];

const PAGE_SIZE = 15;

function TicketsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialStatus =
    (searchParams.get('status') as TicketStatus) || '';

  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] =
    useState<TicketStatus | ''>(initialStatus);

  useEffect(() => {
    setPage(0);
  }, [status]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const res = await ticketService.getAllTickets(
          page,
          PAGE_SIZE,
          status || undefined
        );

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

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* ── Header ── */}
        <div
          className="tk-f1"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <p
              style={{
                color: T.accentSoft,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '.06em',
              }}
            >
              ADMIN · POSTVENTA
            </p>

            <h1
              style={{
                fontFamily: T.fontDisplay,
                fontWeight: 800,
                fontSize: '2rem',
                letterSpacing: '-.02em',
                marginBottom: 4,
              }}
            >
              Tickets
            </h1>

            <p style={{ color: T.muted, fontSize: 14 }}>
              {loading
                ? '...'
                : `${total} ticket${total !== 1 ? 's' : ''} en total`}
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="tk-btn tk-btn-ghost"
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            ← Dashboard
          </Link>
        </div>

        {/* ── Filtros ── */}
        <div
          className="tk-f2"
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
        >
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

        {/* AQUÍ DEJAS TODO TU RESTO DE JSX IGUAL */}
      </div>
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={<div>Cargando tickets...</div>}>
      <TicketsContent />
    </Suspense>
  );
}