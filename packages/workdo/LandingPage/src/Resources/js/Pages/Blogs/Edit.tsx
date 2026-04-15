import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { InputError } from '@/components/ui/input-error';

export default function Edit({ blog }: any) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm<any>({
        title: blog.title || '',
        slug: blog.slug || '',
        category: blog.category || '',
        author_name: blog.author_name || '',
        content: blog.content || '',
        image: null,
        meta_title: blog.meta_title || '',
        meta_description: blog.meta_description || '',
        meta_keywords: blog.meta_keywords || '',
        is_active: !!blog.is_active,
    });

    return (
        <AuthenticatedLayout breadcrumbs={[{ label: t('Blogs'), url: route('blogs.index') }, { label: t('Edit Blog') }]} pageTitle={t('Edit Blog')} pageActions={<Button onClick={() => put(route('blogs.update', blog.id))} disabled={processing}>{t('Update')}</Button>}>
            <Head title={t('Edit Blog')} />
            <div className="space-y-6">
                <Card><CardHeader><CardTitle>{t('Blog Details')}</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
                    <div><Label>{t('Title')}</Label><Input value={data.title} onChange={(e) => setData('title', e.target.value)} /><InputError message={errors.title} /></div>
                    <div><Label>{t('Slug')}</Label><Input value={data.slug} onChange={(e) => setData('slug', e.target.value)} /><InputError message={errors.slug} /></div>
                    <div><Label>{t('Category')}</Label><Input value={data.category} onChange={(e) => setData('category', e.target.value)} /></div>
                    <div><Label>{t('Author Name')}</Label><Input value={data.author_name} onChange={(e) => setData('author_name', e.target.value)} /><InputError message={errors.author_name} /></div>
                    <div className="md:col-span-2"><Label>{t('Blog Image')}</Label><Input type="file" onChange={(e) => setData('image', e.target.files?.[0] || null)} />{blog.image_url && <img src={blog.image_url} alt={blog.title} className="h-20 mt-2 rounded" />}</div>
                    <div className="md:col-span-2"><Label>{t('Content')}</Label><textarea className="w-full min-h-[280px] border rounded-md p-3" value={data.content} onChange={(e) => setData('content', e.target.value)} /><InputError message={errors.content} /></div>
                    <div className="flex items-center gap-2 md:col-span-2"><Switch checked={data.is_active} onCheckedChange={(v) => setData('is_active', v)} /><Label>{t('Active')}</Label></div>
                </CardContent></Card>
                <Card><CardHeader><CardTitle>{t('SEO')}</CardTitle></CardHeader><CardContent className="grid gap-4">
                    <div><Label>{t('Meta Title')}</Label><Input value={data.meta_title} onChange={(e) => setData('meta_title', e.target.value)} /></div>
                    <div><Label>{t('Meta Description')}</Label><Input value={data.meta_description} onChange={(e) => setData('meta_description', e.target.value)} /></div>
                    <div><Label>{t('Meta Keywords')}</Label><Input value={data.meta_keywords} onChange={(e) => setData('meta_keywords', e.target.value)} /></div>
                </CardContent></Card>
            </div>
        </AuthenticatedLayout>
    );
}
