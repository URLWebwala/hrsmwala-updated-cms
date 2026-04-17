import { Head, router, usePage } from '@inertiajs/react';
import Header from './components/Header';
import Footer from './components/Footer';
import { getAdminSetting, getImagePath, formatAdminCurrency } from '@/utils/helpers';
import { useState, useRef } from 'react';
import CookieConsent from "@/components/cookie-consent";
import { useTranslation } from 'react-i18next';
import { Check, ChevronLeft, ChevronRight, Star, Zap, ShieldCheck, Clock, Crown, ArrowRight, HelpCircle, Plus, Minus, MessageCircle, BarChart3, Users2, Headphones } from 'lucide-react';
import AnimateOnScroll from './components/AnimateOnScroll';

interface Plan {
    id: number;
    name: string;
    description?: string;
    package_price_monthly: number;
    package_price_yearly: number;
    number_of_users: number;
    storage_limit: number;
    modules: string[];
    free_plan: boolean;
    trial: boolean;
    trial_days: number;
    orders_count?: number;
}

interface Module {
    module: string;
    alias: string;
    image?: string;
    monthly_price?: number;
    yearly_price?: number;
}

interface PricingProps {
    plans?: Plan[];
    activeModules?: Module[];
    settings?: any;
}

export default function Pricing(props: PricingProps) {
    const { t } = useTranslation();
    const favicon = getAdminSetting('favicon');
    const faviconUrl = favicon ? getImagePath(favicon) : null;
    const { adminAllSetting, auth } = usePage().props as any;
    const plans = props.plans || [];
    const activeModules = props.activeModules || [];
    const settings = { ...props.settings, is_authenticated: !!auth?.user?.id };
    const pricingSettings = settings?.config_sections?.sections?.pricing || {};
    const colors = settings?.config_sections?.colors || { primary: '#3b82f6', secondary: '#2563eb', accent: '#f16b24' };
    
    const [priceType, setPriceType] = useState(pricingSettings.default_price_type || 'monthly');
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - (clientWidth * 0.7) : scrollLeft + (clientWidth * 0.7);
            scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const mostPopularPlanId = plans.length > 0 
        ? plans.reduce((prev, current) => (current.orders_count || 0) > (prev.orders_count || 0) ? current : prev).id
        : null;

    const faqs = [
        { q: t('Can I upgrade my plan anytime?'), a: t('Yes! You can upgrade your subscription at any time from your dashboard. The price difference will be calculated automatically.') },
        { q: t('Is there a free trial available?'), a: t('Absolutely. Most of our plans come with a 1 to 14-day free trial so you can experience all premium features before committing.') },
        { q: t('Do I need a credit card to start?'), a: t('No credit card is required for the free trial or free plan. Start exploring HRMswala immediately.') },
        { q: t('What payment methods do you accept?'), a: t('We accept all major credit cards, PayPal, and local payment gateways depending on your region.') },
    ];

    return (
        <div className="bg-[#fcfcff] font-sans text-gray-900 overflow-x-hidden">
            <Head title="Pricing" >
                {faviconUrl && <link rel="icon" type="image/x-icon" href={faviconUrl} />}
            </Head>
            
            <Header settings={settings} />
            
            <main className="relative pt-16 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <AnimateOnScroll direction="up">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
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
                                    {t('Flexible Pricing')} {t('for Growing Teams')}
                                </span>
                            </h1>
                            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto font-medium">
                                {pricingSettings.subtitle || t('Powerful management tools designed to scale with your business goals.')}
                            </p>
                        </AnimateOnScroll>

                        {/* Toggle */}
                        {pricingSettings.show_monthly_yearly_toggle !== false && (
                            <AnimateOnScroll direction="up" delayMs={100}>
                                <div className="mt-8 inline-flex items-center p-1 bg-gray-50 border border-gray-100 rounded-xl shadow-inner">
                                    <button 
                                        onClick={() => setPriceType('monthly')}
                                        className={`px-8 py-2.5 rounded-lg text-sm font-black transition-all ${priceType === 'monthly' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                        style={priceType === 'monthly' ? { color: colors.primary } : {}}
                                    >
                                        {t('Monthly')}
                                    </button>
                                    <button 
                                        onClick={() => setPriceType('yearly')}
                                        className={`relative px-8 py-2.5 rounded-lg text-sm font-black transition-all ${priceType === 'yearly' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                                        style={priceType === 'yearly' ? { color: colors.primary } : {}}
                                    >
                                        {t('Yearly')}
                                        <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg border-2 border-white">
                                            -20%
                                        </span>
                                    </button>
                                </div>
                            </AnimateOnScroll>
                        )}
                    </div>

                    {plans.length > 0 ? (
                        <div className="relative group/carousel">
                            {/* Navigation Buttons */}
                            <div className="absolute inset-x-[-10px] md:inset-x-[-50px] top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-50">
                                <button onClick={() => scroll('left')} className="w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center text-gray-900 hover:scale-110 pointer-events-auto transition-all border border-gray-100 shadow-blue-100/50">
                                    <ChevronLeft className="w-6 h-6" style={{ color: colors.primary }} strokeWidth={3} />
                                </button>
                                <button onClick={() => scroll('right')} className="w-12 h-12 rounded-full bg-white shadow-2xl flex items-center justify-center text-gray-900 hover:scale-110 pointer-events-auto transition-all border border-gray-100 shadow-blue-100/50">
                                    <ChevronRight className="w-6 h-6" style={{ color: colors.primary }} strokeWidth={3} />
                                </button>
                            </div>

                            {/* Plan Cards Container */}
                            <div ref={scrollContainerRef} className="flex overflow-x-auto gap-8 pb-16 px-4 no-scrollbar scroll-smooth snap-x snap-mandatory">
                                {plans.map((plan, idx) => {
                                    const isPopular = plan.id === mostPopularPlanId && plans.length > 1;
                                    const enabledAddOns = activeModules.filter(module => plan.modules?.includes(module.module));
                                    
                                    return (
                                        <div key={plan.id} className="min-w-full sm:min-w-[400px] md:min-w-[480px] snap-center py-4">
                                            <div className={`h-full bg-white rounded-[2.5rem] border transition-all duration-500 ${isPopular ? 'border-transparent' : 'border-gray-100'}`}
                                                style={isPopular ? { boxShadow: `0 30px 80px -20px ${colors.primary}30`, borderColor: colors.primary, borderWidth: '2px' } : { boxShadow: '0 8px 40px -10px rgba(0,0,0,0.05)' }}>
                                                <div className="p-8 md:p-10">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                                        <div className="flex-1 relative">
                                                            {isPopular && (
                                                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 px-5 py-2 rounded-xl flex items-center gap-2 shadow-2xl z-20 whitespace-nowrap animate-bounce-slow" style={{ backgroundColor: colors.primary }}>
                                                                    <Star className="w-4 h-4 fill-current text-white animate-pulse" />
                                                                    <span className="text-white text-[11px] font-black uppercase tracking-tight">{t('Recommended Choice')}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${idx === 0 ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                                                                    {idx === 0 ? <ShieldCheck className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                                                                </div>
                                                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                                            </div>
                                                            <div className="flex items-baseline gap-1 mt-4">
                                                                <span className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                                                                    {plan.free_plan ? t('Free') : (priceType === 'monthly' ? formatAdminCurrency(plan.package_price_monthly) : formatAdminCurrency(plan.package_price_yearly))}
                                                                </span>
                                                                <span className="text-sm font-bold text-gray-400">/{priceType === 'monthly' ? t('mo') : t('yr')}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col gap-3 min-w-[160px]">
                                                            <button className="w-full py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl text-white"
                                                                style={{ background: isPopular ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})` : '#111827' }}
                                                                onClick={() => router.visit(settings?.is_authenticated ? route('dashboard') : route('register'))}>
                                                                <span>{settings?.is_authenticated ? t('Dashboard') : t('Get Started Now')}</span>
                                                                <ArrowRight className="w-4 h-4" />
                                                            </button>
                                                            {plan.trial && !settings?.is_authenticated && (
                                                                <button onClick={() => router.visit(route('register'))} className="w-full py-3 rounded-2xl border-2 text-[10px] font-black uppercase transition-all bg-white hover:bg-gray-50" style={{ borderColor: colors.primary, color: colors.primary }}>
                                                                    {plan.trial_days} {t('Days Free Trial')}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="border-t-2 border-dashed border-gray-50 pt-8">
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{t('Everything Included')}</p>
                                                            <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-100 to-transparent"></div>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary}10` }}>
                                                                    <Check className="w-3 h-3" style={{ color: colors.primary }} strokeWidth={4} />
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-600">{plan.number_of_users === -1 ? t('Unlimited Users') : `${plan.number_of_users} ${t('Users')}`}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.primary}10` }}>
                                                                    <Check className="w-3 h-3" style={{ color: colors.primary }} strokeWidth={4} />
                                                                </div>
                                                                <span className="text-xs font-bold text-gray-600 truncate">{plan.storage_limit === -1 ? t('Infinite Space') : `${Math.round(plan.storage_limit / (1024 * 1024))}${t("GB Space")}`}</span>
                                                            </div>
                                                            {activeModules.map((module) => (
                                                                <div key={module.module} className={`flex items-center gap-3 ${plan.modules?.includes(module.module) ? 'opacity-100' : 'opacity-20'}`}>
                                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: plan.modules?.includes(module.module) ? `${colors.primary}20` : '#f3f4f6' }}>
                                                                        {plan.modules?.includes(module.module) ? <Check className="w-3 h-3" style={{ color: colors.primary }} strokeWidth={4} /> : <span className="text-[8px] font-black text-gray-400">✕</span>}
                                                                    </div>
                                                                    <span className={`text-xs font-bold truncate ${plan.modules?.includes(module.module) ? 'text-gray-700' : 'text-gray-400'}`}>{module.alias}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                            <Zap className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{t("Fetching Best Deals...")}</h3>
                        </div>
                    )}

                    {/* Enhanced Trust Section */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: ShieldCheck, title: t('Enterprise Secure'), desc: t('Your data is protected with 256-bit bank-grade encryption.'), color: 'text-blue-600', bg: 'bg-blue-50' },
                            { icon: Clock, title: t('24/7 Priority Support'), desc: t('Get instant help from our dedicated human support team at any time.'), color: 'text-indigo-600', bg: 'bg-indigo-50' },
                            { icon: Zap, title: t('Fast Setup'), desc: t('Go live in less than 5 minutes with our automated onboarding tool.'), color: 'text-green-600', bg: 'bg-green-50' }
                        ].map((item, i) => (
                            <div key={i} className="group p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-2">
                                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center mb-6 transition-transform group-hover:rotate-12`}>
                                    <item.icon className={`w-7 h-7 ${item.color}`} />
                                </div>
                                <h4 className="text-lg font-black text-gray-900 mb-3">{item.title}</h4>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-32 max-w-3xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-4">{t('Frequently Asked Questions')}</h2>
                            <p className="text-gray-500 font-medium">{t('Everything you need to know about our plans and billing.')}</p>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm transition-all">
                                    <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full p-6 flex items-center justify-between text-left group">
                                        <span className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{faq.q}</span>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
                                            {openFaq === idx ? <Minus className="w-4 h-4 text-gray-900" /> : <Plus className="w-4 h-4 text-gray-900" />}
                                        </div>
                                    </button>
                                    <div className={`px-6 transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-[200px] pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">{faq.a}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="mt-32 relative rounded-[3rem] bg-gray-900 p-12 overflow-hidden text-center md:text-left">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] -mr-64 -mt-64"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{t('Still have questions?')}</h2>
                                <p className="text-gray-400 font-medium text-lg">{t('Chat with our team to find the best plan for your 100+ members team.')}</p>
                            </div>
                            <button className="px-10 py-5 rounded-2xl bg-white text-gray-900 font-bold text-lg shadow-xl shadow-white/5 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
                                <MessageCircle className="w-6 h-6" />
                                {t('Contact Support')}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer settings={settings} />
            <CookieConsent settings={adminAllSetting || {}} />

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce-slow { 0%, 100% { transform: translate(-50%, 0); } 50% { transform: translate(-50%, -5px); } }
                .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />
        </div>
    );
}