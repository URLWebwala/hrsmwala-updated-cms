 import { ArrowRight, Mail, PlayCircle, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AnimateOnScroll from './AnimateOnScroll';
import { useState } from 'react';
import { toast } from 'sonner';

interface CTAProps {
    settings?: any;
}

export default function CTA({ settings }: CTAProps) {
    const { t } = useTranslation();
    const [emailInput, setEmailInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sectionData = settings?.config_sections?.sections?.cta || {};
    const title = sectionData.title || 'Ready to Transform Your Business?';
    const subtitle = sectionData.subtitle || 'Join thousands of businesses already using Hrmswala to automate operations.';
    const primaryButton = sectionData.primary_button || 'Start Free Trial';
    const primaryLink = sectionData.primary_button_link || route('register');
    const secondaryButton = sectionData.secondary_button || 'Contact Sales';
    const secondaryLink = sectionData.secondary_button_link || route('login');
    
    const newsletterTitle = sectionData.newsletter_title || 'Subscribe to Newsletter';
    const newsletterButtonText = sectionData.newsletter_button_text || 'Join Now';
    
    const colors = settings?.config_sections?.colors || { primary: '#3b82f6', secondary: '#2563eb', accent: '#f59e0b' };

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInput.trim()) { toast.error('Please enter your email address'); return; }
        setIsSubmitting(true);
        try {
            const response = await fetch(route('newsletter.subscribe'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ email: emailInput.trim() }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success(data.message || 'Subscribed successfully!');
                setEmailInput('');
            } else { toast.error(data.message || 'Failed to subscribe.'); }
        } catch { toast.error('An error occurred.'); } finally { setIsSubmitting(false); }
    };

    return (
        <section className="relative py-20 bg-[#fcfcff] overflow-hidden">
            {/* Minimal Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <AnimateOnScroll direction="up">
                    <div className="relative bg-white border border-gray-100 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] overflow-hidden">
                        
                        <div className="flex flex-col lg:flex-row items-stretch">
                            
                            {/* Left Side: Impact Content */}
                            <div className="flex-1 p-8 md:p-14 lg:p-16 border-b lg:border-b-0 lg:border-r border-gray-50 flex flex-col justify-center">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-8 w-fit">
                                    <Rocket className="w-3.5 h-3.5" />
                                    {t('Fast Growing SaaS')}
                                </div>
                                
                                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                                    {t(title)}
                                </h2>
                                <p className="text-base text-gray-500 font-medium mb-10 max-w-lg leading-relaxed">
                                    {t(subtitle)}
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <a 
                                        href={primaryLink}
                                        className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm text-white shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                        style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})` }}
                                    >
                                        {t(primaryButton)}
                                        <ArrowRight className="w-4 h-4" />
                                    </a>
                                    <a 
                                        href={secondaryLink}
                                        className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm text-gray-600 bg-white border border-gray-100 transition-all hover:bg-gray-50 hover:border-gray-200 shadow-sm flex items-center justify-center gap-2 group"
                                    >
                                        <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                        {t(secondaryButton)}
                                    </a>
                                </div>
                            </div>

                            {/* Right Side: Newsletter (Compact) */}
                            <div className="lg:w-1/3 bg-gray-50/50 p-8 md:p-14 lg:p-16 flex flex-col justify-center relative overflow-hidden">
                                {/* Decorative Glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                                
                                <div className="relative space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{t(newsletterTitle)}</h3>
                                    </div>
                                    
                                    <p className="text-xs font-bold text-gray-400 leading-relaxed">
                                        {t('Stay connected with our latest updates and features.')}
                                    </p>

                                    <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                                        <input
                                            type="email"
                                            placeholder={t('Enter email address')}
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            disabled={isSubmitting}
                                            className="w-full bg-white border border-gray-100 rounded-xl px-5 py-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-4 rounded-xl font-black text-[10px] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                                            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary || colors.primary})` }}
                                        >
                                            {isSubmitting ? t('Wait...') : t(newsletterButtonText)}
                                        </button>
                                    </form>
                                    
                                    <p className="text-[10px] font-medium text-gray-300 text-center">
                                        {t('Safe & Secure. No Spam.')}
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </AnimateOnScroll>
            </div>
        </section>
    );
}