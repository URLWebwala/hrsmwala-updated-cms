import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Repeater } from '@/components/ui/repeater';
import { Monitor } from 'lucide-react';

interface TrackerFeaturesSettingsProps {
    data: any;
    getSectionData: (key: string) => any;
    updateSectionData: (key: string, updates: any) => void;
    updateSectionVisibility: (sectionKey: string, visible: boolean) => void;
}

export default function TrackerFeaturesSettings({
    data,
    getSectionData,
    updateSectionData,
    updateSectionVisibility,
}: TrackerFeaturesSettingsProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Monitor className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle>{t('Tracker Features')}</CardTitle>
                                <p className="text-sm text-gray-500">{t('Edit Hrmswala Tracker marketing section')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-sm">{t('Enable Section')}</Label>
                            <Switch
                                checked={data.config_sections?.section_visibility?.tracker_features !== false}
                                onCheckedChange={(checked) => updateSectionVisibility('tracker_features', checked)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t('Section Title')}</Label>
                        <Input
                            value={getSectionData('tracker_features').title || ''}
                            onChange={(e) => updateSectionData('tracker_features', { title: e.target.value })}
                            placeholder={t('Hrmswala Tracker Features')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('Section Subtitle')}</Label>
                        <Textarea
                            value={getSectionData('tracker_features').subtitle || ''}
                            onChange={(e) => updateSectionData('tracker_features', { subtitle: e.target.value })}
                            placeholder={t('Comprehensive time tracking and productivity monitoring for your team.')}
                            rows={3}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>{t('Features List')}</Label>
                        <Repeater
                            fields={[
                                { name: 'title', label: t('Title'), type: 'text', placeholder: t('Feature title'), required: true },
                                { name: 'description', label: t('Description'), type: 'textarea', placeholder: t('Feature description'), required: true, rows: 3 },
                                {
                                    name: 'icon',
                                    label: t('Icon'),
                                    type: 'select',
                                    options: [
                                        { value: 'clock', label: t('Clock') },
                                        { value: 'camera', label: t('Camera') },
                                        { value: 'activity', label: t('Activity') },
                                        { value: 'report', label: t('Report') },
                                    ],
                                    required: true,
                                },
                            ]}
                            value={(getSectionData('tracker_features').features || []).map((f: any, index: number) => ({
                                id: `tracker-feature-${index}`,
                                title: f.title || '',
                                description: f.description || '',
                                icon: f.icon || 'clock',
                            }))}
                            onChange={(items) => {
                                const features = items.map(({ id, ...rest }) => rest);
                                updateSectionData('tracker_features', { features });
                            }}
                            addButtonText={t('Add Feature')}
                            deleteTooltipText={t('Delete Feature')}
                            minItems={1}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>{t('Download Title')}</Label>
                            <Input
                                value={getSectionData('tracker_features').download_title || ''}
                                onChange={(e) => updateSectionData('tracker_features', { download_title: e.target.value })}
                                placeholder={t('Secure Desktop App')}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>{t('Download Subtitle')}</Label>
                            <Input
                                value={getSectionData('tracker_features').download_subtitle || ''}
                                onChange={(e) => updateSectionData('tracker_features', { download_subtitle: e.target.value })}
                                placeholder={t('Available for Windows. Lightweight and runs in the background.')}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-3">
                            <Label>{t('Download Button Text')}</Label>
                            <Input
                                value={getSectionData('tracker_features').download_button_text || ''}
                                onChange={(e) => updateSectionData('tracker_features', { download_button_text: e.target.value })}
                                placeholder={t('Download Tracker App (.exe)')}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

