import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, RevenueVsExpensesChart } from '@/components/charts';
import { UserCheck, Building2, ArrowUpCircle, ArrowDownCircle, Banknote, Receipt, CalendarDays } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/helpers';

const DASHBOARD_MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2000, i, 1).toLocaleDateString(undefined, { month: 'long' }),
}));

interface AccountProps {
    message: string;
    stats?: {
        total_items: number;
        active_items: number;
        inactive_items: number;
        total_clients: number;
        total_vendors: number;
        total_customer_payment: number;
        total_vendor_payment: number;
        total_expense?: number;
        year_posted_revenue?: number;
        year_posted_expense?: number;
        filter_month_revenue?: number;
        filter_month_expense?: number;
        filter_month_name?: string;
        dashboard_report_year?: number;
    };
    monthlyVendorPayments?: Array<{ month: string; vendor_payments: number }>;
    monthlyCustomerPayments?: Array<{ month: string; customer_payments: number }>;
    monthlyBookedRevenues?: Array<{ month: string; booked_revenue: number }>;
    monthlyBookedExpenses?: Array<{ month: string; booked_expense: number }>;
    recentRevenues?: Array<{ id: number; title: string; description: string; amount: number; date: string }>;
    recentExpenses?: Array<{ id: number; title: string; description: string; amount: number; date: string }>;
    recent_items?: Array<{
        id: number;
        name: string;
        created_at: string;
    }>;
    yearlyProfitLoss?: Array<{ month: string; revenue: number; expenses: number }>;
    profit_loss_year?: number;
    dashboard_filter?: { year: number; month: number };
    dashboard_year_options?: number[];
}

export default function AccountIndex({ message, stats, monthlyVendorPayments, monthlyCustomerPayments, monthlyBookedRevenues, monthlyBookedExpenses, yearlyProfitLoss, profit_loss_year, dashboard_filter, dashboard_year_options, recentRevenues, recentExpenses, recent_items }: AccountProps) {
    const { t } = useTranslation();
    const page = usePage();
    const { auth } = page.props as { auth?: { user?: { permissions?: string[] } } };
    const canEditRevenue = auth?.user?.permissions?.includes('edit-revenues');

    const applyDashboardPeriod = (year: number, month: number) => {
        router.get(route('account.index'), { year, month }, { preserveScroll: true });
    };

    const periodFilter =
        dashboard_filter && dashboard_year_options && dashboard_year_options.length > 0 ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="text-xs text-muted-foreground hidden md:inline">{t('Report period')}</span>
                <Select
                    value={String(dashboard_filter.month)}
                    onValueChange={(v) => applyDashboardPeriod(dashboard_filter.year, Number(v))}
                >
                    <SelectTrigger className="h-9 w-[min(100vw-8rem,9.5rem)] sm:w-[9.5rem] text-sm">
                        <SelectValue placeholder={t('Month')} />
                    </SelectTrigger>
                    <SelectContent>
                        {DASHBOARD_MONTH_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={String(dashboard_filter.year)}
                    onValueChange={(v) => applyDashboardPeriod(Number(v), dashboard_filter.month)}
                >
                    <SelectTrigger className="h-9 w-[5.5rem] text-sm">
                        <SelectValue placeholder={t('Year')} />
                    </SelectTrigger>
                    <SelectContent>
                        {dashboard_year_options.map((y) => (
                            <SelectItem key={y} value={String(y)}>
                                {String(y)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        ) : null;

    const recentPeriodLabel =
        stats?.filter_month_name != null && stats?.dashboard_report_year != null
            ? `${stats.filter_month_name} ${stats.dashboard_report_year}`
            : t('Selected period');

    return (
        <AuthenticatedLayout
            breadcrumbs={[{label: t('Account')}]}
            pageTitle={t('Account Dashboard')}
            pageTitleClass="text-lg"
            pageActions={periodFilter}
        >
            <Head title={t('Account')} />

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-orange-700">{t('Total Clients')}</CardTitle>
                                <UserCheck className="h-8 w-8 text-orange-700 opacity-80" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-700">{stats.total_clients || 0}</div>
                                <p className="text-xs text-orange-700 opacity-80 mt-1">{t('Active clients')}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-teal-700">{t('Total Vendors')}</CardTitle>
                                <Building2 className="h-8 w-8 text-teal-700 opacity-80" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-teal-700">{stats.total_vendors || 0}</div>
                                <p className="text-xs text-teal-700 opacity-80 mt-1">{t('Active vendors')}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-700">{t('Total Customer Payment')}</CardTitle>
                                <ArrowDownCircle className="h-8 w-8 text-emerald-700 opacity-80" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-emerald-700">{formatCurrency(stats.total_customer_payment || 0)}</div>
                                <p className="text-xs text-emerald-700 opacity-80 mt-1">{t('Received payments')}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-r from-rose-50 to-rose-100 border-rose-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-rose-700">{t('Total Vendor Payment')}</CardTitle>
                                <ArrowUpCircle className="h-8 w-8 text-rose-700 opacity-80" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-rose-700">{formatCurrency(stats.total_vendor_payment || 0)}</div>
                                <p className="text-xs text-rose-700 opacity-80 mt-1">{t('Paid to vendors')}</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-800">{t('Total Revenue')}</CardTitle>
                                <Banknote className="h-8 w-8 text-green-800 opacity-80" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-800">{formatCurrency(stats.year_posted_revenue ?? 0)}</div>
                                <p className="text-xs text-green-800 opacity-80 mt-1">
                                    {stats.dashboard_report_year != null
                                        ? t('Posted revenue in {{year}}', { year: stats.dashboard_report_year })
                                        : t('Posted revenue (year)')}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-800">{t('Total Expenses')}</CardTitle>
                                <Receipt className="h-8 w-8 text-red-800 opacity-80" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-800">{formatCurrency(stats.year_posted_expense ?? 0)}</div>
                                <p className="text-xs text-red-800 opacity-80 mt-1">
                                    {stats.dashboard_report_year != null
                                        ? t('Posted expenses in {{year}}', { year: stats.dashboard_report_year })
                                        : t('Posted expenses (year)')}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-r from-violet-50 to-violet-100 border-violet-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-violet-800">
                                    {stats.filter_month_name ? `${stats.filter_month_name} ${t('Revenue')}` : t('Monthly revenue')}
                                </CardTitle>
                                <CalendarDays className="h-8 w-8 text-violet-800 opacity-80" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-violet-800">{formatCurrency(stats.filter_month_revenue ?? 0)}</div>
                                <p className="text-xs text-violet-800 opacity-80 mt-1">
                                    {stats.filter_month_name != null && stats.dashboard_report_year != null
                                        ? t('Posted in {{month}} {{year}}', {
                                              month: stats.filter_month_name,
                                              year: stats.dashboard_report_year,
                                          })
                                        : t('Posted for selected month')}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-amber-900">
                                    {stats.filter_month_name ? `${stats.filter_month_name} ${t('Expense')}` : t('Monthly expense')}
                                </CardTitle>
                                <CalendarDays className="h-8 w-8 text-amber-900 opacity-80" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-900">{formatCurrency(stats.filter_month_expense ?? 0)}</div>
                                <p className="text-xs text-amber-900 opacity-80 mt-1">
                                    {stats.filter_month_name != null && stats.dashboard_report_year != null
                                        ? t('Posted in {{month}} {{year}}', {
                                              month: stats.filter_month_name,
                                              year: stats.dashboard_report_year,
                                          })
                                        : t('Posted for selected month')}
                                </p>
                            </CardContent>
                        </Card>
                </div>
            )}

            {yearlyProfitLoss && yearlyProfitLoss.length > 0 && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold tracking-tight">{t('Revenue vs Expenses Growth')}</CardTitle>
                        <CardDescription>
                            {profit_loss_year != null
                                ? t('Yearly comparison of posted revenue and expenses for {{year}}.', { year: profit_loss_year })
                                : t('Yearly comparison of posted revenue and expenses for the current calendar year.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueVsExpensesChart
                            data={yearlyProfitLoss}
                            height={380}
                            revenueLabel={t('Revenue')}
                            expensesLabel={t('Expenses')}
                            formatValue={(v) => formatCurrency(v, page.props)}
                        />
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-6">
                    <Card className="h-96">
                        <CardHeader>
                            <CardTitle className="text-base">{t('Monthly Customer Payments')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LineChart
                                data={monthlyCustomerPayments}
                                height={300}
                                showTooltip={true}
                                showGrid={true}
                                lines={[
                                    { dataKey: 'customer_payments', color: '#10b77f', name: 'Customer Payments' }
                                ]}
                                xAxisKey="month"
                                showLegend={true}
                            />
                        </CardContent>
                    </Card>

                    {recentRevenues && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base">{t('Recent Revenue')}</CardTitle>
                                <span className="text-xs text-gray-500">{recentPeriodLabel}</span>
                            </CardHeader>
                            <CardContent>
                                <div className="max-h-80 overflow-y-auto space-y-3">
                                    {recentRevenues.slice(0, 5).map((revenue) => (
                                        <div key={revenue.id} className="flex justify-between items-center p-3 rounded-lg border gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-sm">{revenue.title}</p>
                                                <p className="text-xs text-gray-600">{revenue.description}</p>
                                                <p className="text-xs text-gray-500">{formatDate(revenue.date)}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                {canEditRevenue && (
                                                    <Link
                                                        href={route('account.revenues.index', { search: revenue.title })}
                                                        className="text-xs font-medium text-primary hover:underline"
                                                    >
                                                        {t('Edit')}
                                                    </Link>
                                                )}
                                                <div className="text-green-600 font-bold">{formatCurrency(revenue.amount)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="h-96">
                        <CardHeader>
                            <CardTitle className="text-base">{t('Monthly Vendor Payments')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LineChart
                                data={monthlyVendorPayments}
                                height={300}
                                showTooltip={true}
                                showGrid={true}
                                lines={[
                                    { dataKey: 'vendor_payments', color: '#ef4444', name: 'Vendor Payments' }
                                ]}
                                xAxisKey="month"
                                showLegend={true}
                            />
                        </CardContent>
                    </Card>

                    {recentExpenses && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base">{t('Recent Expenses')}</CardTitle>
                                <span className="text-xs text-gray-500">{recentPeriodLabel}</span>
                            </CardHeader>
                            <CardContent>
                                <div className="max-h-80 overflow-y-auto space-y-3">
                                    {recentExpenses.slice(0, 5).map((expense) => (
                                        <div key={expense.id} className="flex justify-between items-center p-3 rounded-lg border">
                                            <div>
                                                <p className="font-medium text-sm">{expense.title}</p>
                                                <p className="text-xs text-gray-600">{expense.description}</p>
                                                <p className="text-xs text-gray-500">{formatDate(expense.date)}</p>
                                            </div>
                                            <div className="text-red-600 font-bold">{formatCurrency(expense.amount)}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {(monthlyBookedRevenues?.length || monthlyBookedExpenses?.length) ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <Card className="h-96">
                        <CardHeader>
                            <CardTitle className="text-base">{t('Monthly Booked Revenue')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LineChart
                                data={monthlyBookedRevenues || []}
                                height={300}
                                showTooltip={true}
                                showGrid={true}
                                lines={[
                                    { dataKey: 'booked_revenue', color: '#059669', name: t('Posted revenue') }
                                ]}
                                xAxisKey="month"
                                showLegend={true}
                            />
                        </CardContent>
                    </Card>
                    <Card className="h-96">
                        <CardHeader>
                            <CardTitle className="text-base">{t('Monthly Booked Expenses')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LineChart
                                data={monthlyBookedExpenses || []}
                                height={300}
                                showTooltip={true}
                                showGrid={true}
                                lines={[
                                    { dataKey: 'booked_expense', color: '#dc2626', name: t('Posted expenses') }
                                ]}
                                xAxisKey="month"
                                showLegend={true}
                            />
                        </CardContent>
                    </Card>
                </div>
            ) : null}

        </AuthenticatedLayout>
    );
}
