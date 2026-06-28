import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, PenSquare, X, Search } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// ── New Conversation picker ───────────────────────────────────────────────────
function NewConversationPanel({ onSelect, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/messages/contacts')
      .then(({ data }) => setContacts(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = contacts.filter((c) =>
    c.FullName.toLowerCase().includes(query.toLowerCase()) ||
    (c.SubjectSpecialty || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="absolute inset-0 bg-zinc-900 z-10 flex flex-col rounded-l-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <h3 className="font-semibold text-navy text-sm">New Message</h3>
        <button onClick={onClose} className="text-zinc-500 hover:text-navy">
          <X size={18} />
        </button>
      </div>

      <div className="px-3 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
          <Search size={14} className="text-zinc-500" />
          <input
            autoFocus
            type="text"
            placeholder="Search by name or subject…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 text-zinc-300 placeholder-zinc-500"
          />
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto">
        {loading && <li className="text-center text-zinc-500 text-sm py-8">Loading…</li>}
        {!loading && filtered.length === 0 && (
          <li className="text-center text-zinc-500 text-sm py-8">No contacts found.</li>
        )}
        {filtered.map((c) => (
          <li key={c.UserID}>
            <button
              onClick={() => onSelect(c)}
              className="w-full text-left px-4 py-3 hover:bg-primary-light transition border-b border-zinc-800"
            >
              <p className="text-sm font-medium text-zinc-100">{c.FullName}</p>
              {c.SubjectSpecialty && (
                <p className="text-xs text-primary">{c.SubjectSpecialty}</p>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Conversation list sidebar ─────────────────────────────────────────────────
function Sidebar({ conversations, activeId, onSelect, onNew }) {
  return (
    <div className="relative flex flex-col w-full h-full">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="font-semibold text-zinc-100">Messages</h2>
        <button
          onClick={onNew}
          title="New conversation"
          className="text-primary hover:text-primary-dark transition"
        >
          <PenSquare size={18} />
        </button>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 text-sm p-8 text-center gap-3">
          <MessageSquare size={32} />
          <p>No conversations yet.</p>
          <button
            onClick={onNew}
            className="bg-primary hover:bg-primary-dark text-black text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            Start a conversation
          </button>
        </div>
      ) : (
        <ul className="overflow-y-auto flex-1">
          {conversations.map((c) => (
            <li key={c.UserID}>
              <button
                onClick={() => onSelect(c.UserID)}
                className={`w-full text-left px-4 py-3 hover:bg-zinc-800 transition border-b border-zinc-800 ${activeId === c.UserID ? 'bg-primary-light' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-100 text-sm truncate">{c.FullName}</span>
                  {c.UnreadCount > 0 && (
                    <span className="ml-2 bg-primary text-black text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0">
                      {c.UnreadCount}
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 text-xs truncate mt-0.5">{c.LastMessage || '…'}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Chat thread ───────────────────────────────────────────────────────────────
function Thread({ otherId, currentUserId, onBack, onMessageSent }) {
  const [data, setData]       = useState(null);
  const [text, setText]       = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError]     = useState('');
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  const load = useCallback(() => {
    api.get(`/messages/${otherId}`).then(({ data: d }) => {
      setData(d);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }).catch(() => setData({ messages: [], other: null }));
  }, [otherId]);

  useEffect(() => {
    setData(null);
    setText('');
    setError('');
    load();
  }, [load]);

  // Focus input whenever thread is ready
  useEffect(() => {
    if (data) inputRef.current?.focus();
  }, [data]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError('');
    try {
      await api.post('/messages/', { receiverId: otherId, body: text.trim() });
      setText('');
      load();
      onMessageSent?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="md:hidden text-zinc-400 hover:text-zinc-300">
          <ArrowLeft size={20} />
        </button>
        {data?.other ? (
          <div>
            <p className="font-semibold text-zinc-100 text-sm">{data.other.FullName}</p>
            <p className="text-xs text-primary">{data.other.UserRole}</p>
          </div>
        ) : (
          <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black min-h-0">
        {!data && (
          <p className="text-center text-zinc-500 text-sm pt-8">Loading…</p>
        )}
        {data?.messages.length === 0 && (
          <p className="text-center text-zinc-500 text-sm pt-8">
            No messages yet — say hello!
          </p>
        )}
        {data?.messages.map((m) => {
          const mine = m.SenderID === currentUserId;
          return (
            <div key={m.MessageID} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm break-words ${
                mine
                  ? 'bg-primary text-black rounded-br-sm'
                  : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-bl-sm shadow-sm'
              }`}>
                <p>{m.Body}</p>
                <p className={`text-xs mt-1 ${mine ? 'text-primary-light' : 'text-zinc-500'}`}>
                  {new Date(m.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar — always visible */}
      <form onSubmit={send} className="p-3 border-t border-zinc-800 bg-zinc-900 flex gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message…"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-zinc-100 focus:ring-2 focus:ring-primary outline-none"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-primary hover:bg-primary-dark text-black p-2.5 rounded-full transition disabled:opacity-40 shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
      {error && <p className="text-red-400 text-xs px-4 pb-2">{error}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MessagesPage() {
  const { user }               = useAuth();
  const { userId }             = useParams();
  const navigate               = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId]           = useState(userId ? Number(userId) : null);
  const [showNewPanel, setShowNewPanel]   = useState(false);

  const loadConversations = useCallback(() => {
    api.get('/messages/conversations').then(({ data }) => setConversations(data));
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Sync activeId when the URL param changes (e.g. navigating from tutor profile)
  useEffect(() => {
    if (userId) setActiveId(Number(userId));
  }, [userId]);

  const selectContact = (id) => {
    setActiveId(id);
    setShowNewPanel(false);
    navigate(`/messages/${id}`, { replace: true });
  };

  const handleBack = () => {
    setActiveId(null);
    navigate('/messages', { replace: true });
  };

  const showThread = activeId !== null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div
        className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden flex"
        style={{ height: 'calc(100vh - 120px)' }}
      >
        {/* Sidebar */}
        <div
          className={`relative border-r border-zinc-800 flex-col ${
            showThread ? 'hidden md:flex md:w-72' : 'flex w-full md:w-72'
          }`}
        >
          <Sidebar
            conversations={conversations}
            activeId={activeId}
            onSelect={selectContact}
            onNew={() => setShowNewPanel(true)}
          />
          {showNewPanel && (
            <NewConversationPanel
              onSelect={(c) => selectContact(c.UserID)}
              onClose={() => setShowNewPanel(false)}
            />
          )}
        </div>

        {/* Thread panel */}
        {showThread ? (
          <Thread
            key={activeId}
            otherId={activeId}
            currentUserId={user?.id}
            onBack={handleBack}
            onMessageSent={loadConversations}
          />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-zinc-500 flex-col gap-3">
            <MessageSquare size={40} />
            <p className="text-sm">Select a conversation or start a new one</p>
            <button
              onClick={() => setShowNewPanel(true)}
              className="bg-primary hover:bg-primary-dark text-black text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              New Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
