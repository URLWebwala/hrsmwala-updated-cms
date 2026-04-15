import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Newspaper } from 'lucide-react';

interface BlogsProps {
    data: any;
    getSectionData: (key: string) => any;
    updateSectionData: (key: string, updates: any) => void;
    updateSectionVisibility: (sectionKey: string, visible: boolean) => void;
}

export default function Blogs({ data, getSectionData, updateSectionData, updateSectionVisibility }: BlogsProps) {
    const { t } = useTranslation();
    const sectionData = getSectionData('blogs');
    const isVisible = data.config_sections?.section_visibility?.blogs !== false;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Newspaper className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <CardTitle>{t('Blogs Section')}</CardTitle>
                            <p className="text-sm text-gray-500">{t('Configure homepage 3-card blog section')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label>{t('Show')}</Label>
                        <Switch checked={isVisible} onCheckedChange={(checked) => updateSectionVisibility('blogs', checked)} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>{t('Section Title')}</Label>
                    <Input
                        value={sectionData.title || ''}
                        onChange={(e) => updateSectionData('blogs', { title: e.target.value })}
                        placeholder={t('Latest Blogs')}
                    />
                </div>
                <div className="space-y-2">
                    <Label>{t('Section Subtitle')}</Label>
                    <Input
                        value={sectionData.subtitle || ''}
                        onChange={(e) => updateSectionData('blogs', { subtitle: e.target.value })}
                        placeholder={t('Read recent articles and business insights')}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
