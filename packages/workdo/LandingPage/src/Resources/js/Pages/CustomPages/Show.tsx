import { Head, Link, usePage } from '@inertiajs/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CookieConsent from "@/components/cookie-consent";


interface CustomPage {
    id: number;
    title: string;
    slug: string;
    content: string;
    meta_title: string;
    meta_description: string;
    is_active: boolean;
}

interface LandingPageSettings {
    company_name?: string;
    contact_email?: string;
    contact_phone?: string;
    contact_address?: string;
    config_sections?: {
        sections?: any;
        colors?: {
            primary: string;
            secondary: string;
            accent: string;
        };
    };
}

interface ShowProps {
    page: CustomPage;
    landingPageSettings?: LandingPageSettings;
}

export default function Show({ page, landingPageSettings }: ShowProps) {
    const { adminAllSetting } = usePage().props as any;
    // Apply color settings from landing page
    const colorScheme = landingPageSettings?.config_sections?.colors || {
        primary: '#10b77f',
        secondary: '#059669',
        accent: '#065f46'
    };

    return (
        <div className="min-h-screen bg-white" style={{
            '--color-primary': colorScheme.primary,
            '--color-secondary': colorScheme.secondary,
            '--color-accent': colorScheme.accent,
            '--color-hover': colorScheme.primary
        } as React.CSSProperties}>
            <Head title={page.meta_title || page.title}>
                <meta name="description" content={page.meta_description} />
            </Head>
            
            <Header key="header" settings={landingPageSettings} />
            
            <main className="relative pt-12 pb-24 overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-gray-50 to-white -z-10 pointer-events-none"></div>
                <div className="absolute top-40 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" style={{ backgroundColor: `color-mix(in srgb, var(--color-primary) 10%, transparent)` }}></div>
                <div className="absolute bottom-40 -left-24 w-80 h-80 bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none" style={{ backgroundColor: `color-mix(in srgb, var(--color-accent) 10%, transparent)` }}></div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumbs or Back Link */}
                    <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
                        <Link 
                            href={route('landing.page')}
                            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary transition-colors group"
                            style={{ '--color-hover': colorScheme.primary } as any}
                        >
                            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                            Back to Home
                        </Link>
                    </div>

                    {/* Premium Header Section */}
                    <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-sm border border-black/5" style={{ backgroundColor: colorScheme.primary, color: 'white' }}>
                            Official Document
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight mb-8">
                            {page.title}
                        </h1>
                        <div className="w-24 h-2 bg-primary rounded-full" style={{ backgroundColor: colorScheme.primary }}></div>
                    </div>
                    
                    {/* Content Section with Premium Typography */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[2.5rem] p-8 md:p-16 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                        <article className="prose prose-lg md:prose-xl max-w-none prose-headings:text-gray-900 prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-strong:text-gray-900 prose-a:text-primary transition-all">
                            <div 
                                dangerouslySetInnerHTML={{ __html: page.content }}
                                className="custom-page-content"
                            />
                        </article>
                    </div>

                    {/* Footer CTA in Page */}
                    <div className="mt-20 text-center py-16 px-8 rounded-[3rem] bg-gray-900 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" style={{ backgroundColor: `color-mix(in srgb, var(--color-primary) 20%, transparent)` }}></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-4">Streamline Your HR Today</h2>
                            <p className="text-gray-400 mb-8 max-w-xl mx-auto italic">Join thousands of companies using HRMSWALA to grow their business with confidence.</p>
                            <Link 
                                href={route('register')} 
                                className="inline-flex px-8 py-4 rounded-2xl font-bold bg-primary text-white hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg"
                                style={{ backgroundColor: colorScheme.primary }}
                            >
                                Get Started Free
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer key="footer" settings={landingPageSettings} />

            <CookieConsent settings={adminAllSetting || {}} />
        </div>
    );
}