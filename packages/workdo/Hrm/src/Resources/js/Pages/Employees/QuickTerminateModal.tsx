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
import { AlertTriangle, UserX, Info, CheckCircle2, Trash2 } from 'lucide-react';
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
    const isAlreadyTerminated = !!existingTermination && existingTermination.status !== 'rejected';

    const defaultTypeId = terminationtypes?.length > 0 ? terminationtypes[0].id.toString() : '';

    const { data, setData, post, processing, errors, reset } = useForm({
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
                        <UserX className="h-5 w-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-bold">
                            {isAlreadyTerminated ? t('Update Employee Termination') : t('Terminate Employee')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {employee.user?.name || '-'} ({employee.employee_id})
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            {/* Information Callout */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                    <span className="font-semibold block">{t('Data Safe Notice')}</span>
                    {t('Employee records and past attendance history will remain saved. The employee will not be marked absent after the termination date and will be excluded from future attendance sheets.')}
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
                        className="h-7 text-xs gap-1"
                    >
                        <Trash2 className="h-3 w-3" />
                        {t('Reactivate Employee')}
                    </Button>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <Label required>{t('Last Working Day / Termination Date')}</Label>
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

                    <div>
                        <Label>{t('Notice Date')}</Label>
                        <DatePicker
                            value={data.notice_date}
                            onChange={(date) => setData('notice_date', date)}
                            placeholder={t('Select Notice Date')}
                        />
                        <InputError message={errors.notice_date} />
                    </div>
                </div>

                <div>
                    <Label htmlFor="termination_type_id" required>{t('Termination Type')}</Label>
                    <Select 
                        value={data.termination_type_id?.toString() || ''} 
                        onValueChange={(value) => setData('termination_type_id', value)} 
                        required
                    >
                        <SelectTrigger>
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

                <div>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <Label htmlFor="reason" required>{t('Reason')}</Label>
                            <Input
                                id="reason"
                                type="text"
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                placeholder={t('Enter Reason (e.g. Left company, Resignation, Contract ended)')}
                                required
                            />
                            <InputError message={errors.reason} />
                        </div>
                        {reasonAI.map(field => <div key={field.id}>{field.component}</div>)}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <Label htmlFor="description">{t('Description (Optional)')}</Label>
                        <div className="flex gap-2">
                            {descriptionAI.map(field => <div key={field.id}>{field.component}</div>)}
                        </div>
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

                <div>
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

                <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button type="button" variant="outline" onClick={onSuccess}>
                        {t('Cancel')}
                    </Button>
                    <Button type="submit" variant="destructive" disabled={processing}>
                        {processing ? t('Saving...') : (isAlreadyTerminated ? t('Update Termination') : t('Terminate Employee'))}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
