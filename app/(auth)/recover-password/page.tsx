'use client';

import { useState, FormEvent, useEffect, CSSProperties } from 'react';
import Link from 'next/link';
import { authService } from '@/lib/services/authService';

const T = {
  bg:          '#07080f',
  surface:     '#0e101c',
  surface2:    '#151825',
  border:      'rgba(255,255,255,0.06)',
  borderFocus: 'rgba(255,107,43,0.5)',
  borderErr:   'rgba(239,68,68,0.45)',
  accent:      '#ff6b2b',
  accentSoft:  '#ff9d5c',
  green:       '#22d87a',
  text:        '#eef0f8',
  muted:       '#6b7291',
  fontDisplay: '"Syne", system-ui, sans-serif',
  fontBody:    '"DM Sans", system-ui, sans-serif',
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes lx-up {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes lx-left {
    from { opacity:0; transform:translateX(-20px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes lx-spin {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  @keyframes lx-check {
    0%   { transform:scale(0) rotate(-10deg); opacity:0; }
    60%  { transform:scale(1.15) rotate(3deg); opacity:1; }
    100% { transform:scale(1) rotate(0deg); opacity:1; }
  }

  .lx-page { background:${T.bg}; color:${T.text}; font-family:${T.fontBody}; min-height:100vh; -webkit-font-smoothing:antialiased; }

  .lx-f1 { animation:lx-up .6s .00s ease both; }
  .lx-f2 { animation:lx-up .6s .10s ease both; }
  .lx-f3 { animation:lx-up .6s .20s ease both; }
  .lx-f4 { animation:lx-up .6s .30s ease both; }
  .lx-f5 { animation:lx-up .6s .40s ease both; }

  .lx-panel-content { animation:lx-left .7s .1s ease both; }

  .lx-grad {
    background:linear-gradient(120deg,#ff6b2b 0%,#ff9d5c 50%,#ffc17a 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  .lx-input {
    width:100%; background:${T.surface2}; border:1.5px solid ${T.border}; border-radius:12px;
    padding:13px 18px; color:${T.text}; font-family:${T.fontBody}; font-size:15px; outline:none;
    transition:border-color .2s, box-shadow .2s; box-sizing:border-box;
  }
  .lx-input::placeholder { color:${T.muted}; }
  .lx-input:focus { border-color:${T.borderFocus}; box-shadow:0 0 0 3px rgba(255,107,43,.1); }
  .lx-input.error { border-color:${T.borderErr}; }

  .lx-label { font-size:13px; font-weight:600; color:${T.text}; display:block; margin-bottom:8px; font-family:${T.fontBody}; }

  .lx-btn-primary {
    position:relative; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; gap:8px;
    width:100%; font-family:${T.fontDisplay}; font-weight:700; font-size:15px; letter-spacing:.01em;
    padding:14px 24px; border-radius:13px; border:none; cursor:pointer; color:#fff;
    background:linear-gradient(135deg,#ff6b2b 0%,#ff9d5c 100%);
    transition:box-shadow .25s,transform .2s,opacity .2s;
  }
  .lx-btn-primary::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,transparent,rgba(255,255,255,.14));
    opacity:0; transition:opacity .25s;
  }
  .lx-btn-primary:not(:disabled):hover { box-shadow:0 10px 36px rgba(255,107,43,.4); transform:translateY(-1px); }
  .lx-btn-primary:not(:disabled):hover::after { opacity:1; }
  .lx-btn-primary:active { transform:translateY(0); }
  .lx-btn-primary:disabled { opacity:.55; cursor:not-allowed; }

  .lx-btn-ghost {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    font-family:${T.fontBody}; font-weight:500; font-size:14px;
    padding:11px 16px; border-radius:12px; border:1px solid ${T.border}; cursor:pointer;
    color:${T.muted}; background:transparent; transition:all .2s; text-decoration:none;
  }
  .lx-btn-ghost:hover { border-color:rgba(255,107,43,.3); color:${T.text}; background:rgba(255,107,43,.05); }

  .lx-spinner {
    width:17px; height:17px; border:2.5px solid rgba(255,255,255,.25);
    border-top-color:#fff; border-radius:50%; animation:lx-spin .7s linear infinite; flex-shrink:0;
  }

  .lx-feat {
    display:flex; align-items:center; gap:12px;
    background:rgba(255,255,255,.03); border:1px solid ${T.border};
    border-radius:14px; padding:12px 16px; transition:border-color .2s;
  }
  .lx-feat:hover { border-color:rgba(255,107,43,.2); }

  .lx-check-icon { animation:lx-check .5s .1s cubic-bezier(.34,1.56,.64,1) both; }

  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${T.bg}; }
  ::-webkit-scrollbar-thumb { background:#252840; border-radius:99px; }
`;

export default function RecoverPasswordPage() {
  const [email, setEmail]             = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [sent, setSent]               = useState(false);
  const [mobile, setMobile]           = useState(false);

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 1024);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const emailInvalid = emailTouched && !email.includes('@');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    if (emailInvalid || !email) return;

    setLoading(true);
    try {
      await authService.forgotPassword({ email });
    } finally {
      // Siempre mostrar éxito — no revelar si el email existe
      setSent(true);
      setLoading(false);
    }
  };

  const row = (gap = 12): CSSProperties => ({ display: 'flex', alignItems: 'center', gap });
  const col = (gap = 0): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap });

  return (
    <div className="lx-page" style={{ display: 'flex' }}>
      <style>{STYLES}</style>

      {/* ── Panel izquierdo (solo desktop) ── */}
      {!mobile && (
        <div
          style={{
            flex: '0 0 46%',
            position: 'relative',
            overflow: 'hidden',
            background: T.surface,
            borderRight: `1px solid ${T.border}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '40px 48px',
          }}
        >
          <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,43,.16) 0%,transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -250, left: -120, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,140,255,.09) 0%,transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

          <Link href="/" className="lx-panel-content" style={{ ...row(12), textDecoration: 'none', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#ff6b2b,#ff9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: T.fontDisplay, flexShrink: 0, boxShadow: '0 6px 20px rgba(255,107,43,.4)' }}>M</div>
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 22, color: T.text }}>Mercadox</span>
          </Link>

          <div className="lx-panel-content" style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '2.4rem', lineHeight: 1.1, marginBottom: 18, letterSpacing: '-.02em' }}>
              ¿Olvidaste tu
              <br />
              <span className="lx-grad">contraseña?</span>
            </h2>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.75, marginBottom: 36 }}>
              No te preocupes, pasa. Ingresa tu correo y te enviaremos un enlace seguro para que puedas acceder de nuevo en minutos.
            </p>

            <div style={col(10)}>
              {[
                { icon: '📧', title: 'Enlace por correo',    sub: 'Te llegará en menos de 2 minutos'          },
                { icon: '⏱️', title: 'Válido por 30 min',   sub: 'El enlace expira por seguridad'            },
                { icon: '🔑', title: 'Un solo uso',          sub: 'El enlace se invalida tras usarse'         },
              ].map(({ icon, title, sub }) => (
                <div key={title} className="lx-feat">
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,107,43,.1)', border: '1px solid rgba(255,107,43,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: 12, color: T.muted }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lx-panel-content" style={{ ...row(7), position: 'relative', zIndex: 1, padding: '12px 16px', background: 'rgba(255,255,255,.02)', border: `1px solid ${T.border}`, borderRadius: 10 }}>
            <span style={{ fontSize: 13 }}>🔒</span>
            <span style={{ color: T.muted, fontSize: 12 }}>Conexión segura · Encriptación SSL 256-bit</span>
          </div>
        </div>
      )}

      {/* ── Panel derecho ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: mobile ? '32px 20px' : '40px 48px',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,43,.06) 0%,transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

          {mobile && (
            <Link href="/" style={{ ...row(10), marginBottom: 36, textDecoration: 'none', display: 'flex' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ff6b2b,#ff9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: T.fontDisplay, flexShrink: 0 }}>M</div>
              <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 19, color: T.text }}>Mercadox</span>
            </Link>
          )}

          {/* ── Estado: enviado ── */}
          {sent ? (
            <div style={col(0)}>
              <div
                className="lx-check-icon"
                style={{
                  width: 72, height: 72, borderRadius: '50%', marginBottom: 28,
                  background: 'rgba(34,216,122,.1)', border: '1px solid rgba(34,216,122,.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
                }}
              >
                📧
              </div>

              <h1 className="lx-f1" style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.95rem', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-.02em' }}>
                Revisa tu correo
              </h1>

              <p className="lx-f2" style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
                Si existe una cuenta asociada a <strong style={{ color: T.text }}>{email}</strong>, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>

              <div className="lx-f3" style={col(12)}>
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 16px' }}>
                  <p style={{ color: T.muted, fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                    💡 <strong style={{ color: T.text }}>¿No llegó?</strong> Revisa tu carpeta de spam o correo no deseado. El enlace expira en 30 minutos.
                  </p>
                </div>

                <Link href="/login" className="lx-btn-ghost" style={{ width: '100%', boxSizing: 'border-box' }}>
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </div>

          ) : (
            /* ── Estado: formulario ── */
            <>
              <div className="lx-f1" style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.95rem', lineHeight: 1.15, marginBottom: 8, letterSpacing: '-.02em' }}>
                  Recuperar contraseña 🔑
                </h1>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>
                  Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate style={col(0)}>
                <div className="lx-f2" style={{ marginBottom: 28 }}>
                  <label className="lx-label">Correo electrónico</label>
                  <input
                    type="email"
                    className={`lx-input${emailInvalid ? ' error' : ''}`}
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                  {emailInvalid && <span style={{ color: '#f87171', fontSize: 12, marginTop: 5, display: 'block' }}>Ingresa un correo válido</span>}
                </div>

                <div className="lx-f3">
                  <button type="submit" className="lx-btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="lx-spinner" />
                        <span>Enviando enlace...</span>
                      </>
                    ) : (
                      'Enviar enlace de recuperación →'
                    )}
                  </button>
                </div>
              </form>

              <p className="lx-f4" style={{ textAlign: 'center', color: T.muted, fontSize: 14, marginTop: 28 }}>
                ¿Recordaste tu contraseña?{' '}
                <Link
                  href="/login"
                  style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  Inicia sesión
                </Link>
              </p>

              <div className="lx-f5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 28, padding: '12px 16px', background: 'rgba(255,255,255,.02)', border: `1px solid ${T.border}`, borderRadius: 10 }}>
                <span style={{ fontSize: 13 }}>🔒</span>
                <span style={{ color: T.muted, fontSize: 12 }}>Conexión segura · Encriptación SSL 256-bit</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}