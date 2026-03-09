'use client';

import Link from 'next/link';

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

export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.fontBody, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: 28,
          textAlign: 'center',
        }}
      >
        <p style={{ color: T.accent, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>REGISTER</p>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: '2rem', marginBottom: 12 }}>Registro no disponible aún</h1>
        <p style={{ color: T.muted, lineHeight: 1.7, marginBottom: 22 }}>
          Tu frontend ya tiene la ruta, pero el backend que mostraste todavía no expone un endpoint de registro.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
            <span>Ir al login</span>
          </Link>
          <Link href="/" className="btn-ghost" style={{ textDecoration: 'none' }}>
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}