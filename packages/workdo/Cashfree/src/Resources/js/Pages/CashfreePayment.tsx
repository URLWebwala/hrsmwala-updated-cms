import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

interface CashfreePaymentProps {
    payment_session_id: string;
    environment: string;
}

declare global {
    interface Window {
        Cashfree: any;
    }
}

const CashfreePayment: React.FC<CashfreePaymentProps> = ({ payment_session_id, environment }) => {
    const { t } = useTranslation();
    
    useEffect(() => {
        if (payment_session_id) {
            const script = document.createElement('script');
            script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
            script.onload = () => {
                const cashfree = window.Cashfree({
                    mode: environment === 'production' ? 'production' : 'sandbox'
                });
                
                cashfree.checkout({
                    paymentSessionId: payment_session_id,
                    redirectTarget: "_self", // Redirect in the same tab
                });
            };
            document.head.appendChild(script);
        }
    }, [payment_session_id, environment]);

    return (
        <>
            <Head title={t('Cashfree Payment')} />
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('Redirecting to Cashfree...')}</p>
                </div>
            </div>
        </>
    );
};

export default CashfreePayment;
