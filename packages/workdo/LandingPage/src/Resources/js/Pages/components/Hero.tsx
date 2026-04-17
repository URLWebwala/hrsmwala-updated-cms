import { ArrowRight, PlayCircle, ShieldCheck, Zap } from 'lucide-react';
import { getImagePath } from '@/utils/helpers';
import { useTranslation } from 'react-i18next';
import AnimateOnScroll from './AnimateOnScroll';

interface HeroProps {
    settings?: any;
}

export default function Hero({ settings }: HeroProps) {
    const { t } = useTranslation();
    const sectionData = settings?.config_sections?.sections?.hero || {};
    
    const title = sectionData.title || 'All-in-One ERP, HRM & CRM Software for Growing Businesses';
    const subtitle = sectionData.subtitle || 'From HR and payroll to CRM and accounting, HRMSWALA helps you manage everything in one place with powerful automation and real-time insights.';
    const primaryButtonText = sectionData.primary_button_text || 'Start Free Trial';
    const primaryButtonLink = sectionData.primary_button_link || route('register');
    const secondaryButtonText = sectionData.secondary_button_text || 'Login';
    const secondaryButtonLink = sectionData.secondary_button_link || route('login');
    const heroImage = sectionData.image;
    const colors = settings?.config_sections?.colors || { primary: '#3b82f6', secondary: '#2563eb', accent: '#f59e0b' };

    // Standard Brand Gradient Logic
    const brandGradient = {
        background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary || '#1e40af'})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    };

    return (
        <section className="relative pt-12 pb-20 bg-[#fcfcff] overflow-hidden">
            {/* Atmospheric Depth */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Visual Mockup */}
                    <div className="order-2 lg:order-1 relative">
                        <AnimateOnScroll direction="left" delayMs={200}>
                            <div className="relative group/hero-img">
                                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white transition-all duration-500 hover:scale-[1.01]">
                                    {heroImage ? (
                                        <img 
                                            src={getImagePath(heroImage)} 
                                            alt="Dashboard Preview" 
                                            className="w-full h-auto object-cover" 
                                        />
                                    ) : (
                                        <div className="bg-gray-100 aspect-video flex items-center justify-center">
                                            <span className="text-gray-400 font-bold">{t('Hero Image')}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Minimalist Badges */}
                                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-3 animate-bounce-slow">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900">{t('ISO Certified')}</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{t('Secure Ops')}</p>
                                    </div>
                                </div>

                                <div className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-lg border border-gray-50 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <p className="text-[10px] font-black text-gray-900">{t('99% Faster Ops')}</p>
                                </div>
                            </div>
                        </AnimateOnScroll>
                    </div>

                    {/* Refined Content (Smaller Scale) */}
                    <div className="order-1 lg:order-2 text-center lg:text-left">
                        <AnimateOnScroll direction="up">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6">
                                <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                                {t('Revolutionizing Workflows')}
                            </div>
                        </AnimateOnScroll>

                        <AnimateOnScroll direction="up" delayMs={50}>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                                <span style={brandGradient}>{title}</span>
                            </h1>
                        </AnimateOnScroll>

                        <AnimateOnScroll direction="up" delayMs={100}>
                            <p className="text-base md:text-lg text-gray-500 mb-8 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0">
                                {subtitle}
                            </p>
                        </AnimateOnScroll>

                        <AnimateOnScroll direction="up" delayMs={150}>
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <a 
                                    href={primaryButtonLink}
                                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                    style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})` }}
                                >
                                    {t(primaryButtonText)}
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                                <a 
                                    href={secondaryButtonLink}
                                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-gray-600 bg-white border border-gray-200 transition-all hover:bg-gray-50 shadow-sm flex items-center justify-center gap-2"
                                >
                                    <PlayCircle className="w-4 h-4 text-gray-400" />
                                    {t(secondaryButtonText)}
                                </a>
                            </div>
                        </AnimateOnScroll>

                        {/* Social Proof Row */}
                        <AnimateOnScroll direction="up" delayMs={200}>
                            <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 opacity-40 grayscale">
                                <span className="font-black italic text-lg tracking-tighter">Cloudways</span>
                                <span className="font-black italic text-lg tracking-tighter">Stripe</span>
                                <span className="font-black italic text-lg tracking-tighter">Aws</span>
                            </div>
                        </AnimateOnScroll>
                    </div>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            ` }} />
        </section>
    );
}