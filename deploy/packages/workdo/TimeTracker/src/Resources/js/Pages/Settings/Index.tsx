import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Settings } from 'lucide-react';

interface TrackerSettings {
    keyboard_activity_timer: number;
    mouse_activity_timer: number;
    heartbeat_interval: number;
    screenshot_interval: number;
}

export default function Index({ settings }: { settings: TrackerSettings }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(settings);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(route('tracker-settings.update'), formData);
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('Tracker Settings')} />

            <div className="p-6">
                <div className="mb-6 flex items-center gap-2">
                    <Settings className="w-6 h-6" />
                    <h1 className="text-2xl font-bold">{t('Tracker Settings')}</h1>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>{t('Tracking Intervals')}</CardTitle>
                        <CardDescription>
                            {t('Configure how frequently the desktop app syncs data and captures screenshots.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>{t('Heartbeat Interval (seconds)')}</Label>
                                    <Input 
                                        type="number" 
                                        min="30"
                                        value={formData.heartbeat_interval} 
                                        onChange={(e) => setFormData({ ...formData, heartbeat_interval: parseInt(e.target.value) })} 
                                        required 
                                    />
                                    <p className="text-xs text-gray-500">{t('How often the app sends activity data (min 30s)')}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('Screenshot Interval (seconds)')}</Label>
                                    <Input 
                                        type="number" 
                                        min="60"
                                        value={formData.screenshot_interval} 
                                        onChange={(e) => setFormData({ ...formData, screenshot_interval: parseInt(e.target.value) })} 
                                        required 
                                    />
                                    <p className="text-xs text-gray-500">{t('How often a screenshot is captured (min 60s)')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label>{t('Keyboard Activity Timer (seconds)')}</Label>
                                    <Input 
                                        type="number" 
                                        min="10"
                                        value={formData.keyboard_activity_timer} 
                                        onChange={(e) => setFormData({ ...formData, keyboard_activity_timer: parseInt(e.target.value) })} 
                                        required 
                                    />
                                    <p className="text-xs text-gray-500">{t('Idle detection for keyboard usage (min 10s)')}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('Mouse Activity Timer (seconds)')}</Label>
                                    <Input 
                                        type="number" 
                                        min="10"
                                        value={formData.mouse_activity_timer} 
                                        onChange={(e) => setFormData({ ...formData, mouse_activity_timer: parseInt(e.target.value) })} 
                                        required 
                                    />
                                    <p className="text-xs text-gray-500">{t('Idle detection for mouse usage (min 10s)')}</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit">
                                    <Save className="w-4 h-4 mr-2" />
                                    {t('Save Settings')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
