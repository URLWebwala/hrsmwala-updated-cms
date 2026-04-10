import { Mail, Phone, MapPin, Globe, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { getAdminSetting, getImagePath } from '@/utils/helpers';
import AnimateOnScroll from './AnimateOnScroll';

interface FooterProps {
    settings?: any;
}

const FOOTER_VARIANTS = {
    footer1: {
        footer: 'bg-gray-900 text-white py-16',
        container: 'max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12',
        grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12',
        companyName: 'text-2xl font-bold mb-4 lg:max-w-[180px] max-w-[140px] inline-block',
        description: 'text-gray-400 mb-6 leading-relaxed',
        sectionTitle: 'text-lg font-semibold mb-6 text-white',
        newsletterTitle: 'text-lg font-semibold mb-4 text-white',
        copyright: 'border-t border-gray-800/50 mt-16 pt-8 text-center text-gray-500 text-sm',
        layout: 'standard'
    },
    footer2: {
        footer: 'bg-white py-16 border-t border-gray-100 shadow-inner',
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        grid: 'flex flex-col md:flex-row justify-between items-start space-y-8 md:space-y-0 md:space-x-12',
        companyName: 'text-xl font-bold text-gray-900 lg:max-w-[180px] max-w-[140px] inline-block',
        description: 'text-gray-600 text-sm max-w-md leading-relaxed',
        sectionTitle: 'text-sm font-semibold text-gray-900 mb-4',
        newsletterTitle: 'text-lg font-semibold text-gray-900 mb-4',
        copyright: 'mt-12 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm',
        layout: 'minimal'
    },
    footer3: {
        footer: 'bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white py-24',
        container: 'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center',
        grid: 'space-y-16',
        companyName: 'text-4xl font-bold mb-8 lg:max-w-[180px] max-w-[140px] inline-block',
        description: 'text-gray-300 text-xl mb-12 max-w-3xl mx-auto leading-relaxed',
        sectionTitle: 'text-lg font-semibold mb-6 text-white',
        newsletterTitle: 'text-2xl font-bold mb-6 text-white',
        copyright: 'border-t border-gray-700 mt-16 pt-8 text-gray-400',
        layout: 'centered'
    },
    footer4: {
        footer: 'bg-gray-50 py-20 border-t border-gray-200',
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        grid: 'grid grid-cols-1 lg:grid-cols-2 gap-20 items-start',
        companyName: 'text-2xl font-bold text-gray-900 mb-6 lg:max-w-[180px] max-w-[140px] inline-block',
        description: 'text-gray-600 mb-8 leading-relaxed text-lg',
        sectionTitle: 'text-lg font-semibold mb-6 text-gray-900',
        newsletterTitle: 'text-xl font-bold mb-6 text-gray-900',
        copyright: 'border-t border-gray-200 mt-16 pt-8 text-center text-gray-500',
        layout: 'split'
    },
    footer5: {
        footer: 'py-20 relative overflow-hidden',
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10',
        grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12',
        companyName: 'text-3xl font-bold mb-6 text-white drop-shadow-lg lg:max-w-[180px] max-w-[140px] inline-block',
        description: 'text-white/90 mb-8 leading-relaxed text-lg',
        sectionTitle: 'text-xl font-bold mb-6 text-white',
        newsletterTitle: 'text-2xl font-bold mb-6 text-white',
        copyright: 'border-t border-white/30 mt-12 pt-8 text-center text-white/80 backdrop-blur-sm',
        layout: 'modern'
    }
};

export default function Footer({ settings }: FooterProps) {
    const sectionData = settings?.config_sections?.sections?.footer || {};
    const variant = sectionData.variant || 'footer1';
    const config = FOOTER_VARIANTS[variant as keyof typeof FOOTER_VARIANTS] || FOOTER_VARIANTS.footer1;
    
    const companyName = settings?.company_name || 'Hrmswala SaaS';
    const description = sectionData.description || 'The complete business management solution for modern enterprises.';
    const contactEmail = settings?.contact_email || 'support@hrmswala.com';
    const phone = settings?.contact_phone || '+91 00000 00000';
    const socialLinks = settings?.config_sections?.sections?.social || {};
    const copyrightText = sectionData.copyright_text || `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`;
    const colors = settings?.config_sections?.colors || { primary: '#10b77f', secondary: '#059669', accent: '#f59e0b' };
    
    const isLightBackground = config.layout === 'minimal' || config.layout === 'split';
    const logoKey = isLightBackground ? 'logo_dark' : 'logo_light';
    const logoPath = getAdminSetting(logoKey);
    const logoUrl = logoPath ? getImagePath(logoPath) : null;

    const getBackgroundStyle = () => {
        if (config.layout === 'modern') {
            return { 
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`,
                backgroundSize: '400% 400%',
                animation: 'gradientShift 15s ease infinite'
            };
        }
        return {};
    };

    const renderCompanyInfo = () => {
        if (config.layout === 'minimal') {
            return (
                <div className="flex-1 space-y-4">
                    <Link href={route('landing.page')} className={config.companyName}>
                        {logoUrl ? (
                            <img src={logoUrl} alt={companyName} className="w-auto" />
                        ) : (
                            companyName
                        )}
                    </Link>
                    <p className={config.description}>{description}</p>
                </div>
            );
        }
        
        return (
            <div className={config.layout === 'split' ? 'space-y-6' : ''}>
                <Link href={route('landing.page')} className={config.companyName} style={config.layout !== 'split' ? { color: colors.primary } : {}}>
                    {logoUrl ? (
                        <img src={logoUrl} alt={companyName} className={config.layout === 'centered' ? 'h-12 w-auto mx-auto' : 'w-auto'} />
                    ) : (
                        companyName
                    )}
                </Link>
                <p className={config.description}>
                    {description}
                </p>
            </div>
        );
    };

    const renderContactAndSocial = () => {
        const isLight = config.layout === 'minimal' || config.layout === 'split';
        const titleClass = config.newsletterTitle; // reuse typography slot
        const textClass =
            config.layout === 'centered' || config.layout === 'modern'
                ? 'text-gray-300'
                : isLight
                    ? 'text-gray-600'
                    : 'text-gray-400';

        const iconSizeClass = config.layout === 'centered' || config.layout === 'modern' ? 'h-6 w-6' : 'h-5 w-5';
        const rowTextClass = `${textClass} whitespace-nowrap ${config.layout === 'centered' || config.layout === 'modern' ? 'text-lg' : 'text-sm'}`;

        return (
            <div className={config.layout === 'split' ? 'lg:col-span-2' : ''}>
                <h3 className={titleClass}>Contact</h3>
                <div className={`space-y-4 ${config.layout === 'centered' ? 'flex flex-col items-center' : ''}`}>
                    <div className="flex items-center">
                        <Mail className={`${iconSizeClass} mr-3`} style={{ color: colors.primary }} />
                        <span className={rowTextClass}>{contactEmail}</span>
                    </div>
                    <div className="flex items-center">
                        <Phone className={`${iconSizeClass} mr-3`} style={{ color: colors.primary }} />
                        <span className={rowTextClass}>{phone}</span>
                    </div>

                    <div className={`flex items-center gap-4 pt-2 ${config.layout === 'centered' ? 'justify-center' : ''}`}>
                        {socialLinks.facebook && (
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <Facebook className="h-5 w-5" style={{ color: colors.primary }} />
                            </a>
                        )}
                        {socialLinks.instagram && (
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <Instagram className="h-5 w-5" style={{ color: colors.primary }} />
                            </a>
                        )}
                        {socialLinks.twitter && (
                            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <Twitter className="h-5 w-5" style={{ color: colors.primary }} />
                            </a>
                        )}
                        {socialLinks.linkedin && (
                            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <Linkedin className="h-5 w-5" style={{ color: colors.primary }} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderNavigationSections = () => {
        const customPages = settings?.custom_pages || [];
        const policySlugs = ['privacy-policy', 'terms-and-conditions', 'refund-policy', 'contact-us', 'faq'];
        const legalPages = customPages.filter((p: { slug: string }) => policySlugs.includes(p.slug));
        
        let navigationSections = [...(sectionData.navigation_sections || [])];
        
        // Add a "Resources" section if we have legal pages and a section with that title doesn't exist
        if (legalPages.length > 0 && !navigationSections.some(s => s.title?.toLowerCase() === 'resources')) {
            navigationSections.push({
                title: 'Resources',
                links: legalPages.map((p: any) => {
                    let href = `/page/${p.slug}`;
                    if (policySlugs.includes(p.slug)) {
                        href = `/${p.slug}`;
                    }
                    return {
                        text: p.title,
                        href: href,
                        target: '_self'
                    };
                })
            });
        }

        if (config.layout === 'minimal') {
            return (
                <div className="flex flex-wrap gap-8">
                    {navigationSections?.slice(0, 4).map((section: any, index: number) => (
                        section.links?.length > 0 && (
                            <div key={index} className="min-w-0">
                                <h3 className={config.sectionTitle}>{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.links.slice(0, 4).map((link: any, linkIndex: number) => (
                                        <li key={linkIndex}>
                                            {link.target === '_blank' ? (
                                                <a href={link.href?.startsWith('/page/') ? route('custom-page.show', link.href.replace('/page/', '')) : link.href} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors text-sm hover:underline">
                                                    {link.text}
                                                </a>
                                            ) : (
                                                <Link href={link.href?.startsWith('/page/') ? route('custom-page.show', link.href.replace('/page/', '')) : link.href} className="text-gray-600 hover:text-gray-900 transition-colors text-sm hover:underline">
                                                    {link.text}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    ))}
                </div>
            );
        }

        if (config.layout === 'centered') {
            return (
                <div className="flex flex-wrap justify-center gap-12">
                    {navigationSections?.map((section: any, index: number) => (
                        section.links?.length > 0 && (
                            <div key={index}>
                                <h3 className={config.sectionTitle}>{section.title}</h3>
                                <ul className="space-y-2">
                                    {section.links.map((link: any, linkIndex: number) => (
                                        <li key={linkIndex}>
                                            {link.target === '_blank' ? (
                                                <a href={link.href?.startsWith('/page/') ? route('custom-page.show', link.href.replace('/page/', '')) : link.href} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors text-sm">
                                                    {link.text}
                                                </a>
                                            ) : (
                                                <Link href={link.href?.startsWith('/page/') ? route('custom-page.show', link.href.replace('/page/', '')) : link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                                                    {link.text}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    ))}
                </div>
            );
        }

        if (config.layout === 'split') {
            return (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {navigationSections?.map((section: any, index: number) => (
                        section.links?.length > 0 && (
                            <div key={index}>
                                <h3 className={config.sectionTitle}>{section.title}</h3>
                                <ul className="space-y-3">
                                    {section.links.map((link: any, linkIndex: number) => (
                                        <li key={linkIndex}>
                                            {link.target === '_blank' ? (
                                                <a href={link.href?.startsWith('/page/') ? route('custom-page.show', link.href.replace('/page/', '')) : link.href} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                                                    {link.text}
                                                </a>
                                            ) : (
                                                <Link href={link.href?.startsWith('/page/') ? route('custom-page.show', link.href.replace('/page/', '')) : link.href} className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                                                    {link.text}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    ))}
                </div>
            );
        }

        // Standard and modern layouts
        return navigationSections?.map((section: any, index: number) => (
            section.links?.length > 0 && (
                <div key={index}>
                    <h3 className={config.sectionTitle}>{section.title}</h3>
                    <ul className="space-y-3">
                        {section.links.map((link: any, linkIndex: number) => (
                            <li key={linkIndex} className="whitespace-nowrap">
                                {link.target === '_blank' ? (
                                    <a href={link.href?.startsWith('/page/') ? route('custom-page.show', link.href.replace('/page/', '')) : link.href} target="_blank" rel="noopener noreferrer" className={`transition-all duration-300 text-base ${config.layout === 'modern' ? 'text-white/80 hover:text-white hover:translate-x-2 hover:drop-shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                                        {link.text}
                                    </a>
                                ) : (
                                    <Link href={link.href?.startsWith('/page/') ? route('custom-page.show', link.href.replace('/page/', '')) : link.href} className={`transition-all duration-300 text-base ${config.layout === 'modern' ? 'text-white/80 hover:text-white hover:translate-x-2 hover:drop-shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                                        {link.text}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )
        ));
    };

    if (config.layout === 'minimal') {
        return (
            <footer className={config.footer}>
                <div className={config.container}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-8 lg:space-y-0">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-12 space-y-6 lg:space-y-0">
                            {renderCompanyInfo()}
                            {renderNavigationSections()}
                        </div>
                        <div className="lg:ml-auto">
                            {renderContactAndSocial()}
                        </div>
                    </div>
                    <div className={config.copyright}>
                        <p>{copyrightText}</p>
                    </div>
                </div>
            </footer>
        );
    }

    if (config.layout === 'centered') {
        return (
            <footer className={config.footer}>
                <div className={config.container}>
                    <div className={config.grid}>
                        {renderCompanyInfo()}
                        {renderNavigationSections()}
                        {renderContactAndSocial()}
                    </div>
                    <div className={config.copyright}>
                        <p>{copyrightText}</p>
                    </div>
                </div>
            </footer>
        );
    }

    if (config.layout === 'split') {
        return (
            <footer className={config.footer}>
                <div className={config.container}>
                    <div className={config.grid}>
                        <div>
                            {renderCompanyInfo()}
                            {renderContactAndSocial()}
                        </div>
                        <div>
                            {renderNavigationSections()}
                        </div>
                    </div>
                    <div className={config.copyright}>
                        <p>{copyrightText}</p>
                    </div>
                </div>
            </footer>
        );
    }

    // Standard and modern layouts
    return (
        <footer className={`${config.footer} relative overflow-hidden`} style={getBackgroundStyle()}>
            {config.layout === 'modern' && (
                <>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse delay-500"></div>
                    </div>
                    {/* Big watermark brand text */}
                    <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-[52px] sm:text-[72px] md:text-[96px] lg:text-[120px] font-black tracking-tight leading-none text-white/10">
                                HRMSWALA
                            </div>
                        </div>
                    </div>
                    <style>{`
                        @keyframes gradientShift {
                            0% { background-position: 0% 50%; }
                            50% { background-position: 100% 50%; }
                            100% { background-position: 0% 50%; }
                        }
                    `}</style>
                </>
            )}
            <div className={config.container}>
                <AnimateOnScroll direction="up">
                    <div className={config.grid}>
                        <div className="lg:col-span-3 lg:pr-4">
                            {renderCompanyInfo()}
                        </div>
                        <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-10">
                            {renderNavigationSections()}
                        </div>
                        <div className="lg:col-span-3 lg:pl-10">
                            {renderContactAndSocial()}
                        </div>
                    </div>
                </AnimateOnScroll>
                <div className={config.copyright}>
                    <p>{copyrightText}</p>
                </div>
            </div>
        </footer>
    );
}