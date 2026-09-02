import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { DatePicker } from '@/components/ui/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { Employee } from './types';
import { UserCheck, Info, Sparkles } from 'lucide-react';
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-lg font-bold text-foreground">
                            {t('Rejoin Employee')}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {employee.user?.name || '-'} ({employee.employee_id})
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200">
                <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                    <span className="font-semibold block">{t('Reactivation & Attendance')}</span>
                    {t('Login access will be restored immediately. Attendance calculations will resume on and after the selected rejoin date.')}
                </div>
            </div>

            {existingTermination && (
                <div className="text-xs p-2.5 bg-muted/40 rounded-md border text-muted-foreground flex justify-between items-center">
                    <span>{t('Previous Termination Date')}:</span>
                    <span className="font-bold text-foreground">{formatDate(existingTermination.termination_date || '')}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4 pt-1">
                <div>
                    <Label required>{t('Rejoin Date / New Start Date')}</Label>
                    <DatePicker
                        value={data.rejoin_date}
                        onChange={(date) => setData('rejoin_date', date)}
                        placeholder={t('Select Rejoin Date')}
                        required
                    />
                    <InputError message={errors.rejoin_date} />
                </div>

                <div>
                    <Label htmlFor="notes">{t('Rejoin Remarks / Notes (Optional)')}</Label>
                    <Textarea
                        id="notes"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        placeholder={t('Enter any notes regarding employee rejoining...')}
                        rows={2}
                    />
                    <InputError message={errors.notes} />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button type="button" variant="outline" onClick={onSuccess}>
                        {t('Cancel')}
                    </Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" disabled={processing}>
                        <Sparkles className="h-4 w-4" />
                        {processing ? t('Rejoining...') : t('Confirm Rejoin')}
                    </Button>
                </div>
            </form>
        </DialogContent>
    );
}
