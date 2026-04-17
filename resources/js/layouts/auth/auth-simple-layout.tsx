import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useBrand } from '@/contexts/brand-context';
import { useFavicon } from '@/hooks/use-favicon';
import { getImagePath } from '@/utils/helpers';
import ApplicationLogo from '@/components/application-logo';
import CookieConsent from '@/components/cookie-consent';
import { usePage } from '@inertiajs/react';
import StarfieldBackground from '@/components/StarfieldBackground';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { settings, getPrimaryColor } = useBrand();
    const { adminAllSetting } = usePage().props as any;
    useFavicon();
    
    const logoSrc = settings.themeMode === 'dark' ? (settings.logo_light || settings.logo_dark) : (settings.logo_light || settings.logo_dark);
    const primaryColor = getPrimaryColor();
    
    return (
        <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden text-white">
            <style>{`
                .bg-primary {
                    background-color: ${primaryColor} !important;
                    color: white !important;
                }
                .bg-primary:hover {
                    background-color: ${primaryColor}dd !important;
                }
                .border-primary {
                    border-color: ${primaryColor} !important;
                }
                .text-primary {
                    color: ${primaryColor} !important;
                }
            `}</style>

            {/* Moving Stars Background */}
            <StarfieldBackground />
            
            {/* Ambient Nebula Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            
            {/* Language Switcher */}
            <div className="absolute top-6 right-6 z-20 md:block hidden">
                <LanguageSwitcher />
            </div>

            <div className="flex items-center justify-center min-h-screen p-4 md:p-6 relative z-10">
                <div className="w-full max-w-md">
                    {/* Logo Section */}
                    <div className="text-center mb-6">
                        <Link href={route('dashboard')} className="inline-block transition-transform hover:scale-105 duration-300">
                            {logoSrc ? (
                                <img
                                    src={getImagePath(logoSrc)}
                                    alt={settings.titleText || 'Logo'}
                                    className="h-14 w-auto mx-auto drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                                />
                            ) : (
                                <ApplicationLogo className="h-12 w-12 mx-auto text-primary" />
                            )}
                        </Link>
                    </div>

                    {/* Main Auth Card - Glassmorphism */}
                    <div className="relative group">
                        {/* Radiant Border Glow */}
                        <div 
                            className="absolute -inset-0.5 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 rounded-[2.5rem]" 
                            style={{ background: `linear-gradient(135deg, ${primaryColor}, #8b5cf6)` }}
                        ></div>

                        <div className="relative bg-white/5 backdrop-blur-[28px] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
                            {/* Decorative Grid Trace */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]"></div>

                            {/* Header */}
                            <div className="text-center mb-6 relative">
                                <h1 className="text-2xl md:text-[2rem] font-black text-white mb-3 tracking-tight leading-tight">
                                    {title}
                                </h1>
                                <div 
                                    className="w-12 h-1 mx-auto rounded-full mb-4" 
                                    style={{ background: `linear-gradient(to right, ${primaryColor}, transparent)` }}
                                ></div>
                                <p className="text-gray-400 text-base font-medium max-w-xs mx-auto">{description}</p>
                            </div>

                            {/* Children (Form Content) */}
                            <div className="auth-content-dark">
                                {children}
                            </div>
                        </div>
                    </div>

                    {/* Minimalist Footer */}
                    <div className="text-center mt-7 opacity-60 hover:opacity-100 transition-opacity">
                        <p className="text-xs font-semibold text-gray-500">
                            {settings.footerText || '© 2026 HRMswala. All rights reserved.'}
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                /* Dark Mode Form Overrides for Auth Layout */
                .auth-content-dark label { color: #94a3b8 !important; font-weight: 700 !important; text-transform: uppercase !important; font-size: 0.84rem !important; letter-spacing: 0.08em !important; }
                .auth-content-dark input:not([type='checkbox']):not([type='radio']) { background: rgba(255,255,255,0.03) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: white !important; border-radius: 0.75rem !important; height: 2.75rem !important; padding: 0 1rem !important; font-weight: 600 !important; }
                .auth-content-dark input:focus { border-color: ${primaryColor} !important; background: rgba(255,255,255,0.05) !important; box-shadow: 0 0 0 4px ${primaryColor}20 !important; }
                .auth-content-dark button { border-radius: 0.75rem !important; height: 2.75rem !important; font-weight: 800 !important; letter-spacing: 0.08em !important; box-shadow: 0 10px 24px -12px ${primaryColor}60 !important; }
                .auth-content-dark button[role='checkbox'] {
                    height: 1rem !important;
                    width: 1rem !important;
                    min-height: 1rem !important;
                    min-width: 1rem !important;
                    border-radius: 0.25rem !important;
                    box-shadow: none !important;
                    letter-spacing: normal !important;
                    padding: 0 !important;
                }
                .auth-content-dark .primary-text { color: ${primaryColor} !important; }
                .auth-content-dark .border-t { border-color: rgba(255,255,255,0.1) !important; }
                .auth-content-dark .bg-white { background: transparent !important; }
            `}</style>

            <CookieConsent settings={adminAllSetting || {}} />
        </div>
    );
}