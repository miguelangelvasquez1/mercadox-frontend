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
  text:        '#eef0f8',
  muted:       '#6b7291',
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody:    '"DM Sans", system-ui, sans-serif',
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .nav-adm-link {
    color: ${T.muted}; font-size: 13px; font-weight: 600;
    text-decoration: none; transition: color .2s;
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px; border-radius: 9px;
    white-space: nowrap;
  }
  .nav-adm-link:hover { color: ${T.text}; background: rgba(255,255,255,.04); }

  .nav-adm-avatar {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg,#6366f1,#8b5cf6);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 800; font-size: 13px;
    font-family: ${T.fontDisplay}; cursor: pointer;
    border: 2px solid transparent; transition: border-color .2s;
  }
  .nav-adm-avatar:hover { border-color: #8b5cf6; }

  .nav-adm-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 16px; padding: 8px; min-width: 210px;
    box-shadow: 0 20px 50px rgba(0,0,0,.5); z-index: 50;
  }

  .nav-adm-dd-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    color: ${T.muted}; font-size: 14px; font-weight: 500;
    text-decoration: none; transition: all .2s; cursor: pointer;
    background: none; border: none; width: 100%; font-family: ${T.fontBody};
  }
  .nav-adm-dd-item:hover { background: rgba(255,255,255,.04); color: ${T.text}; }
  .nav-adm-dd-item.danger { color: #f87171; }
  .nav-adm-dd-item.danger:hover { background: rgba(239,68,68,.08); }

  .nav-mobile-menu {
    position: fixed; inset: 0; z-index: 200;
    background: ${T.bg}; display: flex; flex-direction: column;
    padding: 24px 20px; gap: 8px; overflow-y: auto;
  }
`;

const ADMIN_LINKS = [
  { href: '/postSaleDashboard', label: '🏠 Dashboard' },
  { href: '/admin/tickets',           label: '🎫 Tickets',        },
  { href: '/products',                label: '📦 Productos',      },
];

export default function NavbarAdmin() {
  const router    = useRouter();
  const { logout }= useAuth();
  const [dropOpen, setDropOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.push('/');
  };

  return (
    <>
      <style>{STYLES}</style>

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(7,8,15,0.92)', borderBottom: '1px solid rgba(99,102,241,.18)', fontFamily: T.fontBody }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 20px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>

          {/* Logo + Admin badge */}
          <Link href="/admin/postSaleDashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#ff6b2b,#ff9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontFamily: T.fontDisplay, fontSize: 16 }}>M</div>
            <div>
              <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 17, color: T.text }}>Mercadox</span>
              <span style={{ marginLeft: 8, background: 'rgba(99,102,241,.18)', border: '1px solid rgba(99,102,241,.3)', color: '#a5b4fc', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '.05em' }}>Admin</span>
            </div>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }} className="nav-hide-mobile">
            {ADMIN_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="nav-adm-link">{label}</Link>
            ))}
          </div>

          {/* Avatar + dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }} className="nav-hide-mobile">
            <div style={{ position: 'relative' }}>
              <div className="nav-adm-avatar" onClick={() => setDropOpen(o => !o)}>A</div>
              {dropOpen && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDropOpen(false)} />
                  <div className="nav-adm-dropdown">
                    <div style={{ padding: '10px 12px 12px', borderBottom: `1px solid ${T.border}`, marginBottom: 6 }}>
                      <div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>Panel de admin</div>
                      <div style={{ color: '#a5b4fc', fontSize: 12, marginTop: 2 }}>Administrador</div>
                    </div>
                    {ADMIN_LINKS.map(({ href, label }) => (
                      <Link key={href} href={href} className="nav-adm-dd-item" onClick={() => setDropOpen(false)}>{label}</Link>
                    ))}
                    <div style={{ height: 1, background: T.border, margin: '6px 4px' }} />
                    <button className="nav-adm-dd-item danger" onClick={handleLogout}>🚪 Cerrar sesión</button>
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
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18, color: T.text }}>Panel Admin</span>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 24 }}>✕</button>
          </div>
          {ADMIN_LINKS.map(({ href, label }) => (
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