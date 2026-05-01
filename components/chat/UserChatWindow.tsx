'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useUserChat } from '@/lib/hooks/useChat';

const T = {
  bg:         '#07080f',
  surface:    '#0e101c',
  surface2:   '#151825',
  border:     'rgba(255,255,255,0.07)',
  accent:     '#ff6b2b',
  accentSoft: '#ff9d5c',
  green:      '#22d87a',
  text:       '#eef0f8',
  muted:      '#6b7291',
  fontDisplay:'"Syne", system-ui, sans-serif',
  fontBody:   '"DM Sans", system-ui, sans-serif',
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .uc-window {
    position: fixed; bottom: 90px; right: 24px; z-index: 999;
    width: 360px; max-height: 540px;
    display: flex; flex-direction: column;
    background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,.65);
    font-family: ${T.fontBody}; overflow: hidden;
    animation: uc-pop .22s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes uc-pop {
    from { opacity:0; transform: scale(.88) translateY(12px); }
    to   { opacity:1; transform: scale(1) translateY(0); }
  }

  .uc-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 999;
    width: 52px; height: 52px; border-radius: 16px;
    background: linear-gradient(135deg,#ff6b2b,#ff9d5c);
    box-shadow: 0 8px 24px rgba(255,107,43,.4);
    border: none; cursor: pointer; font-size: 22px;
    display: flex; align-items: center; justify-content: center;
    transition: transform .2s, box-shadow .2s;
  }
  .uc-fab:hover { transform: scale(1.07); box-shadow: 0 12px 32px rgba(255,107,43,.55); }

  .uc-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 18px; border-bottom: 1px solid ${T.border};
    background: ${T.surface2};
  }

  .uc-messages {
    flex: 1; overflow-y: auto; padding: 16px 14px;
    display: flex; flex-direction: column; gap: 10px;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.08) transparent;
  }

  .uc-bubble-user {
    align-self: flex-end; max-width: 80%;
    background: linear-gradient(135deg,#ff6b2b,#ff9d5c);
    color: #fff; border-radius: 16px 16px 4px 16px;
    padding: 9px 13px; font-size: 13.5px; line-height: 1.55;
    box-shadow: 0 2px 10px rgba(255,107,43,.2);
  }

  .uc-bubble-admin {
    align-self: flex-start; max-width: 80%;
    background: ${T.surface2}; border: 1px solid ${T.border};
    color: ${T.text}; border-radius: 16px 16px 16px 4px;
    padding: 9px 13px; font-size: 13.5px; line-height: 1.55;
  }

  .uc-ts {
    color: ${T.muted}; font-size: 10px; margin-top: 3px;
    text-align: right;
  }

  .uc-input-row {
    display: flex; gap: 8px; padding: 10px 14px;
    border-top: 1px solid ${T.border}; background: ${T.surface2};
  }

  .uc-textarea {
    flex: 1; background: ${T.surface}; border: 1px solid ${T.border};
    border-radius: 12px; color: ${T.text}; font-family: ${T.fontBody};
    font-size: 13px; padding: 9px 12px; resize: none; outline: none;
    transition: border-color .2s;
  }
  .uc-textarea:focus { border-color: rgba(255,107,43,.45); }

  .uc-send-btn {
    width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
    background: linear-gradient(135deg,#ff6b2b,#ff9d5c);
    border: none; cursor: pointer; font-size: 16px; align-self: flex-end;
    display: flex; align-items: center; justify-content: center;
    transition: opacity .2s;
  }
  .uc-send-btn:disabled { opacity: .45; cursor: not-allowed; }

  .uc-unread-badge {
    position: absolute; top: -5px; right: -5px;
    min-width: 18px; height: 18px; border-radius: 9px;
    background: #f87171; color: #fff; font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid ${T.bg}; padding: 0 3px; line-height: 1;
  }

  .uc-empty {
    color: ${T.muted}; font-size: 13px; text-align: center;
    margin: auto; padding: 24px; line-height: 1.7;
  }

  .uc-spinner {
    width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 400px) {
    .uc-window { width: calc(100vw - 16px); right: 8px; bottom: 80px; }
  }
`;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

interface UserChatWindowProps {
  /** If null, the component renders only the FAB (user not authenticated) */
  isAuthenticated: boolean;
}

export default function UserChatWindow({ isAuthenticated }: UserChatWindowProps) {
  const [open, setOpen]   = useState(false);
  const [text, setText]   = useState('');
  const bottomRef         = useRef<HTMLDivElement>(null);
  const { conversation, loading, sending, error, sendMessage, markAsRead } = useUserChat();

  const unread = conversation?.unreadByUser ?? 0;

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      markAsRead();
    }
  }, [open, conversation?.messages?.length, markAsRead]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const content = text;
    setText('');
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as unknown as FormEvent); }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <style>{STYLES}</style>

      {/* FAB */}
      <button
        id="mercadox-chat-fab"
        className="uc-fab"
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir chat de soporte"
        style={{ position: 'relative' }}
      >
        {open ? '✕' : '💬'}
        {!open && unread > 0 && (
          <span className="uc-unread-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="uc-window">
          {/* Header */}
          <div className="uc-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg,#ff6b2b,#ff9d5c)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>🛡️</div>
              <div>
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 14, color: T.text }}>
                  Soporte Mercadox
                </div>
                <div style={{ color: T.green, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, display: 'inline-block' }} />
                  En línea
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', fontSize: 18 }}
            >✕</button>
          </div>

          {/* Messages */}
          <div className="uc-messages">
            {loading ? (
              <div className="uc-empty">Cargando conversación…</div>
            ) : !conversation?.messages?.length ? (
              <div className="uc-empty">
                👋 ¡Hola! ¿En qué podemos ayudarte hoy?<br />
                <span style={{ fontSize: 12 }}>Escríbenos y un agente te atenderá pronto.</span>
              </div>
            ) : (
              conversation.messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className={msg.senderRole === 'USER' ? 'uc-bubble-user' : 'uc-bubble-admin'}>
                    {msg.senderRole === 'ADMIN' && msg.senderName && (
                      <div style={{ color: T.accentSoft, fontWeight: 700, fontSize: 11, marginBottom: 3 }}>
                        {msg.senderName}
                      </div>
                    )}
                    {msg.content}
                  </div>
                  <div className="uc-ts" style={{ textAlign: msg.senderRole === 'USER' ? 'right' : 'left' }}>
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              ))
            )}
            {error && (
              <div style={{ color: '#f87171', fontSize: 12, textAlign: 'center', padding: '4px 0' }}>{error}</div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form className="uc-input-row" onSubmit={handleSend}>
            <textarea
              className="uc-textarea"
              rows={1}
              placeholder="Escribe un mensaje…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button type="submit" className="uc-send-btn" disabled={sending || !text.trim()}>
              {sending ? <div className="uc-spinner" /> : '➤'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}