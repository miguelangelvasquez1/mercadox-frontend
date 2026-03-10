'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { paymentService } from '@/lib/services/paymentService';
import type { PaymentMethod, PaymentResponse } from '@/lib/types/payment.types';

// ─── Design tokens (same palette as ProductsPage) ───────────────────────────
const T = {
  bg: '#07080f',
  surface: '#0e101c',
  surface2: '#151825',
  border: 'rgba(255,255,255,0.06)',
  accent: '#ff6b2b',
  accentSoft: '#ff9d5c',
  text: '#eef0f8',
  muted: '#6b7291',
  green: '#22d87a',
  red: '#f87171',
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody: '"DM Sans", system-ui, sans-serif',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCOP = (v: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(v);

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));

const STATUS_LABEL: Record<string, string> = {
  APPROVED: 'Aprobado',
  DECLINED: 'Rechazado',
  PENDING: 'Pendiente',
  FAILED: 'Error',
};

const STATUS_COLOR: Record<string, string> = {
  APPROVED: '#22d87a',
  DECLINED: '#f87171',
  PENDING: '#facc15',
  FAILED: '#f87171',
};

const METHOD_LABEL: Record<string, string> = {
  CREDIT_CARD: 'Tarjeta crédito',
  DEBIT_CARD: 'Tarjeta débito',
  PSE: 'PSE',
};

const AMOUNTS = [10_000, 50_000, 100_000, 200_000, 500_000];

// ─── Component ───────────────────────────────────────────────────────────────
export default function PaymentPage() {
  const router = useRouter();
  // Form state
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState(''); // display only — last 4 sent
  const [expiry, setExpiry] = useState('');

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<PaymentResponse | null>(null);
  const [formError, setFormError] = useState('');

  // History
  const [history, setHistory] = useState<PaymentResponse[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);

  const isPSE = method === 'PSE';

  // ── Format card number input (groups of 4) ──
  const handleCardNumberChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // ── Format expiry MM/YY ──
  const handleExpiryChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) setExpiry(digits);
    else setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
  };

  // ── Fetch history ──
  const loadHistory = async (page = 0) => {
    try {
      setHistoryLoading(true);
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

  useEffect(() => {
    void loadHistory(0);
  }, []);

  // ── Submit ──
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

    try {
      setSubmitting(true);
      const res = await paymentService.pay({
        amount: amountNum,
        paymentMethod: method,
        cardLastFour: isPSE ? '0000' : cardNumber.replace(/\s/g, '').slice(-4),
        cardHolder: isPSE ? 'PSE' : cardHolder,
        expiryDate: isPSE ? '01/99' : expiry,
      });
      setResult(res);
      if (res.status === 'APPROVED') {

        // volver al home <--------
        alert('Pago aprobado! Gracias por usar nuestra plataforma.');
        router.push('/products');

        // setAmount('');
        // setCardNumber('');
        // setCardHolder('');
        // setExpiry('');
        // await loadHistory(0);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg || 'No fue posible procesar el pago. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        color: T.text,
        fontFamily: T.fontBody,
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div>
            <p style={{ color: T.accentSoft, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
              MERCADOX STORE
            </p>
            <h1
              style={{
                fontFamily: T.fontDisplay,
                fontSize: '2rem',
                marginBottom: 6,
              }}
            >
              Recargar saldo
            </h1>
            <p style={{ color: T.muted, fontSize: 14 }}>
              Agrega saldo a tu cuenta de forma rápida y segura.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/products" className="btn-ghost" style={{ textDecoration: 'none' }}>
              Ver productos
            </Link>
            <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>
              <span>Inicio</span>
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* ── Payment form ── */}
          <section>
            <form
              onSubmit={handleSubmit}
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 20,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.2rem', marginBottom: 0 }}>
                Datos del pago
              </h2>

              {/* Amount presets */}
              <div>
                <label style={{ fontSize: 13, color: T.muted, display: 'block', marginBottom: 8 }}>
                  Monto a recargar (COP)
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {AMOUNTS.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(String(a))}
                      style={{
                        background:
                          amount === String(a)
                            ? T.accent
                            : T.surface2,
                        border: `1px solid ${amount === String(a) ? T.accent : T.border}`,
                        borderRadius: 999,
                        padding: '5px 12px',
                        fontSize: 12,
                        color: amount === String(a) ? '#fff' : T.muted,
                        cursor: 'pointer',
                        transition: 'all .15s',
                      }}
                    >
                      {formatCOP(a)}
                    </button>
                  ))}
                </div>
                <input
                  className="input-field"
                  type="number"
                  min="1000"
                  placeholder="O ingresa otro monto"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              {/* Method */}
              <div>
                <label style={{ fontSize: 13, color: T.muted, display: 'block', marginBottom: 8 }}>
                  Método de pago
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(['CREDIT_CARD', 'DEBIT_CARD', 'PSE'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      style={{
                        flex: 1,
                        background: method === m ? T.accent : T.surface2,
                        border: `1px solid ${method === m ? T.accent : T.border}`,
                        borderRadius: 12,
                        padding: '10px 6px',
                        fontSize: 12,
                        color: method === m ? '#fff' : T.muted,
                        cursor: 'pointer',
                        fontFamily: T.fontBody,
                        transition: 'all .15s',
                      }}
                    >
                      {METHOD_LABEL[m]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card fields — hidden for PSE */}
              {!isPSE && (
                <>
                  <div>
                    <label
                      style={{ fontSize: 13, color: T.muted, display: 'block', marginBottom: 8 }}
                    >
                      Nombre del titular
                    </label>
                    <input
                      className="input-field"
                      type="text"
                      placeholder="Como aparece en la tarjeta"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label
                      style={{ fontSize: 13, color: T.muted, display: 'block', marginBottom: 8 }}
                    >
                      Número de tarjeta
                    </label>
                    <input
                      className="input-field"
                      type="text"
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      style={{ width: '100%', letterSpacing: '0.12em' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          color: T.muted,
                          display: 'block',
                          marginBottom: 8,
                        }}
                      >
                        Vencimiento
                      </label>
                      <input
                        className="input-field"
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => handleExpiryChange(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          color: T.muted,
                          display: 'block',
                          marginBottom: 8,
                        }}
                      >
                        CVV
                      </label>
                      <input
                        className="input-field"
                        type="password"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="•••"
                      />
                    </div>
                  </div>
                </>
              )}

              {isPSE && (
                <div
                  style={{
                    background: T.surface2,
                    border: `1px solid ${T.border}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    fontSize: 13,
                    color: T.muted,
                    lineHeight: 1.6,
                  }}
                >
                  Serás redirigido a tu banco para completar el pago.{' '}
                  <span style={{ color: T.accentSoft }}>
                    (Simulado — no se requieren datos adicionales)
                  </span>
                </div>
              )}

              {/* Disclaimer */}
              <p
                style={{
                  fontSize: 11,
                  color: T.muted,
                  background: T.surface2,
                  borderRadius: 10,
                  padding: '8px 12px',
                  lineHeight: 1.5,
                }}
              >
                🔒 Entorno de pruebas. Nunca ingreses datos reales. Montos múltiplos exactos de
                $100.000 serán rechazados para simular fallos.
              </p>

              {/* Error */}
              {formError && (
                <div
                  style={{
                    background: 'rgba(239,68,68,.08)',
                    border: '1px solid rgba(239,68,68,.3)',
                    borderRadius: 12,
                    padding: '12px 14px',
                    color: T.red,
                    fontSize: 13,
                  }}
                >
                  {formError}
                </div>
              )}

              {/* Result */}
              {result && (
                <div
                  style={{
                    background:
                      result.status === 'APPROVED'
                        ? 'rgba(34,216,122,.08)'
                        : 'rgba(239,68,68,.08)',
                    border: `1px solid ${
                      result.status === 'APPROVED'
                        ? 'rgba(34,216,122,.3)'
                        : 'rgba(239,68,68,.3)'
                    }`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  <div
                    style={{
                      fontFamily: T.fontDisplay,
                      fontSize: 15,
                      color: STATUS_COLOR[result.status],
                      marginBottom: 4,
                    }}
                  >
                    {result.status === 'APPROVED' ? '✅' : '❌'}{' '}
                    {STATUS_LABEL[result.status]}
                  </div>
                  {result.status === 'APPROVED' && (
                    <>
                      <div>
                        <span style={{ color: T.muted }}>Monto acreditado: </span>
                        <strong>{formatCOP(result.amount)}</strong>
                      </div>
                      <div>
                        <span style={{ color: T.muted }}>Referencia: </span>
                        <code style={{ fontSize: 11 }}>{result.gatewayReference}</code>
                      </div>
                    </>
                  )}
                  {result.status === 'DECLINED' && (
                    <div style={{ color: T.muted }}>
                      El pago fue rechazado. Prueba con otro monto o método.
                    </div>
                  )}
                </div>
              )}

              <button
                className="btn-primary"
                type="submit"
                disabled={submitting}
                style={{ width: '100%', opacity: submitting ? 0.6 : 1 }}
              >
                <span>{submitting ? 'Procesando...' : `Pagar ${amount ? formatCOP(Number(amount)) : ''}`}</span>
              </button>
            </form>
          </section>

          {/* ── Transaction history ── */}
          <section>
            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 20,
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontFamily: T.fontDisplay,
                  fontSize: '1.2rem',
                  marginBottom: 18,
                }}
              >
                Historial de transacciones
              </h2>

              {historyLoading ? (
                <p style={{ color: T.muted, textAlign: 'center', padding: '30px 0' }}>
                  Cargando...
                </p>
              ) : history.length === 0 ? (
                <p style={{ color: T.muted, textAlign: 'center', padding: '30px 0' }}>
                  Aún no tienes transacciones.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {history.map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        background: T.surface2,
                        border: `1px solid ${T.border}`,
                        borderRadius: 14,
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: T.fontDisplay,
                            fontSize: 15,
                            marginBottom: 3,
                          }}
                        >
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
                      <span
                        style={{
                          background: `${STATUS_COLOR[tx.status]}18`,
                          color: STATUS_COLOR[tx.status],
                          borderRadius: 999,
                          padding: '4px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {STATUS_LABEL[tx.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* History pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 10,
                    marginTop: 16,
                  }}
                >
                  <button
                    className="btn-ghost"
                    type="button"
                    disabled={historyPage === 0}
                    onClick={() => loadHistory(historyPage - 1)}
                  >
                    Anterior
                  </button>
                  <span style={{ color: T.muted, fontSize: 13, alignSelf: 'center' }}>
                    {historyPage + 1} / {totalPages}
                  </span>
                  <button
                    className="btn-ghost"
                    type="button"
                    disabled={historyPage + 1 >= totalPages}
                    onClick={() => loadHistory(historyPage + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}