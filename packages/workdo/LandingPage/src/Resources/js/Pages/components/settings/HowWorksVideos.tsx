import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Repeater } from '@/components/ui/repeater';
import { Video } from 'lucide-react';

interface HowWorksVideosSettingsProps {
    data: any;
    getSectionData: (key: string) => any;
    updateSectionData: (key: string, updates: any) => void;
    updateSectionVisibility: (sectionKey: string, visible: boolean) => void;
}

export default function HowWorksVideosSettings({
    data,
    getSectionData,
    updateSectionData,
    updateSectionVisibility,
}: HowWorksVideosSettingsProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Video className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <CardTitle>{t('How Works Videos')}</CardTitle>
                                <p className="text-sm text-gray-500">{t('Add autoplay videos under gallery')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-sm">{t('Enable Section')}</Label>
                            <Switch
                                checked={data.config_sections?.section_visibility?.how_works_videos !== false}
                                onCheckedChange={(checked) => updateSectionVisibility('how_works_videos', checked)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t('Section Title')}</Label>
                        <Input
                            value={getSectionData('how_works_videos').title || ''}
                            onChange={(e) => updateSectionData('how_works_videos', { title: e.target.value })}
                            placeholder={t('How it works')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('Section Subtitle')}</Label>
                        <Input
                            value={getSectionData('how_works_videos').subtitle || ''}
                            onChange={(e) => updateSectionData('how_works_videos', { subtitle: e.target.value })}
                            placeholder={t('See Hrmswala Tracker in action')}
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>{t('Videos')}</Label>
                        <Repeater
                            fields={[
                                { name: 'title', label: t('Title (optional)'), type: 'text', placeholder: t('Video title') },
                                { name: 'url', label: t('Video'), type: 'media', placeholder: t('Select video...'), required: true },
                            ]}
                            value={(getSectionData('how_works_videos').videos || []).map((v: any, index: number) => ({
                                id: `how-works-video-${index}`,
                                title: typeof v === 'string' ? '' : (v?.title || ''),
                                url: typeof v === 'string' ? v : (v?.url || v?.video || ''),
                            }))}
                            onChange={(items) => {
                                const videos = items.map(({ id, ...rest }) => rest);
                                updateSectionData('how_works_videos', { videos });
                            }}
                            addButtonText={t('Add Video')}
                            deleteTooltipText={t('Delete Video')}
                            minItems={0}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

