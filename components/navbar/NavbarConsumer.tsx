'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { authService } from '@/lib/services/authService';

const T = {
  bg:          '#07080f',
  surface:     '#0e101c',
  surface2:    '#151825',
  border:      'rgba(255,255,255,0.06)',
  accent:      '#ff6b2b',
  accentSoft:  '#ff9d5c',
  green:       '#22d87a',
  text:        '#eef0f8',
  muted:       '#6b7291',
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody:    '"DM Sans", system-ui, sans-serif',
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .nav-con-link {
    color: ${T.muted}; font-size: 14px; font-weight: 500;
    text-decoration: none; transition: color .2s; white-space: nowrap;
  }
  .nav-con-link:hover { color: ${T.text}; }
  .nav-con-link.active { color: ${T.accentSoft}; }

  .nav-con-icon-btn {
    position: relative; width: 36px; height: 36px; border-radius: 10px;
    border: 1px solid ${T.border}; background: ${T.surface};
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all .2s; text-decoration: none;
    color: ${T.muted}; font-size: 17px;
  }
  .nav-con-icon-btn:hover {
    border-color: rgba(255,107,43,.35); background: rgba(255,107,43,.06);
    color: ${T.text};
  }

  .nav-con-badge {
    position: absolute; top: -5px; right: -5px;
    width: 17px; height: 17px; border-radius: 50%;
    background: ${T.accent}; color: #fff;
    font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid ${T.bg};
  }

  .nav-con-avatar {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg,#ff6b2b,#ff9d5c);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 800; font-size: 13px;
    font-family: ${T.fontDisplay}; cursor: pointer;
    border: 2px solid transparent; transition: border-color .2s;
  }
  .nav-con-avatar:hover { border-color: ${T.accentSoft}; }

  .nav-con-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 16px; padding: 8px; min-width: 200px;
    box-shadow: 0 20px 50px rgba(0,0,0,.5); z-index: 50;
  }

  .nav-con-dd-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    color: ${T.muted}; font-size: 14px; font-weight: 500;
    text-decoration: none; transition: all .2s; cursor: pointer;
    background: none; border: none; width: 100%; font-family: ${T.fontBody};
  }
  .nav-con-dd-item:hover { background: rgba(255,255,255,.04); color: ${T.text}; }
  .nav-con-dd-item.danger { color: #f87171; }
  .nav-con-dd-item.danger:hover { background: rgba(239,68,68,.08); }

  .nav-mobile-menu {
    position: fixed; inset: 0; z-index: 200;
    background: ${T.bg}; display: flex; flex-direction: column;
    padding: 24px 20px; gap: 8px; overflow-y: auto;
  }
`;

export default function NavbarConsumer() {
  const router               = useRouter();
  const { logout }           = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.push('/');
  };

  const NAV_LINKS = [
    { href: '/products',      label: '🛍️ Productos'        },
    { href: '/cart',          label: '🛒 Carrito'           },
    { href: '/payment',       label: '💳 Pagos'             },
    { href: '/tickets/my',    label: '🎫 Mis tickets'       },
  ];

  return (
    <>
      <style>{STYLES}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(7,8,15,0.88)', borderBottom: `1px solid ${T.border}`, fontFamily: T.fontBody }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ff6b2b,#ff9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontFamily: T.fontDisplay, fontSize: 17 }}>M</div>
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 19, color: T.text }}>Mercadox</span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flex: 1, justifyContent: 'center' }} className="nav-hide-mobile">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="nav-con-link">{label}</Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }} className="nav-hide-mobile">

            {/* New ticket shortcut */}
            <Link href="/tickets/new" className="nav-con-icon-btn" title="Abrir ticket de soporte">🎟️</Link>

            {/* Avatar + dropdown */}
            <div style={{ position: 'relative' }}>
              <div className="nav-con-avatar" onClick={() => setDropOpen(o => !o)}>C</div>
              {dropOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDropOpen(false)} />
                  <div className="nav-con-dropdown">
                    <div style={{ padding: '10px 12px 12px', borderBottom: `1px solid ${T.border}`, marginBottom: 6 }}>
                      <div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>Mi cuenta</div>
                      <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>Consumer</div>
                    </div>
                    <Link href="/tickets/my"  className="nav-con-dd-item" onClick={() => setDropOpen(false)}>🎫 Mis tickets</Link>
                    <Link href="/payment"     className="nav-con-dd-item" onClick={() => setDropOpen(false)}>💳 Historial de pagos</Link>
                    <div style={{ height: 1, background: T.border, margin: '6px 4px' }} />
                    <button className="nav-con-dd-item danger" onClick={handleLogout}>🚪 Cerrar sesión</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text, fontSize: 22, padding: 4, display: 'none' }} className="nav-show-mobile" aria-label="Abrir menú">☰</button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="nav-mobile-menu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18, color: T.text }}>Menú</span>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 24 }}>✕</button>
          </div>
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              style={{ padding: '14px 16px', borderRadius: 12, color: T.text, fontSize: 15, fontWeight: 500, textDecoration: 'none', background: T.surface, border: `1px solid ${T.border}` }}>
              {label}
            </Link>
          ))}
          <div style={{ height: 1, background: T.border, margin: '8px 0' }} />
          <button onClick={handleLogout} style={{ padding: '14px 16px', borderRadius: 12, color: '#f87171', fontSize: 15, fontWeight: 500, textAlign: 'left', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', cursor: 'pointer', fontFamily: T.fontBody }}>
            🚪 Cerrar sesión
          </button>
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