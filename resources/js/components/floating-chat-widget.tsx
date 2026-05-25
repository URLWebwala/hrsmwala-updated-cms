import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    MessageCircle,
    Send,
    Search,
    X,
    Minus,
    Maximize2,
    ArrowLeft,
    Paperclip,
    Loader2,
    User as UserIcon,
    Bot,
    Smile,
} from 'lucide-react';
import { getAdminSetting, getImagePath } from '@/utils/helpers';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { cn } from '@/lib/utils';

interface ChatUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    last_message?: {
        body?: string;
        created_at?: string;
        from_id?: number;
    } | null;
    unread_count?: number;
    is_online?: boolean;
}

interface ChatMessage {
    id: number | string;
    from_id: number;
    to_id: number;
    body: string;
    attachment?: string | null;
    created_at: string;
}

const POLL_ONLINE_INTERVAL_MS = 60000;
const POLL_CONTACTS_INTERVAL_MS = 30000;

function formatTimeAgo(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString();
}

function formatTimeHM(iso: string): string {
    try {
        return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '';
    }
}

export default function FloatingChatWidget() {
    const { t } = useTranslation();
    const page = usePage();
    const pageProps = page.props as any;
    const auth = pageProps?.auth;
    // Use Inertia's reactive page URL so the visibility check updates on SPA navigation.
    const currentUrl = page.url || (typeof window !== 'undefined' ? window.location.pathname : '');

    const permissions: string[] = useMemo(() => {
        const p = auth?.user?.permissions;
        return Array.isArray(p) ? p : [];
    }, [auth?.user?.permissions]);

    const canUseMessenger = useMemo(() => {
        if (!auth?.user?.id) return false;
        return permissions.includes('manage-messenger') || auth?.user?.type === 'superadmin';
    }, [auth?.user?.id, auth?.user?.type, permissions]);

    const isOnMessengerPage = currentUrl.includes('/messenger');
    // Show the floating chat-bot ONLY on dashboard pages. We detect dashboards by the
    // Inertia component name (every dashboard renders a component whose name contains
    // "dashboard" — e.g. `dashboard`, `SuperAdminDashboard`, `Hrm/Dashboard/company-dashboard`,
    // `Taskly/Dashboard/CompanyDashboard`, `Lead/Dashboard/UserDashboard`,
    // `Pos/Dashboard/Index`, `SupportTicket/Dashboard/ClientDashboard`, etc.).
    // This is more reliable than URL matching since module dashboards use varied URLs
    // (/hrm, /crm, /pos, /account, /recruitment, /project/dashboard, /dashboard/support-ticket).
    const isOnDashboardPage = /dashboard/i.test(page.component || '');

    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<'list' | 'chat'>('list');
    const [contacts, setContacts] = useState<ChatUser[]>([]);
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageText, setMessageText] = useState('');
    const [contactsLoading, setContactsLoading] = useState(false);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalUnread = useMemo(
        () => contacts.reduce((sum, u) => sum + (u.unread_count || 0), 0),
        [contacts],
    );

    const filteredContacts = useMemo(() => {
        const s = search.trim().toLowerCase();
        const list = !s
            ? contacts
            : contacts.filter(
                  (u) =>
                      u.name?.toLowerCase().includes(s) ||
                      u.email?.toLowerCase().includes(s),
              );
        return [...list].sort((a, b) => {
            const aTime = new Date(a.last_message?.created_at || 0).getTime();
            const bTime = new Date(b.last_message?.created_at || 0).getTime();
            return bTime - aTime;
        });
    }, [contacts, search]);

    const csrfToken = useMemo(() => {
        if (typeof document === 'undefined') return '';
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }, []);

    const chatBgUrl = useMemo(() => {
        const prefix = (pageProps as any)?.imageUrlPrefix as string | undefined;
        const base = prefix
            ? prefix.replace(/storage\/media\/?$/, '')
            : (typeof window !== 'undefined' ? `${window.location.origin}/` : '/');
        return `${base.replace(/\/$/, '')}/assets/images/chat-bg.png`;
    }, [pageProps]);

    const apiHeaders = useMemo(
        () => ({
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json',
        }),
        [],
    );

    const loadContacts = useCallback(async () => {
        if (!canUseMessenger) return;
        setContactsLoading(true);
        try {
            const res = await fetch(route('messenger.contacts'), {
                headers: apiHeaders,
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) setContacts(data as ChatUser[]);
            }
        } catch {
            // silent
        } finally {
            setContactsLoading(false);
        }
    }, [apiHeaders, canUseMessenger]);

    const loadMessages = useCallback(
        async (userId: number) => {
            setMessagesLoading(true);
            try {
                const res = await fetch(`${route('messenger.messages', userId)}?page=1&per_page=20`, {
                    headers: apiHeaders,
                });
                if (!res.ok) return;
                const data = await res.json();
                const list = (data.data || data || []).map((m: any) => ({
                    id: m.id,
                    from_id: m.from_id ?? m.sender_id,
                    to_id: m.to_id ?? m.receiver_id,
                    body: m.body ?? m.message ?? '',
                    attachment: m.attachment ?? null,
                    created_at: m.created_at,
                })) as ChatMessage[];
                setMessages(list);
                setContacts((prev) =>
                    prev.map((u) => (u.id === userId ? { ...u, unread_count: 0 } : u)),
                );
            } catch {
                // silent
            } finally {
                setMessagesLoading(false);
            }
        },
        [apiHeaders],
    );

    useEffect(() => {
        if (!canUseMessenger) return;
        // Initial silent load so the unread badge appears even before the widget is opened
        loadContacts();
    }, [canUseMessenger, loadContacts]);

    useEffect(() => {
        if (!canUseMessenger) return;
        // Poll more frequently while the widget is open, slower while closed (just for badge updates)
        const intervalMs = isOpen ? POLL_CONTACTS_INTERVAL_MS : POLL_CONTACTS_INTERVAL_MS * 2;
        const interval = setInterval(() => {
            loadContacts();
        }, intervalMs);
        return () => clearInterval(interval);
    }, [isOpen, canUseMessenger, loadContacts]);

    useEffect(() => {
        if (!canUseMessenger) return;
        const updateOnline = async () => {
            try {
                const res = await fetch(route('messenger.online-users'), {
                    headers: apiHeaders,
                });
                if (!res.ok) return;
                const onlineUsers = await res.json();
                setContacts((prev) =>
                    prev.map((u) => {
                        const o = onlineUsers.find((x: any) => x.id === u.id);
                        return o ? { ...u, is_online: !!o.is_online } : u;
                    }),
                );
            } catch {
                // silent
            }
        };
        updateOnline();
        const interval = setInterval(updateOnline, POLL_ONLINE_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [canUseMessenger, apiHeaders]);

    useEffect(() => {
        if (!auth?.user?.id || !canUseMessenger) return;
        const pusherKey =
            getAdminSetting('pusher_app_key', pageProps) || (import.meta as any)?.env?.VITE_PUSHER_APP_KEY;
        const pusherCluster =
            getAdminSetting('pusher_app_cluster', pageProps) ||
            (import.meta as any)?.env?.VITE_PUSHER_APP_CLUSTER ||
            'mt1';
        if (!pusherKey) return;
        try {
            const pusher = new Pusher(pusherKey, { cluster: pusherCluster, forceTLS: true });
            const echo = new Echo({ broadcaster: 'pusher', client: pusher });
            const channel = echo.channel(`messenger.${auth.user.id}`);
            channel.listen('MessageSent', (e: any) => {
                const msg = e?.message;
                if (!msg) return;
                const incoming: ChatMessage = {
                    id: msg.id,
                    from_id: msg.from_id,
                    to_id: msg.to_id,
                    body: msg.body || '',
                    attachment: msg.attachment || null,
                    created_at: msg.created_at,
                };
                setContacts((prev) =>
                    prev.map((u) =>
                        u.id === msg.from_id
                            ? {
                                  ...u,
                                  last_message: { body: incoming.body, created_at: incoming.created_at, from_id: msg.from_id },
                                  unread_count:
                                      selectedUser?.id === msg.from_id && isOpen && view === 'chat'
                                          ? 0
                                          : (u.unread_count || 0) + 1,
                              }
                            : u,
                    ),
                );
                if (selectedUser?.id === msg.from_id && view === 'chat') {
                    setMessages((prev) => [...prev, incoming]);
                }
            });
            return () => {
                try {
                    echo.leaveChannel(`messenger.${auth.user.id}`);
                } catch {
                    /* ignore */
                }
            };
        } catch {
            // silent — polling fallback handles updates
        }
    }, [auth?.user?.id, canUseMessenger, pageProps, selectedUser?.id, isOpen, view]);

    useEffect(() => {
        if (view !== 'chat') return;
        const el = messagesEndRef.current;
        if (el) el.scrollIntoView({ behavior: 'auto' });
    }, [messages, view]);

    const handleOpenChat = async (user: ChatUser) => {
        setSelectedUser(user);
        setView('chat');
        setMessages([]);
        await loadMessages(user.id);
    };

    const handleBackToList = () => {
        setView('list');
        setSelectedUser(null);
        setMessages([]);
        setMessageText('');
        setSelectedFile(null);
        setShowEmojiPicker(false);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!selectedUser) return;
        const text = messageText.trim();
        if (!text && !selectedFile) return;

        const tempId = `temp-${Date.now()}`;
        const optimistic: ChatMessage = {
            id: tempId,
            from_id: auth.user.id,
            to_id: selectedUser.id,
            body: text,
            attachment: selectedFile ? `blob:${selectedFile.name}` : null,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimistic]);
        setContacts((prev) =>
            prev.map((u) =>
                u.id === selectedUser.id
                    ? {
                          ...u,
                          last_message: {
                              body: text || '📎 Attachment',
                              created_at: optimistic.created_at,
                              from_id: auth.user.id,
                          },
                      }
                    : u,
            ),
        );
        const fileToSend = selectedFile;
        setMessageText('');
        setSelectedFile(null);
        setShowEmojiPicker(false);
        setSending(true);

        try {
            const formData = new FormData();
            formData.append('receiver_id', String(selectedUser.id));
            if (text) formData.append('message', text);
            if (fileToSend) formData.append('attachment', fileToSend);
            const res = await fetch(route('messenger.send'), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                body: formData,
            });
            if (!res.ok) {
                setMessages((prev) => prev.filter((m) => String(m.id) !== tempId));
            }
        } catch {
            setMessages((prev) => prev.filter((m) => String(m.id) !== tempId));
        } finally {
            setSending(false);
        }
    };

    const handleMaximize = () => {
        if (selectedUser) {
            router.visit(route('messenger.index') + `?user_id=${selectedUser.id}`);
        } else {
            router.visit(route('messenger.index'));
        }
    };

    if (!canUseMessenger || isOnMessengerPage || !isOnDashboardPage) {
        return null;
    }

    const avatarUrl = (u?: ChatUser | null) => {
        if (!u?.avatar) return '';
        try {
            return getImagePath(u.avatar);
        } catch {
            return u.avatar;
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-3 print:hidden" dir="ltr">
            {isOpen && (
                <div className="w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                        <div className="flex items-center gap-2 min-w-0">
                            {view === 'chat' && selectedUser ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleBackToList}
                                        className="p-1 -ml-1 rounded hover:bg-white/15"
                                        aria-label={t('Back')}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                    <Avatar className="h-8 w-8 ring-2 ring-white/30 shrink-0">
                                        {selectedUser.avatar && (
                                            <AvatarImage src={avatarUrl(selectedUser)} alt={selectedUser.name} />
                                        )}
                                        <AvatarFallback className="bg-white/20 text-white text-xs">
                                            {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold truncate">{selectedUser.name}</div>
                                        <div className="text-[11px] opacity-90 flex items-center gap-1">
                                            <span
                                                className={cn(
                                                    'inline-block h-1.5 w-1.5 rounded-full',
                                                    selectedUser.is_online ? 'bg-green-400' : 'bg-gray-300',
                                                )}
                                            />
                                            {selectedUser.is_online ? t('Online') : t('Offline')}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                                        <MessageCircle className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold leading-tight">{t('Messenger')}</div>
                                        <div className="text-[11px] opacity-90">
                                            {totalUnread > 0
                                                ? `${totalUnread} ${t('unread')}`
                                                : t('We are online and ready to help!')}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                type="button"
                                onClick={handleMaximize}
                                className="p-1.5 rounded hover:bg-white/15"
                                title={t('Open full messenger') as string}
                                aria-label={t('Maximize')}
                            >
                                <Maximize2 className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded hover:bg-white/15"
                                title={t('Minimize') as string}
                                aria-label={t('Minimize')}
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    handleBackToList();
                                }}
                                className="p-1.5 rounded hover:bg-white/15"
                                title={t('Close') as string}
                                aria-label={t('Close')}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {view === 'list' && (
                        <div className="flex flex-col flex-1 min-h-0">
                            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={t('Search users...') as string}
                                        className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {contactsLoading && contacts.length === 0 ? (
                                    <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        {t('Loading...')}
                                    </div>
                                ) : filteredContacts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-32 text-sm text-gray-400 px-4 text-center">
                                        <UserIcon className="h-6 w-6 mb-2 opacity-50" />
                                        {search ? t('No users found') : t('No conversations yet')}
                                    </div>
                                ) : (
                                    filteredContacts.map((u) => (
                                        <button
                                            key={u.id}
                                            type="button"
                                            onClick={() => handleOpenChat(u)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 dark:border-gray-800/60 text-left"
                                        >
                                            <div className="relative shrink-0">
                                                <Avatar className="h-10 w-10">
                                                    {u.avatar && <AvatarImage src={avatarUrl(u)} alt={u.name} />}
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        {u.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {u.is_online && (
                                                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                        {u.name}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 shrink-0">
                                                        {formatTimeAgo(u.last_message?.created_at)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {u.last_message?.body || t('No messages yet')}
                                                    </span>
                                                    {(u.unread_count || 0) > 0 && (
                                                        <span className="ml-2 shrink-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
                                                            {u.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {view === 'chat' && selectedUser && (
                        <div
                            className="flex flex-col flex-1 min-h-0"
                            style={{
                                backgroundImage: `url(${chatBgUrl})`,
                                backgroundRepeat: 'repeat',
                                backgroundSize: '320px',
                                backgroundColor: '#efe7dd',
                            }}
                        >
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {messagesLoading ? (
                                    <div className="flex items-center justify-center h-full text-sm text-gray-400">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        {t('Loading messages...')}
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400 px-4 text-center">
                                        <MessageCircle className="h-8 w-8 mb-2 opacity-40" />
                                        {t('No messages yet. Say hi!')}
                                    </div>
                                ) : (
                                    messages.map((m) => {
                                        const mine = m.from_id === auth.user.id;
                                        return (
                                            <div
                                                key={m.id}
                                                className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                                            >
                                                <div
                                                    className={cn(
                                                        'max-w-[78%] px-3 py-2 rounded-2xl text-sm shadow-sm',
                                                        mine
                                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                                            : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-bl-md border border-gray-100 dark:border-gray-700',
                                                    )}
                                                >
                                                    {m.body && (
                                                        <div className="whitespace-pre-wrap break-words">{m.body}</div>
                                                    )}
                                                    {m.attachment && !String(m.attachment).startsWith('blob:') && (
                                                        <a
                                                            href={m.attachment}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className={cn(
                                                                'flex items-center gap-1 mt-1 text-xs underline',
                                                                mine ? 'text-primary-foreground/90' : 'text-primary',
                                                            )}
                                                        >
                                                            <Paperclip className="h-3 w-3" />
                                                            {t('Attachment')}
                                                        </a>
                                                    )}
                                                    <div
                                                        className={cn(
                                                            'text-[10px] mt-1 opacity-70',
                                                            mine ? 'text-white' : 'text-gray-500',
                                                        )}
                                                    >
                                                        {formatTimeHM(m.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form
                                onSubmit={handleSend}
                                className="relative border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 py-2"
                            >
                                {showEmojiPicker && (
                                    <EmojiPicker
                                        onEmojiSelect={(emoji) => {
                                            setMessageText((prev) => prev + emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                        className="absolute bottom-full right-2 mb-2 z-30"
                                    />
                                )}
                                {selectedFile && (
                                    <div className="mb-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-between text-xs">
                                        <span className="truncate flex items-center gap-1">
                                            <Paperclip className="h-3 w-3" /> {selectedFile.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedFile(null)}
                                            className="text-gray-400 hover:text-red-500"
                                            aria-label={t('Remove')}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-gray-400 hover:text-primary"
                                        aria-label={t('Attach file')}
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setSelectedFile(file);
                                            e.target.value = '';
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        placeholder={t('Type a message...') as string}
                                        className="flex-1 px-3 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        disabled={sending}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker((p) => !p)}
                                        className={cn(
                                            'p-2 transition-colors',
                                            showEmojiPicker ? 'text-primary' : 'text-gray-400 hover:text-primary',
                                        )}
                                        aria-label={t('Insert emoji') as string}
                                        title={t('Insert emoji') as string}
                                    >
                                        <Smile className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={sending || (!messageText.trim() && !selectedFile)}
                                        className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
                                        aria-label={t('Send')}
                                    >
                                        {sending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={cn(
                    'group relative h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30',
                    isOpen
                        ? 'bg-gray-700 text-white hover:bg-gray-800'
                        : 'chat-bot-fab bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground',
                )}
                aria-label={isOpen ? (t('Close chat') as string) : (t('Open chat') as string)}
                title={isOpen ? (t('Close chat') as string) : (t('Open chat') as string)}
            >
                {/* Pulse rings (only when closed) */}
                {!isOpen && (
                    <>
                        <span className="pointer-events-none absolute inset-0 rounded-full bg-primary/40 animate-chat-bot-ping" />
                        <span className="pointer-events-none absolute inset-0 rounded-full bg-primary/30 animate-chat-bot-ping [animation-delay:1s]" />
                    </>
                )}

                {/* Icon: bot face when closed, X when open */}
                {isOpen ? (
                    <X className="h-6 w-6 relative z-10" />
                ) : (
                    <span className="relative z-10 animate-chat-bot-bob inline-flex items-center justify-center">
                        {/* Antenna */}
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <span className="h-2 w-0.5 bg-primary-foreground/80 rounded-full" />
                            <span className="h-1.5 w-1.5 -mt-0.5 rounded-full bg-yellow-300 shadow-[0_0_6px_rgba(253,224,71,0.9)] animate-chat-bot-blink" />
                        </span>
                        {/* Bot face */}
                        <Bot className="h-7 w-7 transition-transform duration-300 group-hover:rotate-[-6deg]" strokeWidth={2.2} />
                    </span>
                )}

                {/* Unread badge */}
                {!isOpen && totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white z-20 animate-bounce">
                        {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                )}
            </button>
        </div>
    );
}
