'use client';

import { useState, FormEvent, useEffect, CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import { useAuth } from '@/lib/auth/AuthContext';
import type { UserRole } from '@/lib/types/auth.types';

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

  @keyframes lx-up   { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes lx-left { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
  @keyframes lx-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }

  .lx-page { background:${T.bg}; color:${T.text}; font-family:${T.fontBody}; min-height:100vh; -webkit-font-smoothing:antialiased; }
  .lx-f1 { animation:lx-up .6s .00s ease both; }
  .lx-f2 { animation:lx-up .6s .08s ease both; }
  .lx-f3 { animation:lx-up .6s .16s ease both; }
  .lx-f4 { animation:lx-up .6s .24s ease both; }
  .lx-f5 { animation:lx-up .6s .32s ease both; }
  .lx-f6 { animation:lx-up .6s .40s ease both; }
  .lx-f7 { animation:lx-up .6s .48s ease both; }
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
  .lx-label { font-size:13px; font-weight:600; color:${T.text}; display:block; margin-bottom:8px; }
  .lx-btn-primary {
    position:relative; overflow:hidden; display:inline-flex; align-items:center; justify-content:center; gap:8px;
    width:100%; font-family:${T.fontDisplay}; font-weight:700; font-size:15px;
    padding:14px 24px; border-radius:13px; border:none; cursor:pointer; color:#fff;
    background:linear-gradient(135deg,#ff6b2b 0%,#ff9d5c 100%);
    transition:box-shadow .25s,transform .2s,opacity .2s;
  }
  .lx-btn-primary:not(:disabled):hover { box-shadow:0 10px 36px rgba(255,107,43,.4); transform:translateY(-1px); }
  .lx-btn-primary:disabled { opacity:.55; cursor:not-allowed; }
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
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-track { background:${T.bg}; }
  ::-webkit-scrollbar-thumb { background:#252840; border-radius:99px; }
`;

const ROLES: { value: UserRole; icon: string; title: string; sub: string; color: string }[] = [
  {
    value: 'CONSUMER',
    icon:  '🛍️',
    title: 'Comprador',
    sub:   'Compra productos digitales y gestiona tus pedidos',
    color: '#ff6b2b',
  },
  {
    value: 'ADMIN',
    icon:  '🛡️',
    title: 'Administrador',
    sub:   'Gestiona productos, tickets y el panel de control',
    color: '#6366f1',
  },
];

export default function RegisterPage() {
  const router       = useRouter();
  const { login }    = useAuth();

  const [form, setForm] = useState({
    email: '', password: '', phoneNumber: '',
    role: 'CONSUMER' as UserRole,
  });
  const [showPass, setShowPass]  = useState(false);
  const [loading, setLoading]    = useState(false);
  const [error, setError]        = useState('');
  const [touched, setTouched]    = useState({ email: false, password: false, phoneNumber: false });
  const [mobile, setMobile]      = useState(false);

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 1024);
    fn();
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const emailInvalid = touched.email       && !form.email.includes('@');
  const passInvalid  = touched.password    && form.password.length < 8;
  const phoneInvalid = touched.phoneNumber && !/^\+?[0-9]{7,15}$/.test(form.phoneNumber);

  const touch = (field: keyof typeof touched) =>
    setTouched(prev => ({ ...prev, [field]: true }));

  const strength = form.password.length >= 12 ? 3 : form.password.length >= 8 ? 2 : form.password.length > 0 ? 1 : 0;
  const strengthColors = ['', '#ef4444', '#f59e0b', T.green];
  const strengthLabels = ['', '🔴 Débil', '🟡 Aceptable', '🟢 Fuerte'];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true, phoneNumber: true });
    if (emailInvalid || passInvalid || phoneInvalid) return;

    setError('');
    setLoading(true);
    try {
      await authService.register({
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        role: form.role,
      });
      // Auto-login tras registro
      const response = await authService.login({ email: form.email, password: form.password });
      login(response.accessToken, response.role);

      if (response.role === 'ADMIN')    router.push('/admin/dashboard');
      else                              router.push('/products');

    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const row = (gap = 12): CSSProperties => ({ display: 'flex', alignItems: 'center', gap });
  const col = (gap = 0): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap });

  return (
    <div className="lx-page" style={{ display: 'flex' }}>
      <style>{STYLES}</style>

      {/* Panel izquierdo */}
      {!mobile && (
        <div style={{ flex: '0 0 46%', position: 'relative', overflow: 'hidden', background: T.surface, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 48px' }}>
          <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,43,.16) 0%,transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -250, left: -120, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(79,140,255,.09) 0%,transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

          <Link href="/" className="lx-panel-content" style={{ ...row(12), textDecoration: 'none', position: 'relative', zIndex: 1 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#ff6b2b,#ff9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: T.fontDisplay, flexShrink: 0, boxShadow: '0 6px 20px rgba(255,107,43,.4)' }}>M</div>
            <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 22, color: T.text }}>Mercadox</span>
          </Link>

          <div className="lx-panel-content" style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '2.4rem', lineHeight: 1.1, marginBottom: 18, letterSpacing: '-.02em' }}>
              Únete hoy,<br />
              <span className="lx-grad">es completamente gratis.</span>
            </h2>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.75, marginBottom: 36 }}>
              Crea tu cuenta en segundos. Elige tu rol y accede a todo lo que Mercadox tiene para ti.
            </p>
            <div style={col(10)}>
              {[
                { icon: '🚀', title: 'Registro en segundos',  sub: 'Sin tarjeta requerida'             },
                { icon: '🛍️', title: 'Catálogo completo',    sub: 'Miles de productos disponibles'     },
                { icon: '🛡️', title: 'Panel de admin',       sub: 'Gestiona tickets y productos'       },
              ].map(({ icon, title, sub }) => (
                <div key={title} className="lx-feat">
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,107,43,.1)', border: '1px solid rgba(255,107,43,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{icon}</div>
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

      {/* Panel derecho */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: mobile ? '32px 20px' : '40px 48px', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,107,43,.06) 0%,transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

          {mobile && (
            <Link href="/" style={{ ...row(10), marginBottom: 36, textDecoration: 'none', display: 'flex' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#ff6b2b,#ff9d5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', fontFamily: T.fontDisplay, flexShrink: 0 }}>M</div>
              <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 19, color: T.text }}>Mercadox</span>
            </Link>
          )}

          <div className="lx-f1" style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.95rem', lineHeight: 1.15, marginBottom: 8, letterSpacing: '-.02em' }}>Crea tu cuenta 👋</h1>
            <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>Elige tu rol y completa los datos para empezar.</p>
          </div>

          {error && (
            <div className="lx-f1" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 22, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
              <span style={{ color: '#f87171', fontSize: 13, lineHeight: 1.5 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={col(0)}>

            {/* ── Selector de rol ── */}
            <div className="lx-f2" style={{ marginBottom: 20 }}>
              <label className="lx-label">¿Cómo quieres usar Mercadox?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ROLES.map(({ value, icon, title, sub, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: value }))}
                    style={{
                      background: form.role === value ? `${color}14` : T.surface2,
                      border: `1.5px solid ${form.role === value ? color : T.border}`,
                      borderRadius: 14, padding: '14px 14px', cursor: 'pointer',
                      textAlign: 'left', transition: 'all .2s',
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                    <div style={{ color: form.role === value ? color : T.text, fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{title}</div>
                    <div style={{ color: T.muted, fontSize: 11, lineHeight: 1.4 }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="lx-f3" style={{ marginBottom: 16 }}>
              <label className="lx-label">Correo electrónico</label>
              <input type="email" className={`lx-input${emailInvalid ? ' error' : ''}`} placeholder="tu@correo.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                onBlur={() => touch('email')} required autoComplete="email" />
              {emailInvalid && <span style={{ color: '#f87171', fontSize: 12, marginTop: 5, display: 'block' }}>Ingresa un correo válido</span>}
            </div>

            {/* Teléfono */}
            <div className="lx-f3" style={{ marginBottom: 16 }}>
              <label className="lx-label">Número de teléfono</label>
              <input type="tel" className={`lx-input${phoneInvalid ? ' error' : ''}`} placeholder="+573001234567"
                value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                onBlur={() => touch('phoneNumber')} required autoComplete="tel" />
              {phoneInvalid && <span style={{ color: '#f87171', fontSize: 12, marginTop: 5, display: 'block' }}>Número inválido (7–15 dígitos)</span>}
            </div>

            {/* Contraseña */}
            <div className="lx-f4" style={{ marginBottom: 26 }}>
              <label className="lx-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} className={`lx-input${passInvalid ? ' error' : ''}`}
                  placeholder="Mínimo 8 caracteres" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onBlur={() => touch('password')} required autoComplete="new-password" style={{ paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 18, padding: 2 }}
                  aria-label={showPass ? 'Ocultar' : 'Mostrar'}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {passInvalid && <span style={{ color: '#f87171', fontSize: 12, marginTop: 5, display: 'block' }}>Mínimo 8 caracteres</span>}
              {form.password.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                    {[1,2,3].map(level => (
                      <div key={level} style={{ flex: 1, height: 3, borderRadius: 99, background: level <= strength ? strengthColors[strength] : T.border, transition: 'background .3s' }} />
                    ))}
                  </div>
                  <span style={{ color: T.muted, fontSize: 11 }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <div className="lx-f5">
              <button type="submit" className="lx-btn-primary" disabled={loading}>
                {loading ? <><div className="lx-spinner" /><span>Creando cuenta...</span></> : `Crear cuenta como ${form.role === 'ADMIN' ? 'Administrador' : 'Comprador'} →`}
              </button>
            </div>
          </form>

          <p className="lx-f6" style={{ textAlign: 'center', color: T.muted, fontSize: 14, marginTop: 24 }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" style={{ color: T.accent, fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
              Inicia sesión
            </Link>
          </p>

          <div className="lx-f7" style={{ ...row(7), justifyContent: 'center', marginTop: 20, padding: '12px 16px', background: 'rgba(255,255,255,.02)', border: `1px solid ${T.border}`, borderRadius: 10 }}>
            <span style={{ fontSize: 13 }}>🔒</span>
            <span style={{ color: T.muted, fontSize: 12 }}>Conexión segura · Encriptación SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}