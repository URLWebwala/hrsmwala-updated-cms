import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm, router } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MediaPicker from '@/components/MediaPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormFields } from '@/hooks/useFormFields';
import { Employee } from './types';
import { UserX, ShieldCheck, Trash2, Calendar, FileText, AlertCircle } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import { useEffect } from 'react';

interface QuickTerminateModalProps {
    employee: Employee;
    terminationtypes?: any[];
    onSuccess: () => void;
}

export default function QuickTerminateModal({ employee, terminationtypes = [], onSuccess }: QuickTerminateModalProps) {
    const { t } = useTranslation();
    const existingTermination = employee.latestTermination || employee.latest_termination;
    const isAlreadyTerminated = !!existingTermination && existingTermination.status !== 'rejected' && !existingTermination.rejoin_date;

    const defaultTypeId = terminationtypes?.length > 0 ? terminationtypes[0].id.toString() : '';

    const { data, setData, post, processing, errors } = useForm({
        employee_id: employee.user_id ? employee.user_id.toString() : '',
        termination_type_id: existingTermination?.termination_type_id ? existingTermination.termination_type_id.toString() : defaultTypeId,
        notice_date: existingTermination?.notice_date || new Date().toISOString().split('T')[0],
        termination_date: existingTermination?.termination_date || new Date().toISOString().split('T')[0],
        reason: existingTermination?.reason || '',
        description: existingTermination?.description || '',
        document: existingTermination?.document || '',
        status: 'approved',
    });

    useEffect(() => {
        if (!data.termination_type_id && terminationtypes?.length > 0) {
            setData('termination_type_id', terminationtypes[0].id.toString());
        }
    }, [terminationtypes]);

    const reasonAI = useFormFields('aiField', data, setData, errors, 'create', 'reason', 'Reason', 'hrm', 'termination');
    const descriptionAI = useFormFields('aiField', data, setData, errors, 'create', 'description', 'Description', 'hrm', 'termination');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hrm.terminations.store'), {
            preserveScroll: true,
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    const handleCancelTermination = () => {
        if (!existingTermination?.id) return;
        if (confirm(t('Are you sure you want to cancel the termination and reactivate this employee?'))) {
            router.delete(route('hrm.terminations.destroy', existingTermination.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onSuccess();
                }
            });
        }
    };

    return (
        <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden border shadow-2xl">
            {/* Header */}
            <div className="p-5 pb-4 bg-gradient-to-r from-rose-50 via-rose-50/40 to-transparent dark:from-rose-950/40 dark:via-rose-950/20 dark:to-transparent border-b">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm border border-rose-200 dark:border-rose-800/40">
                        <UserX className="h-5 w-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                            {isAlreadyTerminated ? t('Update Employee Termination') : t('Terminate Employee')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-semibold text-foreground">{employee.user?.name || '-'}</span> &bull; <span className="font-mono">{employee.employee_id}</span>
                        </DialogDescription>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Information Callout */}
                <div className="p-3 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/20 dark:border-amber-800/40 rounded-lg flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                    <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-0.5">
                        <p className="font-semibold text-amber-800 dark:text-amber-300">{t('Data Safe Notice')}</p>
                        <p className="text-[11px] leading-relaxed opacity-90">
                            {t('Employee historical attendance and records are fully preserved. Attendance tracking will stop from the selected termination date and login access will be restricted.')}
                        </p>
                    </div>
                </div>

                {isAlreadyTerminated && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-lg flex items-center justify-between text-xs text-rose-900 dark:text-rose-200">
                        <div>
                            <span className="font-bold">{t('Current Status')}: </span>
                            {t('Terminated on')} <b>{formatDate(existingTermination?.termination_date || '')}</b>
                        </div>
                        <Button 
                            type="button" 
                            size="sm" 
                            variant="destructive" 
                            onClick={handleCancelTermination}
                            className="h-7 text-xs gap-1.5"
                        >
                            <Trash2 className="h-3 w-3" />
                            {t('Reactivate Employee')}
                        </Button>
                    </div>
                )}

                <form onSubmit={submit} id="quick-terminate-form" className="space-y-4">
                    {/* Date Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label required className="text-xs font-semibold flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {t('Last Working Day')}
                            </Label>
                            <DatePicker
                                value={data.termination_date}
                                onChange={(date) => {
                                    setData(prev => ({
                                        ...prev,
                                        termination_date: date,
                                        notice_date: prev.notice_date || date
                                    }));
                                }}
                                placeholder={t('Select Date')}
                                required
                            />
                            <InputError message={errors.termination_date} />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                {t('Notice Date')}
                            </Label>
                            <DatePicker
                                value={data.notice_date}
                                onChange={(date) => setData('notice_date', date)}
                                placeholder={t('Select Notice Date')}
                            />
                            <InputError message={errors.notice_date} />
                        </div>
                    </div>

                    {/* Termination Type */}
                    <div className="space-y-1.5">
                        <Label htmlFor="termination_type_id" required className="text-xs font-semibold">
                            {t('Termination Type')}
                        </Label>
                        <Select 
                            value={data.termination_type_id?.toString() || ''} 
                            onValueChange={(value) => setData('termination_type_id', value)} 
                            required
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('Select Termination Type')} />
                            </SelectTrigger>
                            <SelectContent searchable={true}>
                                {terminationtypes?.map((item: any) => (
                                    <SelectItem key={item.id} value={item.id.toString()}>
                                        {item.termination_type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.termination_type_id} />
                    </div>

                    {/* Reason */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="reason" required className="text-xs font-semibold">
                                {t('Reason')}
                            </Label>
                            {reasonAI.length > 0 && (
                                <div className="flex gap-1">
                                    {reasonAI.map(field => <div key={field.id}>{field.component}</div>)}
                                </div>
                            )}
                        </div>
                        <Input
                            id="reason"
                            type="text"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            placeholder={t('e.g. Left company, Resignation, Contract ended')}
                            required
                        />
                        <InputError message={errors.reason} />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="description" className="text-xs font-semibold">
                                {t('Description (Optional)')}
                            </Label>
                            {descriptionAI.length > 0 && (
                                <div className="flex gap-1">
                                    {descriptionAI.map(field => <div key={field.id}>{field.component}</div>)}
                                </div>
                            )}
                        </div>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder={t('Enter additional details or remarks...')}
                            rows={2}
                        />
                        <InputError message={errors.description} />
                    </div>

                    {/* Document */}
                    <div className="space-y-1.5">
                        <MediaPicker
                            label={t('Document (Optional)')}
                            value={data.document}
                            onChange={(value) => setData('document', Array.isArray(value) ? value[0] || '' : value)}
                            placeholder={t('Select Document...')}
                            showPreview={true}
                            multiple={false}
                        />
                        <InputError message={errors.document} />
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-muted/20 border-t flex items-center justify-end gap-2.5">
                <Button type="button" variant="outline" onClick={onSuccess} className="px-4">
                    {t('Cancel')}
                </Button>
                <Button 
                    type="submit" 
                    form="quick-terminate-form" 
                    variant="destructive" 
                    disabled={processing}
                    className="gap-1.5 px-4 shadow-sm"
                >
                    <UserX className="h-4 w-4" />
                    {processing ? t('Saving...') : (isAlreadyTerminated ? t('Update Termination') : t('Terminate Employee'))}
                </Button>
            </div>
        </DialogContent>
    );
}
