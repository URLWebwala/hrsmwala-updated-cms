import { useForm, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Download, Save, Zap, Clock, Camera, MousePointer2, Keyboard, ShieldCheck, Settings, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PageProps } from '@/types';
import { useBrand } from '@/contexts/brand-context';

interface TrackerAppSettingsProps {
    userSettings: any;
}

export default function TrackerAppSettings({ userSettings }: TrackerAppSettingsProps) {
    const { t } = useTranslation();
    const { adminAllSetting, auth } = usePage<PageProps & { adminAllSetting: any }>().props;
    const { getPrimaryColor } = useBrand();
    const primaryColor = getPrimaryColor();

    const isSuperAdmin = auth.user?.type === 'superadmin';
    // Company settings should take precedence for company users.
    // For superadmin, fall back to admin settings.
    const settings = isSuperAdmin ? (userSettings ?? adminAllSetting) : (userSettings ?? adminAllSetting);

    const getBoolSetting = (key: string, defaultOn = true) => {
        const raw = settings?.[key];
        if (typeof raw === 'boolean') return raw;
        if (raw === 'on' || raw === '1' || raw === 1) return true;
        if (raw === 'off' || raw === '0' || raw === 0) return false;
        return defaultOn;
    };

    const toMinutes = (value: unknown, fallbackSeconds: number) => {
        const seconds = Number(value ?? fallbackSeconds);
        if (!Number.isFinite(seconds) || seconds <= 0) return Math.max(1, Math.ceil(fallbackSeconds / 60));
        return Math.max(1, Math.ceil(seconds / 60));
    };

    const { data, setData, post, processing, errors, transform } = useForm({
        tracker_app: null as File | null,
        // Company wise settings
        keyboard_activity_timer: toMinutes(settings?.keyboard_activity_timer, 60),
        mouse_activity_timer: toMinutes(settings?.mouse_activity_timer, 60),
        heartbeat_interval: toMinutes(settings?.heartbeat_interval, 120),
        screenshot_interval: toMinutes(settings?.screenshot_interval, 600),
        enable_keyboard_tracking: getBoolSetting('enable_keyboard_tracking', true),
        enable_mouse_tracking: getBoolSetting('enable_mouse_tracking', true),
        enable_heartbeat_tracking: getBoolSetting('enable_heartbeat_tracking', true),
        enable_screenshot_tracking: getBoolSetting('enable_screenshot_tracking', true),
        enable_blurry_screenshots: getBoolSetting('enable_blurry_screenshots', false),
        auto_stop_tracking: settings?.auto_stop_tracking || 30,
        enable_idle_detection: getBoolSetting('enable_idle_detection', false),
    });

    const getToggleStyle = (enabled: boolean): React.CSSProperties => ({
        backgroundColor: enabled ? primaryColor : '#cbd5e1',
        borderColor: enabled ? primaryColor : '#cbd5e1',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const routeName = isSuperAdmin ? 'settings.tracker-app.update' : 'tracker-settings.update';
        transform((formData) => ({
            ...formData,
            // UI works in minutes; backend continues to store seconds.
            keyboard_activity_timer: Number(formData.keyboard_activity_timer) * 60,
            mouse_activity_timer: Number(formData.mouse_activity_timer) * 60,
            heartbeat_interval: Number(formData.heartbeat_interval) * 60,
            screenshot_interval: Number(formData.screenshot_interval) * 60,
        }));
        post(route(routeName), {
            forceFormData: true,
        });
    };

    return (
        <Card id="tracker-app-settings" className="border-none shadow-none">
            <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Monitor className="w-5 h-5" style={{ color: primaryColor }} />
                    {t('Tracker App Settings')}
                </CardTitle>
                <CardDescription>
                    {isSuperAdmin 
                        ? t('Manage the desktop application bundle for all companies and users.') 
                        : t('Configure your company-specific time tracking rules and intervals.')}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <div className="bg-muted/20 p-4 rounded-lg mb-8 border border-muted-foreground/10 text-sm text-muted-foreground">
                    {isSuperAdmin 
                        ? t('This section allows you to upload the latest .exe tracker app. This app will be available for download to all companies and their employees.') 
                        : t('Each company can set its own timing rules for screenshots, activity detection, and idle behavior. These settings will sync with the desktop app.')}
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {isSuperAdmin ? (
                        /* SUPER ADMIN UI: FILE UPLOAD */
                        <div className="grid grid-cols-1 gap-6 p-6 border rounded-xl bg-white shadow-sm">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex-1 space-y-2 w-full">
                                    <Label htmlFor="tracker_app" className="font-bold text-gray-700">{t('Desktop app bundle (.exe)')}</Label>
                                    <Input
                                        id="tracker_app"
                                        type="file"
                                        onChange={(e) => setData('tracker_app', e.target.files?.[0] || null)}
                                        className="w-full bg-gray-50 border-gray-200 focus-visible:ring-offset-0 focus-visible:ring-1"
                                        style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                                    />
                                    <p className="text-[10px] text-gray-500">{t('Only .exe, .zip or .dmg files are supported. Max size 50MB.')}</p>
                                    {errors.tracker_app && (
                                        <p className="text-sm text-red-500 font-medium">{errors.tracker_app}</p>
                                    )}
                                </div>

                                {settings?.tracker_app_file && (
                                    <div className="space-y-2 min-w-[250px]">
                                        <Label className="font-bold text-gray-700">{t('Current Active Bundle')}</Label>
                                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm" style={{ borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}05` }}>
                                            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                                                <Download className="w-5 h-5" style={{ color: primaryColor }} />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <span className="text-sm font-bold truncate block text-gray-900">
                                                    {settings.tracker_app_name || 'tracker.exe'}
                                                </span>
                                                <span className="text-[10px] font-medium uppercase tracking-tighter" style={{ color: primaryColor }}>{t('Production Ready')}</span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" style={{ color: primaryColor }} asChild>
                                                <a href={`/storage/${settings.tracker_app_file}`} download title={t('Download Current')}>
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* COMPANY ADMIN UI: TIMING RULES & ADVANCED FEATURES */
                        <div className="space-y-10">
                            {/* Timing Rules Section */}
                            <div className="grid grid-cols-1 gap-6 p-6 border rounded-xl bg-white shadow-sm">
                                <div className="flex items-center gap-2 border-b pb-4 mb-2">
                                    <Clock className="w-5 h-5" style={{ color: primaryColor }} />
                                    <h4 className="text-base font-bold text-gray-900">{t('Timing & Synchronization Rules')}</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="heartbeat_interval" className="font-semibold text-gray-700">{t('Heartbeat Interval')}</Label>
                                            <Switch
                                                checked={data.enable_heartbeat_tracking}
                                                onCheckedChange={(checked) => setData('enable_heartbeat_tracking', checked)}
                                                className="shadow-sm"
                                                style={getToggleStyle(data.enable_heartbeat_tracking)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="heartbeat_interval"
                                                type="number"
                                                min="1"
                                                className="pr-12 bg-gray-50 border-gray-200"
                                                value={data.heartbeat_interval}
                                                onChange={(e) => setData('heartbeat_interval', Number(e.target.value))}
                                                disabled={!data.enable_heartbeat_tracking}
                                            />
                                            <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400 uppercase">{t('Min')}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500">{t('How often the app syncs work logs with the server (in minutes).')}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="screenshot_interval" className="font-semibold text-gray-700">{t('Screenshot Interval')}</Label>
                                            <Switch
                                                checked={data.enable_screenshot_tracking}
                                                onCheckedChange={(checked) => setData('enable_screenshot_tracking', checked)}
                                                className="shadow-sm"
                                                style={getToggleStyle(data.enable_screenshot_tracking)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="screenshot_interval"
                                                type="number"
                                                min="1"
                                                className="pr-12 bg-gray-50 border-gray-200"
                                                value={data.screenshot_interval}
                                                onChange={(e) => setData('screenshot_interval', Number(e.target.value))}
                                                disabled={!data.enable_screenshot_tracking}
                                            />
                                            <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400 uppercase">{t('Min')}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500">{t('Time between each automated desktop capture (in minutes).')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Activity Section */}
                            <div className="grid grid-cols-1 gap-6 p-6 border rounded-xl bg-white shadow-sm">
                                <div className="flex items-center gap-2 border-b pb-4 mb-2">
                                    <MousePointer2 className="w-5 h-5" style={{ color: primaryColor }} />
                                    <h4 className="text-base font-bold text-gray-900">{t('Idle Detection Thresholds')}</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="keyboard_activity_timer" className="font-semibold text-gray-700 flex items-center gap-2">
                                                <Keyboard className="w-4 h-4" />
                                                {t('Keyboard Inactivity')}
                                            </Label>
                                            <Switch
                                                checked={data.enable_keyboard_tracking}
                                                onCheckedChange={(checked) => setData('enable_keyboard_tracking', checked)}
                                                className="shadow-sm"
                                                style={getToggleStyle(data.enable_keyboard_tracking)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="keyboard_activity_timer"
                                                type="number"
                                                min="1"
                                                className="pr-12 bg-gray-50 border-gray-200"
                                                value={data.keyboard_activity_timer}
                                                onChange={(e) => setData('keyboard_activity_timer', Number(e.target.value))}
                                                disabled={!data.enable_keyboard_tracking}
                                            />
                                            <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400 uppercase">{t('Min')}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="mouse_activity_timer" className="font-semibold text-gray-700 flex items-center gap-2">
                                                <MousePointer2 className="w-4 h-4" />
                                                {t('Mouse Inactivity')}
                                            </Label>
                                            <Switch
                                                checked={data.enable_mouse_tracking}
                                                onCheckedChange={(checked) => setData('enable_mouse_tracking', checked)}
                                                className="shadow-sm"
                                                style={getToggleStyle(data.enable_mouse_tracking)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="mouse_activity_timer"
                                                type="number"
                                                min="1"
                                                className="pr-12 bg-gray-50 border-gray-200"
                                                value={data.mouse_activity_timer}
                                                onChange={(e) => setData('mouse_activity_timer', Number(e.target.value))}
                                                disabled={!data.enable_mouse_tracking}
                                            />
                                            <span className="absolute right-3 top-2.5 text-[10px] font-bold text-gray-400 uppercase">{t('Min')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Advance Features Section */}
                            <div className="grid grid-cols-1 gap-6 p-6 border rounded-xl bg-white shadow-sm">
                                <div className="flex items-center gap-2 border-b pb-4 mb-2">
                                    <Zap className="w-5 h-5" style={{ color: primaryColor }} />
                                    <h4 className="text-base font-bold text-gray-900">{t('Advance Tracker Features')}</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                <Camera className="w-4 h-4" style={{ color: primaryColor }} />
                                                {t('Blurry Screenshots')}
                                            </Label>
                                            <p className="text-[10px] text-gray-500">{t('Privacy mode: Desktop captures will be blurred.')}</p>
                                        </div>
                                        <Switch
                                            checked={data.enable_blurry_screenshots}
                                            onCheckedChange={(checked) => setData('enable_blurry_screenshots', checked)}
                                            className="shadow-sm"
                                            style={getToggleStyle(data.enable_blurry_screenshots)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4" style={{ color: primaryColor }} />
                                                {t('Smart Inactivity Detection')}
                                            </Label>
                                            <p className="text-[10px] text-gray-500">{t('Automatically pause tracking when user is away.')}</p>
                                        </div>
                                        <Switch
                                            checked={data.enable_idle_detection}
                                            onCheckedChange={(checked) => setData('enable_idle_detection', checked)}
                                            className="shadow-sm"
                                            style={getToggleStyle(data.enable_idle_detection)}
                                        />
                                    </div>
                                    <div className="space-y-2 p-4 border rounded-xl md:col-span-2 shadow-sm" style={{ borderColor: `${primaryColor}20`, backgroundColor: `${primaryColor}05` }}>
                                        <Label htmlFor="auto_stop_tracking" className="font-bold" style={{ color: primaryColor }}>{t('Auto Stop Tracking After Inactivity')}</Label>
                                        <div className="relative max-w-[200px]">
                                            <Input
                                                id="auto_stop_tracking"
                                                type="number"
                                                min="5"
                                                className="pr-12 bg-white"
                                                style={{ borderColor: `${primaryColor}40` }}
                                                value={data.auto_stop_tracking}
                                                onChange={(e) => setData('auto_stop_tracking', e.target.value)}
                                            />
                                            <span className="absolute right-3 top-2.5 text-[10px] font-bold uppercase" style={{ color: primaryColor }}>{t('Min')}</span>
                                        </div>
                                        <p className="text-[10px]" style={{ color: `${primaryColor}90` }}>{t('Forcefully stop the work session after X minutes of zero activity.')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end pt-6 border-t">
                        <Button 
                            type="submit" 
                            disabled={processing} 
                            className="h-12 px-10 font-bold shadow-lg transition-all" 
                            style={{ backgroundColor: primaryColor }}
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {isSuperAdmin ? t('Upload Desktop Bundle') : t('Save Company Rules')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
