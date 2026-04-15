import { Calendar, User } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

interface BlogMetaRowProps {
    publishedAt?: string | null;
    authorName?: string | null;
    /** Theme color (hex) for date/author row — matches landing page primary. */
    accentColor?: string;
}

export default function BlogMetaRow({ publishedAt, authorName, accentColor }: BlogMetaRowProps) {
    const dateLabel = publishedAt ? formatDate(publishedAt) : '';
    const color = accentColor || '#64748b';

    return (
        <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium"
            style={{ color }}
        >
            {dateLabel && (
                <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden style={{ color }} />
                    {dateLabel}
                </span>
            )}
            {authorName && (
                <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 shrink-0 opacity-90" aria-hidden style={{ color }} />
                    {authorName}
                </span>
            )}
        </div>
    );
}
