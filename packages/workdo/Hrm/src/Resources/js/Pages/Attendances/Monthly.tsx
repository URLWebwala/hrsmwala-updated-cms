import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MonthPicker } from '@/components/ui/month-picker';
import { Filter, Download, Calendar as CalendarIcon, Users as UsersIcon, Clock, AlertTriangle, CheckCircle2, Info, Monitor } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MonthlyAttendanceProps {
    attendanceData: any[];
    daysInMonth: number;
    month: string;
    branches: any[];
    departments: any[];
    employees: any[];
    summary: {
        total_present: number;
        total_leave: number;
        total_overtime: number;
        total_late: number;
        total_early: number;
        duration: string;
    };
    auth: any;
    [key: string]: any;
}

export default function Monthly() {
    const { t } = useTranslation();
    const props = usePage<MonthlyAttendanceProps>().props;
    const { attendanceData, daysInMonth, month, branches, departments, employees, summary } = props;
    
    const urlParams = new URLSearchParams(window.location.search);
    const [filters, setFilters] = useState({
        month: urlParams.get('month') || new Date().toISOString().slice(0, 7),
        branch_id: urlParams.get('branch_id') || '',
        department_id: urlParams.get('department_id') || '',
        employee_id: urlParams.get('employee_id') || '',
    });

    const handleFilter = () => {
        router.get(route('hrm.attendances.monthly'), filters, {
            preserveState: true,
            replace: true
        });
    };

    const clearFilters = () => {
        setFilters({
            month: new Date().toISOString().slice(0, 7),
            branch_id: '',
            department_id: '',
            employee_id: '',
        });
        router.get(route('hrm.attendances.monthly'));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'P': return 'bg-green-500 text-white border-green-600'; // Present
            case 'A': return 'bg-rose-500 text-white border-rose-600';   // Absent
            case 'H': return 'bg-amber-500 text-white border-amber-600'; // Half Day
            case 'O': return 'bg-indigo-500 text-white border-indigo-600'; // Holiday
            case 'L': return 'bg-sky-500 text-white border-sky-600';    // Leave
            case 'F': return 'bg-blue-600 text-white border-blue-700';   // Festival
            default: return 'bg-muted/50 text-muted-foreground border-muted';
        }
    };

    const renderDayHeaders = () => {
        const headers = [];
        for (let i = 1; i <= daysInMonth; i++) {
            headers.push(
                <th key={i} className="px-1 py-3 text-center text-[10px] font-bold text-muted-foreground border-x border-border min-w-[35px]">
                    {i.toString().padStart(2, '0')}
                </th>
            );
        }
        return headers;
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: t('Hrm'), url: route('hrm.index') },
                { label: t('Attendance'), url: route('hrm.attendances.index') },
                { label: t('Monthly Attendance') }
            ]}
            pageTitle={t('Manage Monthly Attendance')}
            pageActions={
                <Button size="sm" variant="outline" className="gap-2 shadow-sm border-primary/20 hover:bg-primary/5">
                    <Download className="h-4 w-4" />
                    {t('Export')}
                </Button>
            }
        >
            <Head title={t('Monthly Attendance')} />

            <div className="space-y-6">
                
                {/* Filters Card - Improved Theme Alignment */}
                <Card className="border-border shadow-sm bg-card overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-primary" />
                                    {t('Month')}
                                </label>
                                <MonthPicker 
                                    value={filters.month} 
                                    onChange={(v) => setFilters({...filters, month: v})}
                                    className="bg-muted/30 border-input"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Monitor className="h-4 w-4 text-primary" />
                                    {t('Branch')}
                                </label>
                                <Select value={filters.branch_id} onValueChange={(v) => setFilters({...filters, branch_id: v})}>
                                    <SelectTrigger className="bg-muted/30 border-input">
                                        <SelectValue placeholder={t('Select Branch')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {branches.map((b: any) => (
                                            <SelectItem key={b.id} value={b.id.toString()}>{b.branch_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <UsersIcon className="h-4 w-4 text-primary" />
                                    {t('Department')}
                                </label>
                                <Select value={filters.department_id} onValueChange={(v) => setFilters({...filters, department_id: v})}>
                                    <SelectTrigger className="bg-muted/30 border-input">
                                        <SelectValue placeholder={t('Select Department')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((d: any) => (
                                            <SelectItem key={d.id} value={d.id.toString()}>{d.department_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <UsersIcon className="h-4 w-4 text-primary" />
                                    {t('Employee')}
                                </label>
                                <Select value={filters.employee_id} onValueChange={(v) => setFilters({...filters, employee_id: v})}>
                                    <SelectTrigger className="bg-muted/30 border-input">
                                        <SelectValue placeholder={t('Select Employee')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((e: any) => (
                                            <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                                {t('Reset')}
                            </Button>
                            <Button onClick={handleFilter} className="bg-primary text-primary-foreground shadow-sm hover:opacity-90 transition-all px-6">
                                <Filter className="h-4 w-4 mr-2" />
                                {t('Apply Filters')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Section - More subtle theme mapping */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="border-border shadow-sm bg-card overflow-hidden">
                        <CardContent className="p-4 flex flex-col gap-1 items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Report')}</span>
                            <span className="text-base font-bold text-foreground">Attendance Summary</span>
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-sm bg-card overflow-hidden">
                        <CardContent className="p-4 flex flex-col gap-1 items-center justify-center text-center">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('Duration')}</span>
                            <span className="text-base font-bold text-foreground">{summary.duration}</span>
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-sm bg-green-50/50 dark:bg-green-900/10 overflow-hidden">
                        <CardContent className="p-4 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">{t('Attendance')}</span>
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">{t('Total Present: ')} <b className="text-foreground">{summary.total_present}</b></span>
                                <span className="text-xs text-muted-foreground">{t('Total Leave: ')} <b className="text-foreground">{summary.total_leave}</b></span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-sm bg-blue-50/50 dark:bg-blue-900/10 overflow-hidden">
                        <CardContent className="p-4 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t('Overtime')}</span>
                                <Clock className="h-3 w-3 text-blue-500" />
                            </div>
                            <span className="text-xs text-muted-foreground">{t('Total hours: ')} <b className="text-foreground">{summary.total_overtime}h</b></span>
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-sm bg-rose-50/50 dark:bg-rose-900/10 overflow-hidden">
                        <CardContent className="p-4 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">{t('Late/Early')}</span>
                                <AlertTriangle className="h-3 w-3 text-rose-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">{t('Employee Late: ')} <b className="text-foreground">{summary.total_late}h</b></span>
                                <span className="text-xs text-muted-foreground">{t('Early Leave: ')} <b className="text-foreground">{summary.total_early}h</b></span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Legends */}
                <div className="flex flex-wrap items-center gap-4 py-3 px-5 bg-card/60 rounded-lg border border-border shadow-sm">
                    <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        {t('Attendance Codes')}:
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm bg-green-500" title={t('Present')} />
                        <span className="text-[10px] font-bold text-muted-foreground">{t('Present')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm bg-rose-500" title={t('Absent')} />
                        <span className="text-[10px] font-bold text-muted-foreground">{t('Absent')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm bg-amber-500" title={t('Half Day')} />
                        <span className="text-[10px] font-bold text-muted-foreground">{t('Half Day')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm bg-indigo-500" title={t('Holiday')} />
                        <span className="text-[10px] font-bold text-muted-foreground">{t('Holiday')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm bg-sky-500" title={t('Leave')} />
                        <span className="text-[10px] font-bold text-muted-foreground">{t('Leave')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-sm bg-blue-600" title={t('Festival')} />
                        <span className="text-[10px] font-bold text-muted-foreground">{t('Festival')}</span>
                    </div>
                </div>

                {/* Main Table Card - Cleaned up to match standard ERP look */}
                <Card className="border-border shadow-sm bg-card overflow-hidden rounded-md">
                    <CardHeader className="bg-muted/10 border-b border-border py-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold text-foreground">{month}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-muted/5">
                                        <th className="sticky left-0 bg-background/95 z-20 px-6 py-4 text-left text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-r border-border backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] min-w-[200px]">
                                            {t('Employee Name')}
                                        </th>
                                        {renderDayHeaders()}
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData.length > 0 ? (
                                        attendanceData.map((emp, idx) => (
                                            <tr key={emp.id} className={cn("hover:bg-primary/[0.02] transition-colors", idx % 2 === 0 ? "bg-card" : "bg-muted/5")}>
                                                <td className="sticky left-0 bg-inherit z-10 px-6 py-3.5 text-xs font-bold text-foreground border-b border-r border-border backdrop-blur-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                    {emp.name}
                                                </td>
                                                {Object.entries(emp.attendance).map(([day, status]: any) => (
                                                    <td key={day} className="px-1 py-1 text-center border-b border-x border-border/30 min-w-[35px]">
                                                        {status ? (
                                                            <div className={cn(
                                                                "w-6 h-6 mx-auto rounded-sm flex items-center justify-center text-[10px] font-bold shadow-sm border",
                                                                getStatusColor(status)
                                                            )}>
                                                                {status}
                                                            </div>
                                                        ) : (
                                                            <div className="w-1 h-1 mx-auto bg-border rounded-full" />
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={daysInMonth + 1} className="py-24 text-center text-muted-foreground italic text-sm">
                                                <div className="flex flex-col items-center gap-2 opacity-50">
                                                    <CalendarIcon className="h-10 w-10" />
                                                    {t('No attendance data found for the selected period.')}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
