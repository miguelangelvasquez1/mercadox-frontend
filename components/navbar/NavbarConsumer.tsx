'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { userService } from '@/lib/services/userService';
import { useCart } from '@/lib/cart/CartContext';
import UserChatWindow from '@/components/chat/UserChatWindow';
import { chatService } from '@/lib/services/chatService';

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

  .nav-pub-link {
    color: ${T.muted}; font-size: 14px; font-weight: 500;
    text-decoration: none; transition: color .2s;
  }
  .nav-pub-link:hover { color: ${T.text}; }

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

  .nav-balance-chip {
    display: flex; align-items: center; gap: 7px;
    padding: 0 13px; height: 36px; border-radius: 10px;
    border: 1px solid rgba(34,216,122,.22);
    background: rgba(34,216,122,.07);
    color: #22d87a; font-size: 13px; font-weight: 600;
    font-family: ${T.fontBody}; white-space: nowrap; transition: all .2s;
  }
  .nav-balance-chip:hover { background: rgba(34,216,122,.12); border-color: rgba(34,216,122,.35); }
  .nav-balance-dot { width: 6px; height: 6px; border-radius: 50%; background: #22d87a; flex-shrink: 0; }

  .nav-balance-skeleton {
    width: 90px; height: 36px; border-radius: 10px;
    background: linear-gradient(90deg, ${T.surface} 25%, ${T.surface2} 50%, ${T.surface} 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0 }
    100% { background-position: -200% 0 }
  }

  .nav-btn-login {
    padding: 0 16px; height: 36px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1); background: transparent;
    color: ${T.text}; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all .2s; font-family: ${T.fontBody};
    text-decoration: none; display: flex; align-items: center; white-space: nowrap;
  }
  .nav-btn-login:hover { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,.04); }

  .nav-btn-register {
    padding: 0 16px; height: 36px; border-radius: 10px;
    border: none; background: linear-gradient(135deg,#ff6b2b,#ff9d5c);
    color: #fff; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all .2s; font-family: ${T.fontBody};
    text-decoration: none; display: flex; align-items: center; white-space: nowrap;
    box-shadow: 0 0 20px rgba(255,107,43,.25);
  }
  .nav-btn-register:hover { box-shadow: 0 0 28px rgba(255,107,43,.4); transform: translateY(-1px); }

  .nav-divider { width: 1px; height: 20px; background: rgba(255,255,255,0.08); margin: 0 2px; }

  /* Chat button pulse animation when there are unread messages */
  @keyframes chat-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,43,.4); }
    50%       { box-shadow: 0 0 0 6px rgba(255,107,43,.0); }
  }
  .nav-chat-btn-unread {
    animation: chat-pulse 2s ease infinite;
    border-color: rgba(255,107,43,.45) !important;
    background: rgba(255,107,43,.08) !important;
  }
`;

const AUTH_LINKS = [
  { href: '/products',   label: '🛍️ Productos'  },
  { href: '/payment',    label: '💳 Pagos'       },
  { href: '/tickets/my', label: '🎫 Mis tickets' },
];

const PUBLIC_LINKS = [
  { href: '/products',    label: 'Productos'  },
  { href: '/#categorias', label: 'Categorías' },
];

export default function NavbarConsumer() {
  const router                              = useRouter();
  const { logout, isAuthenticated }         = useAuth();
  const { totalItems }                      = useCart();
  const [dropOpen, setDropOpen]             = useState(false);
  const [mobileOpen, setMobileOpen]         = useState(false);
  const [balance, setBalance]               = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [chatUnread, setChatUnread]         = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    setBalanceLoading(true);
    userService
      .getUserBalance()
      .then(setBalance)
      .catch(() => setBalance(null))
      .finally(() => setBalanceLoading(false));
  }, [isAuthenticated]);

  // Poll unread chat count
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUnread = async () => {
      try {
        const res = await chatService.getUserUnread();
        const data = await res;
        setChatUnread(data ?? 0);
      } catch { /* silent */ }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10_000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = async () => {
    logout();
    router.push('/');
  };

  const formatBalance = (n: number) =>
    n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  const navLinks = isAuthenticated ? AUTH_LINKS : PUBLIC_LINKS;

  return (
    <>
      <style>{STYLES}</style>

      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(7,8,15,0.88)', borderBottom: `1px solid ${T.border}`,
        fontFamily: T.fontBody,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
        }}>

          {/* Logo */}
          <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#ff6b2b,#ff9d5c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontFamily: T.fontDisplay, fontSize: 17,
            }}>M</div>
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 19, color: T.text }}>Mercadox</span>
          </Link>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flex: 1, justifyContent: 'center' }} className="nav-hide-mobile">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={isAuthenticated ? 'nav-con-link' : 'nav-pub-link'}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }} className="nav-hide-mobile">

            {isAuthenticated ? (
              <>
                {/* Saldo */}
                {balanceLoading ? (
                  <div className="nav-balance-skeleton" />
                ) : balance !== null && (
                  <div className="nav-balance-chip">
                    Saldo
                    <div className="nav-balance-dot" />
                    {formatBalance(balance)}
                  </div>
                )}

                <div className="nav-divider" />

                {/* Cart */}
                <Link href="/cart" className="nav-con-icon-btn" title="Ver carrito">
                  🛒
                  {totalItems > 0 && (
                    <span style={{
                      position: 'absolute', top: -6, right: -6,
                      minWidth: 17, height: 17, borderRadius: '50%',
                      background: T.accent, color: '#fff', fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${T.bg}`, padding: '0 3px', lineHeight: 1,
                    }}>
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </Link>

                {/* Chat button — opens UserChatWindow FAB area */}
                <button
                  className={`nav-con-icon-btn${chatUnread > 0 ? ' nav-chat-btn-unread' : ''}`}
                  title="Chat de soporte"
                  onClick={() => {
                    // Trigger the FAB click — the FAB is rendered below
                    document.getElementById('mercadox-chat-fab')?.click();
                  }}
                  style={{ position: 'relative' }}
                >
                  💬
                  {chatUnread > 0 && (
                    <span style={{
                      position: 'absolute', top: -6, right: -6,
                      minWidth: 17, height: 17, borderRadius: '50%',
                      background: '#f87171', color: '#fff', fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${T.bg}`, padding: '0 3px', lineHeight: 1,
                    }}>
                      {chatUnread > 9 ? '9+' : chatUnread}
                    </span>
                  )}
                </button>

                {/* Ticket shortcut */}
                <Link href="/tickets/new" className="nav-con-icon-btn" title="Abrir ticket de soporte">🎟️</Link>

                {/* Avatar + dropdown */}
                <div style={{ position: 'relative' }}>
                  <div className="nav-con-avatar" onClick={() => setDropOpen(o => !o)}>
                    👤
                  </div>
                  {dropOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setDropOpen(false)} />
                      <div className="nav-con-dropdown">
                        <div style={{ padding: '10px 12px 12px', borderBottom: `1px solid ${T.border}`, marginBottom: 6 }}>
                          <div style={{ color: T.text, fontWeight: 600, fontSize: 14 }}>Mi cuenta</div>
                          <div style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>Consumer</div>
                        </div>
                        <Link href="/tickets/my" className="nav-con-dd-item" onClick={() => setDropOpen(false)}>🎫 Mis tickets</Link>
                        <Link href="/payment" className="nav-con-dd-item" onClick={() => setDropOpen(false)}>💳 Historial de pagos</Link>
                        <div style={{ height: 1, background: T.border, margin: '6px 4px' }} />
                        <button className="nav-con-dd-item danger" onClick={handleLogout}>
                          🚪 Cerrar sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login"    className="nav-btn-login">Iniciar sesión</Link>
                <Link href="/register" className="nav-btn-register">Crear cuenta</Link>
              </>
            )}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 18, color: T.text }}>Menú</span>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 24 }}>✕</button>
          </div>

          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              style={{ padding: '14px 16px', borderRadius: 12, color: T.text, fontSize: 15, fontWeight: 500, textDecoration: 'none', background: T.surface, border: `1px solid ${T.border}` }}>
              {href === '/cart' && totalItems > 0
                ? `🛒 Carrito (${totalItems > 99 ? '99+' : totalItems})`
                : label}
            </Link>
          ))}

          <div style={{ height: 1, background: T.border, margin: '8px 0' }} />

          {isAuthenticated ? (
            <>
              {/* Chat button (mobile) */}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setTimeout(() => document.getElementById('mercadox-chat-fab')?.click(), 100);
                }}
                style={{
                  padding: '14px 16px', borderRadius: 12, color: T.text, fontSize: 15,
                  fontWeight: 500, textAlign: 'left', background: T.surface,
                  border: `1px solid ${chatUnread > 0 ? 'rgba(255,107,43,.4)' : T.border}`,
                  cursor: 'pointer', fontFamily: T.fontBody, display: 'flex', gap: 10, alignItems: 'center',
                }}
              >
                💬 Chat de soporte
                {chatUnread > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: '#f87171', color: '#fff',
                    fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  }}>
                    {chatUnread} nuevo{chatUnread !== 1 ? 's' : ''}
                  </span>
                )}
              </button>

              {balance !== null && !balanceLoading && (
                <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(34,216,122,.07)', border: '1px solid rgba(34,216,122,.22)', color: '#22d87a', fontSize: 14, fontWeight: 600 }}>
                  💰 Saldo: {formatBalance(balance)}
                </div>
              )}
              <button onClick={handleLogout}
                style={{ padding: '14px 16px', borderRadius: 12, color: '#f87171', fontSize: 15, fontWeight: 500, textAlign: 'left', background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', cursor: 'pointer', fontFamily: T.fontBody }}>
                🚪 Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)}
                style={{ padding: '14px 16px', borderRadius: 12, color: T.text, fontSize: 15, fontWeight: 500, textDecoration: 'none', textAlign: 'center', background: T.surface, border: `1px solid ${T.border}` }}>
                Iniciar sesión
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)}
                style={{ padding: '14px 16px', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', textAlign: 'center', background: 'linear-gradient(135deg,#ff6b2b,#ff9d5c)', boxShadow: '0 0 20px rgba(255,107,43,.25)' }}>
                Crear cuenta
              </Link>
            </>
          )}
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

      {/* Floating chat window — rendered for authenticated users */}
      <UserChatWindowWrapper isAuthenticated={isAuthenticated} />
    </>
  );
}

// Wrapper that adds the id to the FAB so the navbar button can trigger it
function UserChatWindowWrapper({ isAuthenticated }: { isAuthenticated: boolean }) {
  if (!isAuthenticated) return null;
  return (
    <div id="mercadox-chat-wrapper">
      <UserChatWindow isAuthenticated={isAuthenticated} />
    </div>
  );
}