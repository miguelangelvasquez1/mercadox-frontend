'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cart/CartContext';
import { authService } from '@/lib/services/authService';
import { purchaseService } from '@/lib/services/purchaseService';

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
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody:    '"DM Sans", system-ui, sans-serif',
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .cart-btn-primary {
    width: 100%; padding: 14px 20px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #ff6b2b, #ff9d5c);
    color: #fff; font-size: 15px; font-weight: 700;
    font-family: ${T.fontDisplay}; cursor: pointer;
    transition: all .25s; position: relative; overflow: hidden;
    box-shadow: 0 0 24px rgba(255,107,43,.25);
  }
  .cart-btn-primary:hover:not(:disabled) {
    box-shadow: 0 8px 32px rgba(255,107,43,.45);
    transform: translateY(-1px);
  }
  .cart-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

  .cart-btn-ghost {
    padding: 10px 18px; border-radius: 11px;
    border: 1px solid ${T.border}; background: transparent;
    color: ${T.muted}; font-size: 13px; font-weight: 500;
    font-family: ${T.fontBody}; cursor: pointer;
    transition: all .2s; text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .cart-btn-ghost:hover {
    border-color: rgba(255,107,43,.35);
    color: ${T.text};
    background: rgba(255,107,43,.05);
  }

  .cart-btn-danger {
    padding: 8px 14px; border-radius: 9px;
    border: 1px solid rgba(239,68,68,.2); background: transparent;
    color: #f87171; font-size: 12px; font-weight: 500;
    font-family: ${T.fontBody}; cursor: pointer; transition: all .2s;
  }
  .cart-btn-danger:hover { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.4); }

  .cart-qty-btn {
    width: 30px; height: 30px; border-radius: 8px;
    border: 1px solid ${T.border}; background: ${T.surface2};
    color: ${T.text}; font-size: 16px; font-weight: 600;
    cursor: pointer; transition: all .2s;
    display: flex; align-items: center; justify-content: center;
    font-family: ${T.fontBody};
  }
  .cart-qty-btn:hover { border-color: rgba(255,107,43,.4); background: rgba(255,107,43,.08); color: ${T.accentSoft}; }

  .cart-item {
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 18px; padding: 18px;
    display: grid; grid-template-columns: 96px 1fr auto;
    gap: 16px; align-items: center;
    transition: border-color .2s;
  }
  .cart-item:hover { border-color: rgba(255,107,43,.2); }

  /* ── Success overlay ── */
  .cart-success-overlay {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(7,8,15,.92);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 20px;
    backdrop-filter: blur(12px);
    animation: fadeIn .35s ease;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

  .cart-success-icon {
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(34,216,122,.12);
    border: 2px solid rgba(34,216,122,.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 38px;
    animation: popIn .4s cubic-bezier(.34,1.56,.64,1) .1s both;
  }
  @keyframes popIn {
    from { transform: scale(0); opacity: 0 }
    to   { transform: scale(1); opacity: 1 }
  }

  .cart-success-bar {
    width: 260px; height: 4px; border-radius: 99px;
    background: ${T.surface2}; overflow: hidden;
  }
  .cart-success-bar-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, #22d87a, #4ade80);
    animation: fillBar 5s linear forwards;
  }
  @keyframes fillBar { from { width: 0% } to { width: 100% } }
`;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(value);
}

export default function CartPage() {
  const router = useRouter();
  const { items, totalItems, totalPrice, removeItem, increaseQuantity, decreaseQuantity, clearCart } = useCart();

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);
  const [countdown, setCountdown]   = useState(5);

  // ── Cuenta regresiva y redirección tras compra exitosa ──
  useEffect(() => {
    if (!success) return;
    const interval = setInterval(() => {
      setCountdown(n => {
        if (n <= 1) {
          clearInterval(interval);
          router.push('/products');
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [success, router]);

  const handleCheckout = async () => {
    setError('');
    if (items.length === 0) { setError('Tu carrito está vacío.'); return; }
    if (!authService.isAuthenticated()) { router.push('/login'); return; }
    const role = typeof window !== 'undefined' ? localStorage.getItem('mercadox_role') : null;
    if (role !== 'CONSUMER') { setError('Solo los usuarios CONSUMER pueden realizar compras.'); return; }

    try {
      setLoading(true);
      await purchaseService.buy({
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });
      clearCart();
      setSuccess(true); // 👈 activa el overlay de éxito
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'No fue posible procesar la compra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Overlay de éxito ── */}
      {success && (
        <div className="cart-success-overlay">
          <div className="cart-success-icon">✓</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 26, color: T.text, marginBottom: 8 }}>
              ¡Compra realizada exitosamente!
            </div>
            <div style={{ color: T.muted, fontSize: 14 }}>
              Redirigiendo a productos en <span style={{ color: T.green, fontWeight: 700 }}>{countdown}s</span>…
            </div>
          </div>
          <div className="cart-success-bar">
            <div className="cart-success-bar-fill" />
          </div>
          <button
            className="cart-btn-ghost"
            onClick={() => router.push('/products')}
          >
            Ir ahora →
          </button>
        </div>
      )}

      <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.fontBody }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px 80px' }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ color: T.accentSoft, fontSize: 12, fontWeight: 700, marginBottom: 10, letterSpacing: '0.08em' }}>
              CARRITO
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: T.fontDisplay, fontSize: '2rem', marginBottom: 6 }}>
                  Tu carrito de compra
                </h1>
                <p style={{ color: T.muted, fontSize: 14 }}>
                  Revisa cantidades y finaliza tu compra.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link href="/products" className="cart-btn-ghost">
                  ← Seguir comprando
                </Link>
                {items.length > 0 && (
                  <button className="cart-btn-ghost" type="button" onClick={clearCart}>
                    🗑 Vaciar carrito
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Carrito vacío */}
          {items.length === 0 ? (
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 20,
              padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, marginBottom: 10 }}>
                Tu carrito está vacío
              </h2>
              <p style={{ color: T.muted, marginBottom: 24, fontSize: 14 }}>
                Agrega productos desde la tienda para comenzar.
              </p>
              <Link href="/products" className="cart-btn-ghost">
                Ver productos
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

              {/* Lista de items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {items.map((item) => (
                  <div key={item.productId} className="cart-item">

                    {/* Imagen */}
                    <div style={{ aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden',
                      background: T.surface2, border: `1px solid ${T.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                    </div>

                    {/* Info */}
                    <div>
                      <div style={{ fontFamily: T.fontDisplay, fontSize: 17, marginBottom: 4 }}>
                        {item.name}
                      </div>
                      <div style={{ color: T.muted, fontSize: 12, marginBottom: 10 }}>
                        {item.categoryName}
                      </div>
                      <div style={{ color: T.accent, fontFamily: T.fontDisplay, fontSize: 20 }}>
                        {formatCurrency(item.price)}
                      </div>
                    </div>

                    {/* Controles */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
                      {/* Qty */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
                        background: T.surface2, border: `1px solid ${T.border}`,
                        borderRadius: 10, padding: '4px 10px' }}>
                        <button className="cart-qty-btn" type="button"
                          onClick={() => decreaseQuantity(item.productId)}>−</button>
                        <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 600, fontSize: 15 }}>
                          {item.quantity}
                        </span>
                        <button className="cart-qty-btn" type="button"
                          onClick={() => increaseQuantity(item.productId)}>+</button>
                      </div>

                      {/* Subtotal */}
                      <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 700 }}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>

                      {/* Eliminar */}
                      <button className="cart-btn-danger" type="button"
                        onClick={() => removeItem(item.productId)}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen */}
              <div style={{ background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 20, padding: 22, position: 'sticky', top: 80 }}>

                <h2 style={{ fontFamily: T.fontDisplay, fontSize: 20, marginBottom: 20 }}>
                  Resumen del pedido
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: T.muted, fontSize: 14 }}>Productos</span>
                    <span style={{ fontWeight: 600 }}>{totalItems}</span>
                  </div>
                  <div style={{ height: 1, background: T.border }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: T.muted, fontSize: 14 }}>Total</span>
                    <span style={{ fontFamily: T.fontDisplay, fontSize: 22, color: T.accent }}>
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>

                <button className="cart-btn-primary" type="button"
                  onClick={handleCheckout} disabled={loading}>
                  {loading ? 'Procesando...' : '✦ Finalizar compra'}
                </button>

                {/* Error */}
                {error && (
                  <div style={{ marginTop: 14, borderRadius: 12, padding: '12px 14px',
                    background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)',
                    color: '#f87171', fontSize: 13 }}>
                    {error}
                  </div>
                )}

                {/* Info extra */}
                <div style={{ marginTop: 18, padding: '12px 14px', borderRadius: 12,
                  background: T.surface2, border: `1px solid ${T.border}` }}>
                  <div style={{ color: T.muted, fontSize: 12, lineHeight: 1.6 }}>
                    🔒 Pago seguro · Tu saldo será descontado automáticamente al confirmar.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}