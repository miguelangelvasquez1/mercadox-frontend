import type { TicketStatus, TicketType, TicketResolution } from '@/lib/types/ticket.types';

export const T = {
  bg:          '#07080f',
  surface:     '#0e101c',
  surface2:    '#151825',
  border:      'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,107,43,0.3)',
  accent:      '#ff6b2b',
  accentSoft:  '#ff9d5c',
  green:       '#22d87a',
  red:         '#f87171',
  yellow:      '#fbbf24',
  blue:        '#60a5fa',
  text:        '#eef0f8',
  muted:       '#6b7291',
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody:    '"DM Sans", system-ui, sans-serif',
};

export const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes tk-up   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes tk-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes tk-fade { from { opacity:0; } to { opacity:1; } }

  .tk-f1 { animation:tk-up .5s .00s ease both; }
  .tk-f2 { animation:tk-up .5s .08s ease both; }
  .tk-f3 { animation:tk-up .5s .16s ease both; }
  .tk-f4 { animation:tk-up .5s .24s ease both; }
  .tk-f5 { animation:tk-up .5s .32s ease both; }
  .tk-fade { animation:tk-fade .3s ease both; }

  .tk-page {
    background:${T.bg}; color:${T.text};
    font-family:${T.fontBody}; min-height:100vh;
    -webkit-font-smoothing:antialiased;
  }

  .tk-card {
    background:${T.surface}; border:1px solid ${T.border};
    border-radius:18px; transition:border-color .2s, box-shadow .2s;
  }
  .tk-card:hover { border-color:${T.borderHover}; }
  .tk-card-flat { background:${T.surface}; border:1px solid ${T.border}; border-radius:18px; }

  .tk-input {
    width:100%; background:${T.surface2}; border:1.5px solid ${T.border};
    border-radius:12px; padding:12px 16px; color:${T.text};
    font-family:${T.fontBody}; font-size:14px; outline:none;
    transition:border-color .2s, box-shadow .2s; box-sizing:border-box;
    resize:vertical;
  }
  .tk-input::placeholder { color:${T.muted}; }
  .tk-input:focus { border-color:rgba(255,107,43,.5); box-shadow:0 0 0 3px rgba(255,107,43,.1); }

  .tk-label { font-size:12px; font-weight:600; color:${T.muted}; display:block; margin-bottom:6px; text-transform:uppercase; letter-spacing:.04em; }

  .tk-btn {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    font-family:${T.fontBody}; font-weight:600; font-size:14px;
    padding:10px 20px; border-radius:11px; border:none; cursor:pointer;
    transition:all .2s; text-decoration:none;
  }
  .tk-btn:disabled { opacity:.5; cursor:not-allowed; }

  .tk-btn-primary {
    background:linear-gradient(135deg,#ff6b2b,#ff9d5c); color:#fff;
  }
  .tk-btn-primary:not(:disabled):hover { box-shadow:0 8px 28px rgba(255,107,43,.4); transform:translateY(-1px); }

  .tk-btn-ghost {
    background:transparent; color:${T.muted};
    border:1px solid ${T.border};
  }
  .tk-btn-ghost:not(:disabled):hover { border-color:${T.borderHover}; color:${T.text}; background:rgba(255,107,43,.05); }

  .tk-btn-danger {
    background:rgba(239,68,68,.12); color:#f87171;
    border:1px solid rgba(239,68,68,.25);
  }
  .tk-btn-danger:not(:disabled):hover { background:rgba(239,68,68,.2); }

  .tk-btn-success {
    background:rgba(34,216,122,.12); color:#22d87a;
    border:1px solid rgba(34,216,122,.25);
  }
  .tk-btn-success:not(:disabled):hover { background:rgba(34,216,122,.2); }

  .tk-spinner {
    width:16px; height:16px; border:2px solid rgba(255,255,255,.2);
    border-top-color:#fff; border-radius:50%; animation:tk-spin .7s linear infinite;
  }

  .tk-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700;
    text-transform:uppercase; letter-spacing:.04em;
  }

  .tk-select {
    background:${T.surface2}; border:1.5px solid ${T.border};
    border-radius:11px; padding:10px 14px; color:${T.text};
    font-family:${T.fontBody}; font-size:14px; outline:none;
    cursor:pointer; transition:border-color .2s;
  }
  .tk-select:focus { border-color:rgba(255,107,43,.5); }
  .tk-select option { background:${T.surface2}; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${T.bg}; }
  ::-webkit-scrollbar-thumb { background:#252840; border-radius:99px; }
`;

// ── Badge helpers ──────────────────────────────────────────────────────────────

export function statusBadge(status: TicketStatus) {
  const map: Record<TicketStatus, { label: string; color: string; bg: string }> = {
    OPEN:          { label: 'Abierto',    color: '#60a5fa', bg: 'rgba(96,165,250,.12)'  },
    VALIDATING:    { label: 'Revisando',  color: '#fbbf24', bg: 'rgba(251,191,36,.12)'  },
    RESOLVED:      { label: 'Resuelto',   color: '#22d87a', bg: 'rgba(34,216,122,.12)'  },
    REJECTED:      { label: 'Rechazado',  color: '#f87171', bg: 'rgba(248,113,113,.12)' },
    CLOSED_INVALID:{ label: 'Inválido',   color: '#6b7291', bg: 'rgba(107,114,145,.12)' },
  };
  return map[status] ?? { label: status, color: '#6b7291', bg: 'rgba(107,114,145,.12)' };
}

export function typeBadge(type: TicketType) {
  return type === 'REPLACEMENT'
    ? { label: 'Reemplazo', color: '#ff9d5c', bg: 'rgba(255,157,92,.12)'  }
    : { label: 'Reembolso', color: '#a78bfa', bg: 'rgba(167,139,250,.12)' };
}

export function resolutionLabel(resolution: TicketResolution | null): string {
  if (!resolution) return '—';
  const map: Record<TicketResolution, string> = {
    REPLACEMENT_SENT:  'Código reemplazado',
    REFUND_PROCESSED:  'Reembolso procesado',
    REJECTED:          'Solicitud rechazada',
    CLOSED_INVALID:    'Cerrado como inválido',
  };
  return map[resolution];
}

export function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(value);
}