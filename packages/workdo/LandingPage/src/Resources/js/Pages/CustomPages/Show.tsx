import { Head, Link, usePage } from '@inertiajs/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CookieConsent from "@/components/cookie-consent";
import { CheckCircle2, Target, Eye, Shield, Zap, Heart, Users, Award, Globe, Building2, TrendingUp } from 'lucide-react';
import AnimateOnScroll from '../components/AnimateOnScroll';

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
    config_sections?: {
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
    const isAboutUs = page.slug === 'about-us' || page.title.toLowerCase().includes('about');
    
    const colors = landingPageSettings?.config_sections?.colors || {
        primary: '#3b82f6',
        secondary: '#2563eb',
        accent: '#f16b24'
    };

    return (
        <div className="min-h-screen bg-[#fcfcff] font-sans">
            <Head title={page.meta_title || page.title}>
                <meta name="description" content={page.meta_description} />
            </Head>
            
            <Header settings={landingPageSettings} />
            
            <main className="relative pt-20 pb-24 overflow-hidden">
                {/* Modern Background Elements */}
                <div className="absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-blue-50/50 to-transparent -z-10"></div>
                <div className="absolute top-40 -right-48 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                <div className="absolute top-[60%] -left-48 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[100px] -z-10"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="mb-12">
                        <Link 
                            href={route('landing.page')}
                            className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-blue-600 transition-all group"
                        >
                            <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span>
                            Back to Home
                        </Link>
                    </div>

                    {/* Premium Header */}
                    <div className="mb-20 text-center max-w-4xl mx-auto">
                        <AnimateOnScroll direction="up">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest border border-blue-100 mb-6">
                                <Shield className="w-3 h-3" />
                                {t('Official Company Profile')}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-8">
                                <span 
                                    className="bg-clip-text text-transparent"
                                    style={{ 
                                        backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    {page.title}
                                </span>
                            </h1>
                            <div className="w-24 h-2 rounded-full mx-auto" style={{ backgroundColor: colors.primary }}></div>
                        </AnimateOnScroll>
                    </div>

                    {isAboutUs && (
                        /* About Us Specific Sections */
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
                                {[
                                    { label: 'Trusted Companies', val: '500+', icon: Building2 },
                                    { label: 'Global Users', val: '10K+', icon: Globe },
                                    { label: 'Uptime Guarantee', val: '99.9%', icon: Zap },
                                    { label: 'Success Rate', val: '98%', icon: TrendingUp },
                                ].map((stat, i) => (
                                    <AnimateOnScroll key={i} direction="up" delayMs={i * 100}>
                                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm text-center hover:shadow-xl transition-all hover:-translate-y-2 group">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                                <stat.icon className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="text-3xl font-black text-gray-900 mb-1">{stat.val}</div>
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                                        </div>
                                    </AnimateOnScroll>
                                ))}
                            </div>

                            {/* Values Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                                {[
                                    { title: 'Transparency', desc: 'We believe in clear communication and honest business practices for every client.', icon: Eye },
                                    { title: 'Innovation', desc: 'Constantly evolving our tools to stay ahead of the modern workplace demands.', icon: Zap },
                                    { title: 'Customer First', desc: 'Your business growth is our priority. We succeed when you succeed.', icon: Heart },
                                ].map((value, i) => (
                                    <AnimateOnScroll key={i} direction="up" delayMs={i * 100}>
                                        <div className="h-full bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-6">
                                                <value.icon className="w-7 h-7" style={{ color: colors.primary }} />
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-4">{value.title}</h3>
                                            <p className="text-gray-500 font-medium leading-relaxed">{value.desc}</p>
                                        </div>
                                    </AnimateOnScroll>
                                ))}
                            </div>
                        </>
                    )}
                    
                    {/* Main Content Card */}
                    <AnimateOnScroll direction="up">
                        <div className="relative group/card">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-[3rem] blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                            <div className="relative bg-white border border-gray-100 shadow-2xl rounded-[3rem] overflow-hidden">
                                <div className="p-8 md:p-20">
                                    <article className="prose prose-lg md:prose-xl max-w-none prose-headings:text-gray-900 prose-headings:font-black prose-p:text-gray-500 prose-p:leading-relaxed prose-strong:text-gray-900 prose-li:text-gray-500">
                                        <div 
                                            dangerouslySetInnerHTML={{ __html: page.content }}
                                            className="custom-page-content"
                                        />
                                    </article>
                                </div>
                            </div>
                        </div>
                    </AnimateOnScroll>

                    {/* Premium CTA */}
                    <AnimateOnScroll direction="up">
                        <div className="mt-24 relative rounded-[3.5rem] bg-gray-900 p-12 md:p-24 overflow-hidden text-center">
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40"></div>
                            
                            <div className="relative z-10 max-w-2xl mx-auto">
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                                    {t('Ready to build a faster, better HR?')}
                                </h2>
                                <p className="text-gray-400 mb-12 text-lg font-medium leading-relaxed">
                                    {t('Join 10,000+ users who have transformed their payroll, attendance, and management with HRMswala.')}
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                    <Link 
                                        href={route('register')} 
                                        className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black bg-white text-gray-900 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95"
                                    >
                                        {t('Start Your Free Trial')}
                                    </Link>
                                    <button className="w-full sm:w-auto px-10 py-5 rounded-2xl font-black border-2 border-white/10 text-white hover:bg-white/5 transition-all">
                                        {t('Request Custom Demo')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </AnimateOnScroll>
                </div>
            </main>
            
            <Footer settings={landingPageSettings} />
            <CookieConsent settings={adminAllSetting || {}} />

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-page-content h1, .custom-page-content h2, .custom-page-content h3 { margin-top: 2rem; margin-bottom: 1.5rem; color: #111827; font-weight: 900; }
                .custom-page-content p { margin-bottom: 1.5rem; }
            ` }} />
        </div>
    );
}

// Simple translation helper if t() is not defined globally (though it should be via useTranslation)
function t(key: string) { return key; }