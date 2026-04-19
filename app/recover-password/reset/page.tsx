'use client';

import { useState, FormEvent, useEffect, Suspense, CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  .lx-f6 { animation:lx-up .6s .50s ease both; }

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
  .lx-input.success { border-color:rgba(34,216,122,.45); }

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
    color:${T.muted}; background:transparent; transition:all .2s; text-decoration:none; width:100%; box-sizing:border-box;
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

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') ?? '';

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [done, setDone]           = useState(false);
  const [touched, setTouched]     = useState({ password: false, confirm: false });
  const [mobile, setMobile]       = useState(false);

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 1024);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const passInvalid    = touched.password && password.length < 8;
  const confirmInvalid = touched.confirm  && confirm !== password;
  const strength       = password.length >= 12 ? 3 : password.length >= 8 ? 2 : password.length > 0 ? 1 : 0;
  const strengthColors = ['', '#ef4444', '#f59e0b', T.green];
  const strengthLabels = ['', '🔴 Débil', '🟡 Aceptable', '🟢 Fuerte'];

  const touch = (field: keyof typeof touched) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ password: true, confirm: true });
    if (passInvalid || confirmInvalid || !token) return;

    setError('');
    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword: password });
      setDone(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Token inválido o expirado. Solicita un nuevo enlace.');
    } finally {
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
              Nueva contraseña,
              <br />
              <span className="lx-grad">nueva oportunidad.</span>
            </h2>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.75, marginBottom: 36 }}>
              Elige una contraseña segura que no hayas usado antes. Te recomendamos combinar letras, números y símbolos.
            </p>

            <div style={col(10)}>
              {[
                { icon: '🔐', title: 'Mínimo 8 caracteres',   sub: 'Mientras más larga, más segura'           },
                { icon: '🔣', title: 'Usa símbolos',          sub: 'Añade ! @ # $ para mayor seguridad'       },
                { icon: '🚫', title: 'No repitas contraseñas', sub: 'Evita usar la misma de otros servicios'  },
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

          {/* ── Estado: éxito ── */}
          {done ? (
            <div style={col(0)}>
              <div
                className="lx-check-icon"
                style={{ width: 72, height: 72, borderRadius: '50%', marginBottom: 28, background: 'rgba(34,216,122,.1)', border: '1px solid rgba(34,216,122,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}
              >
                ✅
              </div>

              <h1 className="lx-f1" style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.95rem', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-.02em' }}>
                ¡Contraseña actualizada!
              </h1>
              <p className="lx-f2" style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
                Tu contraseña fue restablecida exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.
              </p>

              <div className="lx-f3">
                <button
                  className="lx-btn-primary"
                  onClick={() => router.push('/auth/login')}
                >
                  Ir al inicio de sesión →
                </button>
              </div>
            </div>

          ) : !token ? (
            /* ── Token ausente ── */
            <div style={col(0)}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', marginBottom: 28, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>⚠️</div>
              <h1 className="lx-f1" style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.95rem', lineHeight: 1.15, marginBottom: 12, letterSpacing: '-.02em' }}>Enlace inválido</h1>
              <p className="lx-f2" style={{ color: T.muted, fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>Este enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.</p>
              <div className="lx-f3">
                <Link href="/recover-password" className="lx-btn-ghost">Solicitar nuevo enlace →</Link>
              </div>
            </div>

          ) : (
            /* ── Formulario ── */
            <>
              <div className="lx-f1" style={{ marginBottom: 32 }}>
                <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.95rem', lineHeight: 1.15, marginBottom: 8, letterSpacing: '-.02em' }}>
                  Nueva contraseña 🔐
                </h1>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>
                  Elige una contraseña segura para tu cuenta de Mercadox.
                </p>
              </div>

              {error && (
                <div className="lx-f1" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 22, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
                  <span style={{ color: '#f87171', fontSize: 13, lineHeight: 1.5 }}>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate style={col(0)}>

                {/* Nueva contraseña */}
                <div className="lx-f2" style={{ marginBottom: 18 }}>
                  <label className="lx-label">Nueva contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className={`lx-input${passInvalid ? ' error' : confirm === password && confirm.length > 0 ? ' success' : ''}`}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => touch('password')}
                      required
                      autoComplete="new-password"
                      autoFocus
                      style={{ paddingRight: 48 }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 18, padding: 2, lineHeight: 1 }} aria-label={showPass ? 'Ocultar' : 'Mostrar'}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {passInvalid && <span style={{ color: '#f87171', fontSize: 12, marginTop: 5, display: 'block' }}>Mínimo 8 caracteres</span>}

                  {/* Indicador de fuerza */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                        {[1, 2, 3].map((level) => (
                          <div key={level} style={{ flex: 1, height: 3, borderRadius: 99, background: level <= strength ? strengthColors[strength] : T.border, transition: 'background .3s' }} />
                        ))}
                      </div>
                      <span style={{ color: T.muted, fontSize: 11 }}>{strengthLabels[strength]}</span>
                    </div>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div className="lx-f3" style={{ marginBottom: 28 }}>
                  <label className="lx-label">Confirmar contraseña</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConf ? 'text' : 'password'}
                      className={`lx-input${confirmInvalid ? ' error' : confirm === password && confirm.length > 0 ? ' success' : ''}`}
                      placeholder="Repite la contraseña"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      onBlur={() => touch('confirm')}
                      required
                      autoComplete="new-password"
                      style={{ paddingRight: 48 }}
                    />
                    <button type="button" onClick={() => setShowConf(!showConf)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 18, padding: 2, lineHeight: 1 }} aria-label={showConf ? 'Ocultar' : 'Mostrar'}>
                      {showConf ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {confirmInvalid
                    ? <span style={{ color: '#f87171', fontSize: 12, marginTop: 5, display: 'block' }}>Las contraseñas no coinciden</span>
                    : confirm === password && confirm.length > 0
                    ? <span style={{ color: T.green, fontSize: 12, marginTop: 5, display: 'block' }}>✓ Las contraseñas coinciden</span>
                    : null
                  }
                </div>

                <div className="lx-f4">
                  <button type="submit" className="lx-btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="lx-spinner" />
                        <span>Actualizando...</span>
                      </>
                    ) : (
                      'Actualizar contraseña →'
                    )}
                  </button>
                </div>
              </form>

              <p className="lx-f5" style={{ textAlign: 'center', color: T.muted, fontSize: 14, marginTop: 28 }}>
                <Link href="/recover-password" style={{ color: T.accent, fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  Solicitar un nuevo enlace
                </Link>
              </p>

              <div className="lx-f6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 20, padding: '12px 16px', background: 'rgba(255,255,255,.02)', border: `1px solid ${T.border}`, borderRadius: 10 }}>
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

// useSearchParams requiere Suspense en Next.js 14+
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}