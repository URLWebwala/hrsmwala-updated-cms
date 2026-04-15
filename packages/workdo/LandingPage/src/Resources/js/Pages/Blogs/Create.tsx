import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { InputError } from '@/components/ui/input-error';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Upload } from 'lucide-react';

export default function Create() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm<any>({
        title: '',
        slug: '',
        category: '',
        author_name: '',
        content: '',
        image: null,
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        is_active: true,
    });

    useEffect(() => {
        setData('slug', data.title ? data.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim() : '');
    }, [data.title]);

    return (
        <AuthenticatedLayout
            breadcrumbs={[{ label: t('Blogs'), url: route('blogs.index') }, { label: t('Create Blog') }]}
            pageTitle={t('Create Blog')}
            pageActions={<Button onClick={() => post(route('blogs.store'))} disabled={processing}>{t('Save')}</Button>}
        >
            <Head title={t('Create Blog')} />
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('Blog Details')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <Label>{t('Title')}</Label>
                                <Input
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder={t('Enter blog title')}
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div>
                                <Label>{t('Slug')}</Label>
                                <Input
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder={t('enter-blog-slug')}
                                />
                                <InputError message={errors.slug} />
                            </div>
                            <div>
                                <Label>{t('Category')}</Label>
                                <Input
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    placeholder={t('e.g. SEO, Marketing, Productivity')}
                                />
                            </div>
                            <div>
                                <Label>{t('Author Name')}</Label>
                                <Input
                                    value={data.author_name}
                                    onChange={(e) => setData('author_name', e.target.value)}
                                    placeholder={t('Enter author name')}
                                />
                                <InputError message={errors.author_name} />
                            </div>
                        </div>

                        <div>
                            <Label>{t('Blog Image')}</Label>
                            <label className="mt-2 flex h-32 w-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                                <Upload className="h-5 w-5 text-gray-500" />
                                <span className="mt-1 text-xs text-gray-600">{t('Upload')}</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setData('image', e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>

                        <div>
                            <Label>{t('Content')}</Label>
                            <RichTextEditor
                                content={data.content}
                                onChange={(value) => setData('content', value)}
                                placeholder={t('Write your blog content here...')}
                                className="mt-2 min-h-[280px]"
                            />
                            <InputError message={errors.content} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch checked={data.is_active} onCheckedChange={(v) => setData('is_active', v)} />
                            <Label>{t('Active')}</Label>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('SEO Meta Details')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <Label>{t('Meta Title')}</Label>
                                <Input
                                    value={data.meta_title}
                                    onChange={(e) => setData('meta_title', e.target.value)}
                                    placeholder={t('Example: Best HRM platform for startups')}
                                />
                            </div>
                            <div>
                                <Label>{t('Meta Tags')}</Label>
                                <Input
                                    value={data.meta_keywords}
                                    onChange={(e) => setData('meta_keywords', e.target.value)}
                                    placeholder={t('hrm saas, payroll, crm, employee management')}
                                />
                            </div>
                            <div className="rounded-md border bg-gray-50 p-3">
                                <p className="text-xs font-semibold text-muted-foreground">{t('SEO Preview')}</p>
                                <p className="mt-2 text-sm font-medium text-blue-700">{data.meta_title || t('Preview title')}</p>
                                <p className="text-xs text-green-700">{`/${data.slug || 'your-slug'}`}</p>
                                <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                                    {data.meta_description || t('Preview description will appear here.')}
                                </p>
                            </div>
                        </div>
                        <div>
                            <Label>{t('Meta Description')}</Label>
                            <textarea
                                className="mt-1 min-h-[120px] w-full rounded-md border p-3 text-sm"
                                value={data.meta_description}
                                onChange={(e) => setData('meta_description', e.target.value)}
                                placeholder={t('Write a short summary (150-160 chars) for search engines.')}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
