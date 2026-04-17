import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Calendar, User } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';
import SectionHeading from './SectionHeading';
import { blogPlainExcerpt, resolveThemeColors } from '../../utils/blogDisplay';

interface BlogsProps {
    settings?: any;
    blogs?: any[];
}

export default function Blogs({ settings, blogs = [] }: BlogsProps) {
    const { t } = useTranslation();
    const sectionData = settings?.config_sections?.sections?.blogs || {};
    const colors = settings?.config_sections?.colors || { primary: '#3b82f6', secondary: '#2563eb', accent: '#f59e0b' };
    const { primary: themePrimary, secondary: themeSecondary } = resolveThemeColors(colors);

    if (!blogs.length) return null;

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    title={sectionData.title || t('Latest Blogs')}
                    subtitle={sectionData.subtitle || t('Fresh updates and insights from our team.')}
                    accentColor={colors.primary}
                />

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-12">
                    {blogs.map((blog: any, index: number) => {
                        const excerpt = blogPlainExcerpt(blog.content, 130);
                        const date = new Date(blog.published_at || blog.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });
                        
                        return (
                            <AnimateOnScroll key={blog.id} direction="up" delayMs={index * 50}>
                                <article className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200 overflow-hidden">
                                    
                                    {/* Image Container - Using object-contain to prevent cropping */}
                                    <div className="relative aspect-[16/10] bg-gray-50/50 flex items-center justify-center p-2">
                                        {blog.image_url ? (
                                            <img 
                                                src={blog.image_url} 
                                                alt={blog.title} 
                                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
                                                <span className="text-4xl font-bold text-gray-200">{(blog.title || '?').charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex flex-1 flex-col p-6">
                                        {/* Date & Author Row */}
                                        <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {date}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5" />
                                                {blog.author_name || t('Admin')}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                            <Link href={route('blog.show', blog.slug)}>
                                                {blog.title}
                                            </Link>
                                        </h3>

                                        <p className="flex-1 text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6">
                                            {excerpt}
                                        </p>

                                        <Link
                                            href={route('blog.show', blog.slug)}
                                            className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
                                            style={{ color: colors.primary }}
                                        >
                                            {t('Read More')}
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </div>
                                </article>
                            </AnimateOnScroll>
                        );
                    })}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link
                        href={route('blog.index')}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
                        style={{ background: `linear-gradient(to right, ${themePrimary}, ${themeSecondary})` }}
                    >
                        {t('View All Blogs')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
