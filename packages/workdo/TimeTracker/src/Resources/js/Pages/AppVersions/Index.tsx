import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Download, Trash2 } from 'lucide-react';

interface AppVersion {
    id: number;
    version_name: string;
    changelog: string;
    file_path: string;
    upload_date: string;
}

export default function Index({ versions }: { versions: AppVersion[] }) {
    const { t } = useTranslation();
    const [showCreate, setShowCreate] = useState(false);
    const [formData, setFormData] = useState({
        version_name: '',
        changelog: '',
        desktop_app: null as File | null
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('version_name', formData.version_name);
        data.append('changelog', formData.changelog);
        if (formData.desktop_app) {
            data.append('desktop_app', formData.desktop_app);
        }

        router.post(route('app-versions.store'), data, {
            onSuccess: () => {
                setShowCreate(false);
                setFormData({ version_name: '', changelog: '', desktop_app: null });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('Desktop App Versions')} />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{t('Desktop App Versions')}</h1>
                    <Button onClick={() => setShowCreate(!showCreate)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('Upload New Version')}
                    </Button>
                </div>

                {showCreate && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>{t('New App Version')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>{t('Version Name')}</Label>
                                        <Input 
                                            value={formData.version_name} 
                                            onChange={(e) => setFormData({ ...formData, version_name: e.target.value })} 
                                            placeholder="e.g. 1.0.0" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{t('Desktop App File (.exe, .dmg, .zip)')}</Label>
                                        <Input 
                                            type="file" 
                                            onChange={(e) => setFormData({ ...formData, desktop_app: e.target.files?.[0] || null })} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('Changelog')}</Label>
                                    <Textarea 
                                        value={formData.changelog} 
                                        onChange={(e) => setFormData({ ...formData, changelog: e.target.value })} 
                                        placeholder={t('What is new in this version?')} 
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                                        {t('Cancel')}
                                    </Button>
                                    <Button type="submit">
                                        {t('Upload & Save')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {versions.length > 0 ? versions.map((version) => (
                        <Card key={version.id}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold">v{version.version_name}</h3>
                                        <p className="text-sm text-gray-500">{t('Uploaded on')}: {version.upload_date}</p>
                                        <div className="mt-4 prose prose-sm max-w-none">
                                            <p className="text-gray-700 whitespace-pre-line">{version.changelog}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={`/storage/${version.file_path}`} download>
                                                <Download className="w-4 h-4 mr-2" />
                                                {t('Download')}
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <Card>
                            <CardContent className="p-8 text-center text-gray-500">
                                {t('No app versions found.')}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
