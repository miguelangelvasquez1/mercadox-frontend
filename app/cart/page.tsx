'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/lib/cart/CartContext';
import { authService } from '@/lib/services/authService';
import { purchaseService } from '@/lib/services/purchaseService';

const T = {
  bg: '#07080f',
  surface: '#0e101c',
  surface2: '#151825',
  border: 'rgba(255,255,255,0.06)',
  accent: '#ff6b2b',
  text: '#eef0f8',
  muted: '#6b7291',
  green: '#22d87a',
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody: '"DM Sans", system-ui, sans-serif',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    totalItems,
    totalPrice,
    removeItem,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCheckout = async () => {
    setMessage('');

    if (items.length === 0) {
      setMessage('Tu carrito está vacío.');
      return;
    }

    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const role = typeof window !== 'undefined' ? localStorage.getItem('mercadox_role') : null;
    if (role !== 'CONSUMER') {
      setMessage('Solo los usuarios CONSUMER pueden realizar compras.');
      return;
    }

    try {
      setLoading(true);

      const response = await purchaseService.buy({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      clearCart();
      setMessage(response.message || 'Compra realizada correctamente.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setMessage(msg || 'No fue posible procesar la compra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.fontBody }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <p style={{ color: T.accent, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>CARRITO</p>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: '2rem', marginBottom: 8 }}>Tu carrito de compra</h1>
            <p style={{ color: T.muted }}>Revisa cantidades y finaliza tu compra.</p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/products" className="btn-ghost" style={{ textDecoration: 'none' }}>
              Seguir comprando
            </Link>
            <button className="btn-ghost" type="button" onClick={clearCart}>
              Vaciar carrito
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 18,
              padding: 24,
              textAlign: 'center',
              color: T.muted,
            }}
          >
            Tu carrito está vacío.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr .7fr', gap: 20 }}>
            <div style={{ display: 'grid', gap: 14 }}>
              {items.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 18,
                    padding: 16,
                    display: 'grid',
                    gridTemplateColumns: '110px 1fr auto',
                    gap: 14,
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '1 / 1',
                      borderRadius: 14,
                      overflow: 'hidden',
                      background: T.surface2,
                      border: `1px solid ${T.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 10,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    />
                  </div>

                  <div>
                    <div style={{ fontFamily: T.fontDisplay, fontSize: 18, marginBottom: 6 }}>{item.name}</div>
                    <div style={{ color: T.muted, fontSize: 13, marginBottom: 8 }}>{item.categoryName}</div>
                    <div style={{ color: T.accent, fontFamily: T.fontDisplay, fontSize: 22 }}>
                      {formatCurrency(item.price)}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 10, justifyItems: 'end' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button className="btn-ghost" type="button" onClick={() => decreaseQuantity(item.productId)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button className="btn-ghost" type="button" onClick={() => increaseQuantity(item.productId)}>
                        +
                      </button>
                    </div>

                    <div style={{ fontWeight: 700 }}>
                      {formatCurrency(item.price * item.quantity)}
                    </div>

                    <button className="btn-ghost" type="button" onClick={() => removeItem(item.productId)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                background: T.surface,
                border: `1px solid ${T.border}`,
                borderRadius: 18,
                padding: 18,
                height: 'fit-content',
              }}
            >
              <h2 style={{ fontFamily: T.fontDisplay, marginBottom: 16 }}>Resumen</h2>

              <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: T.muted }}>Productos</span>
                  <span>{totalItems}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: T.muted }}>Total</span>
                  <span style={{ fontFamily: T.fontDisplay, fontSize: 24, color: T.accent }}>
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <button className="btn-primary" type="button" onClick={handleCheckout} disabled={loading}>
                <span>{loading ? 'Procesando...' : 'Finalizar compra'}</span>
              </button>

              {message && (
                <div
                  style={{
                    marginTop: 14,
                    borderRadius: 12,
                    padding: '12px 14px',
                    background: message.toLowerCase().includes('correct') || message.toLowerCase().includes('realizada')
                      ? 'rgba(34,216,122,.08)'
                      : 'rgba(239,68,68,.08)',
                    border: message.toLowerCase().includes('correct') || message.toLowerCase().includes('realizada')
                      ? '1px solid rgba(34,216,122,.25)'
                      : '1px solid rgba(239,68,68,.3)',
                    color: message.toLowerCase().includes('correct') || message.toLowerCase().includes('realizada')
                      ? T.green
                      : '#f87171',
                    fontSize: 14,
                  }}
                >
                  {message}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}