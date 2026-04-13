'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { productService } from '@/lib/services/productService';
import type { ProductCategory, ProductSummary } from '@/lib/types/product.types';

const T = {
  bg: '#07080f',
  surface: '#0e101c',
  surface2: '#151825',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,107,43,0.35)',
  accent: '#ff6b2b',
  accentSoft: '#ff9d5c',
  green: '#22d87a',
  text: '#eef0f8',
  muted: '#6b7291',
  faint: 'rgba(238,240,248,0.04)',
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody: '"DM Sans", system-ui, sans-serif',
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes mx-up {
    from { opacity: 0; transform: translateY(26px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes mx-float {
    0%,100% { transform: translateY(0); }
    50%     { transform: translateY(-10px); }
  }

  .mx-f1 { animation: mx-up .55s .00s ease both; }
  .mx-f2 { animation: mx-up .55s .10s ease both; }
  .mx-f3 { animation: mx-up .55s .18s ease both; }
  .mx-f4 { animation: mx-up .55s .26s ease both; }

  .mx-float { animation: mx-float 6s ease-in-out infinite; }

  .mx-grad {
    background: linear-gradient(120deg,#ff6b2b 0%,#ff9d5c 45%,#ffc17a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .mx-nav-link {
    color: ${T.muted};
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    transition: color .2s;
  }
  .mx-nav-link:hover {
    color: ${T.text};
  }

  .mx-stat-card {
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: 18px;
    padding: 18px;
    transition: border-color .25s, transform .25s, box-shadow .25s;
  }
  .mx-stat-card:hover {
    border-color: ${T.borderHover};
    transform: translateY(-2px);
    box-shadow: 0 20px 50px rgba(0,0,0,.35);
  }

  .mx-cat-card {
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: 18px;
    padding: 18px;
    text-decoration: none;
    transition: border-color .25s, transform .25s, box-shadow .25s;
    display: block;
  }
  .mx-cat-card:hover {
    border-color: ${T.borderHover};
    transform: translateY(-3px);
    box-shadow: 0 20px 50px rgba(0,0,0,.35);
  }

  .mx-product-card {
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: 20px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    transition: border-color .25s, transform .25s, box-shadow .25s;
  }
  .mx-product-card:hover {
    border-color: ${T.borderHover};
    transform: translateY(-3px);
    box-shadow: 0 20px 50px rgba(0,0,0,.35);
  }

  .mx-empty {
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: 18px;
    padding: 24px;
    text-align: center;
    color: ${T.muted};
  }

  .mx-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,.03), rgba(255,255,255,.08), rgba(255,255,255,.03));
    background-size: 200% 100%;
    animation: mx-shimmer 1.2s infinite linear;
  }

  @keyframes mx-shimmer {
    from { background-position: 200% 0; }
    to   { background-position: -200% 0; }
  }

  .mx-grid-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  .mx-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .mx-grid-6 {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 14px;
  }

  @media (max-width: 1100px) {
    .mx-grid-6 { grid-template-columns: repeat(3, 1fr); }
    .mx-grid-4 { grid-template-columns: repeat(2, 1fr); }
    .mx-grid-3 { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 720px) {
    .mx-hide-mobile { display: none !important; }
    .mx-grid-6,
    .mx-grid-4,
    .mx-grid-3 { grid-template-columns: 1fr; }
  }
`;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function getInitials(text: string) {
  return text
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export default function HomePage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductSummary[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLandingData = async () => {
      try {
        setLoading(true);
        setError('');

        const [categoriesResponse, productsResponse] = await Promise.all([
          productService.getCategories(),
          productService.getProducts(0),
        ]);

        setCategories(categoriesResponse);
        setFeaturedProducts(productsResponse.content.slice(0, 6));
        setTotalProducts(productsResponse.totalElements);
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(msg || 'No fue posible cargar la información principal.');
      } finally {
        setLoading(false);
      }
    };

    void loadLandingData();
  }, []);

  const stats = useMemo(() => {
    const withStock = featuredProducts.filter((product) => product.stock > 0).length;
    const highestPrice = featuredProducts.length > 0
      ? Math.max(...featuredProducts.map((product) => Number(product.price)))
      : 0;

    return [
      {
        label: 'Productos cargados',
        value: totalProducts > 0 ? String(totalProducts) : '0',
      },
      {
        label: 'Categorías activas',
        value: String(categories.length),
      },
      {
        label: 'Destacados con stock',
        value: String(withStock),
      },
      {
        label: 'Precio más alto visible',
        value: highestPrice > 0 ? formatCurrency(highestPrice) : '$0',
      },
    ];
  }, [categories.length, featuredProducts, totalProducts]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: T.bg,
        color: T.text,
        fontFamily: T.fontBody,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{STYLES}</style>

      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '82px 20px 72px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -150,
            width: 620,
            height: 620,
            borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(255,107,43,.12) 0%,transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -220,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(79,140,255,.08) 0%,transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>

            <h1
              className="mx-f2"
              style={{
                fontFamily: T.fontDisplay,
                fontWeight: 800,
                fontSize: 'clamp(2.3rem, 7vw, 4.3rem)',
                lineHeight: 1.05,
                letterSpacing: '-.03em',
                marginBottom: 18,
              }}
            >
              Tu marketplace digital,
              <br />
            </h1>

            <p
              className="mx-f3"
              style={{
                color: T.muted,
                fontSize: 16,
                lineHeight: 1.8,
                maxWidth: 620,
                margin: '0 auto 30px',
              }}
            >            
            </p>

            <div
              className="mx-f4"
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 36,
              }}
            >
              <Link href="/products" className="btn-primary" style={{ textDecoration: 'none' }}>
                <span>Ver catálogo</span>
              </Link>
              <Link href="/login" className="btn-ghost" style={{ textDecoration: 'none' }}>
                Iniciar sesión
              </Link>
            </div>
          </div>

          <div className="mx-grid-4" style={{ marginTop: 22 }}>
            {stats.map((item) => (
              <div key={item.label} className="mx-stat-card">
                <div style={{ color: T.muted, fontSize: 13, marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontFamily: T.fontDisplay, fontSize: '1.9rem', lineHeight: 1.1 }}>
                  {loading ? '...' : item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="categorias" style={{ padding: '0 20px 70px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 26 }}>
            <p style={{ color: T.accentSoft, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>CATEGORÍAS</p>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '2rem', marginBottom: 10 }}>
              Explora por categoría
            </h2>
          
          </div>

          {error ? (
            <div
              style={{
                background: 'rgba(239,68,68,.08)',
                border: '1px solid rgba(239,68,68,.3)',
                borderRadius: 16,
                padding: '16px 18px',
                color: '#f87171',
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="mx-grid-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 18,
                    padding: 18,
                  }}
                >
                  <div className="mx-skeleton" style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 14 }} />
                  <div className="mx-skeleton" style={{ width: '80%', height: 16, borderRadius: 8, marginBottom: 10 }} />
                  <div className="mx-skeleton" style={{ width: '55%', height: 12, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="mx-empty">No hay categorías disponibles en este momento.</div>
          ) : (
            <div className="mx-grid-6">
              {categories.map((category) => (
                <Link key={category.id} href="/products" className="mx-cat-card">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: 'rgba(255,107,43,.1)',
                      border: '1px solid rgba(255,107,43,.18)',
                      color: T.accentSoft,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: T.fontDisplay,
                      fontWeight: 800,
                      marginBottom: 14,
                    }}
                  >
                    {getInitials(category.name)}
                  </div>

                  <div
                    style={{
                      color: T.text,
                      fontFamily: T.fontDisplay,
                      fontWeight: 700,
                      fontSize: 14,
                      lineHeight: 1.35,
                      marginBottom: 8,
                    }}
                  >
                    {category.name}
                  </div>

                  <div style={{ color: T.muted, fontSize: 12 }}>
                    Disponible en catálogo
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="destacados" style={{ padding: '0 20px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
              alignItems: 'end',
              flexWrap: 'wrap',
              marginBottom: 26,
            }}
          >
            <div>
              <p style={{ color: T.accentSoft, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>DESTACADOS</p>
              <h2 style={{ fontFamily: T.fontDisplay, fontSize: '2rem', marginBottom: 10 }}>
                Productos visibles en la primera página
              </h2>
        
            </div>

            <Link href="/products" className="btn-ghost" style={{ textDecoration: 'none' }}>
              Ver todos
            </Link>
          </div>

          {loading ? (
            <div className="mx-grid-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 20,
                    padding: 18,
                  }}
                >
                  <div className="mx-skeleton" style={{ height: 180, borderRadius: 14, marginBottom: 14 }} />
                  <div className="mx-skeleton" style={{ height: 18, width: '70%', borderRadius: 8, marginBottom: 10 }} />
                  <div className="mx-skeleton" style={{ height: 12, width: '45%', borderRadius: 8, marginBottom: 14 }} />
                  <div className="mx-skeleton" style={{ height: 18, width: '35%', borderRadius: 8 }} />
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="mx-empty">No hay productos para mostrar en la landing.</div>
          ) : (
            <div className="mx-grid-3">
              {featuredProducts.map((product) => (
                <article key={product.id} className="mx-product-card">
                  <div
                  className="mx-float"
                  style={{
                    aspectRatio: '16 / 10',
                    width: '100%',
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: T.surface2,
                    border: `1px solid ${T.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 12,
                  }}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: 20,
                        background: T.faint,
                        color: T.muted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: T.fontDisplay,
                        fontWeight: 800,
                        fontSize: 22,
                      }}
                    >
                      {getInitials(product.name)}
                    </div>
                  )}
                </div>

                  <div>
                    <div
                      style={{
                        color: T.text,
                        fontFamily: T.fontDisplay,
                        fontWeight: 700,
                        fontSize: 18,
                        lineHeight: 1.3,
                        marginBottom: 6,
                      }}
                    >
                      {product.name}
                    </div>

                    <div style={{ color: T.muted, fontSize: 13, marginBottom: 12 }}>
                      {product.categoryName}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: T.fontDisplay,
                            fontWeight: 800,
                            fontSize: 22,
                            color: T.accent,
                            lineHeight: 1.1,
                          }}
                        >
                          {formatCurrency(Number(product.price))}
                        </div>
                        <div
                          style={{
                            color: product.stock > 0 ? T.green : '#f87171',
                            fontSize: 12,
                            fontWeight: 700,
                            marginTop: 6,
                          }}
                        >
                          {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
                        </div>
                      </div>

                      <Link
                        href={`/products/${product.id}`}
                        className="btn-primary"
                        style={{ textDecoration: 'none' }}
                      >
                        <span>Ver detalle</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '0 20px 80px' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 24,
            padding: '28px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 18,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p style={{ color: T.accentSoft, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SIGUIENTE PASO</p>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: '1.8rem', marginBottom: 8 }}>
              Entra al catálogo completo
            </h2>
            <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.7 }}>
              Desde productos podrás filtrar, paginar y entrar al detalle de cada artículo conectado al backend.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/products" className="btn-primary" style={{ textDecoration: 'none' }}>
              <span>Ir a productos</span>
            </Link>
            <Link href="/login" className="btn-ghost" style={{ textDecoration: 'none' }}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}