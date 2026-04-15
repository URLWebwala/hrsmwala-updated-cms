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
    
    const isSectionVisible = (key: string) => {
        return settings?.config_sections?.section_visibility?.[key] !== false;
    };
    
    const sectionOrder = settings?.config_sections?.section_order || 
        ['header', 'hero', 'stats', 'features', 'tracker_features', 'modules', 'benefits', 'gallery', 'how_works_videos', 'blogs', 'cta', 'footer'];

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
    
    const renderSection = useCallback((sectionKey: string) => {
        if (!isSectionVisible(sectionKey)) return null;
        
        switch (sectionKey) {
            case 'header':
                return <Header key={sectionKey} settings={settings} />;
            case 'hero':
                return <Hero key={sectionKey} settings={settings} />;
            case 'stats':
                return <Stats key={sectionKey} settings={settings} />;
            case 'features':
                return <Features key={sectionKey} settings={settings} />;
            case 'tracker_features':
                return <TrackerFeatures key={sectionKey} settings={settings} />;
            case 'modules':
                return <Modules key={sectionKey} settings={settings} />;
            case 'benefits':
                return <Benefits key={sectionKey} settings={settings} />;
            case 'gallery':
                return <Gallery key={sectionKey} settings={settings} />;
            case 'how_works_videos':
                return <HowWorksVideos key={sectionKey} settings={settings} />;
            case 'cta':
                return <CTA key={sectionKey} settings={settings} />;
            case 'blogs':
                return <Blogs key={sectionKey} settings={settings} blogs={blogs} />;
            case 'footer':
                return <Footer key={sectionKey} settings={settings} />;
            default:
                return null;
        }
    }, [settings, blogs, isSectionVisible]);

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
            
            {/* Render sections in order */}
            {sectionOrder.map(sectionKey => renderSection(sectionKey))}

            <section className="border-t border-gray-100 bg-white py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Business Operations in One Platform</h2>
                    <p className="mt-4 text-base leading-7 text-gray-600">
                        HRMswala is a cloud SaaS platform for modern teams that need reliable HRM, CRM, payroll, accounting,
                        and attendance management tools in one place. It helps reduce manual work, improve team visibility,
                        and keep business data organized with role-based access and real-time reporting.
                    </p>
                    <p className="mt-4 text-base leading-7 text-gray-600">
                        From employee onboarding to payroll processing and customer follow-ups, HRMswala supports daily
                        operations with practical modules designed for startups, SMEs, and growing enterprises.
                    </p>
                </div>
            </section>

            {/* Floating WhatsApp quick-contact button */}
            {whatsappHref && (
                <>
                    {/* Desktop: modern edge tab */}
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden md:block fixed right-0 top-1/2 -translate-y-1/2 z-[60] group animate-[waFloat_3s_ease-in-out_infinite]"
                        aria-label="Chat on WhatsApp"
                        title="Chat on WhatsApp"
                    >
                        <div
                            className="text-white rounded-l-[12px] shadow-[0_10px_28px_rgba(22,163,74,0.35)] border border-white/25 overflow-hidden transition-all duration-300 group-hover:-translate-x-0.5 group-hover:shadow-[0_18px_42px_rgba(22,163,74,0.5)]"
                            style={{ background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 55%, #15803D 100%)' }}
                        >
                            <div className="h-[154px] w-[46px] flex flex-col items-center justify-center gap-3">
                                <span
                                    className="text-[15px] font-semibold leading-none text-white"
                                    style={{
                                        writingMode: 'vertical-rl',
                                        transform: 'rotate(180deg)',
                                        letterSpacing: '0.12em',
                                        fontFamily: 'Poppins, Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
                                    }}
                                >
                                    WhatsApp
                                </span>
                                <span className="h-6 w-6 rounded-full border border-white/70 flex items-center justify-center bg-transparent">
                                    <WhatsAppIcon className="h-3.5 w-3.5 drop-shadow-sm transition-transform duration-300 group-hover:scale-110" />
                                </span>
                            </div>
                        </div>
                    </a>

                    {/* Mobile: clean floating action button */}
                    <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="md:hidden fixed bottom-5 right-4 z-[60] animate-[waFloat_3s_ease-in-out_infinite]"
                        aria-label="Chat on WhatsApp"
                        title="Chat on WhatsApp"
                    >
                        <div
                            className="h-14 w-14 rounded-full text-white shadow-2xl border-2 border-white flex items-center justify-center transition-all duration-300 active:scale-95 hover:shadow-[0_18px_36px_rgba(22,163,74,0.45)]"
                            style={{ background: 'linear-gradient(180deg, #22C55E 0%, #16A34A 55%, #15803D 100%)' }}
                        >
                            <WhatsAppIcon className="h-6 w-6 transition-transform duration-300" />
                        </div>
                    </a>
                </>
            )}

            <style>{`
                @keyframes waFloat {
                    0%, 100% {
                        transform: translateY(-50%);
                    }
                    50% {
                        transform: translateY(calc(-50% - 6px));
                    }
                }

                @media (max-width: 767px) {
                    @keyframes waFloat {
                        0%, 100% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-5px);
                        }
                    }
                }
            `}</style>
            
            <CookieConsent settings={adminAllSetting || {}} />
        </div>
    );
}