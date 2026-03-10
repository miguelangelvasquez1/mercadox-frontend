'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { authService } from '@/lib/services/authService';
import { productService } from '@/lib/services/productService';
import { purchaseService } from '@/lib/services/purchaseService';
import type { ProductDetail } from '@/lib/types/product.types';
import { useCart } from '@/lib/cart/CartContext';

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
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody: '"DM Sans", system-ui, sans-serif',
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = useMemo(() => Number(params?.productId), [params]);
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);

    const handleAddToCart = () => {
  if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      price: Number(product.price),
      stock: product.stock,
      categoryName: product.categoryName,
      quantity: 1,
    });

    setActionMessage('Producto agregado al carrito.');
  };

  useEffect(() => {
    const loadProduct = async () => {
      if (!Number.isFinite(productId)) {
        setError('El identificador del producto no es válido.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await productService.getProductDetail(productId);
        setProduct(data);
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg || 'No fue posible cargar el detalle del producto.');
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [productId]);

  const handleBuyNow = async () => {
    if (!product) return;

    setActionMessage('');

    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    const role = typeof window !== 'undefined' ? localStorage.getItem('mercadox_role') : null;

    if (role !== 'CONSUMER') {
      setActionMessage('Solo los usuarios con rol CONSUMER pueden realizar compras.');
      return;
    }

    try {
      setBuying(true);
      const response = await purchaseService.buy({
        items: [{ productId: product.id, quantity: 1 }],
      });

      setActionMessage(response.message || 'Compra creada correctamente.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setActionMessage(msg || 'No fue posible crear la compra.');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.fontBody }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 60px' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
          <Link href="/products" className="btn-ghost" style={{ textDecoration: 'none' }}>
            Volver a productos
          </Link>
          <Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>
            Inicio
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '100px 0', textAlign: 'center', color: T.muted }}>Cargando detalle...</div>
        ) : error ? (
          <div
            style={{
              background: 'rgba(239,68,68,.08)',
              border: '1px solid rgba(239,68,68,.3)',
              borderRadius: 14,
              padding: '16px 18px',
              color: '#f87171',
            }}
          >
            {error}
          </div>
        ) : !product ? (
          <div style={{ color: T.muted }}>No se encontró el producto.</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              gap: 24,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div
              style={{
                minHeight: 420,
                borderRadius: 18,
                background: T.surface2,
                border: `1px solid ${T.border}`,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: T.muted }}>Sin imagen</span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <p style={{ color: T.accentSoft, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>{product.categoryName}</p>
                <h1 style={{ fontFamily: T.fontDisplay, fontSize: '2.2rem', lineHeight: 1.08, marginBottom: 10 }}>{product.name}</h1>
                <p style={{ color: T.muted, lineHeight: 1.7 }}>{product.description}</p>
              </div>

              <div
                style={{
                  background: T.surface2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  padding: 18,
                  display: 'grid',
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ color: T.muted, fontSize: 13, marginBottom: 6 }}>Precio</div>
                  <div style={{ fontFamily: T.fontDisplay, fontSize: '2rem', color: T.accent }}>{formatCurrency(Number(product.price))}</div>
                </div>

                <div>
                  <div style={{ color: T.muted, fontSize: 13, marginBottom: 6 }}>Disponibilidad</div>
                  <div style={{ color: product.stock > 0 ? T.green : '#f87171', fontWeight: 700 }}>
                    {product.stock > 0 ? `${product.stock} unidades disponibles` : 'Sin stock'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="btn-primary"
                  type="button"
                  onClick={handleBuyNow}
                  disabled={buying || product.stock <= 0}
                >
                  <span>{buying ? 'Procesando...' : 'Comprar ahora'}</span>
                </button>

                <Link href="/login" className="btn-ghost" style={{ textDecoration: 'none' }}>
                  Iniciar sesión
                </Link>
                <button
                className="btn-ghost"
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                Agregar al carrito
              </button>
              </div>

              {actionMessage && (
                <div
                  style={{
                    background: actionMessage.toLowerCase().includes('correct') || actionMessage.toLowerCase().includes('creada')
                      ? 'rgba(34,216,122,.08)'
                      : 'rgba(239,68,68,.08)',
                    border: actionMessage.toLowerCase().includes('correct') || actionMessage.toLowerCase().includes('creada')
                      ? '1px solid rgba(34,216,122,.25)'
                      : '1px solid rgba(239,68,68,.3)',
                    borderRadius: 14,
                    padding: '14px 16px',
                    color: actionMessage.toLowerCase().includes('correct') || actionMessage.toLowerCase().includes('creada')
                      ? T.green
                      : '#f87171',
                    fontSize: 14,
                  }}
                >
                  {actionMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}