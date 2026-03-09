'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';

const T = {
  bg: '#07080f',
  surface: '#0e101c',
  border: 'rgba(255,255,255,0.06)',
  accent: '#ff6b2b',
  text: '#eef0f8',
  muted: '#6b7291',
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody: '"DM Sans", system-ui, sans-serif',
};

export default function SellerPage() {
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace('/login');
      return;
    }

    const role = typeof window !== 'undefined' ? localStorage.getItem('mercadox_role') : null;
    if (role !== 'SELLER') {
      router.replace('/products');
    }
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mercadox_role');
    }
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.fontBody }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
          <div>
            <p style={{ color: T.accent, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>SELLER AREA</p>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: '2rem', marginBottom: 8 }}>Panel de vendedor</h1>
            <p style={{ color: T.muted }}>Vista lista para conectar catálogo, ventas y estado de publicaciones.</p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/products" className="btn-ghost" style={{ textDecoration: 'none' }}>
              Ir a productos
            </Link>
            <button className="btn-primary" type="button" onClick={handleLogout}>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>

        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 18,
            padding: 22,
          }}
        >
          <h2 style={{ fontFamily: T.fontDisplay, marginBottom: 10 }}>Estado actual</h2>
          <p style={{ color: T.muted, lineHeight: 1.7 }}>
            Tu backend mostrado todavía no expone endpoints de vendedor. Esta vista evita errores de navegación y te deja listo el destino del rol.
          </p>
        </div>
      </div>
    </div>
  );
}