import { useEffect, useMemo, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getAdminSetting } from '@/utils/helpers';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sound_url?: string | null;
  sound_volume?: number;
}

export default function HeaderNotifications() {
  const { t } = useTranslation();
  const pageProps = usePage().props as any;
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const lastSeenIdRef = useRef<number>(0);

  const unreadCount = useMemo(() => items.filter((item) => !item.is_read).length, [items]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(route('web.notifications.index', { limit: 15 }), {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      if (!response.ok) return;
      const json = await response.json();
      const list: NotificationItem[] = json?.data?.data || [];

      const latestId = list[0]?.id ?? 0;
      if (latestId > lastSeenIdRef.current && lastSeenIdRef.current !== 0) {
        const newest = list.find((item) => item.id === latestId);
        if (newest) {
          toast(newest.title, { description: newest.message });
          await tryPlayNotificationSound();
        }
      }
      lastSeenIdRef.current = latestId;
      setItems(list);
    } catch {
      // Fail silently in header polling.
    }
  };

  const playNotificationSound = async (soundUrl?: string | null, soundVolume?: number) => {
    if (!soundUrl) return;
    try {
      const audio = new Audio(soundUrl);
      audio.volume = Math.max(0, Math.min(1, Number(soundVolume ?? 1)));
      await audio.play();
    } catch {
      // Sound is best-effort.
    }
  };

  const tryPlayNotificationSound = async () => {
    try {
      const response = await fetch(route('web.sound-settings.index'), {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      if (!response.ok) return;
      const json = await response.json();
      const sounds = Array.isArray(json?.data) ? json.data : [];
      const sound = sounds.find((s: any) => s.type === 'notification' && s.is_active && s.file_path);
      if (!sound?.file_path) return;

      await playNotificationSound(`/storage/${sound.file_path}`, Number(sound.volume ?? 1));
    } catch {
      // Sound is optional.
    }
  };

  const markRead = async (id: number) => {
    try {
      await fetch(route('web.notifications.mark-read'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)));
    } catch {
      // Ignore network failures for optimistic UX.
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(route('web.notifications.mark-all-read'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      await fetch(route('web.notifications.clear-read'), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      setItems([]);
    } catch {
      // Ignore.
    }
  };

  useEffect(() => {
    void fetchNotifications();
    const timer = setInterval(() => void fetchNotifications(), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const authUserId = pageProps?.auth?.user?.id;
    if (!authUserId) return;

    const pusherKey = getAdminSetting('pusher_app_key', pageProps) || import.meta.env.VITE_PUSHER_APP_KEY;
    const pusherCluster = getAdminSetting('pusher_app_cluster', pageProps) || import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1';
    if (!pusherKey) return;

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        forceTLS: true,
        authEndpoint: '/broadcasting/auth',
        auth: { headers: { 'X-CSRF-TOKEN': csrfToken } },
      });
      const echo = new Echo({ broadcaster: 'pusher', client: pusher });

      echo.private(`private-user.${authUserId}`).listen('.notification.created', async (e: any) => {
        const incoming: NotificationItem = {
          id: e.id,
          type: e.type,
          title: e.title,
          message: e.message,
          is_read: false,
          created_at: e.created_at,
          sound_url: e.sound_url,
          sound_volume: e.sound_volume,
        };
        setItems((prev) => [incoming, ...prev.filter((x) => x.id !== incoming.id)].slice(0, 15));
        toast(incoming.title, { description: incoming.message });
        if (incoming.sound_url) {
          await playNotificationSound(incoming.sound_url, incoming.sound_volume);
        } else {
          await tryPlayNotificationSound();
        }
      });

      return () => {
        echo.leaveChannel(`private-user.${authUserId}`);
      };
    } catch {
      // Realtime is optional; polling still works.
      return;
    }
  }, [pageProps?.auth?.user?.id]);

  useEffect(() => {
    if (isOpen) {
      void fetchNotifications();
    }
  }, [isOpen]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-red-600 text-[10px] text-white px-1 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t('Notifications')}</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={markAllRead}>
              {t('Mark all read')}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <DropdownMenuItem className="text-muted-foreground">{t('No notifications')}</DropdownMenuItem>
        ) : (
          items.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className={`flex flex-col items-start gap-1 py-2 ${item.is_read ? 'opacity-70' : ''}`}
              onClick={() => markRead(item.id)}
            >
              <div className="w-full flex items-start justify-between gap-2">
                <span className="font-medium text-sm leading-tight">{item.title}</span>
                {!item.is_read && <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />}
              </div>
              <span className="text-xs text-muted-foreground line-clamp-2">{item.message}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(item.created_at).toLocaleString()}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

