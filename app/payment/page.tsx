'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { paymentService } from '@/lib/services/paymentService';
import type { PaymentMethod, PaymentResponse } from '@/lib/types/payment.types';

const T = {
  bg:          '#07080f',
  surface:     '#0e101c',
  surface2:    '#151825',
  border:      'rgba(255,255,255,0.06)',
  accent:      '#ff6b2b',
  accentSoft:  '#ff9d5c',
  text:        '#eef0f8',
  muted:       '#6b7291',
  green:       '#22d87a',
  red:         '#f87171',
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody:    '"DM Sans", system-ui, sans-serif',
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes pm-up   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pm-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes pm-fade { from { opacity:0; } to { opacity:1; } }

  .pm-f1 { animation:pm-up .5s .00s ease both; }
  .pm-f2 { animation:pm-up .5s .08s ease both; }
  .pm-f3 { animation:pm-up .5s .16s ease both; }
  .pm-fade { animation:pm-fade .35s ease both; }

  .pm-page { background:${T.bg}; color:${T.text}; font-family:${T.fontBody}; min-height:100vh; -webkit-font-smoothing:antialiased; }

  .pm-card {
    background:${T.surface}; border:1px solid ${T.border};
    border-radius:20px; padding:24px;
  }

  .pm-input {
    width:100%; background:${T.surface2}; border:1.5px solid ${T.border};
    border-radius:12px; padding:12px 16px; color:${T.text};
    font-family:${T.fontBody}; font-size:15px; outline:none;
    transition:border-color .2s, box-shadow .2s; box-sizing:border-box;
  }
  .pm-input::placeholder { color:${T.muted}; }
  .pm-input:focus { border-color:rgba(255,107,43,.5); box-shadow:0 0 0 3px rgba(255,107,43,.1); }

  .pm-label { font-size:12px; font-weight:700; color:${T.muted}; display:block; margin-bottom:8px; text-transform:uppercase; letter-spacing:.04em; }

  .pm-btn-primary {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    width:100%; font-family:${T.fontDisplay}; font-weight:700; font-size:15px;
    padding:14px 24px; border-radius:13px; border:none; cursor:pointer; color:#fff;
    background:linear-gradient(135deg,#ff6b2b,#ff9d5c);
    transition:box-shadow .25s,transform .2s,opacity .2s;
  }
  .pm-btn-primary:not(:disabled):hover { box-shadow:0 10px 36px rgba(255,107,43,.4); transform:translateY(-1px); }
  .pm-btn-primary:disabled { opacity:.55; cursor:not-allowed; }

  .pm-btn-ghost {
    display:inline-flex; align-items:center; justify-content:center;
    font-family:${T.fontBody}; font-weight:500; font-size:13px;
    padding:8px 16px; border-radius:10px; border:1px solid ${T.border};
    color:${T.muted}; background:transparent; cursor:pointer; transition:all .2s;
    text-decoration:none;
  }
  .pm-btn-ghost:hover { border-color:rgba(255,107,43,.3); color:${T.text}; background:rgba(255,107,43,.05); }

  .pm-spinner {
    width:17px; height:17px; border:2.5px solid rgba(255,255,255,.25);
    border-top-color:#fff; border-radius:50%; animation:pm-spin .7s linear infinite;
  }

  .pm-preset {
    padding:6px 14px; border-radius:99px; font-size:12px; font-weight:600;
    cursor:pointer; transition:all .15s; border:1px solid ${T.border};
    background:${T.surface2}; color:${T.muted}; white-space:nowrap;
  }
  .pm-preset.active { background:${T.accent}; border-color:${T.accent}; color:#fff; }
  .pm-preset:hover:not(.active) { border-color:rgba(255,107,43,.3); color:${T.text}; }

  .pm-method {
    flex:1; padding:10px 8px; border-radius:12px; font-size:13px; font-weight:600;
    cursor:pointer; transition:all .15s; border:1.5px solid ${T.border};
    background:${T.surface2}; color:${T.muted}; font-family:${T.fontBody};
  }
  .pm-method.active { background:rgba(255,107,43,.12); border-color:${T.accent}; color:${T.accentSoft}; }
  .pm-method:hover:not(.active) { border-color:rgba(255,107,43,.25); color:${T.text}; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${T.bg}; }
  ::-webkit-scrollbar-thumb { background:#252840; border-radius:99px; }
`;

const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

const STATUS_LABEL: Record<string, string> = {
  APPROVED: 'Aprobado',
  DECLINED:  'Rechazado',
  PENDING:   'Pendiente',
  FAILED:    'Error',
};

const STATUS_COLOR: Record<string, string> = {
  APPROVED: '#22d87a',
  DECLINED:  '#f87171',
  PENDING:   '#facc15',
  FAILED:    '#f87171',
};

const METHOD_LABEL: Record<string, string> = {
  CREDIT_CARD: 'Tarjeta crédito',
  DEBIT_CARD:  'Tarjeta débito',
  PSE:         'PSE',
};

const AMOUNTS = [10_000, 50_000, 100_000, 200_000, 500_000];

export default function PaymentPage() {
  // Form
  const [amount, setAmount]         = useState('');
  const [method, setMethod]         = useState<PaymentMethod>('CREDIT_CARD');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry]         = useState('');

  // UI
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState<PaymentResponse | null>(null);
  const [formError, setFormError]   = useState('');

  // History
  const [history, setHistory]           = useState<PaymentResponse[]>([]);
  const [historyPage, setHistoryPage]   = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);

  const isPSE = method === 'PSE';

  const handleCardNumberChange = (raw: string) => {
    const digits    = raw.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) setExpiry(digits);
    else setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
  };

  const loadHistory = async (page = 0) => {
    setHistoryLoading(true);
    try {
      const data = await paymentService.getHistory(page, 6);
      setHistory(data.content);
      setTotalPages(data.totalPages);
      setHistoryPage(data.number);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { void loadHistory(0); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setResult(null);

    const amountNum = Number(amount.replace(/\D/g, ''));
    if (!amountNum || amountNum < 1000) {
      setFormError('El monto mínimo es $1.000 COP.');
      return;
    }
    if (!isPSE && cardNumber.replace(/\s/g, '').length < 16) {
      setFormError('Ingresa un número de tarjeta válido (16 dígitos).');
      return;
    }
    if (!isPSE && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setFormError('Fecha de vencimiento inválida (MM/YY).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await paymentService.pay({
        amount:        amountNum,
        paymentMethod: method,
        cardLastFour:  isPSE ? '0000' : cardNumber.replace(/\s/g, '').slice(-4),
        cardHolder:    isPSE ? 'PSE'  : cardHolder,
        expiryDate:    isPSE ? '01/99' : expiry,
      });

      setResult(res);

      if (res.status === 'COMPLETED') {
        setAmount('');
        setCardNumber('');
        setCardHolder('');
        setExpiry('');
        await loadHistory(0);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg || 'No fue posible procesar el pago. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pm-page">
      <style>{STYLES}</style>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Header */}
        <div className="pm-f1" style={{ marginBottom: 28 }}>
          <p style={{ color: T.accentSoft, fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>MI CUENTA</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.9rem', letterSpacing: '-.02em' }}>
              Recargar saldo
            </h1>
            <Link href="/products" className="pm-btn-ghost">← Ver productos</Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, alignItems: 'start' }}>

          {/* ── Formulario ── */}
          <div className="pm-f2">
            <form onSubmit={handleSubmit} className="pm-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1.1rem' }}>Datos del pago</h2>

              {/* Monto */}
              <div>
                <label className="pm-label">Monto a recargar (COP)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {AMOUNTS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      className={`pm-preset${amount === String(a) ? ' active' : ''}`}
                      onClick={() => setAmount(String(a))}
                    >
                      {formatCOP(a)}
                    </button>
                  ))}
                </div>
                <input
                  className="pm-input"
                  type="number"
                  min="1000"
                  placeholder="O ingresa otro monto"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Método */}
              <div>
                <label className="pm-label">Método de pago</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['CREDIT_CARD', 'DEBIT_CARD', 'PSE'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`pm-method${method === m ? ' active' : ''}`}
                      onClick={() => setMethod(m)}
                    >
                      {METHOD_LABEL[m]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos tarjeta */}
              {!isPSE && (
                <>
                  <div>
                    <label className="pm-label">Nombre del titular</label>
                    <input className="pm-input" type="text" placeholder="Como aparece en la tarjeta"
                      value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} />
                  </div>

                  <div>
                    <label className="pm-label">Número de tarjeta</label>
                    <input className="pm-input" type="text" inputMode="numeric"
                      placeholder="0000 0000 0000 0000" value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      style={{ letterSpacing: '0.1em' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label className="pm-label">Vencimiento</label>
                      <input className="pm-input" type="text" inputMode="numeric"
                        placeholder="MM/YY" value={expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)} />
                    </div>
                    <div>
                      <label className="pm-label">CVV</label>
                      <input className="pm-input" type="password" inputMode="numeric"
                        maxLength={4} placeholder="•••" />
                    </div>
                  </div>
                </>
              )}

              {isPSE && (
                <div style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', fontSize: 13, color: T.muted, lineHeight: 1.6 }}>
                  Serás redirigido a tu banco para completar el pago.{' '}
                  <span style={{ color: T.accentSoft }}>(Simulado)</span>
                </div>
              )}

              {/* Error */}
              {formError && (
                <div className="pm-fade" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, padding: '12px 16px', color: T.red, fontSize: 13 }}>
                  ⚠️ {formError}
                </div>
              )}

              {/* Resultado */}
              {result && (
                <div
                  className="pm-fade"
                  style={{
                    background: result.status === 'COMPLETED' ? 'rgba(34,216,122,.08)' : 'rgba(239,68,68,.08)',
                    border:     `1px solid ${result.status === 'COMPLETED' ? 'rgba(34,216,122,.3)' : 'rgba(239,68,68,.3)'}`,
                    borderRadius: 13, padding: '16px 18px',
                  }}
                >
                  <div style={{ fontFamily: T.fontDisplay, fontSize: 15, color: STATUS_COLOR[result.status], marginBottom: 8, fontWeight: 700 }}>
                    {result.status === 'COMPLETED' ? '✅' : '❌'} {STATUS_LABEL[result.status]}
                  </div>
                  {result.status === 'COMPLETED' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 13 }}>
                      <div><span style={{ color: T.muted }}>Monto acreditado: </span><strong>{formatCOP(result.amount)}</strong></div>
                      <div><span style={{ color: T.muted }}>Referencia: </span><code style={{ fontSize: 11, background: T.surface2, padding: '2px 6px', borderRadius: 5 }}>{result.gatewayReference}</code></div>
                    </div>
                  )}
                  {result.status !== 'COMPLETED' && (
                    <div style={{ color: T.muted, fontSize: 13 }}>
                      El pago fue rechazado. Prueba con otro monto o método.
                    </div>
                  )}
                </div>
              )}

              {/* Submit */}
              <button className="pm-btn-primary" type="submit" disabled={submitting}>
                {submitting
                  ? <><div className="pm-spinner" /><span>Procesando...</span></>
                  : `Pagar ${amount ? formatCOP(Number(amount)) : ''}`
                }
              </button>
            </form>
          </div>

          {/* ── Historial ── */}
          <div className="pm-f3">
            <div className="pm-card">
              <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1.1rem', marginBottom: 18 }}>
                Historial de recargas
              </h2>

              {historyLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
                  <div className="pm-spinner" style={{ borderTopColor: T.accent }} />
                </div>
              ) : history.length === 0 ? (
                <div style={{ color: T.muted, textAlign: 'center', padding: '30px 0', fontSize: 14 }}>
                  Aún no tienes recargas.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {history.map((tx) => (
                    <div
                      key={tx.id}
                      style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}
                    >
                      <div>
                        <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700, marginBottom: 3 }}>
                          {formatCOP(tx.amount)}
                        </div>
                        <div style={{ fontSize: 12, color: T.muted }}>
                          {METHOD_LABEL[tx.paymentMethod]}
                          {tx.cardLastFour !== '0000' && ` •••• ${tx.cardLastFour}`}
                        </div>
                        <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                          {formatDate(tx.createdAt)}
                        </div>
                      </div>
                      <span style={{ background: `${STATUS_COLOR[tx.status]}18`, color: STATUS_COLOR[tx.status], borderRadius: 99, padding: '4px 12px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {STATUS_LABEL[tx.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 16 }}>
                  <button className="pm-btn-ghost" type="button" disabled={historyPage === 0} onClick={() => loadHistory(historyPage - 1)}>← Anterior</button>
                  <span style={{ color: T.muted, fontSize: 13, alignSelf: 'center' }}>{historyPage + 1} / {totalPages}</span>
                  <button className="pm-btn-ghost" type="button" disabled={historyPage + 1 >= totalPages} onClick={() => loadHistory(historyPage + 1)}>Siguiente →</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}