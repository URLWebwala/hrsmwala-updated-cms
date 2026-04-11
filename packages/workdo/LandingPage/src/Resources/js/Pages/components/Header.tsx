import { Menu, X, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { getAdminSetting, getImagePath } from '@/utils/helpers';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
    settings?: any;
}

const HEADER_VARIANTS = {
    header1: {
        nav: 'bg-white border-b border-gray-200 sticky top-0 z-50',
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        wrapper: 'flex justify-between items-center min-h-[72px] py-3',
        logo: 'text-2xl font-bold lg:max-w-[180px] max-w-[140px]',
        desktop: 'hidden md:flex items-center space-x-2',
        mobile: 'md:hidden text-gray-600 p-2 transition-colors',
        mobileMenu: 'md:hidden bg-white border-t'
    },
    header2: {
        nav: 'bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm',
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        wrapper: 'flex flex-col items-center py-6 space-y-6',
        logo: 'text-3xl font-bold',
        desktop: 'flex items-center space-x-2 bg-gray-50 px-6 py-3 rounded-full',
        mobile: 'md:hidden text-gray-600 p-2 transition-colors absolute top-4 right-4 hover:bg-gray-100 rounded-lg',
        mobileMenu: 'md:hidden bg-white border-t w-full shadow-lg'
    },
    header3: {
        nav: 'bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50',
        container: 'max-w-6xl mx-auto px-6 sm:px-8 lg:px-10',
        wrapper: 'flex justify-between items-center min-h-[68px] py-3',
        logo: 'text-xl font-bold',
        desktop: 'hidden md:flex items-center space-x-2',
        mobile: 'md:hidden text-gray-600 p-2 transition-colors hover:bg-gray-100 rounded-md',
        mobileMenu: 'md:hidden bg-white/95 backdrop-blur-md border-t'
    },
    header4: {
        nav: 'bg-black/20 backdrop-blur-md absolute top-0 left-0 right-0 z-50 border-b border-white/10',
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        wrapper: 'flex justify-between items-center h-20 py-4',
        logo: 'text-2xl font-bold text-white drop-shadow-lg',
        desktop: 'hidden md:flex items-center space-x-2',
        mobile: 'md:hidden text-white p-2 transition-colors hover:bg-white/10 rounded-lg',
        mobileMenu: 'md:hidden bg-black/90 backdrop-blur-md border-t border-white/10'
    },
    header5: {
        nav: 'sticky top-0 z-50 shadow-xl',
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        wrapper: 'flex justify-between items-center h-20 py-4',
        logo: 'text-2xl font-bold text-white drop-shadow-lg',
        desktop: 'hidden md:flex items-center space-x-2',
        mobile: 'md:hidden text-white p-2 transition-colors hover:bg-white/10 rounded-lg',
        mobileMenu: 'md:hidden border-t border-white/20'
    }
};

export default function Header({ settings }: HeaderProps) {
    const sectionData = settings?.config_sections?.sections?.header || {};
    const { t } = useTranslation();
    const variant = sectionData.variant || 'header1';
    const config = HEADER_VARIANTS[variant as keyof typeof HEADER_VARIANTS] || HEADER_VARIANTS.header1;
    
    const companyName = sectionData.company_name || settings?.company_name || 'Hrmswala SaaS';
    const isAuthenticated = settings?.is_authenticated;
    const ctaText = isAuthenticated ? 'Dashboard' : (sectionData.cta_text || 'Get Started');
    const colors = settings?.config_sections?.colors || { primary: '#10b77f', secondary: '#059669', accent: '#f59e0b' };
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const socialLinks = settings?.config_sections?.sections?.social || settings?.config_sections?.social || {};
    
    const themeMode = getAdminSetting('theme_mode') || 'light';
    const logoKey = themeMode === 'dark' ? 'logo_light' : 'logo_dark';
    const logoPath = getAdminSetting(logoKey);
    const logoUrl = logoPath ? getImagePath(logoPath) : null;
    
    // Use dynamic navigation items from settings or empty array
    const navigationItems = sectionData.navigation_items || [];

    // Careers (Recruitment frontend) link. URL is already supported by Recruitment routes:
    // /{userSlug}/careers
    const inferSlugFromPath = (): string | null => {
        if (typeof window === 'undefined') return null;
        const path = window.location?.pathname || '/';
        // matches "/{slug}/careers" OR "/{slug}/careers/..."
        const m1 = path.match(/^\/([^/]+)\/careers(?:\/|$)/i);
        if (m1?.[1]) return m1[1];
        // matches "/{slug}/..." (best-effort fallback if landing is served under slug)
        const m2 = path.match(/^\/([^/]+)(?:\/|$)/);
        if (m2?.[1] && !['pricing', 'login', 'register', 'dashboard', 'page', 'marketplace', 'recruitment', 'api'].includes(m2[1].toLowerCase())) {
            return m2[1];
        }
        return null;
    };
    const userSlug =
        settings?.user_slug ||
        settings?.userSlug ||
        settings?.slug ||
        settings?.company_slug ||
        settings?.companySlug ||
        settings?.workspace_slug ||
        settings?.workspaceSlug ||
        inferSlugFromPath() ||
        null;
    const careerHrefFromSettings: string | null =
        sectionData?.career_link || sectionData?.career_url || settings?.career_url || null;

    // Prefer named route (if available) to avoid 404s due to mismatched params.
    // Recruitment route: {userSlug}/careers  -> name: recruitment.frontend.careers.jobs.index
    let careersHref: string | null = null;
    const fallbackCareerSlug: string | null =
        sectionData?.career_user_slug ||
        sectionData?.career_slug ||
        settings?.career_user_slug ||
        settings?.career_slug ||
        settings?.career_default_slug ||
        'company';
    const careersSlugToUse = userSlug || fallbackCareerSlug;

    if (careerHrefFromSettings) {
        careersHref = careerHrefFromSettings.startsWith('/') ? careerHrefFromSettings : `/${careerHrefFromSettings}`;
    } else if (careersSlugToUse) {
        if (typeof (globalThis as any).route === 'function') {
            try {
                careersHref = (globalThis as any).route('recruitment.frontend.careers.jobs.index', { userSlug: careersSlugToUse });
            } catch {
                careersHref = `/${careersSlugToUse}/careers`;
            }
        } else {
            careersHref = `/${careersSlugToUse}/careers`;
        }
    }

    const policySlugs = ['privacy-policy', 'terms-and-conditions', 'terms-of-service', 'refund-policy', 'contact-us', 'faq'];
    
    // Add custom pages to navigation if they exist, but exclude policy pages from header
    const customPages = settings?.custom_pages || [];
    const customPageItems = customPages
        .filter((page: { slug: string }) => !policySlugs.includes(page.slug))
        .map((page: { title: string; slug: string }) => {
            let href = `/page/${page.slug}`;
            if (page.slug === 'contact-us') {
                href = '/contact-us';
            }
            if (page.slug === 'faq') {
                href = '/faq';
            }
            return {
                text: page.title,
                href: href,
                target: '_self'
            };
        });
    
    // Filter manually added navigation items as well
    const filteredNavigationItems = (navigationItems || []).filter((item: any) => {
        const href = (item.href || '').toLowerCase();
        const text = (item.text || '').toLowerCase();
        const matchesSlug = policySlugs.some(slug => href.includes(slug));
        const matchesText = ['privacy', 'policy', 'terms', 'condition', 'faq', 'contact', 'refund'].some(keyword => text.includes(keyword));
        const isHome = text.includes('home') || href === '/' || href === '';
        return !matchesSlug && !matchesText && !isHome;
    });

    // Combine navigation items with custom pages
    const baseNavigationItems = [
        { text: 'Home', href: '/', target: '_self' },
        ...filteredNavigationItems, 
        ...customPageItems
    ];
    const hasCareersAlready =
        baseNavigationItems.some((i: any) => (typeof i?.href === 'string' ? i.href.toLowerCase().includes('careers') : false)) ||
        baseNavigationItems.some((i: any) => (typeof i?.text === 'string' ? i.text.toLowerCase().includes('career') : false));
    const allNavigationItems = [
        ...baseNavigationItems,
        ...(careersHref && !hasCareersAlready ? [{ text: 'Career', href: careersHref, target: '_self' }] : []),
    ];

    const renderNavItems = (isMobile = false) => {
        const isTransparentOrGradient = variant === 'header4' || variant === 'header5';
        const textColor = isTransparentOrGradient ? 'text-white' : 'text-gray-600';
        const hoverBg = variant === 'header2' ? 'hover:bg-white hover:shadow-sm' : variant === 'header3' ? 'hover:bg-gray-50' : isTransparentOrGradient ? 'hover:bg-white/10' : 'hover:bg-gray-50';
        
        return allNavigationItems.map((item) => {
            const href = item.href?.startsWith('/page/') ? route('custom-page.show', item.href.replace('/page/', '')) : item.href;
            return item.target === '_blank' ? (
                <a 
                    key={item.text} 
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={isMobile 
                        ? `block px-4 py-3 text-base font-medium ${textColor} ${hoverBg} rounded-lg transition-all` 
                        : `${textColor} px-4 py-2 text-sm font-medium ${hoverBg} rounded-lg transition-all duration-200`
                    }
                    style={!isMobile ? { '--hover-color': isTransparentOrGradient ? 'white' : colors.primary } as React.CSSProperties : {}}
                    onMouseEnter={!isMobile ? (e) => {
                        if (!isTransparentOrGradient) {
                            e.currentTarget.style.color = colors.primary;
                        }
                    } : undefined}
                    onMouseLeave={!isMobile ? (e) => e.currentTarget.style.color = '' : undefined}
                >
                    {item.text}
                </a>
            ) : (
                <Link 
                    key={item.text} 
                    href={href} 
                    className={isMobile 
                        ? `block px-4 py-3 text-base font-medium ${textColor} ${hoverBg} rounded-lg transition-all` 
                        : `${textColor} px-4 py-2 text-sm font-medium ${hoverBg} rounded-lg transition-all duration-200`
                    }
                    style={!isMobile ? { '--hover-color': isTransparentOrGradient ? 'white' : colors.primary } as React.CSSProperties : {}}
                    onMouseEnter={!isMobile ? (e) => {
                        if (!isTransparentOrGradient) {
                            e.currentTarget.style.color = colors.primary;
                        }
                    } : undefined}
                    onMouseLeave={!isMobile ? (e) => e.currentTarget.style.color = '' : undefined}
                >
                    {item.text}
                </Link>
            );
        });
    };

    const renderCTAButtons = (isMobile = false) => {
        const enableRegistration = settings?.enable_registration !== false;
        if (isAuthenticated) {
            return (
                <button 
                    onClick={() => router.visit(route('dashboard'))}
                    className={`text-white rounded-md font-medium transition-colors ${
                        isMobile ? 'px-4 py-2 text-sm w-full' : 
                        variant === 'header3' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
                    }`}
                    style={{ backgroundColor: colors.primary }} 
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondary} 
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
                >
                    {t('Dashboard')}
                </button>
            );
        }
        
        if (enableRegistration) {
            return (
                <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'}`}>
                    <button 
                        onClick={() => router.visit(route('login'))}
                        className={`border rounded-md font-medium transition-colors ${
                            isMobile ? 'px-4 py-2 text-sm w-full' : 
                            variant === 'header3' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
                        }`}
                        style={{ borderColor: colors.primary, color: colors.primary }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.primary;
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = colors.primary;
                        }}
                    >
                        {t('Sign In')}
                    </button>
                    <button 
                        onClick={() => router.visit(route('register'))}
                        className={`text-white rounded-md font-medium transition-colors ${
                            isMobile ? 'px-4 py-2 text-sm w-full' : 
                            variant === 'header3' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
                        }`}
                        style={{ backgroundColor: colors.primary }} 
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondary} 
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
                    >
                        {t('Get Started')}
                    </button>
                </div>
            );
        }
        
        return (
            <button 
                onClick={() => router.visit(route('login'))}
                className={`text-white rounded-md font-medium transition-colors ${
                    isMobile ? 'px-4 py-2 text-sm w-full' : 
                    variant === 'header3' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
                }`}
                style={{ backgroundColor: colors.primary }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.secondary} 
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
            >
                {t('Sign In')}
            </button>
        );
    };

    const getGradientStyle = () => {
        if (variant === 'header5') {
            return {
                background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary}, ${colors.accent})`
            };
        }
        return {};
    };

    const getMobileMenuStyle = () => {
        if (variant === 'header5') {
            return {
                background: `linear-gradient(to right, ${colors.primary}, ${colors.secondary})`
            };
        }
        return {};
    };

    const drawerSocialItems = [
        { key: 'facebook', href: socialLinks.facebook, icon: Facebook },
        { key: 'instagram', href: socialLinks.instagram, icon: Instagram },
        { key: 'twitter', href: socialLinks.twitter, icon: Twitter },
        { key: 'linkedin', href: socialLinks.linkedin, icon: Linkedin },
    ];

    return (
        <nav className={config.nav} style={getGradientStyle()}>
            <div className={config.container}>
                <div className={config.wrapper}>
                    <Link href={route('landing.page')} className={config.logo} style={{ color: colors.primary }}>
                        {logoUrl ? (
                            <img src={logoUrl} alt={`${companyName} Logo`} className="w-auto" />
                        ) : (
                            companyName
                        )}
                    </Link>
                    
                    <div className={config.desktop}>
                        {renderNavItems()}
                        {sectionData?.enable_pricing_link !== false && (
                            <Link 
                                href={route("pricing.page")}
                                className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                                    variant === 'header4' || variant === 'header5' 
                                        ? 'text-white hover:bg-white/10' 
                                        : variant === 'header2' 
                                            ? 'text-gray-600 hover:bg-white hover:shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50'
                                }`}
                                onMouseEnter={(e) => {
                                    if (variant !== 'header4' && variant !== 'header5') {
                                        e.currentTarget.style.color = colors.primary;
                                    }
                                }}
                                onMouseLeave={(e) => e.currentTarget.style.color = ''}
                            >
                                {t('Pricing')}
                            </Link>
                        )}
                        {renderCTAButtons()}
                    </div>
                    
                    <button 
                        className={config.mobile}
                        onMouseEnter={(e) => e.currentTarget.style.color = colors.primary} 
                        onMouseLeave={(e) => e.currentTarget.style.color = ''}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>
            
            {/* Modern mobile side drawer */}
            <div
                className={`md:hidden fixed inset-0 z-[100] transition-all duration-300 ${
                    mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                aria-hidden={!mobileMenuOpen}
            >
                <div
                    className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                        mobileMenuOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                />
                <div
                    className={`absolute top-0 right-0 h-full w-[88%] max-w-sm shadow-2xl transition-transform duration-300 ease-out ${
                        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    } ${
                        variant === 'header4' || variant === 'header5'
                            ? 'bg-[#0b1320] text-white border-l border-white/15'
                            : 'bg-white text-gray-900 border-l border-gray-200'
                    }`}
                    style={variant === 'header5' ? getMobileMenuStyle() : {}}
                >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/30">
                        <Link
                            href={route('landing.page')}
                            className="lg:max-w-[180px] max-w-[140px] inline-block"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {logoUrl ? (
                                <img src={logoUrl} alt={`${companyName} Logo`} className="w-auto" />
                            ) : (
                                <span className="text-lg font-bold" style={{ color: colors.primary }}>
                                    {companyName}
                                </span>
                            )}
                        </Link>
                        <button
                            className="p-2 rounded-md hover:bg-black/5"
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Close menu"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="px-4 py-4 space-y-1">
                        {renderNavItems(true)}
                        {sectionData?.enable_pricing_link !== false && (
                            <Link
                                href={route('pricing.page')}
                                className={`block px-4 py-3 text-base font-medium rounded-lg transition-all ${
                                    variant === 'header4' || variant === 'header5'
                                        ? 'text-white hover:bg-white/10'
                                        : 'text-gray-700 hover:bg-gray-50'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('Pricing')}
                            </Link>
                        )}
                    </div>

                    <div className="px-4 pt-2">
                        {renderCTAButtons(true)}
                    </div>

                    <div className="mt-6 px-4 pb-6">
                        <p
                            className={`text-xs font-semibold uppercase tracking-wide mb-3 ${
                                variant === 'header4' || variant === 'header5' ? 'text-white/70' : 'text-gray-500'
                            }`}
                        >
                            {t('Follow Us')}
                        </p>
                        <div className="flex items-center gap-3">
                            {drawerSocialItems.map(({ key, href, icon: Icon }) =>
                                href ? (
                                    <a
                                        key={key}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-black/5 hover:scale-105 transition-all"
                                        aria-label={key}
                                    >
                                        <Icon className="h-5 w-5" style={{ color: colors.primary }} />
                                    </a>
                                ) : (
                                    <span
                                        key={key}
                                        className="p-2 rounded-lg bg-black/5 opacity-70"
                                        aria-label={key}
                                    >
                                        <Icon className="h-5 w-5" style={{ color: colors.primary }} />
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}