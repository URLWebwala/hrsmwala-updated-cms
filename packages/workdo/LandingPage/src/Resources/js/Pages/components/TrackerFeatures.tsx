import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowRight, MessageSquare } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';
import SectionHeading from './SectionHeading';

interface TrackerFeaturesProps {
    settings?: any;
}

export default function TrackerFeatures({ settings }: TrackerFeaturesProps) {
    const { t } = useTranslation();
    const colors = { 
        primary: settings?.config_sections?.colors?.primary || '#3b82f6',
        secondary: settings?.config_sections?.colors?.secondary || '#2563eb'
    };
    const sectionData = settings?.config_sections?.sections?.tracker_features || {};
    const [isModalOpen, setIsModalOpen] = useState(false);

    const defaultFeatures = [
        { title: 'Time Tracking', description: 'Track exact working hours with our automated desktop application.', icon: 'clock' },
        { title: 'Screenshot Monitoring', description: "Get periodic screenshots of your team's workspace to ensure productivity.", icon: 'camera' },
        { title: 'Activity Tracking', description: 'Monitor keyboard and mouse activity levels to identify idle time.', icon: 'activity' },
        { title: 'Productivity Reports', description: 'Generate detailed reports on how much time is spent on each project.', icon: 'report' },
    ];

    const features = (sectionData.features?.length > 0 ? sectionData.features : defaultFeatures) as Array<{
        title: string;
        description: string;
        icon?: 'clock' | 'camera' | 'activity' | 'report';
    }>;

    const title = sectionData.title || 'Hrmswala Tracker Features';
    const subtitle = sectionData.subtitle || 'Comprehensive time tracking and productivity monitoring for your remote team.';
    const downloadTitle = sectionData.download_title || 'Secure Desktop App';
    const downloadSubtitle = sectionData.download_subtitle || 'Available for Windows. Lightweight and runs in the background.';
    const downloadButtonText = sectionData.download_button_text || 'Download Tracker App (.exe)';

    const iconSvg = (icon?: string) => {
        switch (icon) {
            case 'camera':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            case 'activity':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                );
            case 'report':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'clock':
            default:
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    return (
        <section id="tracker-features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <SectionHeading
                        title={t(title)}
                        subtitle={t(subtitle)}
                        accentColor={colors.primary}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <AnimateOnScroll key={index} direction="up" delayMs={Math.min(240, index * 60)}>
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                                    {iconSvg(feature.icon)}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{t(feature.title || '')}</h3>
                                <p className="text-gray-600 leading-relaxed">{t(feature.description || '')}</p>
                            </div>
                        </AnimateOnScroll>
                    ))}
                </div>

                <AnimateOnScroll direction="up">
                    <div className="text-center">
                        <div className="inline-block p-1 rounded-2xl bg-white shadow-xl border border-gray-100">
                            <div className="flex flex-col md:flex-row items-center gap-8 p-8">
                                <div className="flex-1 text-left">
                                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{t(downloadTitle)}</h4>
                                    <p className="text-gray-600">{t(downloadSubtitle)}</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    {t(downloadButtonText)}
                                </button>
                            </div>
                        </div>
                    </div>
                </AnimateOnScroll>
            </div>

            {/* Modal Popup */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsModalOpen(false)}
                    />
                    
                    <AnimateOnScroll direction="up" className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-[101]">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${colors.primary}15`, color: colors.primary }}>
                                    <ArrowRight className="w-8 h-8" />
                                </div>
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            
                            <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
                                {t('Ready to Boost Productivity?')}
                            </h3>
                            
                            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                {t('To use the desktop application, you need an active HRMswala account. Start your journey today and streamline your workflows with ease.')}
                            </p>
                            
                            <div className="flex flex-col gap-4">
                                <a 
                                    href="/register"
                                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                                    style={{ backgroundColor: colors.primary }}
                                >
                                    {t('Start Free Trial')}
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                                
                                <a 
                                    href="/login"
                                    className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold border-2 transition-all hover:bg-gray-50 bg-white"
                                    style={{ borderColor: colors.primary, color: colors.primary }}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    {t('Contact Sales')}
                                </a>
                            </div>
                            
                            <p className="mt-6 text-center text-sm text-gray-400">
                                {t('Already have an account?')} <a href="/login" className="font-semibold underline" style={{ color: colors.primary }}>{t('Login here')}</a>
                            </p>
                        </div>
                    </AnimateOnScroll>
                </div>
            )}
        </section>
    );
}
