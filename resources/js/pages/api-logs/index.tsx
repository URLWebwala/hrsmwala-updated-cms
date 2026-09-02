import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Pagination } from "@/components/ui/pagination";
import { PerPageSelector } from '@/components/ui/per-page-selector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import NoRecordsFound from '@/components/no-records-found';
import { 
    Activity, 
    AlertTriangle, 
    Flame, 
    Zap, 
    Clock, 
    Search, 
    RefreshCw, 
    Trash2, 
    Eye, 
    Copy, 
    Check, 
    ServerCrash, 
    ShieldAlert, 
    Filter, 
    X,
    User,
    Globe,
    Code,
    FileText,
    Layers,
    Timer
} from "lucide-react";
import { formatDateTime } from '@/utils/helpers';

interface ApiLogItem {
    id: number;
    method: string;
    url: string;
    route_name?: string | null;
    status_code: number;
    status_text?: string | null;
    duration_ms: number;
    ip_address?: string | null;
    user_id?: number | null;
    user_name?: string | null;
    user_email?: string | null;
    request_headers?: Record<string, any> | null;
    request_body?: Record<string, any> | null;
    response_body?: string | null;
    error_message?: string | null;
    error_trace?: string | null;
    is_slow: boolean;
    is_failed: boolean;
    created_at: string;
}

interface ApiLogsPageProps {
    logs: {
        data: ApiLogItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: any[];
    };
    stats: {
        total_logs: number;
        total_errors: number;
        total_crashes: number;
        total_slow: number;
        avg_duration_ms: number;
        max_duration_ms: number;
    };
    filters: {
        search: string;
        type: string;
        method: string;
        status_code: string;
        date: string;
        sort: string;
        direction: string;
        per_page: number;
    };
    auth: any;
    [key: string]: unknown;
}

export default function ApiLogsIndex() {
    const { t } = useTranslation();
    const { logs, stats, filters } = usePage<ApiLogsPageProps>().props;

    // Filter states
    const [search, setSearch] = useState(filters.search || '');
    const [filterType, setFilterType] = useState(filters.type || 'all');
    const [method, setMethod] = useState(filters.method || 'all');
    const [statusCode, setStatusCode] = useState(filters.status_code || 'all');
    const [date, setDate] = useState(filters.date || '');
    const [perPage, setPerPage] = useState(String(filters.per_page || 15));

    // Modal inspection state
    const [selectedLog, setSelectedLog] = useState<ApiLogItem | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'error' | 'payload' | 'headers' | 'response'>('overview');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Delete single log dialog
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Clear logs dialog
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
    const [clearDays, setClearDays] = useState<'all' | '7' | '30'>('all');

    const applyFilters = (newFilters: Partial<typeof filters> = {}) => {
        const queryParams = {
            search: search,
            type: filterType,
            method: method !== 'all' ? method : '',
            status_code: statusCode !== 'all' ? statusCode : '',
            date: date,
            per_page: perPage,
            ...newFilters
        };

        router.get(route('api-logs.index'), queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleTypeChange = (type: string) => {
        setFilterType(type);
        applyFilters({ type });
    };

    const handleResetFilters = () => {
        setSearch('');
        setFilterType('all');
        setMethod('all');
        setStatusCode('all');
        setDate('');
        router.get(route('api-logs.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        router.delete(route('api-logs.destroy', deleteId), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleteDialogOpen(false);
                setDeleteId(null);
                if (selectedLog?.id === deleteId) {
                    setSelectedLog(null);
                }
            }
        });
    };

    const handleClearLogs = () => {
        const data = clearDays === 'all' ? {} : { days: clearDays };
        router.post(route('api-logs.clear'), data, {
            preserveScroll: true,
            onSuccess: () => {
                setIsClearDialogOpen(false);
            }
        });
    };

    // Helper to format Method Badge
    const getMethodBadge = (m: string) => {
        switch (m.toUpperCase()) {
            case 'GET':
                return <Badge className="bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800 font-mono font-bold">GET</Badge>;
            case 'POST':
                return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-mono font-bold">POST</Badge>;
            case 'PUT':
            case 'PATCH':
                return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-mono font-bold">{m.toUpperCase()}</Badge>;
            case 'DELETE':
                return <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-mono font-bold">DELETE</Badge>;
            default:
                return <Badge variant="outline" className="font-mono">{m}</Badge>;
        }
    };

    // Helper to format Status Badge
    const getStatusBadge = (code: number, text?: string | null) => {
        if (code >= 500) {
            return (
                <Badge className="bg-rose-600 text-white font-mono font-bold shadow-sm shadow-rose-500/20">
                    <ServerCrash className="w-3 h-3 mr-1" />
                    {code} {text ? `(${text})` : ''}
                </Badge>
            );
        }
        if (code >= 400) {
            return (
                <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400 dark:border-amber-700 font-mono font-bold">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {code} {text ? `(${text})` : ''}
                </Badge>
            );
        }
        return (
            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-mono font-bold">
                <Check className="w-3 h-3 mr-1" />
                {code} OK
            </Badge>
        );
    };

    // Helper to format Duration Badge
    const getDurationBadge = (ms: number, isSlow: boolean) => {
        if (ms >= 1500) {
            return (
                <span className="inline-flex items-center gap-1 font-mono font-semibold text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                    <Flame className="w-3 h-3 text-rose-500 animate-pulse" />
                    {ms} ms
                </span>
            );
        }
        if (ms >= 800 || isSlow) {
            return (
                <span className="inline-flex items-center gap-1 font-mono font-semibold text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <Timer className="w-3 h-3 text-amber-500" />
                    {ms} ms
                </span>
            );
        }
        if (ms >= 300) {
            return (
                <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {ms} ms
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Zap className="w-3 h-3 text-emerald-500" />
                {ms} ms
            </span>
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('API Logs & Performance Monitor')} />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                <Activity className="w-6 h-6 text-primary animate-pulse" />
                                {t('API Logs & Performance Monitor')}
                            </h1>
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('Real-time tracking of failed API endpoints, slow response times (>800ms), server crashes, and execution latencies.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => router.reload()}
                            className="flex items-center gap-1.5"
                        >
                            <RefreshCw className="w-4 h-4" />
                            {t('Refresh')}
                        </Button>
                        <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => setIsClearDialogOpen(true)}
                            className="flex items-center gap-1.5"
                        >
                            <Trash2 className="w-4 h-4" />
                            {t('Purge Logs')}
                        </Button>
                    </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-border/60 bg-gradient-to-br from-rose-500/5 via-background to-background shadow-sm hover:shadow transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('Total Failed (4xx/5xx)')}
                            </CardTitle>
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                <ShieldAlert className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                                {stats.total_errors.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.total_logs > 0 ? `${((stats.total_errors / stats.total_logs) * 100).toFixed(1)}% error rate` : '0%'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-gradient-to-br from-amber-500/5 via-background to-background shadow-sm hover:shadow transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('Server 500 Crashes')}
                            </CardTitle>
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <ServerCrash className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                                {stats.total_crashes.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('Uncaught exceptions & crashes')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-gradient-to-br from-orange-500/5 via-background to-background shadow-sm hover:shadow transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('Slow APIs (>800ms)')}
                            </CardTitle>
                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <Flame className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 font-mono">
                                {stats.total_slow.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('High latency bottlenecks')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-gradient-to-br from-sky-500/5 via-background to-background shadow-sm hover:shadow transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {t('Avg Latency (ms)')}
                            </CardTitle>
                            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
                                <Zap className="w-4 h-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400 font-mono">
                                {stats.avg_duration_ms} <span className="text-xs text-muted-foreground font-normal">ms</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('Max peak')}: <span className="font-mono font-medium">{stats.max_duration_ms} ms</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-4 space-y-4">
                        {/* Quick Filter Pill Tabs */}
                        <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-3">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1">
                                <Filter className="w-3.5 h-3.5" /> {t('Filter')}:
                            </span>
                            <button
                                onClick={() => handleTypeChange('all')}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                                    filterType === 'all' 
                                        ? 'bg-primary text-primary-foreground shadow-sm' 
                                        : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                {t('All Logs')}
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-background/20 font-mono">
                                    {stats.total_logs}
                                </span>
                            </button>
                            <button
                                onClick={() => handleTypeChange('errors')}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                                    filterType === 'errors' 
                                        ? 'bg-rose-600 text-white shadow-sm' 
                                        : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20'
                                }`}
                            >
                                <AlertTriangle className="w-3 h-3" />
                                {t('Failed & Errors (4xx/5xx)')}
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 dark:bg-white/20 font-mono">
                                    {stats.total_errors}
                                </span>
                            </button>
                            <button
                                onClick={() => handleTypeChange('crashes')}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                                    filterType === 'crashes' 
                                        ? 'bg-amber-600 text-white shadow-sm' 
                                        : 'bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20'
                                }`}
                            >
                                <ServerCrash className="w-3 h-3" />
                                {t('500 Crashes')}
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 dark:bg-white/20 font-mono">
                                    {stats.total_crashes}
                                </span>
                            </button>
                            <button
                                onClick={() => handleTypeChange('slow')}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                                    filterType === 'slow' 
                                        ? 'bg-orange-600 text-white shadow-sm' 
                                        : 'bg-orange-500/10 text-orange-700 dark:text-orange-300 hover:bg-orange-500/20'
                                }`}
                            >
                                <Flame className="w-3 h-3" />
                                {t('Slow APIs (>800ms)')}
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 dark:bg-white/20 font-mono">
                                    {stats.total_slow}
                                </span>
                            </button>
                            <button
                                onClick={() => handleTypeChange('success')}
                                className={`px-3 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                                    filterType === 'success' 
                                        ? 'bg-emerald-600 text-white shadow-sm' 
                                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                                }`}
                            >
                                <Check className="w-3 h-3" />
                                {t('Success (2xx)')}
                            </button>
                        </div>

                        {/* Search & Detail Dropdown Filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                            <form onSubmit={handleSearchSubmit} className="md:col-span-2 relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('Search URL, error message, user or IP...')}
                                    className="pl-9 pr-9"
                                />
                                {search && (
                                    <button 
                                        type="button" 
                                        onClick={() => { setSearch(''); applyFilters({ search: '' }); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </form>

                            <div>
                                <Select value={method} onValueChange={(val) => { setMethod(val); applyFilters({ method: val }); }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('HTTP Method')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Methods')}</SelectItem>
                                        <SelectItem value="GET">GET</SelectItem>
                                        <SelectItem value="POST">POST</SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                        <SelectItem value="DELETE">DELETE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => { setDate(e.target.value); applyFilters({ date: e.target.value }); }}
                                    className="w-full text-xs"
                                    placeholder={t('Select Date')}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={handleResetFilters}
                                    className="w-full text-xs"
                                >
                                    <X className="w-3.5 h-3.5 mr-1" />
                                    {t('Reset')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Log Records Table */}
                <Card className="border-border/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/40 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
                                <tr>
                                    <th className="px-4 py-3 w-16">{t('Method')}</th>
                                    <th className="px-4 py-3 w-32">{t('Status')}</th>
                                    <th className="px-4 py-3">{t('Endpoint URL / Route')}</th>
                                    <th className="px-4 py-3 w-28">{t('Latency')}</th>
                                    <th className="px-4 py-3 w-40">{t('User / IP')}</th>
                                    <th className="px-4 py-3 w-36">{t('Timestamp')}</th>
                                    <th className="px-4 py-3 w-20 text-right">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12">
                                            <NoRecordsFound 
                                                icon={Activity}
                                                title={t('No API logs recorded yet')}
                                                description={t('Failed requests or slow API executions will automatically be captured and displayed here.')}
                                            />
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data.map((log) => (
                                        <tr 
                                            key={log.id} 
                                            className={`hover:bg-muted/30 transition-colors ${
                                                log.status_code >= 500 
                                                    ? 'bg-rose-500/5' 
                                                    : log.status_code >= 400 
                                                        ? 'bg-amber-500/5' 
                                                        : log.is_slow 
                                                            ? 'bg-orange-500/5' 
                                                            : ''
                                            }`}
                                        >
                                            {/* Method */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {getMethodBadge(log.method)}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {getStatusBadge(log.status_code, log.status_text)}
                                            </td>

                                            {/* URL */}
                                            <td className="px-4 py-3 max-w-md">
                                                <div className="flex items-center gap-1.5 group">
                                                    <span className="font-mono text-xs font-medium text-foreground truncate select-all">
                                                        {log.url}
                                                    </span>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    onClick={() => copyToClipboard(log.url, `url_${log.id}`)}
                                                                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity"
                                                                >
                                                                    {copiedKey === `url_${log.id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{t('Copy URL')}</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>

                                                {/* Error message preview or route name */}
                                                {log.error_message ? (
                                                    <div className="text-xs text-rose-600 dark:text-rose-400 font-mono truncate mt-0.5 max-w-sm">
                                                        ⚠️ {log.error_message}
                                                    </div>
                                                ) : log.route_name ? (
                                                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
                                                        Route: {log.route_name}
                                                    </div>
                                                ) : null}
                                            </td>

                                            {/* Latency */}
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {getDurationBadge(log.duration_ms, log.is_slow)}
                                            </td>

                                            {/* User / IP */}
                                            <td className="px-4 py-3 whitespace-nowrap text-xs">
                                                {log.user_name ? (
                                                    <div>
                                                        <div className="font-medium text-foreground flex items-center gap-1 truncate">
                                                            <User className="w-3 h-3 text-primary shrink-0" />
                                                            {log.user_name}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground font-mono">{log.ip_address}</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-muted-foreground font-mono flex items-center gap-1">
                                                        <Globe className="w-3 h-3" />
                                                        {log.ip_address || 'Guest'}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Timestamp */}
                                            <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                                                <div className="font-mono">{formatDateTime(log.created_at)}</div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-xs">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => { setSelectedLog(log); setActiveTab(log.error_message ? 'error' : 'overview'); }}
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(log.id)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {logs.data.length > 0 && (
                        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                            <PerPageSelector
                                routeName="api-logs.index"
                                filters={{ search, type: filterType, method: method !== 'all' ? method : '', status_code: statusCode !== 'all' ? statusCode : '', date }}
                                defaultValue={perPage}
                                onPageChange={(val: string) => {
                                    setPerPage(val);
                                    applyFilters({ per_page: Number(val) });
                                }}
                            />
                            <Pagination
                                data={{
                                    current_page: logs.current_page,
                                    last_page: logs.last_page,
                                    per_page: logs.per_page,
                                    total: logs.total,
                                    from: logs.from,
                                    to: logs.to
                                }}
                                routeName="api-logs.index"
                                filters={{ search, type: filterType, method: method !== 'all' ? method : '', status_code: statusCode !== 'all' ? statusCode : '', date }}
                            />
                        </div>
                    )}
                </Card>
            </div>

            {/* Log Details Inspector Modal */}
            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-0">
                    <DialogHeader className="p-6 border-b border-border bg-muted/20">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                {selectedLog && getMethodBadge(selectedLog.method)}
                                {selectedLog && getStatusBadge(selectedLog.status_code, selectedLog.status_text)}
                                {selectedLog && getDurationBadge(selectedLog.duration_ms, selectedLog.is_slow)}
                            </div>
                        </div>
                        <DialogTitle className="text-base font-mono break-all mt-2 text-foreground">
                            {selectedLog?.url}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-mono text-muted-foreground">
                            ID #{selectedLog?.id} • {selectedLog?.created_at ? formatDateTime(selectedLog.created_at) : ''} • IP: {selectedLog?.ip_address}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tab Navigation in Modal */}
                    <div className="flex items-center gap-2 px-6 border-b border-border bg-background">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                                activeTab === 'overview'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            {t('Overview')}
                        </button>

                        {selectedLog?.error_message && (
                            <button
                                onClick={() => setActiveTab('error')}
                                className={`py-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                                    activeTab === 'error'
                                        ? 'border-rose-600 text-rose-600'
                                        : 'border-transparent text-rose-600/80 hover:text-rose-600'
                                }`}
                            >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {t('Exception & Stack Trace')}
                            </button>
                        )}

                        <button
                            onClick={() => setActiveTab('payload')}
                            className={`py-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                                activeTab === 'payload'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Code className="w-3.5 h-3.5" />
                            {t('Request Body')}
                        </button>

                        <button
                            onClick={() => setActiveTab('headers')}
                            className={`py-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                                activeTab === 'headers'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            {t('Headers')}
                        </button>

                        <button
                            onClick={() => setActiveTab('response')}
                            className={`py-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
                                activeTab === 'response'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Activity className="w-3.5 h-3.5" />
                            {t('Response Preview')}
                        </button>
                    </div>

                    {/* Modal Tab Contents */}
                    <div className="p-6">
                        {activeTab === 'overview' && selectedLog && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="space-y-1 p-3 rounded-lg border border-border/60 bg-muted/20">
                                    <div className="font-semibold text-muted-foreground uppercase">{t('HTTP Method & Route')}</div>
                                    <div className="font-mono text-sm text-foreground">{selectedLog.method}</div>
                                    <div className="font-mono text-muted-foreground">{selectedLog.route_name || 'N/A'}</div>
                                </div>

                                <div className="space-y-1 p-3 rounded-lg border border-border/60 bg-muted/20">
                                    <div className="font-semibold text-muted-foreground uppercase">{t('Status & Duration')}</div>
                                    <div className="font-mono text-sm">{selectedLog.status_code} ({selectedLog.status_text})</div>
                                    <div className="font-mono text-muted-foreground">{selectedLog.duration_ms} ms</div>
                                </div>

                                <div className="space-y-1 p-3 rounded-lg border border-border/60 bg-muted/20">
                                    <div className="font-semibold text-muted-foreground uppercase">{t('User / Requester')}</div>
                                    <div className="font-medium text-foreground">{selectedLog.user_name || 'Guest / Unauthenticated'}</div>
                                    <div className="text-muted-foreground">{selectedLog.user_email || 'N/A'} (ID #{selectedLog.user_id || 'N/A'})</div>
                                </div>

                                <div className="space-y-1 p-3 rounded-lg border border-border/60 bg-muted/20">
                                    <div className="font-semibold text-muted-foreground uppercase">{t('Client IP & Time')}</div>
                                    <div className="font-mono text-foreground">{selectedLog.ip_address}</div>
                                    <div className="text-muted-foreground font-mono">{formatDateTime(selectedLog.created_at)}</div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'error' && selectedLog && (
                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-300 dark:border-rose-900">
                                    <div className="flex items-center justify-between">
                                        <div className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 text-xs">
                                            <AlertTriangle className="w-4 h-4" />
                                            {t('Error Message')}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(selectedLog.error_message || '', 'err_msg')}
                                            className="h-7 text-xs"
                                        >
                                            {copiedKey === 'err_msg' ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                            {t('Copy')}
                                        </Button>
                                    </div>
                                    <div className="font-mono text-xs text-rose-800 dark:text-rose-200 mt-2 break-all whitespace-pre-wrap">
                                        {selectedLog.error_message}
                                    </div>
                                </div>

                                {selectedLog.error_trace && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase">{t('Stack Trace')}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(selectedLog.error_trace || '', 'trace')}
                                                className="h-7 text-xs"
                                            >
                                                {copiedKey === 'trace' ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                                {t('Copy Trace')}
                                            </Button>
                                        </div>
                                        <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
                                            {selectedLog.error_trace}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'payload' && selectedLog && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">{t('Sanitized Request Payload')}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(JSON.stringify(selectedLog.request_body, null, 2), 'body')}
                                        className="h-7 text-xs"
                                    >
                                        {copiedKey === 'body' ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                        {t('Copy JSON')}
                                    </Button>
                                </div>
                                <pre className="p-4 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed">
                                    {selectedLog.request_body && Object.keys(selectedLog.request_body).length > 0
                                        ? JSON.stringify(selectedLog.request_body, null, 2)
                                        : '// No request payload sent'}
                                </pre>
                            </div>
                        )}

                        {activeTab === 'headers' && selectedLog && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">{t('Request Headers')}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => copyToClipboard(JSON.stringify(selectedLog.request_headers, null, 2), 'headers')}
                                        className="h-7 text-xs"
                                    >
                                        {copiedKey === 'headers' ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                        {t('Copy Headers')}
                                    </Button>
                                </div>
                                <div className="rounded-lg border border-border overflow-hidden">
                                    <table className="w-full text-left text-xs font-mono">
                                        <thead className="bg-muted/50 border-b border-border">
                                            <tr>
                                                <th className="p-2.5 font-semibold text-muted-foreground w-1/3">{t('Header')}</th>
                                                <th className="p-2.5 font-semibold text-muted-foreground">{t('Value')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {selectedLog.request_headers && Object.entries(selectedLog.request_headers).map(([key, val]) => (
                                                <tr key={key} className="hover:bg-muted/20">
                                                    <td className="p-2.5 text-primary font-semibold">{key}</td>
                                                    <td className="p-2.5 text-muted-foreground break-all">{String(val)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'response' && selectedLog && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">{t('Response Content Preview')}</span>
                                    {selectedLog.response_body && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(selectedLog.response_body || '', 'resp')}
                                            className="h-7 text-xs"
                                        >
                                            {copiedKey === 'resp' ? <Check className="w-3 h-3 text-emerald-500 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                                            {t('Copy Response')}
                                        </Button>
                                    )}
                                </div>
                                <pre className="p-4 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed">
                                    {selectedLog.response_body || '// No response body captured'}
                                </pre>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-4 border-t border-border bg-muted/20 flex justify-between">
                        <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(selectedLog?.id || 0)}
                            className="flex items-center gap-1.5"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {t('Delete this log')}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedLog(null)}
                        >
                            {t('Close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog for single log deletion */}
            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                title={t('Delete API Log')}
                message={t('Are you sure you want to delete this API log record? This action cannot be undone.')}
                onConfirm={confirmDelete}
            />

            {/* Clear Logs Dialog */}
            <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-600">
                            <Trash2 className="w-5 h-5" />
                            {t('Purge API Logs')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('Select which API logs you would like to purge from the database to save space.')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-3">
                        <label className="flex items-center gap-2 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/40 transition-colors">
                            <input 
                                type="radio" 
                                name="clear_option" 
                                checked={clearDays === '30'} 
                                onChange={() => setClearDays('30')}
                                className="text-primary"
                            />
                            <div>
                                <div className="font-semibold text-xs">{t('Older than 30 Days')}</div>
                                <div className="text-[11px] text-muted-foreground">{t('Keep recent 30 days of logs and delete older entries.')}</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-2 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/40 transition-colors">
                            <input 
                                type="radio" 
                                name="clear_option" 
                                checked={clearDays === '7'} 
                                onChange={() => setClearDays('7')}
                                className="text-primary"
                            />
                            <div>
                                <div className="font-semibold text-xs">{t('Older than 7 Days')}</div>
                                <div className="text-[11px] text-muted-foreground">{t('Keep past 7 days and delete older entries.')}</div>
                            </div>
                        </label>

                        <label className="flex items-center gap-2 p-3 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-500/5 cursor-pointer hover:bg-rose-500/10 transition-colors">
                            <input 
                                type="radio" 
                                name="clear_option" 
                                checked={clearDays === 'all'} 
                                onChange={() => setClearDays('all')}
                                className="text-rose-600"
                            />
                            <div>
                                <div className="font-semibold text-xs text-rose-600 dark:text-rose-400">{t('Purge ALL Logs (Complete Clear)')}</div>
                                <div className="text-[11px] text-muted-foreground">{t('Truncate entire log history.')}</div>
                            </div>
                        </label>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>
                            {t('Cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleClearLogs}>
                            {t('Purge Now')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
