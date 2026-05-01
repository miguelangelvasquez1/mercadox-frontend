'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { chatService, ConversationSummaryDto } from '@/lib/services/chatService';
import { useAdminConversation } from '@/lib/hooks/useChat';

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
  red:        '#f87171',
  fontDisplay:'"Syne", system-ui, sans-serif',
  fontBody:   '"DM Sans", system-ui, sans-serif',
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; color: ${T.text}; font-family: ${T.fontBody}; }

  .ac-layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    height: calc(100vh - 64px);
    overflow: hidden;
  }

  .ac-sidebar {
    border-right: 1px solid ${T.border};
    display: flex; flex-direction: column;
    background: ${T.surface}; overflow: hidden;
  }

  .ac-sidebar-header {
    padding: 18px 18px 14px;
    border-bottom: 1px solid ${T.border};
    flex-shrink: 0;
  }

  .ac-conv-list {
    flex: 1; overflow-y: auto;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.06) transparent;
  }

  .ac-conv-item {
    padding: 13px 16px; cursor: pointer;
    border-bottom: 1px solid rgba(255,255,255,.04);
    transition: background .15s;
    display: flex; gap: 12px; align-items: flex-start;
  }
  .ac-conv-item:hover { background: rgba(255,255,255,.03); }
  .ac-conv-item.active { background: rgba(255,107,43,.07); border-left: 3px solid ${T.accent}; }
  .ac-conv-item.active { padding-left: 13px; }

  .ac-avatar {
    width: 38px; height: 38px; border-radius: 11px;
    background: linear-gradient(135deg, #ff6b2b22, #ff9d5c22);
    border: 1px solid rgba(255,107,43,.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0; color: ${T.accentSoft};
    font-weight: 700; font-family: ${T.fontDisplay};
  }

  .ac-unread-dot {
    min-width: 19px; height: 19px; border-radius: 10px;
    background: ${T.accent}; color: #fff; font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px; flex-shrink: 0;
  }

  .ac-main {
    display: flex; flex-direction: column; overflow: hidden;
    background: ${T.bg};
  }

  .ac-main-header {
    padding: 16px 24px; border-bottom: 1px solid ${T.border};
    background: ${T.surface}; flex-shrink: 0;
    display: flex; align-items: center; gap: 14px;
  }

  .ac-messages {
    flex: 1; overflow-y: auto; padding: 20px 24px;
    display: flex; flex-direction: column; gap: 12px;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.06) transparent;
  }

  .ac-bubble-admin {
    align-self: flex-end; max-width: 65%;
    background: linear-gradient(135deg,#ff6b2b,#ff9d5c);
    color: #fff; border-radius: 18px 18px 4px 18px;
    padding: 10px 14px; font-size: 14px; line-height: 1.55;
    box-shadow: 0 4px 14px rgba(255,107,43,.25);
  }

  .ac-bubble-user {
    align-self: flex-start; max-width: 65%;
    background: ${T.surface}; border: 1px solid ${T.border};
    color: ${T.text}; border-radius: 18px 18px 18px 4px;
    padding: 10px 14px; font-size: 14px; line-height: 1.55;
  }

  .ac-ts {
    color: ${T.muted}; font-size: 10px; margin-top: 4px;
  }

  .ac-input-row {
    display: flex; gap: 10px; padding: 14px 24px;
    border-top: 1px solid ${T.border}; background: ${T.surface};
    flex-shrink: 0;
  }

  .ac-textarea {
    flex: 1; background: ${T.bg}; border: 1px solid ${T.border};
    border-radius: 14px; color: ${T.text}; font-family: ${T.fontBody};
    font-size: 14px; padding: 11px 15px; resize: none; outline: none;
    transition: border-color .2s;
  }
  .ac-textarea:focus { border-color: rgba(255,107,43,.4); }

  .ac-send-btn {
    padding: 0 20px; height: 44px; border-radius: 13px;
    background: linear-gradient(135deg,#ff6b2b,#ff9d5c);
    border: none; color: #fff; font-size: 14px; font-weight: 600;
    font-family: ${T.fontBody}; cursor: pointer;
    transition: opacity .2s, transform .15s;
    box-shadow: 0 4px 16px rgba(255,107,43,.3);
    display: flex; align-items: center; gap: 8px;
    align-self: flex-end;
  }
  .ac-send-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
  .ac-send-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(255,107,43,.4); }

  .ac-empty-state {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: ${T.muted}; gap: 12px; padding: 32px;
  }

  .ac-search {
    width: 100%; background: ${T.surface2}; border: 1px solid ${T.border};
    border-radius: 12px; color: ${T.text}; font-family: ${T.fontBody};
    font-size: 13px; padding: 9px 13px; outline: none;
    transition: border-color .2s;
  }
  .ac-search:focus { border-color: rgba(255,107,43,.35); }

  .ac-spinner {
    width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.25);
    border-top-color: #fff; border-radius: 50%;
    animation: spin .7s linear infinite; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 700px) {
    .ac-layout { grid-template-columns: 1fr; }
    .ac-sidebar { display: none; }
    .ac-sidebar.show { display: flex; position: fixed; inset: 0; z-index: 50; }
  }
`;

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
}

function formatTimeFull(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function initials(name?: string | null) {
  if (!name?.trim()) return '?';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0] ?? '')
    .join('')
    .toUpperCase();
}

export default function AdminChatPage() {
  const [conversations, setConversations]     = useState<ConversationSummaryDto[]>([]);
  const [selectedId, setSelectedId]           = useState<number | null>(null);
  const [loadingList, setLoadingList]         = useState(true);
  const [searchQuery, setSearchQuery]         = useState('');
  const [message, setMessage]                 = useState('');
  const bottomRef                             = useRef<HTMLDivElement>(null);

  const { conversation, loading: loadingConv, sending, error, sendMessage, markAsRead } =
    useAdminConversation(selectedId);

  // Load conversation list + poll
  const loadList = useCallback(async () => {
    try {
      const res = await chatService.getAllConversations(0, 50);
      setConversations(res.content);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    loadList().finally(() => setLoadingList(false));
    const interval = setInterval(loadList, 4000);
    return () => clearInterval(interval);
  }, [loadList]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages?.length]);

  // Mark as read when selecting a conversation
  useEffect(() => {
    if (selectedId) markAsRead();
  }, [selectedId, conversation?.messages?.length, markAsRead]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    const content = message;
    setMessage('');
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as unknown as FormEvent); }
  };

  const filtered = conversations.filter(c =>
    !searchQuery ||
    c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadByAdmin, 0);

  return (
    <div style={{ height: 'calc(100vh - 64px)', overflow: 'hidden', background: T.bg }}>
      <style>{STYLES}</style>

      <div className="ac-layout">

        {/* ── Sidebar ── */}
        <div className="ac-sidebar">
          <div className="ac-sidebar-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h2 style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: '1.1rem', marginBottom: 2 }}>
                  Chats
                </h2>
                <p style={{ color: T.muted, fontSize: 12 }}>
                  {totalUnread > 0 ? `${totalUnread} sin leer` : 'Todo leído'}
                </p>
              </div>
              {totalUnread > 0 && (
                <span className="ac-unread-dot">{totalUnread > 99 ? '99+' : totalUnread}</span>
              )}
            </div>

            <input
              className="ac-search"
              placeholder="🔍  Buscar usuario..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="ac-conv-list">
            {loadingList ? (
              [1,2,3,4,5].map(i => (
                <div key={i} style={{
                  margin: '8px 12px', height: 60, borderRadius: 12,
                  background: T.surface2, opacity: 0.6,
                }} />
              ))
            ) : filtered.length === 0 ? (
              <div style={{ color: T.muted, fontSize: 13, textAlign: 'center', padding: '32px 16px' }}>
                {searchQuery ? 'Sin resultados.' : 'Sin conversaciones aún.'}
              </div>
            ) : (
              filtered.map(conv => (
                <div
                  key={conv.id}
                  className={`ac-conv-item ${selectedId === conv.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(conv.id)}
                >
                  <div className="ac-avatar">{initials(conv.userName)}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.userName}
                      </span>
                      <span style={{ color: T.muted, fontSize: 10, flexShrink: 0, marginLeft: 6 }}>
                        {formatDate(conv.updatedAt)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: T.muted, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {conv.lastMessage
                          ? (conv.lastMessage.senderRole === 'ADMIN' ? '🛡️ ' : '') + conv.lastMessage.content
                          : 'Sin mensajes aún'}
                      </span>
                      {conv.unreadByAdmin > 0 && (
                        <span className="ac-unread-dot" style={{ marginLeft: 6 }}>
                          {conv.unreadByAdmin > 9 ? '9+' : conv.unreadByAdmin}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Main area ── */}
        <div className="ac-main">
          {!selectedId ? (
            <div className="ac-empty-state">
              <div style={{ fontSize: 48 }}>💬</div>
              <div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: '1.2rem', color: T.text }}>
                Selecciona una conversación
              </div>
              <div style={{ fontSize: 14, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
                Elige un chat del panel izquierdo para responder a los usuarios.
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="ac-main-header">
                <div style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(255,107,43,.15), rgba(255,157,92,.15))',
                  border: '1px solid rgba(255,107,43,.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 14, color: T.accentSoft,
                }}>
                  {conversation ? initials(conversation.userName) : '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 15, color: T.text }}>
                    {conversation?.userName ?? '…'}
                  </div>
                  <div style={{ color: T.muted, fontSize: 12 }}>{conversation?.userEmail ?? ''}</div>
                </div>
                {conversation?.unreadByAdmin! > 0 && (
                  <span style={{
                    background: 'rgba(248,113,113,.12)', border: '1px solid rgba(248,113,113,.25)',
                    color: T.red, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  }}>
                    {conversation!.unreadByAdmin} sin leer
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="ac-messages">
                {loadingConv ? (
                  <div style={{ color: T.muted, textAlign: 'center', marginTop: 32 }}>Cargando…</div>
                ) : !conversation?.messages?.length ? (
                  <div style={{ color: T.muted, textAlign: 'center', marginTop: 48, fontSize: 14 }}>
                    Aún no hay mensajes en esta conversación.
                  </div>
                ) : (
                  conversation.messages.map((msg) => (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column',
                      alignItems: msg.senderRole === 'ADMIN' ? 'flex-end' : 'flex-start' }}>
                      {msg.senderRole === 'USER' && (
                        <div style={{ color: T.muted, fontSize: 10, marginBottom: 3, paddingLeft: 4 }}>
                          👤 {msg.senderName ?? 'Usuario'}
                        </div>
                      )}
                      <div className={msg.senderRole === 'ADMIN' ? 'ac-bubble-admin' : 'ac-bubble-user'}>
                        {msg.content}
                      </div>
                      <div className="ac-ts" style={{ textAlign: msg.senderRole === 'ADMIN' ? 'right' : 'left' }}>
                        {formatTimeFull(msg.createdAt)}
                        {msg.senderRole === 'ADMIN' && (
                          <span style={{ marginLeft: 5 }}>
                            {msg.readByOther ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {error && (
                  <div style={{ color: T.red, fontSize: 12, textAlign: 'center' }}>{error}</div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form className="ac-input-row" onSubmit={handleSend}>
                <textarea
                  className="ac-textarea"
                  rows={2}
                  placeholder="Escribe una respuesta al cliente…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button type="submit" className="ac-send-btn" disabled={sending || !message.trim()}>
                  {sending ? <div className="ac-spinner" /> : <>Enviar ➤</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}