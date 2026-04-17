import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowRight, MessageSquare, Clock, Camera, Activity, FileText, Download, ShieldCheck, Zap, Mail, Lock } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';
import SectionHeading from './SectionHeading';
import { getImagePath } from '@/utils/helpers';

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
        { title: 'Real-Time Time Tracking', description: 'Track employee working hours in real-time with automated timers and activity monitoring.', icon: 'clock' },
        { title: 'Screenshot Monitoring', description: "Capture periodic screenshots to maintain transparency and ensure team productivity.", icon: 'camera' },
        { title: 'Activity Tracking', description: 'Monitor employee activity including apps and websites usage during working hours.', icon: 'activity' },
        { title: 'Detailed Reports', description: 'Generate comprehensive reports to analyze productivity, performance, and work patterns.', icon: 'report' },
    ];

    const features = (sectionData.features?.length > 0 ? sectionData.features : defaultFeatures) as Array<{
        title: string;
        description: string;
        icon?: 'clock' | 'camera' | 'activity' | 'report';
    }>;

    const title = sectionData.title || 'Hrmswala Time Tracker';
    const subtitle = sectionData.subtitle || 'Smart time tracking and employee productivity monitoring for modern teams.';
    const downloadTitle = sectionData.download_title || 'Secure Desktop Application';
    const downloadSubtitle = sectionData.download_subtitle || 'Available for Windows. Lightweight, secure, and runs silently in the background without affecting performance.';
    const downloadButtonText = sectionData.download_button_text || 'Download Now';

    const getIcon = (icon?: string) => {
        switch (icon) {
            case 'camera': return <Camera className="w-6 h-6" />;
            case 'activity': return <Activity className="w-6 h-6" />;
            case 'report': return <FileText className="w-6 h-6" />;
            case 'clock':
            default: return <Clock className="w-6 h-6" />;
        }
    };

    return (
        <section id="tracker-features" className="py-24 bg-[#fcfcff] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Modern Heading */}
                <div className="mb-20">
                    <SectionHeading 
                        title={t(title)}
                        subtitle={t(subtitle)}
                        accentColor={colors.primary}
                        secondaryColor={colors.secondary}
                    />
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
                    {features.map((feature, index) => (
                        <AnimateOnScroll key={index} direction="up" delayMs={index * 100}>
                            <div className="group bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110" style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}>
                                    {getIcon(feature.icon)}
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">{t(feature.title || '')}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed font-medium">{t(feature.description || '')}</p>
                            </div>
                        </AnimateOnScroll>
                    ))}
                </div>

                {/* Download Box */}
                <AnimateOnScroll direction="up">
                    <div className="relative group/box max-w-6xl mx-auto">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -mr-64 -mt-64"></div>
                        
                        <div className="relative bg-white border border-gray-100 rounded-[3.5rem] shadow-2xl overflow-hidden">
                            <div className="flex flex-col lg:flex-row items-center">
                                {/* Left: Content */}
                                <div className="flex-1 p-8 md:p-14 lg:p-20 text-center lg:text-left border-b lg:border-b-0 lg:border-r border-gray-100">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-xs font-black uppercase tracking-widest mb-8">
                                        <ShieldCheck className="w-4 h-4" />
                                        {t('Safe & Secure Execution')}
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                                        {t(downloadTitle)}
                                    </h2>
                                    <p className="text-gray-500 text-lg font-medium leading-relaxed mb-10 max-w-xl">
                                        {t(downloadSubtitle)}
                                    </p>
                                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                                            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})` }}
                                        >
                                            <Download className="w-5 h-5" />
                                            {t(downloadButtonText)}
                                        </button>
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
                                            <Zap className="w-5 h-5 text-yellow-500" />
                                            <span>{t('Instant Setup')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: App Mockup */}
                                <div className="flex-1 w-full bg-gray-50/10 p-12 lg:p-16 flex items-center justify-center">
                                    <div className="relative group/app">
                                        {/* Floating Decoration */}
                                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center z-10 animate-bounce-slow">
                                            <Clock className="w-10 h-10" style={{ color: colors.primary }} />
                                        </div>
                                        
                                        {/* Mockup Frame - Clean Image (No more CSS overlay needed) */}
                                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] border-8 border-white transition-transform duration-500 group-hover/app:scale-[1.05]">
                                            <img 
                                                src={getImagePath('tracker-app.png')} 
                                                alt="HRMswala Tracker App" 
                                                className="w-full max-w-[320px] h-auto object-cover"
                                            />
                                        </div>
                                        
                                        {/* Shadow Glow */}
                                        <div className="absolute -inset-10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimateOnScroll>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <AnimateOnScroll direction="up" className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden z-[101]">
                        <div className="p-10 md:p-14 text-center">
                            <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8" style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}>
                                <Zap className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
                                {t('Get Started with HRMswala')}
                            </h3>
                            <p className="text-gray-500 text-lg font-medium mb-8 leading-relaxed">
                                {t('To use our tracker app, you need an active workspace. Use our demo account to explore.')}
                            </p>
                            
                            {/* Demo Credentials Section */}
                            <div className="bg-gray-50 rounded-2xl p-6 mb-10 text-left border border-gray-100">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">{t('Demo Credentials')}</p>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-bold text-gray-700">info@hrmswala.com</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Lock className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-bold text-gray-300">••••••••••••</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <a href={route('register')} className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})` }}>
                                    {t('Start Free Trial')}
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                                <a href={route('login')} className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl font-black border-2 transition-all hover:bg-gray-50 bg-white" style={{ borderColor: colors.primary, color: colors.primary }}>
                                    <MessageSquare className="w-5 h-5" />
                                    {t('Contact Sales')}
                                </a>
                            </div>
                        </div>
                    </AnimateOnScroll>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            ` }} />
        </section>
    );
}
