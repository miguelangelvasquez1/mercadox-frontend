'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { productService } from '@/lib/services/productService';
import type {
  ProductSummary,
  ProductDetail,
  ProductCategory,
  CreateProductRequestDTO,
  CreateProductStockRequestDTO,
  BulkStockResponseDTO,
} from '@/lib/types/product.types';
import { T, SHARED_STYLES, formatCurrency } from '@/lib/utils/tickethelpers';

type Panel = 'create' | 'detail' | 'addStock' | null;

export default function ProductsPage() {
  const [products, setProducts]         = useState<ProductSummary[]>([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(0);
  const [totalPages, setTotalPages]     = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [listError, setListError]       = useState('');

  const [searchQuery, setSearchQuery]   = useState('');
  const [filterCatId, setFilterCatId]   = useState<number | undefined>();
  const [categories, setCategories]     = useState<ProductCategory[]>([]);

  const [panel, setPanel]               = useState<Panel>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [working, setWorking]           = useState(false);
  const [panelError, setPanelError]     = useState('');
  const [panelSuccess, setPanelSuccess] = useState('');

  // Create form
  const [cName, setCName]               = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cPrice, setCPrice]             = useState('');
  const [cCatId, setCCatId]             = useState('');
  const [cImage, setCImage]             = useState<File | null>(null);
  const [stockItems, setStockItems]     = useState<CreateProductStockRequestDTO[]>([{ code: '', expirationDate: null }]);
  const imageRef                        = useRef<HTMLInputElement>(null);

  // Bulk stock form
  const [bulkItems, setBulkItems]       = useState<CreateProductStockRequestDTO[]>([{ code: '', expirationDate: null }]);
  const [bulkResult, setBulkResult]     = useState<BulkStockResponseDTO | null>(null);

  useEffect(() => {
    void productService.getCategories().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    void loadProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery, filterCatId]);

  const loadProducts = async () => {
    setLoading(true);
    setListError('');
    try {
      const res =
        searchQuery || filterCatId
          ? await productService.filterProducts({ searchQuery, categoryId: filterCatId, page })
          : await productService.getProducts(page);
      setProducts(res.content);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements);
    } catch {
      setListError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (productId: number) => {
    setPanelError('');
    setPanelSuccess('');
    setBulkResult(null);
    setPanel('detail');
    setDetailLoading(true);
    try {
      setSelectedProduct(await productService.getProductDetail(productId));
    } catch {
      setPanelError('No se pudo cargar el producto.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closePanel = () => {
    setPanel(null);
    setSelectedProduct(null);
    setPanelError('');
    setPanelSuccess('');
    setBulkResult(null);
  };

  // ── Create ──────────────────────────────────────────────────────────────────

  const resetCreate = () => {
    setCName(''); setCDescription(''); setCPrice(''); setCCatId(''); setCImage(null);
    setStockItems([{ code: '', expirationDate: null }]);
    if (imageRef.current) imageRef.current.value = '';
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!cImage) { setPanelError('Debes subir una imagen.'); return; }
    const valid = stockItems
      .filter(s => s.code.trim())
      .map(s => ({ ...s, expirationDate: s.expirationDate || null }));
    if (valid.length === 0) { setPanelError('Agrega al menos un código de stock.'); return; }
    setWorking(true);
    setPanelError('');
    try {
      const payload: CreateProductRequestDTO = {
        name: cName,
        description: cDescription,
        price: parseFloat(cPrice),
        productCategoryId: Number(cCatId),
        stockItems: valid,
      };
      await productService.createProduct(payload, cImage);
      setPanelSuccess('Producto creado con éxito.');
      resetCreate();
      void loadProducts();
      setTimeout(() => { setPanelSuccess(''); closePanel(); }, 1600);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPanelError(msg ?? 'Error al crear el producto.');
    } finally {
      setWorking(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!selectedProduct) return;
    if (!confirm(`¿Eliminar "${selectedProduct.name}"? Esta acción no se puede deshacer.`)) return;
    setWorking(true);
    setPanelError('');
    try {
      await productService.deleteProduct(selectedProduct.id);
      closePanel();
      void loadProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPanelError(msg ?? 'Error al eliminar el producto.');
    } finally {
      setWorking(false);
    }
  };

  // ── Bulk stock ──────────────────────────────────────────────────────────────

  const handleBulkStock = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const valid = bulkItems
      .filter(s => s.code.trim())
      .map(s => ({ ...s, expirationDate: s.expirationDate || null }));
    if (valid.length === 0) { setPanelError('Agrega al menos un código.'); return; }
    setWorking(true);
    setPanelError('');
    try {
      const result = await productService.addBulkStockItems(selectedProduct.id, valid);
      setBulkResult(result);
      setBulkItems([{ code: '', expirationDate: null }]);
      const updated = await productService.getProductDetail(selectedProduct.id);
      setSelectedProduct(updated);
      void loadProducts();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPanelError(msg ?? 'Error al agregar stock.');
    } finally {
      setWorking(false);
    }
  };

  // ── Stock row helpers ───────────────────────────────────────────────────────

  const updateRow = (
    items: CreateProductStockRequestDTO[],
    set: (v: CreateProductStockRequestDTO[]) => void,
    idx: number,
    field: keyof CreateProductStockRequestDTO,
    val: string,
  ) => { const n = [...items]; n[idx] = { ...n[idx], [field]: val }; set(n); };

  const addRow = (items: CreateProductStockRequestDTO[], set: (v: CreateProductStockRequestDTO[]) => void) =>
    set([...items, { code: '', expirationDate: null }]);

  const removeRow = (items: CreateProductStockRequestDTO[], set: (v: CreateProductStockRequestDTO[]) => void, idx: number) => {
    if (items.length === 1) return;
    set(items.filter((_, i) => i !== idx));
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="tk-page" style={{ padding: '32px 20px' }}>
      <style>{SHARED_STYLES}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div className="tk-f1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ color: T.accentSoft, fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              ADMIN · INVENTARIO
            </p>
            <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '2rem', letterSpacing: '-.02em', marginBottom: 6 }}>
              Gestión de productos
            </h1>
            <p style={{ color: T.muted, fontSize: 14 }}>
              {loading ? '...' : `${totalElements} producto${totalElements !== 1 ? 's' : ''} en total`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/admin/dashboard" className="tk-btn tk-btn-ghost" style={{ fontSize: 13 }}>
              ← Dashboard
            </Link>
            <button
              className="tk-btn tk-btn-primary"
              onClick={() => { closePanel(); setPanel('create'); }}
            >
              + Nuevo producto
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="tk-f2" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            className="tk-input"
            style={{ flex: 1, minWidth: 200, resize: 'none' }}
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
          />
          <select
            className="tk-select"
            value={filterCatId ?? ''}
            onChange={e => { setFilterCatId(e.target.value ? Number(e.target.value) : undefined); setPage(0); }}
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: panel ? '1fr 380px' : '1fr', gap: 20, alignItems: 'start' }}>

          {/* Product list */}
          <div className="tk-f3">
            <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr 130px 110px 72px 40px', gap: 12, padding: '8px 18px', color: T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              <span>Img</span><span>Nombre</span><span>Categoría</span><span>Precio</span><span>Stock</span><span />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <div key={i} className="tk-card-flat" style={{ height: 72, borderRadius: 14 }} />
                ))
              ) : listError ? (
                <div className="tk-card-flat" style={{ padding: 24, textAlign: 'center', color: T.red }}>{listError}</div>
              ) : products.length === 0 ? (
                <div className="tk-card-flat" style={{ padding: '40px 24px', textAlign: 'center', color: T.muted }}>
                  No hay productos.
                </div>
              ) : (
                products.map((p, i) => (
                  <div
                    key={p.id}
                    className={`tk-card tk-f${Math.min(i + 1, 5) as 1|2|3|4|5}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '56px 1fr 130px 110px 72px 40px',
                      gap: 12,
                      padding: '12px 18px',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderColor: selectedProduct?.id === p.id ? 'rgba(255,107,43,.45)' : undefined,
                    }}
                    onClick={() => openDetail(p.id)}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: T.surface2, flexShrink: 0 }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📦</div>
                      }
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    </div>

                    <span style={{ color: T.muted, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.categoryName}</span>

                    <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(p.price)}</span>

                    <span style={{ fontSize: 13, fontWeight: 700, color: p.stock === 0 ? T.red : p.stock < 5 ? T.yellow : T.green }}>
                      {p.stock}
                    </span>

                    <span style={{ color: T.muted, fontSize: 18, textAlign: 'center' }}>›</span>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16, alignItems: 'center' }}>
                <button className="tk-btn tk-btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  ← Anterior
                </button>
                <span style={{ color: T.muted, fontSize: 13 }}>{page + 1} / {totalPages}</span>
                <button className="tk-btn tk-btn-ghost" style={{ padding: '7px 14px', fontSize: 13 }} disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  Siguiente →
                </button>
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          {panel && (
            <div className="tk-fade" style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 24 }}>

              {/* Create panel */}
              {panel === 'create' && (
                <div className="tk-card-flat" style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1.05rem' }}>Nuevo producto</h2>
                    <button className="tk-btn tk-btn-ghost" style={{ padding: '5px 11px', fontSize: 13 }} onClick={closePanel}>✕</button>
                  </div>

                  {panelError   && <AlertBox color="red"   msg={panelError} />}
                  {panelSuccess && <AlertBox color="green" msg={panelSuccess} />}

                  <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Field label="Nombre">
                      <input className="tk-input" style={{ resize: 'none' }} required value={cName} onChange={e => setCName(e.target.value)} placeholder="Ej: Minecraft Java Edition" />
                    </Field>
                    <Field label="Descripción">
                      <textarea className="tk-input" rows={3} required value={cDescription} onChange={e => setCDescription(e.target.value)} placeholder="Descripción del producto..." />
                    </Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Precio (COP)">
                        <input className="tk-input" style={{ resize: 'none' }} type="number" min="0" step="0.01" required value={cPrice} onChange={e => setCPrice(e.target.value)} placeholder="0" />
                      </Field>
                      <Field label="Categoría">
                        <select className="tk-select" style={{ width: '100%' }} required value={cCatId} onChange={e => setCCatId(e.target.value)}>
                          <option value="">Seleccionar...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </Field>
                    </div>
                    <Field label="Imagen">
                      <input ref={imageRef} type="file" accept="image/*" required onChange={e => setCImage(e.target.files?.[0] ?? null)} style={{ color: T.text, fontSize: 13 }} />
                      {cImage && <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>{cImage.name}</div>}
                    </Field>

                    <StockRowsField label="Códigos de stock" items={stockItems} setItems={setStockItems} addRow={addRow} removeRow={removeRow} updateRow={updateRow} />

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <button type="button" className="tk-btn tk-btn-ghost" style={{ flex: 1 }} onClick={closePanel}>Cancelar</button>
                      <button type="submit" className="tk-btn tk-btn-primary" style={{ flex: 1 }} disabled={working}>
                        {working ? <div className="tk-spinner" /> : 'Crear producto'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Detail / Add stock panels */}
              {(panel === 'detail' || panel === 'addStock') && (
                <>
                  <div className="tk-card-flat" style={{ padding: '22px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1.05rem' }}>Detalle del producto</h2>
                      <button className="tk-btn tk-btn-ghost" style={{ padding: '5px 11px', fontSize: 13 }} onClick={closePanel}>✕</button>
                    </div>

                    {panelError && <AlertBox color="red" msg={panelError} />}

                    {detailLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 0' }}>
                        <div className="tk-spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                      </div>
                    ) : selectedProduct ? (
                      <>
                        {selectedProduct.imageUrl && (
                          <div style={{ width: '100%', height: 160, borderRadius: 12, overflow: 'hidden', marginBottom: 16, background: T.surface2 }}>
                            <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}

                        <h3 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{selectedProduct.name}</h3>
                        <p style={{ color: T.muted, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>{selectedProduct.description}</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
                          <InfoChip label="Precio"    value={formatCurrency(selectedProduct.price)} />
                          <InfoChip label="Categoría" value={selectedProduct.categoryName} />
                          <InfoChip
                            label="Stock"
                            value={String(selectedProduct.stock)}
                            valueColor={selectedProduct.stock === 0 ? T.red : selectedProduct.stock < 5 ? T.yellow : T.green}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <button
                            className="tk-btn tk-btn-success"
                            style={{ width: '100%' }}
                            onClick={() => { setPanel('addStock'); setPanelError(''); setBulkResult(null); }}
                          >
                            + Agregar stock en bulk
                          </button>
                          <button
                            className="tk-btn tk-btn-danger"
                            style={{ width: '100%' }}
                            disabled={working}
                            onClick={handleDelete}
                          >
                            {working ? <div className="tk-spinner" /> : '🗑 Eliminar producto'}
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>

                  {panel === 'addStock' && selectedProduct && (
                    <div className="tk-card-flat tk-fade" style={{ padding: '22px 24px' }}>
                      <h3 style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>
                        Agregar códigos de stock
                      </h3>

                      {panelError && <AlertBox color="red" msg={panelError} />}
                      {bulkResult && <BulkResultBox result={bulkResult} onDismiss={() => setBulkResult(null)} />}

                      <form onSubmit={handleBulkStock} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <StockRowsField label="Códigos" items={bulkItems} setItems={setBulkItems} addRow={addRow} removeRow={removeRow} updateRow={updateRow} />

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" className="tk-btn tk-btn-ghost" style={{ flex: 1 }} onClick={() => { setPanel('detail'); setPanelError(''); }}>
                            ← Volver
                          </button>
                          <button type="submit" className="tk-btn tk-btn-primary" style={{ flex: 1 }} disabled={working}>
                            {working ? <div className="tk-spinner" /> : 'Agregar'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small reusable pieces ───────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="tk-label">{label}</label>
      {children}
    </div>
  );
}

function InfoChip({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ background: T.surface2, borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ color: T.muted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: valueColor ?? T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

function AlertBox({ color, msg }: { color: 'red' | 'green'; msg: string }) {
  const isRed = color === 'red';
  return (
    <div style={{
      background: isRed ? 'rgba(239,68,68,.08)' : 'rgba(34,216,122,.08)',
      border: `1px solid ${isRed ? 'rgba(239,68,68,.25)' : 'rgba(34,216,122,.25)'}`,
      borderRadius: 10, padding: '10px 14px',
      color: isRed ? T.red : T.green,
      fontSize: 12, marginBottom: 14,
    }}>
      {msg}
    </div>
  );
}

function StockRowsField({
  label, items, setItems, addRow, removeRow, updateRow,
}: {
  label: string;
  items: CreateProductStockRequestDTO[];
  setItems: (v: CreateProductStockRequestDTO[]) => void;
  addRow: (i: CreateProductStockRequestDTO[], s: (v: CreateProductStockRequestDTO[]) => void) => void;
  removeRow: (i: CreateProductStockRequestDTO[], s: (v: CreateProductStockRequestDTO[]) => void, idx: number) => void;
  updateRow: (i: CreateProductStockRequestDTO[], s: (v: CreateProductStockRequestDTO[]) => void, idx: number, f: keyof CreateProductStockRequestDTO, v: string) => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <label className="tk-label" style={{ margin: 0 }}>{label}</label>
        <button type="button" className="tk-btn tk-btn-ghost" style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => addRow(items, setItems)}>
          + Agregar fila
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 26px', gap: 6, alignItems: 'center' }}>
            <input
              className="tk-input"
              style={{ resize: 'none', padding: '8px 10px', fontSize: 12 }}
              placeholder="Código"
              value={item.code}
              onChange={e => updateRow(items, setItems, idx, 'code', e.target.value)}
            />
            <input
              className="tk-input"
              style={{ resize: 'none', padding: '8px 10px', fontSize: 12 }}
              type="date"
              value={item.expirationDate ?? ''}
              onChange={e => updateRow(items, setItems, idx, 'expirationDate', e.target.value)}
            />
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: T.red, cursor: 'pointer', fontSize: 18, padding: 0, opacity: items.length === 1 ? .3 : 1 }}
              onClick={() => removeRow(items, setItems, idx)}
              disabled={items.length === 1}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function BulkResultBox({ result, onDismiss }: { result: BulkStockResponseDTO; onDismiss: () => void }) {
  return (
    <div style={{ background: 'rgba(96,165,250,.08)', border: '1px solid rgba(96,165,250,.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ color: T.blue, fontWeight: 700, fontSize: 13 }}>Resultado del bulk</span>
        <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 14, padding: 0 }}>✕</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: result.errors.length > 0 ? 12 : 0 }}>
        {[
          { label: 'Procesados', value: result.totalProcessed,    color: T.blue  },
          { label: 'Exitosos',   value: result.successfullyAdded, color: T.green },
          { label: 'Fallidos',   value: result.failed,            color: result.failed > 0 ? T.red : T.muted },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', color }}>{value}</div>
            <div style={{ color: T.muted, fontSize: 11 }}>{label}</div>
          </div>
        ))}
      </div>
      {result.errors.length > 0 && (
        <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
          {result.errors.map((e, i) => (
            <div key={i} style={{ color: T.red, fontSize: 11, marginTop: 3 }}>· {e}</div>
          ))}
        </div>
      )}
    </div>
  );
}
