import { Head, usePage } from '@inertiajs/react';
import { useCallback } from 'react';
import { getAdminSetting, getImagePath } from '@/utils/helpers';
import CookieConsent from "@/components/cookie-consent";
// Import components
import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Features from './components/Features';
import Modules from './components/Modules';
import Benefits from './components/Benefits';
import Gallery from './components/Gallery';
import TrackerFeatures from './components/TrackerFeatures';
import HowWorksVideos from './components/HowWorksVideos';
import Blogs from './components/Blogs';
import CTA from './components/CTA';
import WhyChoose from './components/WhyChoose';
import Footer from './components/Footer';

// Type definitions for better type safety
interface SectionData {
    [key: string]: any;
}

interface SectionVisibility {
    [key: string]: boolean;
}

interface ConfigSections {
    sections?: SectionData;
    social?: any;
    section_visibility?: SectionVisibility;
    section_order?: string[];
    colors?: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

interface LandingProps {
    settings?: {
        company_name?: string;
        contact_email?: string;
        contact_phone?: string;
        contact_address?: string;
        config_sections?: ConfigSections;
    };
    blogs?: any[];
}

function WhatsAppIcon({ className = '' }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
            <path
                d="M12.04 2C6.52 2 2.05 6.47 2.05 11.99c0 1.94.56 3.84 1.61 5.47L2 22l4.66-1.53a9.95 9.95 0 0 0 5.38 1.57h.01c5.52 0 9.99-4.47 9.99-9.99C22.04 6.47 17.56 2 12.04 2Zm0 18.29h-.01a8.26 8.26 0 0 1-4.21-1.16l-.3-.18-2.76.9.9-2.69-.2-.31a8.24 8.24 0 0 1-1.27-4.4c0-4.56 3.7-8.26 8.26-8.26 2.2 0 4.27.86 5.82 2.41a8.2 8.2 0 0 1 2.42 5.84c0 4.56-3.7 8.26-8.25 8.26Z"
                fill="currentColor"
            />
            <path
                d="M16.56 13.39c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.56.12-.17.24-.64.8-.79.97-.15.18-.29.2-.54.07-.25-.13-1.04-.39-1.99-1.25-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.11-.52.12-.12.25-.3.37-.45.12-.15.16-.25.25-.42.08-.17.04-.32-.02-.45-.06-.12-.56-1.34-.77-1.84-.2-.48-.4-.41-.56-.42h-.48c-.17 0-.45.06-.68.31-.23.25-.88.86-.88 2.09 0 1.24.9 2.43 1.02 2.6.13.17 1.77 2.7 4.28 3.78.6.26 1.07.41 1.44.53.61.2 1.17.17 1.61.1.49-.07 1.46-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.16-.47-.28Z"
                fill="currentColor"
            />
        </svg>
    );
}

export default function Landing({ settings, blogs = [] }: LandingProps) {
    const getSectionData = (key: string) => {
        return settings?.config_sections?.sections?.[key] || {};
    };
    const { adminAllSetting } = usePage().props as any;
    const favicon = getAdminSetting('favicon');
    const faviconUrl = favicon ? getImagePath(favicon) : null;
    const colors = settings?.config_sections?.colors || { primary: '#3b82f6', secondary: '#2563eb' };
    
    const isSectionVisible = (key: string) => {
        return settings?.config_sections?.section_visibility?.[key] !== false;
    };
    
    const sectionOrder = [...(settings?.config_sections?.section_order || 
        ['header', 'hero', 'stats', 'features', 'tracker_features', 'why_choose', 'modules', 'benefits', 'gallery', 'how_works_videos', 'blogs', 'cta', 'footer'])];

    const whatsappSettings =
        settings?.config_sections?.sections?.social ||
        (settings?.config_sections as any)?.social ||
        {};
    const rawWhatsappNumber = whatsappSettings?.whatsapp_number || settings?.contact_phone || '';
    const whatsappMessage = whatsappSettings?.whatsapp_message || 'Hi, I want to connect for sales.';
    const whatsappNumber = String(rawWhatsappNumber).replace(/[^\d]/g, '');
    const whatsappHref = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
        : null;
    const seoTitle = 'HRMswala - All-in-One HRM, CRM, Payroll and Business Management Software';
    const seoDescription = 'HRMswala helps businesses manage HR, payroll, attendance, CRM, accounting, projects, and operations in one secure cloud platform.';
    const seoKeywords = 'hrm software, crm software, payroll software, attendance management, business management software, saas platform, hrmswala';

    const renderSeoHighlight = () => (
        <section className="relative py-28 bg-[#fcfcff] overflow-hidden">
            {/* Ambient Background Glows - Using Theme Colors */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-20" style={{ backgroundColor: colors.primary }}></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-20" style={{ backgroundColor: colors.secondary || colors.primary }}></div>
            
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Premium Glassmorphic Card */}
                <div className="relative rounded-[3.5rem] p-[2px] overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-indigo-100/40" 
                    style={{ background: `linear-gradient(135deg, ${colors.primary}40, ${colors.secondary || colors.primary}40)` }}>
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[60px] group-hover:bg-white/40 transition-colors"></div>
                    <div className="relative bg-white/80 p-10 md:p-16 lg:p-20 rounded-[calc(3.5rem-2px)] border border-white/60 backdrop-blur-3xl transition-transform duration-500">
                        <div className="flex flex-col lg:flex-row gap-16 items-center justify-between">
                            <div className="flex-1 text-left">
                                {/* Badge */}
                                <div className="inline-flex items-center space-x-2 rounded-full px-5 py-2 border transition-all duration-300 hover:shadow-lg"
                                    style={{ backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20` }}>
                                    <span className="flex h-2.5 w-2.5 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }}></span>
                                    <span className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: colors.primary }}>Premium Business Suite</span>
                                </div>
                                
                                {/* Heading */}
                                <h2 className="mt-10 text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                                    <span 
                                        style={{ 
                                            background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary || '#1e40af'})`,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                            color: 'transparent',
                                            display: 'inline-block'
                                        }}
                                    >
                                        Business Operations in <br/>
                                        One Unified Platform
                                    </span>
                                </h2>
                                
                                {/* Content */}
                                <div className="mt-10 space-y-6">
                                    <p className="text-xl leading-relaxed text-gray-500 font-bold max-w-2xl">
                                        HRMswala is a cloud SaaS platform for modern teams that need reliable HRM, CRM, payroll, accounting,
                                        and attendance management tools in one place.
                                    </p>
                                    <p className="text-lg leading-relaxed text-gray-400 font-medium max-w-2xl">
                                        It helps reduce manual work, improve team visibility, and keep business data organized with role-based access and real-time reporting. Designed for startups, SMEs, and growing enterprises.
                                    </p>
                                </div>
                            </div>
                            
                            {/* Decorative Animated Graphic */}
                            <div className="hidden lg:flex flex-shrink-0 w-[450px] justify-center items-center relative">
                                <div className="relative w-80 h-80 rounded-[3rem] bg-gradient-to-tr from-white to-gray-50 flex items-center justify-center animate-[spin_20s_linear_infinite] shadow-2xl border-4 border-white">
                                    <div className="absolute inset-0 rounded-[3rem] border-2 border-dashed opacity-20 transform scale-110" style={{ borderColor: colors.primary }}></div>
                                    <div className="absolute inset-0 rounded-full border-2 border-dashed opacity-20 transform scale-125 rotate-45" style={{ borderColor: colors.primary }}></div>
                                    
                                    <div className="absolute w-52 h-52 rounded-[2.5rem] bg-white shadow-2xl flex items-center justify-center animate-[spin_20s_reverse_linear_infinite] border border-gray-50">
                                        <svg className="w-20 h-20 drop-shadow-2xl" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: colors.primary }}>
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    
                                    {/* Elevated Orbits */}
                                    <div className="absolute -top-6 -right-6 w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-2xl flex items-center justify-center transition-transform hover:rotate-12">
                                        <div className="w-8 h-8 rounded-full opacity-20" style={{ backgroundColor: colors.primary }}></div>
                                    </div>
                                    <div className="absolute -bottom-10 left-10 w-20 h-20 rounded-[2rem] bg-white border-4 border-white shadow-2xl flex items-center justify-center transition-transform hover:-rotate-12">
                                        <div className="w-10 h-10 rounded-full opacity-20" style={{ backgroundColor: colors.secondary || colors.primary }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
    
    const renderSection = useCallback((sectionKey: string) => {
        if (!isSectionVisible(sectionKey)) return null;
        
        switch (sectionKey) {
            case 'header': return <Header key={sectionKey} settings={settings} />;
            case 'hero': return <Hero key={sectionKey} settings={settings} />;
            case 'stats': return <Stats key={sectionKey} settings={settings} />;
            case 'features': return <Features key={sectionKey} settings={settings} />;
            case 'tracker_features': return <TrackerFeatures key={sectionKey} settings={settings} />;
            case 'why_choose': return <WhyChoose key={sectionKey} settings={settings} />;
            case 'modules': return <Modules key={sectionKey} settings={settings} />;
            case 'benefits': return <Benefits key={sectionKey} settings={settings} />;
            case 'gallery': return <Gallery key={sectionKey} settings={settings} />;
            case 'how_works_videos': return <HowWorksVideos key={sectionKey} settings={settings} />;
            case 'cta': return <CTA key={sectionKey} settings={settings} />;
            case 'blogs':
                return (
                    <div key={sectionKey}>
                        {renderSeoHighlight()}
                        <Blogs settings={settings} blogs={blogs} />
                    </div>
                );
            case 'footer': return <Footer key={sectionKey} settings={settings} />;
            default: return null;
        }
    }, [settings, blogs, isSectionVisible, colors]);

    return (
        <div className="min-h-screen bg-white">
            <Head title={seoTitle}>
                <meta name="description" content={seoDescription} />
                <meta name="keywords" content={seoKeywords} />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                {faviconUrl && <link rel="icon" type="image/x-icon" href={faviconUrl} />}
            </Head>
            
            {sectionOrder.map(sectionKey => renderSection(sectionKey))}

            {whatsappHref && (
                <>
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-[60] group animate-[waFloat_3s_ease-in-out_infinite]"
                    >
                        <div
                            className="text-white rounded-l-[12px] shadow-[0_10px_28px_rgba(22,163,74,0.35)] border border-white/25 overflow-hidden transition-all duration-300 group-hover:-translate-x-0.5"
                            style={{ background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 55%, #15803D 100%)' }}
                        >
                            <div className="h-[154px] w-[46px] flex flex-col items-center justify-center gap-3">
                                <span className="text-[15px] font-black leading-none text-white" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '0.12em' }}>
                                    WhatsApp
                                </span>
                                <span className="h-6 w-6 rounded-full border border-white/70 flex items-center justify-center">
                                    <WhatsAppIcon className="h-3.5 w-3.5" />
                                </span>
                            </div>
                        </div>
                    </a>
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="md:hidden fixed bottom-5 right-4 z-[60] animate-[waFloat_3s_ease-in-out_infinite]"
                    >
                        <div className="h-14 w-14 rounded-full text-white shadow-2xl border-2 border-white flex items-center justify-center"
                            style={{ background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 55%, #15803D 100%)' }}>
                            <WhatsAppIcon className="h-6 w-6" />
                        </div>
                    </a>
                </>
            )}

            <style>{`
                @keyframes waFloat { 0%, 100% { transform: translateY(-50%); } 50% { transform: translateY(calc(-50% - 6px)); } }
                @media (max-width: 767px) { @keyframes waFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } } }
            `}</style>
            
            <CookieConsent settings={adminAllSetting || {}} />
        </div>
    );
}