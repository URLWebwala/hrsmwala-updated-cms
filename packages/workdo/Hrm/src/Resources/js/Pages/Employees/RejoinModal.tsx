import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { Employee } from './types';
import { UserCheck, ShieldCheck, Sparkles, Calendar, Clock } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

interface RejoinModalProps {
    employee: Employee;
    onSuccess: () => void;
}

export default function RejoinModal({ employee, onSuccess }: RejoinModalProps) {
    const { t } = useTranslation();
    const existingTermination = employee.latestTermination || employee.latest_termination;

    const { data, setData, post, processing, errors } = useForm({
        rejoin_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hrm.employees.rejoin', employee.id), {
            preserveScroll: true,
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border shadow-2xl">
            {/* Header */}
            <div className="p-5 pb-4 bg-gradient-to-r from-emerald-50 via-emerald-50/40 to-transparent dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-transparent border-b">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-800/40">
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-bold text-foreground">
                            {t('Rejoin Employee')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-semibold text-foreground">{employee.user?.name || '-'}</span> &bull; <span className="font-mono">{employee.employee_id}</span>
                        </DialogDescription>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 dark:border-emerald-800/40 rounded-lg flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-0.5">
                        <p className="font-semibold text-emerald-800 dark:text-emerald-300">{t('Reactivation & Attendance')}</p>
                        <p className="text-[11px] leading-relaxed opacity-90">
                            {t('Login access will be restored immediately. Attendance calculations will resume seamlessly on and after the selected rejoin date.')}
                        </p>
                    </div>
                </div>

                {existingTermination && (
                    <div className="text-xs p-2.5 bg-muted/40 rounded-lg border text-muted-foreground flex justify-between items-center">
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {t('Previous Termination Date')}:
                        </span>
                        <span className="font-bold text-foreground">{formatDate(existingTermination.termination_date || '')}</span>
                    </div>
                )}

                <form onSubmit={submit} id="rejoin-employee-form" className="space-y-4">
                    <div className="space-y-1.5">
                        <Label required className="text-xs font-semibold flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {t('Rejoin Date / New Start Date')}
                        </Label>
                        <DatePicker
                            value={data.rejoin_date}
                            onChange={(date) => setData('rejoin_date', date)}
                            placeholder={t('Select Rejoin Date')}
                            required
                        />
                        <InputError message={errors.rejoin_date} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="notes" className="text-xs font-semibold">
                            {t('Rejoin Remarks / Notes (Optional)')}
                        </Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder={t('Enter any notes regarding employee rejoining...')}
                            rows={2}
                        />
                        <InputError message={errors.notes} />
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
                    form="rejoin-employee-form"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 px-4 shadow-sm" 
                    disabled={processing}
                >
                    <Sparkles className="h-4 w-4" />
                    {processing ? t('Rejoining...') : t('Confirm Rejoin')}
                </Button>
            </div>
        </DialogContent>
    );
}
