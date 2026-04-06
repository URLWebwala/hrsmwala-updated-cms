import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, User as UserIcon, Clock, Zap } from 'lucide-react';

interface SummaryItem {
    user_id: number;
    name: string;
    avatar: string;
    total_hours: number;
    worked_seconds: number;
    break_seconds: number;
    avg_activity: number;
    session_count: number;
    recent_tasks: string[];
}

export default function Summary({ summaryData, selectedDate }: { summaryData: SummaryItem[], selectedDate: string }) {
    const { t } = useTranslation();
    const [date, setDate] = useState(selectedDate);

    const formatSeconds = (seconds: number) => {
        const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
        const h = Math.floor(safe / 3600).toString().padStart(2, '0');
        const m = Math.floor((safe % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(safe % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handleDateChange = (newDate: string) => {
        setDate(newDate);
        router.get(route('timetracker.admin.summary'), { date: newDate }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('Tracking Summary')} />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{t('Tracking Summary')}</h1>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <Input 
                            type="date" 
                            className="w-48"
                            value={date} 
                            onChange={(e) => handleDateChange(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {summaryData.length > 0 ? summaryData.map((item) => (
                        <Card key={item.user_id}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={`/storage/${item.avatar}`} alt={item.name} />
                                        <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <p className="text-sm text-gray-500">{t('Employee')}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{t('Worked Time')}</span>
                                        </div>
                                        <span className="font-bold">{formatSeconds(item.worked_seconds)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{t('Break Time')}</span>
                                        </div>
                                        <span className="font-bold text-amber-600">{formatSeconds(item.break_seconds)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Zap className="w-4 h-4" />
                                            <span>{t('Avg Activity')}</span>
                                        </div>
                                        <span className={`font-bold ${item.avg_activity > 70 ? 'text-green-600' : item.avg_activity > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                                            {item.avg_activity}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <UserIcon className="w-4 h-4" />
                                            <span>{t('Sessions')}</span>
                                        </div>
                                        <span className="font-bold">{item.session_count}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 mb-2">{t('Recent Tasks')}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {item.recent_tasks?.length ? item.recent_tasks.map((task, idx) => (
                                                <span key={`${item.user_id}-${idx}`} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                                    {task}
                                                </span>
                                            )) : (
                                                <span className="text-xs text-gray-400">{t('No tasks tracked')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t">
                                    <Button variant="outline" className="w-full" size="sm" asChild>
                                        <a href={route('timetracker.admin.screenshots', { user_id: item.user_id })}>
                                            {t('View Screenshots')}
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full py-20 text-center text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-100">
                            {t('No tracking data found for this date.')}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
