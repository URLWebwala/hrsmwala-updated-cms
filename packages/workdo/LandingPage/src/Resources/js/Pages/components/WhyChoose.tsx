import React from 'react';
import { Check, ArrowRight, Minus } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';
import SectionHeading from './SectionHeading';
import { useTranslation } from 'react-i18next';

interface WhyChooseProps {
    settings?: any;
}

export default function WhyChoose({ settings }: WhyChooseProps) {
    const { t } = useTranslation();
    const colors = {
        primary: settings?.config_sections?.colors?.primary || '#3b82f6',
        secondary: settings?.config_sections?.colors?.secondary || '#2563eb',
    };

    const comparisonFeatures = [
        {
            feature: 'Real-time Time Tracking',
            hrmswala: 'Included',
            others: 'Often manual or basic',
        },
        {
            feature: 'Screenshot Monitoring',
            hrmswala: 'Included',
            others: 'Not always available',
        },
        {
            feature: 'Activity & App Tracking',
            hrmswala: 'Included',
            others: 'Limited in some tools',
        },
        {
            feature: 'AI-Powered Reports',
            hrmswala: 'Included',
            others: 'Often requires manual export',
        },
        {
            feature: 'Multi-platform Access',
            hrmswala: 'Web, desktop, and mobile',
            others: 'Sometimes web only',
        },
        {
            feature: 'Priority Support',
            hrmswala: 'Available',
            others: 'Standard support',
        },
        {
            feature: 'Transparent Pricing',
            hrmswala: 'No surprise add-ons',
            others: 'Extra charges may apply',
        },
    ];

    return (
        <section id="why-choose" className="py-24 bg-white relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="mb-16">
                    <SectionHeading
                        title={t('Why Teams Choose HRMswala')}
                        subtitle={t('Compare HRMswala with typical alternatives based on the features businesses use every day.')}
                        accentColor={colors.primary}
                    />
                </div>

                <AnimateOnScroll direction="up">
                    <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white/80 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="py-8 px-8 text-lg font-bold text-gray-900 border-b border-gray-100 min-w-[250px]">
                                            {t('Feature')}
                                        </th>
                                        <th className="py-8 px-8 text-center border-b border-gray-100 min-w-[200px] relative">
                                            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
                                                HRMswala
                                            </span>
                                        </th>
                                        <th className="py-8 px-8 text-center text-lg font-bold text-gray-500 border-b border-gray-100 min-w-[250px]">
                                            {t('Typical Alternatives')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonFeatures.map((item, index) => (
                                        <tr 
                                            key={index}
                                            className="group hover:bg-gray-50/30 transition-colors"
                                        >
                                            <td className="py-6 px-8 text-gray-700 font-semibold border-b border-gray-100">
                                                {t(item.feature)}
                                            </td>
                                            <td className="py-6 px-8 text-center border-b border-gray-100 bg-blue-50/20">
                                                <div className="flex flex-col items-center gap-2">
                                                    {item.hrmswala === 'Included' || item.hrmswala === 'Available' ? (
                                                        <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-100 mb-1">
                                                            <Check className="w-4 h-4 text-white stroke-[3px]" />
                                                        </div>
                                                    ) : null}
                                                    <span className="font-bold text-blue-700">{t(item.hrmswala as string)}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8 text-center border-b border-gray-100">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-gray-500 font-medium">{t(item.others as string)}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50/40">
                                        <td className="py-10 px-8 text-gray-900 font-bold text-lg">
                                            {t('Overall Value')}
                                        </td>
                                        <td className="py-10 px-8 text-center bg-blue-50/60">
                                            <span className="text-xl font-black text-blue-700">{t('Strong all-in-one value')}</span>
                                        </td>
                                        <td className="py-10 px-8 text-center">
                                            <span className="text-gray-500 font-semibold">{t('Can become costly as teams grow')}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </AnimateOnScroll>

                    <div className="mt-16 text-center">
                    <AnimateOnScroll direction="up" delayMs={200}>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a 
                                href={route('register')} 
                                className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all"
                            >
                                {t('Start Free Trial')}
                                <ArrowRight className="w-5 h-5" />
                            </a>
                            {(() => {
                                const whatsappSettings = settings?.config_sections?.sections?.social || (settings?.config_sections as any)?.social || {};
                                const rawWhatsappNumber = whatsappSettings?.whatsapp_number || settings?.contact_phone || '918084033396';
                                const whatsappNumber = String(rawWhatsappNumber).replace(/[^\d]/g, '');
                                const demoMessage = `Hi HRMSWALA Team I came across your SaaS and I'm interested in a demo. Could you please help me understand how it can fit my business? Here are my details:\n\nName: \nCompany: \nTeam Size: \nRequirement: \n\nLooking forward to your response`;
                                const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(demoMessage)}`;
                                
                                return (
                                    <a 
                                        href={whatsappHref} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-white border-2 border-gray-100 text-gray-700 font-bold text-lg hover:border-blue-200 hover:bg-gray-50 hover:-translate-y-1 transition-all"
                                    >
                                        {t('Book a Demo')}
                                    </a>
                                );
                            })()}
                        </div>
                    </AnimateOnScroll>
                </div>
            </div>
        </section>
    );
}
