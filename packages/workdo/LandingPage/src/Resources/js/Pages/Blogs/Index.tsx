import { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from '@/layouts/authenticated-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { PerPageSelector } from '@/components/ui/per-page-selector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import { formatDate } from '@/utils/helpers';

export default function Index({ blogs }: any) {
    const { t } = useTranslation();
    const { auth } = usePage<{ auth: { user: any } }>().props;
    const params = new URLSearchParams(window.location.search);
    const [filters, setFilters] = useState({
        title: params.get('title') || '',
        status: params.get('status') || 'all',
    });

    const { deleteState, openDeleteDialog, closeDeleteDialog, confirmDelete } = useDeleteHandler({
        routeName: 'blogs.destroy',
        defaultMessage: t('Are you sure you want to delete this blog?'),
    });

    const applyFilters = (next = filters) => {
        router.get(route('blogs.index'), { ...next, per_page: params.get('per_page') || '10' }, { preserveState: true, replace: true });
    };

    const columns: any[] = [
        { key: 'title', header: t('Title') },
        { key: 'author_name', header: t('Author') },
        { key: 'read_count', header: t('Reads') },
        { key: 'unique_readers_count', header: t('Unique Readers') },
        { key: 'is_active', header: t('Status'), render: (v: boolean) => <span className={`px-2 py-1 rounded-full text-xs ${v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{v ? t('Active') : t('Inactive')}</span> },
        { key: 'created_at', header: t('Created'), render: (v: string) => formatDate(v) },
        {
            key: 'actions',
            header: t('Actions'),
            render: (_: any, row: any) => (
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => window.open(route('blog.show', row.slug), '_blank')}><Eye className="h-4 w-4" /></Button>
                    {auth.user?.permissions?.includes('edit-blogs') && <Link href={route('blogs.edit', row.id)}><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></Link>}
                    {auth.user?.permissions?.includes('delete-blogs') && <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(row.id)}><Trash2 className="h-4 w-4" /></Button>}
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout breadcrumbs={[{ label: t('Blogs') }]} pageTitle={t('Manage Blogs')} pageActions={auth.user?.permissions?.includes('create-blogs') ? <Link href={route('blogs.create')}><Button size="sm"><Plus className="h-4 w-4" /></Button></Link> : null}>
            <Head title={t('Blogs')} />
            <Card>
                <CardContent className="p-4 border-b flex gap-3">
                    <div className="flex-1"><SearchInput value={filters.title} onChange={(title) => setFilters((p) => ({ ...p, title }))} onSearch={() => applyFilters()} placeholder={t('Search blogs...')} /></div>
                    <Select value={filters.status} onValueChange={(status) => { const next = { ...filters, status }; setFilters(next); applyFilters(next); }}>
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('All')}</SelectItem>
                            <SelectItem value="active">{t('Active')}</SelectItem>
                            <SelectItem value="inactive">{t('Inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <PerPageSelector routeName="blogs.index" filters={filters} />
                </CardContent>
                <CardContent className="p-0"><DataTable data={blogs.data} columns={columns} /></CardContent>
                <CardContent className="px-4 py-2 border-t"><Pagination data={blogs} routeName="blogs.index" filters={filters} /></CardContent>
            </Card>
            <ConfirmationDialog open={deleteState.isOpen} onOpenChange={closeDeleteDialog} title={t('Delete Blog')} message={deleteState.message} confirmText={t('Delete')} onConfirm={confirmDelete} variant="destructive" />
        </AuthenticatedLayout>
    );
}
