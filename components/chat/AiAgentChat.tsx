'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { agentService, AgentContextDto, AgentMessage } from '@/lib/services/agentService';

// ── Theme ─────────────────────────────────────────────────────────────────
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

  .ai-fab {
    position: fixed;
    bottom: 24px;
    right: 96px; /* sits to the left of the chat support FAB */
    z-index: 998;
    width: 52px; height: 52px; border-radius: 16px;
    background: linear-gradient(135deg, #0e101c, #151825);
    border: 1px solid rgba(255,107,43,.35);
    box-shadow: 0 8px 28px rgba(0,0,0,.5), 0 0 0 1px rgba(255,107,43,.1),
                inset 0 1px 0 rgba(255,255,255,.06);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: transform .25s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
    font-size: 22px;
  }
  .ai-fab:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 12px 36px rgba(255,107,43,.3), 0 0 0 1px rgba(255,107,43,.3),
                inset 0 1px 0 rgba(255,255,255,.08);
  }
  .ai-fab-ring {
    position: absolute; inset: -4px;
    border-radius: 20px;
    background: conic-gradient(from 0deg, #ff6b2b, #ff9d5c, transparent, transparent, #ff6b2b);
    animation: ai-ring-spin 3s linear infinite;
    opacity: 0.6;
    mask: radial-gradient(farthest-side, transparent calc(100% - 3px), white calc(100% - 3px));
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), white calc(100% - 3px));
  }
  @keyframes ai-ring-spin { to { transform: rotate(360deg); } }

  .ai-window {
    position: fixed;
    bottom: 90px; right: 96px;
    z-index: 998;
    width: 380px;
    max-height: 580px;
    display: flex; flex-direction: column;
    background: ${T.surface};
    border: 1px solid ${T.border};
    border-radius: 24px;
    box-shadow: 0 32px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(255,107,43,.06);
    overflow: hidden;
    font-family: ${T.fontBody};
    animation: ai-slide-in .28s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes ai-slide-in {
    from { opacity: 0; transform: scale(.88) translateY(16px) translateX(8px); }
    to   { opacity: 1; transform: scale(1)  translateY(0)    translateX(0); }
  }

  /* Glowing header */
  .ai-header {
    padding: 16px 18px 14px;
    background: linear-gradient(135deg, rgba(255,107,43,.08), rgba(255,157,92,.04));
    border-bottom: 1px solid ${T.border};
    position: relative; overflow: hidden;
    flex-shrink: 0;
  }
  .ai-header::before {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 100px; height: 100px;
    background: radial-gradient(circle, rgba(255,107,43,.15), transparent 70%);
    pointer-events: none;
  }

  .ai-avatar {
    width: 38px; height: 38px; border-radius: 12px;
    background: linear-gradient(135deg, #1a1c2e, #252840);
    border: 1px solid rgba(255,107,43,.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(255,107,43,.15);
    position: relative;
  }
  .ai-avatar::after {
    content: '';
    position: absolute; bottom: -2px; right: -2px;
    width: 10px; height: 10px; border-radius: 50%;
    background: ${T.green}; border: 2px solid ${T.surface};
  }

  .ai-messages {
    flex: 1; overflow-y: auto;
    padding: 16px 14px;
    display: flex; flex-direction: column; gap: 14px;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.06) transparent;
  }

  /* AI bubble */
  .ai-bubble-model {
    align-self: flex-start;
    max-width: 88%;
    background: ${T.surface2};
    border: 1px solid rgba(255,255,255,.07);
    color: ${T.text};
    border-radius: 18px 18px 18px 4px;
    padding: 11px 14px;
    font-size: 13.5px; line-height: 1.62;
    position: relative;
  }
  .ai-bubble-model::before {
    content: '';
    position: absolute; left: -1px; top: 0; bottom: 0;
    width: 3px; border-radius: 0 2px 2px 0;
    background: linear-gradient(135deg, #ff6b2b, #ff9d5c);
    opacity: 0.7;
  }

  /* User bubble */
  .ai-bubble-user {
    align-self: flex-end;
    max-width: 82%;
    background: linear-gradient(135deg, rgba(255,107,43,.15), rgba(255,157,92,.08));
    border: 1px solid rgba(255,107,43,.2);
    color: ${T.text};
    border-radius: 18px 18px 4px 18px;
    padding: 11px 14px;
    font-size: 13.5px; line-height: 1.62;
  }

  /* Inline link button rendered from [LINK:/ruta|Texto] */
  .ai-link-btn {
    display: inline-flex; align-items: center; gap: 6px;
    margin: 4px 3px 0 0;
    padding: 5px 12px; border-radius: 20px;
    background: linear-gradient(135deg, rgba(255,107,43,.18), rgba(255,157,92,.1));
    border: 1px solid rgba(255,107,43,.3);
    color: ${T.accentSoft}; font-size: 12px; font-weight: 600;
    cursor: pointer; font-family: ${T.fontBody};
    transition: all .2s;
    text-decoration: none;
  }
  .ai-link-btn:hover {
    background: linear-gradient(135deg, rgba(255,107,43,.28), rgba(255,157,92,.18));
    border-color: rgba(255,107,43,.5);
    transform: translateY(-1px);
  }

  /* Thinking dots */
  .ai-thinking {
    display: flex; gap: 5px; padding: 14px 16px;
    align-self: flex-start;
    background: ${T.surface2};
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 18px 18px 18px 4px;
  }
  .ai-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: linear-gradient(135deg, #ff6b2b, #ff9d5c);
    animation: ai-bounce .9s ease-in-out infinite;
  }
  .ai-dot:nth-child(2) { animation-delay: .15s; }
  .ai-dot:nth-child(3) { animation-delay: .3s; }
  @keyframes ai-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: .5; }
    40%           { transform: translateY(-8px); opacity: 1; }
  }

  /* Suggestion chips */
  .ai-chips {
    display: flex; flex-wrap: wrap; gap: 6px;
    padding: 0 14px 12px;
    flex-shrink: 0;
  }
  .ai-chip {
    padding: 6px 13px; border-radius: 20px;
    background: ${T.surface2}; border: 1px solid ${T.border};
    color: ${T.muted}; font-size: 12px; font-weight: 500;
    cursor: pointer; font-family: ${T.fontBody};
    transition: all .2s; white-space: nowrap;
  }
  .ai-chip:hover {
    border-color: rgba(255,107,43,.35);
    color: ${T.text};
    background: rgba(255,107,43,.06);
  }

  .ai-input-row {
    display: flex; gap: 8px; padding: 10px 14px 14px;
    border-top: 1px solid ${T.border};
    background: ${T.surface2};
    flex-shrink: 0;
  }

  .ai-textarea {
    flex: 1; background: ${T.bg};
    border: 1px solid ${T.border};
    border-radius: 14px; color: ${T.text};
    font-family: ${T.fontBody}; font-size: 13px;
    padding: 10px 13px; resize: none; outline: none;
    transition: border-color .2s;
    min-height: 40px; max-height: 100px;
  }
  .ai-textarea:focus { border-color: rgba(255,107,43,.4); }
  .ai-textarea::placeholder { color: ${T.muted}; }

  .ai-send-btn {
    width: 40px; height: 40px; border-radius: 13px; flex-shrink: 0;
    background: linear-gradient(135deg, #ff6b2b, #ff9d5c);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; align-self: flex-end;
    box-shadow: 0 4px 14px rgba(255,107,43,.3);
    transition: opacity .2s, transform .15s;
  }
  .ai-send-btn:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,107,43,.4); }
  .ai-send-btn:disabled { opacity: .4; cursor: not-allowed; }

  .ai-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ai-spin .6s linear infinite;
  }
  @keyframes ai-spin { to { transform: rotate(360deg); } }

  .ai-close-btn {
    width: 28px; height: 28px; border-radius: 8px;
    background: rgba(255,255,255,.05);
    border: 1px solid ${T.border};
    color: ${T.muted}; font-size: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .15s;
  }
  .ai-close-btn:hover { background: rgba(255,255,255,.09); color: ${T.text}; }

  @media (max-width: 480px) {
    .ai-window { 
      width: calc(100vw - 12px); right: 6px; bottom: 80px;
      max-height: calc(100dvh - 100px);
    }
    .ai-fab { right: 84px; }
  }
`;

// ── Suggestion chips ──────────────────────────────────────────────────────
const SUGGESTIONS = [
  '¿Cuál es mi saldo?',
  '¿Qué compré recientemente?',
  '¿Cómo abro un ticket?',
  'Ver productos disponibles',
  '¿Por qué no funciona mi código?',
];

// ── Markdown-ish renderer (bold, bullets, link buttons) ───────────────────
function renderContent(text: string, onNavigate: (path: string) => void) {
  // Split on [LINK:/path|Label] patterns
  const linkRegex = /\[LINK:([^\|]+)\|([^\]]+)\]/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    const before = text.slice(last, match.index);
    if (before) parts.push(<span key={last}>{renderText(before)}</span>);
    const path  = match[1];
    const label = match[2];
    parts.push(
      <button
        key={match.index}
        className="ai-link-btn"
        onClick={() => onNavigate(path)}
      >
        ↗ {label}
      </button>
    );
    last = match.index + match[0].length;
  }

  const tail = text.slice(last);
  if (tail) parts.push(<span key="tail">{renderText(tail)}</span>);

  return <>{parts}</>;
}

function renderText(text: string): React.ReactNode {
  // Bold **text**
  const boldRegex = /\*\*(.+?)\*\*/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = boldRegex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(<strong key={m.index} style={{ color: '#eef0f8', fontWeight: 700 }}>{m[1]}</strong>);
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));

  // Now handle newlines → <br/> and bullet points
  return nodes.map((node, i) => {
    if (typeof node !== 'string') return node;
    return node.split('\n').map((line, j) => {
      const isBullet = line.trimStart().startsWith('• ') || line.trimStart().startsWith('- ');
      return (
        <span key={`${i}-${j}`} style={{ display: isBullet ? 'block' : undefined }}>
          {j > 0 && !isBullet && <br />}
          {isBullet ? '  ' + line.trim() : line}
        </span>
      );
    });
  });
}

// ── Main component ─────────────────────────────────────────────────────────

interface AIAgentChatProps {
  isAuthenticated: boolean;
}

export default function AIAgentChat({ isAuthenticated }: AIAgentChatProps) {
  const router                              = useRouter();
  const [open, setOpen]                     = useState(false);
  const [messages, setMessages]             = useState<AgentMessage[]>([]);
  const [displayMessages, setDisplay]       = useState<
    Array<{ role: 'user' | 'model'; text: string }>
  >([]);
  const [input, setInput]                   = useState('');
  const [thinking, setThinking]             = useState(false);
  const [context, setContext]               = useState<AgentContextDto | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef                           = useRef<HTMLDivElement>(null);
  const textareaRef                         = useRef<HTMLTextAreaElement>(null);

  // Load context when first opened
  useEffect(() => {
    if (!open || context || !isAuthenticated) return;
    setContextLoading(true);
    agentService.getContext()
      .then(setContext)
      .catch(() => setContext({}))
      .finally(() => setContextLoading(false));
  }, [open, context, isAuthenticated]);

  // Welcome message
  useEffect(() => {
    if (!open || displayMessages.length > 0) return;
    const name = context?.user?.name?.split(' ')[0] ?? '';
    const greeting = name
      ? `¡Hola, ${name}! 👋 Soy **MercaBot**, tu asistente en Mercadox.\n\n¿En qué te puedo ayudar hoy? Puedo ayudarte con tus compras, tickets de soporte, saldo, productos y más.`
      : '¡Hola! 👋 Soy **MercaBot**, tu asistente en Mercadox.\n\n¿En qué te puedo ayudar hoy?';
    setDisplay([{ role: 'model', text: greeting }]);
  }, [open, context, displayMessages.length]);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, thinking]);

  // Auto resize textarea
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || thinking) return;

    setShowSuggestions(false);

    const userMsg: AgentMessage = { role: 'user', parts: [{ text }] };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setDisplay(prev => [...prev, { role: 'user', text }]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setThinking(true);

    try {
      const reply = await agentService.chat(newMessages, context ?? {});
      const modelMsg: AgentMessage = { role: 'model', parts: [{ text: reply }] };
      setMessages(prev => [...prev, modelMsg]);
      setDisplay(prev => [...prev, { role: 'model', text: reply }]);
    } catch {
      setDisplay(prev => [...prev, {
        role: 'model',
        text: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo.',
      }]);
    } finally {
      setThinking(false);
    }
  }, [messages, thinking, context]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      <style>{STYLES}</style>

      {/* FAB */}
      <button
        className="ai-fab"
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir asistente IA"
        title="MercaBot — Asistente IA"
      >
        <div className="ai-fab-ring" />
        {open ? (
          <span style={{ fontSize: 18, position: 'relative', zIndex: 1 }}>✕</span>
        ) : (
          <span style={{ position: 'relative', zIndex: 1 }}>🤖</span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="ai-window">

          {/* Header */}
          <div className="ai-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="ai-avatar">🤖</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 15, color: T.text, letterSpacing: '-.01em' }}>
                  MercaBot
                </div>
                <div style={{ color: T.green, fontSize: 11, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, display: 'inline-block', boxShadow: `0 0 6px ${T.green}` }} />
                  Asistente IA · Siempre disponible
                </div>
              </div>
              <button className="ai-close-btn" onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Context loading indicator */}
            {contextLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10,
                background: 'rgba(255,107,43,.06)', borderRadius: 10, padding: '6px 10px' }}>
                <div className="ai-spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }} />
                <span style={{ color: T.muted, fontSize: 11 }}>Cargando tu información…</span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="ai-messages">
            {displayMessages.map((msg, i) => (
              <div
                key={i}
                className={msg.role === 'user' ? 'ai-bubble-user' : 'ai-bubble-model'}
              >
                {msg.role === 'model'
                  ? renderContent(msg.text, handleNavigate)
                  : msg.text
                }
              </div>
            ))}

            {thinking && (
              <div className="ai-thinking">
                <div className="ai-dot" />
                <div className="ai-dot" />
                <div className="ai-dot" />
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          {showSuggestions && displayMessages.length <= 1 && (
            <div className="ai-chips">
              {SUGGESTIONS.map(s => (
                <button key={s} className="ai-chip" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form className="ai-input-row" onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              className="ai-textarea"
              rows={1}
              placeholder="Pregúntame lo que necesites…"
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              disabled={thinking || contextLoading}
            />
            <button
              type="submit"
              className="ai-send-btn"
              disabled={thinking || !input.trim() || contextLoading}
            >
              {thinking
                ? <div className="ai-spinner" />
                : <span>➤</span>
              }
            </button>
          </form>
        </div>
      )}
    </>
  );
}