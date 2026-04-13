'use client';

import Link from 'next/link';
import { useState } from 'react';

const T = {
  bg:          '#07080f',
  surface:     '#0e101c',
  border:      'rgba(255,255,255,0.06)',
  accent:      '#ff6b2b',
  accentSoft:  '#ff9d5c',
  text:        '#eef0f8',
  muted:       '#6b7291',
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody:    '"DM Sans", system-ui, sans-serif',
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .nav-pub-link {
    color: ${T.muted}; font-size: 14px; font-weight: 500;
    text-decoration: none; transition: color .2s;
  }
  .nav-pub-link:hover { color: ${T.text}; }

  .nav-pub-btn-ghost {
    padding: 9px 18px; border-radius: 11px;
    border: 1px solid ${T.border}; background: transparent;
    color: ${T.muted}; font-size: 14px; font-weight: 500;
    font-family: ${T.fontBody}; cursor: pointer;
    text-decoration: none; transition: all .2s;
    display: inline-flex; align-items: center;
  }
  .nav-pub-btn-ghost:hover {
    border-color: rgba(255,107,43,.35); color: ${T.text};
    background: rgba(255,107,43,.05);
  }

  .nav-pub-btn-primary {
    padding: 9px 20px; border-radius: 11px; border: none;
    background: linear-gradient(135deg,#ff6b2b,#ff9d5c);
    color: #fff; font-size: 14px; font-weight: 700;
    font-family: ${T.fontDisplay}; cursor: pointer;
    text-decoration: none; transition: all .2s;
    display: inline-flex; align-items: center;
  }
  .nav-pub-btn-primary:hover {
    box-shadow: 0 8px 24px rgba(255,107,43,.4);
    transform: translateY(-1px);
  }

  .nav-mobile-menu {
    position: fixed; inset: 0; z-index: 200;
    background: ${T.bg};
    display: flex; flex-direction: column;
    padding: 24px 20px; gap: 8px;
  }
`;

export default function NavbarPublic() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{STYLES}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(7,8,15,0.85)',
        borderBottom: `1px solid ${T.border}`,
        fontFamily: T.fontBody,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ff6b2b,#ff9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontFamily: T.fontDisplay, fontSize: 17 }}>M</div>
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 19, color: T.text }}>Mercadox</span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-hide-mobile">
            <Link href="/products"  className="nav-pub-link">Productos</Link>
            <Link href="/#categorias" className="nav-pub-link">Categorías</Link>
          </div>

          {/* Desktop CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="nav-hide-mobile">
            <Link href=" /login"  className="nav-pub-btn-ghost">Iniciar sesión</Link>
            <Link href="/register"    className="nav-pub-btn-primary">Crear cuenta</Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text, fontSize: 22, padding: 4, display: 'none' }}
            className="nav-show-mobile"
            aria-label="Abrir menú"
          >☰</button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="nav-mobile-menu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }} onClick={() => setMobileOpen(false)}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#ff6b2b,#ff9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontFamily: T.fontDisplay }}>M</div>
              <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18, color: T.text }}>Mercadox</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 24 }}>✕</button>
          </div>

          {[
            { href: '/products',    label: 'Productos'    },
            { href: '/#categorias', label: 'Categorías'   },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              style={{ padding: '14px 16px', borderRadius: 12, color: T.text, fontSize: 15, fontWeight: 500, textDecoration: 'none', background: T.surface, border: `1px solid ${T.border}` }}>
              {label}
            </Link>
          ))}

          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/login" className="nav-pub-btn-ghost" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'center' }}>Iniciar sesión</Link>
            <Link href="/register"   className="nav-pub-btn-primary" onClick={() => setMobileOpen(false)} style={{ justifyContent: 'center' }}>Crear cuenta</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-hide-mobile { display: none !important; }
          .nav-show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-show-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}