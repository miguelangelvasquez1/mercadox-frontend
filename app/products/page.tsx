'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { productService } from '@/lib/services/productService';
import type { ProductCategory, ProductSummary } from '@/lib/types/product.types';
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

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const { addItem, totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const hasFilters = useMemo(
    () => Boolean(searchQuery.trim() || categoryId || maxPrice),
    [searchQuery, categoryId, maxPrice]
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const data = await productService.getCategories();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchProducts = async ({
    pageToLoad = page,
    search = searchQuery,
    category = categoryId,
    price = maxPrice,
  }: {
    pageToLoad?: number;
    search?: string;
    category?: string;
    price?: string;
  } = {}) => {
    try {
      setLoading(true);
      setError('');

      const response = search.trim() || category || price
        ? await productService.filterProducts({
            searchQuery: search.trim() || undefined,
            categoryId: category ? Number(category) : undefined,
            maxPrice: price ? Number(price) : undefined,
            page: pageToLoad,
            sortBy: 'createdAt',
            sortDirection: 'DESC',
          })
        : await productService.getProducts(pageToLoad);

      setProducts(response.content);
      setTotalPages(response.totalPages);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'No fue posible cargar los productos.');
      setProducts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCategories();
  }, []);

  useEffect(() => {
    void fetchProducts({ pageToLoad: page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleApplyFilters = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (page === 0) {
      await fetchProducts({ pageToLoad: 0 });
      return;
    }
    setPage(0);
  };

  const handleClearFilters = async () => {
    setSearchQuery('');
    setCategoryId('');
    setMaxPrice('');

    if (page === 0) {
      await fetchProducts({ pageToLoad: 0, search: '', category: '', price: '' });
      return;
    }
    setPage(0);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.fontBody }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <p style={{ color: T.accentSoft, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>MERCADOX STORE</p>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: '2.1rem', marginBottom: 8 }}>Explorar productos</h1>
            <p style={{ color: T.muted, fontSize: 14 }}>Busca, filtra y revisa el detalle de cada producto.</p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>
              Volver al inicio
            </Link>
            <Link href="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
              <span>Iniciar sesión</span>
            </Link>
            <Link href="/cart" className="btn-ghost" style={{ textDecoration: 'none' }}>
              Carrito ({totalItems})
            </Link>
            <Link href="/payment" className="btn-ghost" style={{ textDecoration: 'none' }}>
              Recargar
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleApplyFilters}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 18,
            padding: 18,
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr auto auto',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <input
            className="input-field"
            type="text"
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select className="input-field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">{categoriesLoading ? 'Cargando categorías...' : 'Todas las categorías'}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            className="input-field"
            type="number"
            min="0"
            placeholder="Precio máximo"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />

          <button className="btn-primary" type="submit">
            <span>Aplicar</span>
          </button>

          <button className="btn-ghost" type="button" onClick={handleClearFilters}>
            Limpiar
          </button>
        </form>

        {hasFilters && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
            {searchQuery && (
              <span style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 999, padding: '6px 12px', fontSize: 12, color: T.muted }}>
                Búsqueda: {searchQuery}
              </span>
            )}
            {categoryId && (
              <span style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 999, padding: '6px 12px', fontSize: 12, color: T.muted }}>
                Categoría: {categories.find((c) => String(c.id) === categoryId)?.name || categoryId}
              </span>
            )}
            {maxPrice && (
              <span style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 999, padding: '6px 12px', fontSize: 12, color: T.muted }}>
                Máximo: {formatCurrency(Number(maxPrice))}
              </span>
            )}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: 20,
              background: 'rgba(239,68,68,.08)',
              border: '1px solid rgba(239,68,68,.3)',
              borderRadius: 14,
              padding: '14px 16px',
              color: '#f87171',
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: T.muted }}>Cargando productos...</div>
        ) : products.length === 0 ? (
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 18,
              padding: '40px 24px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontFamily: T.fontDisplay, marginBottom: 10 }}>No hay productos para mostrar</h2>
            <p style={{ color: T.muted, marginBottom: 18 }}>Prueba con otros filtros o limpia la búsqueda actual.</p>
            <button className="btn-ghost" type="button" onClick={handleClearFilters}>
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
              {products.map((product) => (
                <article
                  key={product.id}
                  className="card"
                  style={{
                    padding: 18,
                    background: T.surface,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      aspectRatio: '8 / 10',
                      width: '100%',
                      borderRadius: 14,
                      background: T.surface2,
                      border: `1px solid ${T.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
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
                      <span style={{ color: T.muted, fontSize: 20 }}>Sin imagen</span>
                    )}
                  </div>

                  <div>
                    <div style={{ marginBottom: 6, fontFamily: T.fontDisplay, fontSize: 18 }}>{product.name}</div>
                    <div style={{ color: T.muted, fontSize: 13, marginBottom: 10 }}>{product.categoryName}</div>
                    <div style={{ fontFamily: T.fontDisplay, fontSize: 22, color: T.accent, marginBottom: 8 }}>
                      {formatCurrency(Number(product.price))}
                    </div>
                    <div style={{ color: product.stock > 0 ? T.green : '#f87171', fontSize: 13, fontWeight: 600 }}>
                      {product.stock > 0 ? `Stock disponible: ${product.stock}` : 'Sin stock'}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
                    <Link
                      href={`/products/${product.id}`}
                      className="btn-primary"
                      style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
                    >
                      <span>Ver detalle</span>
                    </Link>
                  </div>
                  <button
                    className="btn-ghost"
                    type="button"
                    onClick={() =>
                      addItem({
                        productId: product.id,
                        name: product.name,
                        imageUrl: product.imageUrl,
                        price: Number(product.price),
                        stock: product.stock,
                        categoryName: product.categoryName,
                        quantity: 1,
                      })
                    }
                  >
                    Agregar al carrito
                  </button>
                </article>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <button className="btn-ghost" type="button" disabled={page === 0} onClick={() => setPage((prev) => Math.max(prev - 1, 0))}>
                Anterior
              </button>

              <span style={{ color: T.muted, fontSize: 14 }}>
                Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
              </span>

              <button
                className="btn-ghost"
                type="button"
                disabled={totalPages === 0 || page + 1 >= totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}