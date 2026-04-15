import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Head } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from '@/components/charts';
import { Building2, ShoppingCart, CreditCard, Crown, Eye, Newspaper, TrendingUp } from "lucide-react";
import { formatCurrency } from '@/utils/helpers';

interface SuperAdminDashboardProps {
    stats: {
        order_payments: number;
        total_orders: number;
        total_plans: number;
        total_companies: number;
    };
    chartData: Array<{
        month: string;
        orders: number;
        payments: number;
    }>;
    blogInsights: {
        total_blogs: number;
        active_blogs: number;
        total_reads: number;
        average_reads: number;
        top_blogs: Array<{
            id: number;
            title: string;
            slug: string;
            category: string | null;
            author_name: string | null;
            read_count: number;
            published_at: string | null;
        }>;
    };
}

export default function SuperAdminDashboard({ stats, chartData, blogInsights }: SuperAdminDashboardProps) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout
            breadcrumbs={[{ label: t('Dashboard') }]}
            pageTitle={t('Dashboard')}
        >
            <Head title={t('Dashboard')} />

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="relative overflow-hidden bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">{t('Total Orders')}</CardTitle>
                        <ShoppingCart className="h-8 w-8 text-green-700 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{stats.total_orders}</div>
                        <p className="text-xs text-green-700 opacity-80 mt-1">{t('All orders')}</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">{t('Order Payments')}</CardTitle>
                        <CreditCard className="h-8 w-8 text-blue-700 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{formatCurrency(stats.order_payments)}</div>
                        <p className="text-xs text-blue-700 opacity-80 mt-1">{t('Total payments')}</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700">{t('Total Plans')}</CardTitle>
                        <Crown className="h-8 w-8 text-purple-700 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700">{stats.total_plans}</div>
                        <p className="text-xs text-purple-700 opacity-80 mt-1">{t('Available plans')}</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-orange-700">{t('Total Companies')}</CardTitle>
                        <Building2 className="h-8 w-8 text-orange-700 opacity-80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-700">{stats.total_companies}</div>
                        <p className="text-xs text-orange-700 opacity-80 mt-1">{t('Registered companies')}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders Chart */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>{t('Recent Orders (Monthly)')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <LineChart
                        data={chartData}
                        dataKey="orders"
                        height={300}
                        showTooltip={true}
                        showGrid={true}
                        lines={[
                            { dataKey: 'orders', color: '#3b82f6', name: 'Orders' }
                        ]}
                        xAxisKey="month"
                        showLegend={true}
                    />
                </CardContent>
            </Card>

            {/* Blog Insights */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>{t('Blog Performance Insights')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-green-700">{t('Total Blogs')}</p>
                                <Newspaper className="h-4 w-4 text-green-700 opacity-80" />
                            </div>
                            <p className="mt-2 text-2xl font-bold text-green-700">{blogInsights?.total_blogs ?? 0}</p>
                        </div>
                        <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-blue-700">{t('Active Blogs')}</p>
                                <TrendingUp className="h-4 w-4 text-blue-700 opacity-80" />
                            </div>
                            <p className="mt-2 text-2xl font-bold text-blue-700">{blogInsights?.active_blogs ?? 0}</p>
                        </div>
                        <div className="rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-purple-700">{t('Total Reads')}</p>
                                <Eye className="h-4 w-4 text-purple-700 opacity-80" />
                            </div>
                            <p className="mt-2 text-2xl font-bold text-purple-700">{(blogInsights?.total_reads ?? 0).toLocaleString()}</p>
                        </div>
                        <div className="rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-orange-700">{t('Avg Reads/Blog')}</p>
                                <Eye className="h-4 w-4 text-orange-700 opacity-80" />
                            </div>
                            <p className="mt-2 text-2xl font-bold text-orange-700">{(blogInsights?.average_reads ?? 0).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="rounded-lg border">
                        <div className="border-b px-4 py-3">
                            <h3 className="text-sm font-semibold">{t('Top Trending Blogs')}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/30">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">{t('Rank')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Blog Title')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Category')}</th>
                                        <th className="px-4 py-3 text-left font-medium">{t('Author')}</th>
                                        <th className="px-4 py-3 text-right font-medium">{t('Reads')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(blogInsights?.top_blogs ?? []).length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-center text-muted-foreground" colSpan={5}>
                                                {t('No blog data available yet.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        (blogInsights?.top_blogs ?? []).map((blog, index) => (
                                            <tr key={blog.id} className="border-t">
                                                <td className="px-4 py-3 font-medium">#{index + 1}</td>
                                                <td className="px-4 py-3">{blog.title}</td>
                                                <td className="px-4 py-3">{blog.category || '-'}</td>
                                                <td className="px-4 py-3">{blog.author_name || '-'}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{blog.read_count.toLocaleString()}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </AuthenticatedLayout>
    );
}
