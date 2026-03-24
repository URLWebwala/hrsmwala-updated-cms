import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Calendar, User as UserIcon, Maximize2 } from 'lucide-react';

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

export default function Screenshots({ screenshots, employees }: { screenshots: any, employees: User[] }) {
    const { t } = useTranslation();
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    const handleUserChange = (userId: string) => {
        setSelectedUser(userId);
        const params: any = {};
        if (userId !== 'all') {
            params.user_id = userId;
        }
        router.get(route('timetracker.admin.screenshots'), params, { preserveState: true });
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Camera className="w-6 h-6" />
                            {t('Captured Screenshots')}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('Monitor employee activity through periodic desktop screenshots.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={selectedUser} onValueChange={handleUserChange}>
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder={t('Filter by Employee')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('All Employees')}</SelectItem>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id.toString()}>{emp.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
