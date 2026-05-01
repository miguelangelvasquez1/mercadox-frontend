'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ticketService } from '@/lib/services/ticketservice';
import type { TicketSummary } from '@/lib/types/ticket.types';
import { T, SHARED_STYLES, statusBadge, typeBadge, formatDate } from '@/lib/utils/tickethelpers';

interface KPI {
  label: string;
  value: number;
  icon: string;
  color: string;
  bg: string;
  filterValue: string;
}

export default function PostSaleDashboard() {
  const [tickets, setTickets]   = useState<TicketSummary[]>([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ticketService.getAllTickets(0, 8);
        setTickets(res.content);
        setTotal(res.totalElements);
      } catch {
        // silencioso — el dashboard no debe romper por esto
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  // Calcular KPIs desde los tickets cargados
  const counts = tickets.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const KPIS: KPI[] = [
    {
      label:       'Total tickets',
      value:       total,
      icon:        '🎫',
      color:       T.text,
      bg:          'rgba(255,255,255,.05)',
      filterValue: '',
    },
    {
      label:       'Abiertos',
      value:       counts['OPEN'] ?? 0,
      icon:        '📬',
      color:       '#60a5fa',
      bg:          'rgba(96,165,250,.1)',
      filterValue: 'OPEN',
    },
    {
      label:       'En revisión',
      value:       counts['VALIDATING'] ?? 0,
      icon:        '🔍',
      color:       '#fbbf24',
      bg:          'rgba(251,191,36,.1)',
      filterValue: 'VALIDATING',
    },
    {
      label:       'Resueltos',
      value:       counts['RESOLVED'] ?? 0,
      icon:        '✅',
      color:       T.green,
      bg:          'rgba(34,216,122,.1)',
      filterValue: 'RESOLVED',
    },
    {
      label:       'Rechazados',
      value:       counts['REJECTED'] ?? 0,
      icon:        '✗',
      color:       '#f87171',
      bg:          'rgba(248,113,113,.1)',
      filterValue: 'REJECTED',
    },
    {
      label:       'Inválidos',
      value:       counts['CLOSED_INVALID'] ?? 0,
      icon:        '⊘',
      color:       T.muted,
      bg:          'rgba(107,114,145,.1)',
      filterValue: 'CLOSED_INVALID',
    },
  ];

const QUICK_ACTIONS = [
  { href: '/tickets?status=OPEN',      icon: '📬', label: 'Ver tickets abiertos',   color: '#60a5fa' },
  { href: '/tickets?status=VALIDATING',icon: '🔍', label: 'En revisión',             color: '#fbbf24' },
  { href: '/chat',                     icon: '💬', label: 'Chat con usuarios',       color: '#ff6b2b' },
  { href: '/tickets',                  icon: '🎫', label: 'Todos los tickets',       color: T.accentSoft },
  { href: '/products',                       icon: '📦', label: 'Gestionar productos',     color: T.green   },
];

  return (
    <div className="tk-page" style={{ padding: '32px 20px' }}>
      <style>{SHARED_STYLES}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── Header ── */}
        <div className="tk-f1">
          <p style={{ color: T.accentSoft, fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
            ADMIN · POSTVENTA
          </p>
          <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '2rem', letterSpacing: '-.02em', marginBottom: 6 }}>
            Dashboard
          </h1>
          <p style={{ color: T.muted, fontSize: 14 }}>
            Resumen del estado actual del sistema de soporte.
          </p>
        </div>

        {/* ── KPIs ── */}
        <div className="tk-f2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {KPIS.map(({ label, value, icon, color, bg, filterValue }) => (
            <Link
              key={label}
              href={filterValue ? `/tickets?status=${filterValue}` : '/tickets'}
              style={{ textDecoration: 'none' }}
            >
              <div
                className="tk-card"
                style={{ padding: '18px 20px', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {icon}
                  </div>
                  <span style={{ color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    {loading ? '...' : '→'}
                  </span>
                </div>
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '2rem', color, lineHeight: 1, marginBottom: 5 }}>
                  {loading ? '—' : value}
                </div>
                <div style={{ color: T.muted, fontSize: 13 }}>{label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Quick actions ── */}
        <div className="tk-f3">
          <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1.1rem', marginBottom: 14, color: T.text }}>
            Accesos rápidos
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {QUICK_ACTIONS.map(({ href, icon, label, color }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                <div
                  className="tk-card"
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <span style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>{label}</span>
                  <span style={{ color: T.muted, marginLeft: 'auto' }}>›</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Tickets recientes ── */}
        <div className="tk-f4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1.1rem', color: T.text }}>
              Tickets recientes
            </h2>
            <Link href="/tickets" className="tk-btn tk-btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }}>
              Ver todos →
            </Link>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 110px 110px 130px', gap: 12, padding: '8px 18px', color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            <span>#</span>
            <span>Producto / Compra</span>
            <span>Tipo</span>
            <span>Estado</span>
            <span>Fecha</span>
            <span />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="tk-card-flat" style={{ height: 60, borderRadius: 14 }} />
              ))
            ) : tickets.length === 0 ? (
              <div className="tk-card-flat tk-fade" style={{ padding: '32px 24px', textAlign: 'center', color: T.muted }}>
                No hay tickets aún.
              </div>
            ) : (
              tickets.map((ticket, i) => {
                const sb = statusBadge(ticket.status);
                const tb = typeBadge(ticket.type);
                return (
                  <div
                    key={ticket.id}
                    className={`tk-card tk-f${Math.min(i + 1, 5) as 1|2|3|4|5}`}
                    style={{ display: 'grid', gridTemplateColumns: '60px 1fr 120px 110px 110px 130px', gap: 12, padding: '13px 18px', alignItems: 'center' }}
                  >
                    <span style={{ color: T.muted, fontFamily: 'monospace', fontSize: 13 }}>#{ticket.id}</span>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.productName}
                      </div>
                      <div style={{ color: T.muted, fontSize: 12 }}>Ref: {ticket.purchaseReferenceId}</div>
                    </div>

                    <span className="tk-badge" style={{ color: tb.color, background: tb.bg, width: 'fit-content' }}>{tb.label}</span>
                    <span className="tk-badge" style={{ color: sb.color, background: sb.bg, width: 'fit-content' }}>{sb.label}</span>

                    <span style={{ color: T.muted, fontSize: 12 }}>{formatDate(ticket.createdAt)}</span>

                    <Link
                      href={`/tickets/${ticket.id}`}
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

      </div>
    </div>
  );
}