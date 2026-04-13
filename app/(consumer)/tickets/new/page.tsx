'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { ticketService } from '@/lib/services/ticketservice';
import type { TicketType } from '@/lib/types/ticket.types';
import { T, SHARED_STYLES } from '@/lib/utils/tickethelpers';

function NewTicketForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill from query params if coming from purchase detail
  const [form, setForm] = useState({
    purchaseId:     searchParams.get('purchaseId') ?? '',
    purchaseItemId: searchParams.get('purchaseItemId') ?? '',
    type:           (searchParams.get('type') ?? 'REPLACEMENT') as TicketType,
    reason:         '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.purchaseId || !form.purchaseItemId || !form.reason.trim()) {
      setError('Completa todos los campos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const ticket = await ticketService.createTicket({
        purchaseId:     Number(form.purchaseId),
        purchaseItemId: Number(form.purchaseItemId),
        type:           form.type,
        reason:         form.reason,
      });
      router.push(`/tickets/${ticket.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Error al abrir el ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tk-page" style={{ padding: '32px 20px' }}>
      <style>{SHARED_STYLES}</style>

      <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* Back */}
        <Link href="/tickets/my" className="tk-btn tk-btn-ghost tk-f1" style={{ marginBottom: 24, display: 'inline-flex' }}>
          ← Mis tickets
        </Link>

        {/* Header */}
        <div className="tk-f2" style={{ marginBottom: 28 }}>
          <p style={{ color: T.accentSoft, fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>SOPORTE</p>
          <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-.02em', marginBottom: 8 }}>Abrir ticket</h1>
          <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>
            Describe tu problema y nuestro equipo lo revisará lo antes posible.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Purchase ID */}
          <div className="tk-f3">
            <label className="tk-label">ID de la compra</label>
            <input
              type="number"
              className="tk-input"
              placeholder="Ej: 123"
              value={form.purchaseId}
              onChange={(e) => setForm({ ...form, purchaseId: e.target.value })}
              required
              style={{ resize: 'none' }}
            />
          </div>

          {/* Purchase Item ID */}
          <div className="tk-f3">
            <label className="tk-label">ID del ítem</label>
            <input
              type="number"
              className="tk-input"
              placeholder="Ej: 456"
              value={form.purchaseItemId}
              onChange={(e) => setForm({ ...form, purchaseItemId: e.target.value })}
              required
              style={{ resize: 'none' }}
            />
            <p style={{ color: T.muted, fontSize: 12, marginTop: 6 }}>
              Puedes encontrar el ID del ítem en el historial de tus compras.
            </p>
          </div>

          {/* Type */}
          <div className="tk-f4">
            <label className="tk-label">¿Qué tipo de solución buscas?</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {([
                { value: 'REPLACEMENT', icon: '🔄', title: 'Reemplazo de código', sub: 'Quiero un nuevo código' },
                { value: 'REFUND',      icon: '💸', title: 'Reembolso',           sub: 'Quiero recuperar mi dinero' },
              ] as const).map(({ value, icon, title, sub }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, type: value })}
                  style={{
                    background: form.type === value ? 'rgba(255,107,43,.1)' : T.surface2,
                    border: `1.5px solid ${form.type === value ? T.accent : T.border}`,
                    borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
                    textAlign: 'left', transition: 'all .2s',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                  <div style={{ color: T.text, fontWeight: 600, fontSize: 14, marginBottom: 3 }}>{title}</div>
                  <div style={{ color: T.muted, fontSize: 12 }}>{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="tk-f4">
            <label className="tk-label">Descripción del problema</label>
            <textarea
              className="tk-input"
              rows={5}
              placeholder="Describe detalladamente el problema con el código recibido..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
            />
            <p style={{ color: T.muted, fontSize: 12, marginTop: 6 }}>
              Mientras más detalle incluyas, más rápido podremos ayudarte.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 12, padding: '12px 16px', color: T.red, fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <div className="tk-f5">
            <button type="submit" className="tk-btn tk-btn-primary" disabled={loading} style={{ width: '100%', padding: '13px 24px' }}>
              {loading ? <><div className="tk-spinner" /> Enviando...</> : 'Abrir ticket →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewTicketPage() {
  return <Suspense><NewTicketForm /></Suspense>;
}