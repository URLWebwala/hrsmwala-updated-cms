import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Pagination } from '@/components/ui/pagination';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Calendar, User as UserIcon, Maximize2, X, RefreshCw } from 'lucide-react';

interface Screenshot {
    id: number;
    file_path: string;
    screenshot_url?: string;
    captured_at: string;
    session: {
        id: number;
        worked_seconds?: number;
        break_seconds?: number;
        task?: {
            title?: string;
        };
        user: {
            name: string;
            avatar: string;
        };
        project: {
            name: string;
        };
    };
}

interface User {
    id: number;
    name: string;
}

export default function Screenshots({ 
    screenshots, 
    employees, 
    selectedDate = '', 
    selectedUser = 'all' 
}: { 
    screenshots: any, 
    employees: User[], 
    selectedDate?: string, 
    selectedUser?: string 
}) {
    const { t } = useTranslation();
    const [currentUser, setCurrentUser] = useState<string>(selectedUser || 'all');
    const [currentDate, setCurrentDate] = useState<string>(selectedDate || '');
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    const applyFilters = (userId: string, date: string) => {
        const params: any = {};
        if (userId && userId !== 'all') {
            params.user_id = userId;
        }
        if (date) {
            params.date = date;
        }
        router.get(route('timetracker.admin.screenshots'), params, { preserveState: true, replace: true });
    };

    const handleUserChange = (userId: string) => {
        setCurrentUser(userId);
        applyFilters(userId, currentDate);
    };

    const handleDateChange = (date: string) => {
        setCurrentDate(date);
        applyFilters(currentUser, date);
    };

    const handleClearFilters = () => {
        setCurrentUser('all');
        setCurrentDate('');
        router.get(route('timetracker.admin.screenshots'), {}, { preserveState: true, replace: true });
    };

    const formatSeconds = (seconds: number) => {
        const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
        const h = Math.floor(safe / 3600).toString().padStart(2, '0');
        const m = Math.floor((safe % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(safe % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('Screenshots')} />

            <div className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Camera className="w-6 h-6" />
                            {t('Captured Screenshots')}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('Monitor employee activity through periodic desktop screenshots.')}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-48">
                            <DatePicker
                                value={currentDate}
                                onChange={handleDateChange}
                                placeholder={t('Filter by Date')}
                            />
                        </div>

                        <Select value={currentUser} onValueChange={handleUserChange}>
                            <SelectTrigger className="w-52">
                                <SelectValue placeholder={t('Filter by Employee')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('All Employees')}</SelectItem>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(currentUser !== 'all' || currentDate) && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleClearFilters}
                                className="text-muted-foreground hover:text-foreground h-9 px-2 text-xs gap-1"
                            >
                                <X className="h-3.5 w-3.5" />
                                {t('Clear')}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {screenshots.data.length > 0 ? screenshots.data.map((screenshot: Screenshot) => (
                        <Card key={screenshot.id} className="overflow-hidden group">
                            <CardContent className="p-0 relative">
                                {(() => {
                                    const imageUrl = screenshot.screenshot_url || `/storage/${screenshot.file_path}`;
                                    return (
                                <img 
                                    src={imageUrl} 
                                    alt={t('Screenshot')} 
                                    className="w-full aspect-video object-cover cursor-pointer transition-transform group-hover:scale-105"
                                    onClick={() => setViewingImage(imageUrl)}
                                />
                                    );
                                })()}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <Maximize2 className="text-white w-8 h-8" />
                                </div>
                                <div className="p-4 bg-white border-t">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 text-sm font-bold truncate">
                                            <UserIcon className="w-4 h-4 text-gray-400" />
                                            {screenshot.session.user.name}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium">
                                            {new Date(screenshot.captured_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold truncate max-w-[120px]">
                                            {screenshot.session.project.name}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(screenshot.captured_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="mt-2 space-y-1">
                                        <div className="text-[10px] text-gray-500">
                                            {t('Task')}: <span className="font-semibold text-gray-700">{screenshot.session.task?.title || '-'}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            {t('Worked')}: <span className="font-semibold text-green-700">{formatSeconds(screenshot.session.worked_seconds ?? 0)}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            {t('Break')}: <span className="font-semibold text-amber-700">{formatSeconds(screenshot.session.break_seconds ?? 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-100">
                            {t('No screenshots found.')}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {screenshots.links && screenshots.links.length > 3 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination 
                            data={screenshots} 
                            routeName="timetracker.admin.screenshots" 
                            filters={{ 
                                user_id: currentUser !== 'all' ? currentUser : undefined, 
                                date: currentDate || undefined 
                            }} 
                        />
                    </div>
                )}

                {/* Simple Modal for Image Preview */}
                {viewingImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setViewingImage(null)}>
                        <img 
                            src={viewingImage} 
                            alt={t('Full Screenshot')} 
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                        />
                        <Button 
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
                            onClick={() => setViewingImage(null)}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </Button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
