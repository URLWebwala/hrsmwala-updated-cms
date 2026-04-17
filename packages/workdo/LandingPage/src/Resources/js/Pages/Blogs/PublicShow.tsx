import type { CSSProperties } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Calendar, Eye, Tag, User, ChevronLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CookieConsent from '@/components/cookie-consent';
import { formatDate } from '@/utils/helpers';
import {
    blogPlainExcerpt,
    resolveThemeColors,
} from '../../utils/blogDisplay';

export default function PublicShow({ blog, relatedBlogs, landingPageSettings }: any) {
    const { adminAllSetting } = usePage().props as any;
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const canonicalUrl = typeof window !== 'undefined' ? window.location.href : '';
    
    const themeColors = landingPageSettings?.config_sections?.colors;
    const { primary, secondary } = resolveThemeColors(themeColors);
    const published = blog.published_at || blog.created_at;

    const [liveViews, setLiveViews] = useState<number>(() => Number(blog.read_count) || 0);

    const refreshViewCount = useCallback(async () => {
        try {
            const url = route('blog.views', { slug: blog.slug });
            const res = await fetch(url, {
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                credentials: 'same-origin',
            });
            if (!res.ok) return;
            const data = await res.json();
            if (typeof data.read_count === 'number') {
                setLiveViews(data.read_count);
            }
        } catch { /* ignore */ }
    }, [blog.slug]);

    useEffect(() => {
        refreshViewCount();
        const t1 = window.setTimeout(refreshViewCount, 2500);
        const interval = window.setInterval(refreshViewCount, 8000);
        return () => {
            window.clearTimeout(t1);
            window.clearInterval(interval);
        };
    }, [refreshViewCount]);

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <Head title={blog.meta_title || blog.title}>
                <meta name="description" content={blog.meta_description || blogPlainExcerpt(blog.content || '', 160)} />
                <meta name="robots" content="index,follow" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={blog.title} />
                {blog.image_url && <meta property="og:image" content={blog.image_url} />}
            </Head>
            
            <Header settings={landingPageSettings} />
            
            <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
                {/* Navigation & Breadcrumb */}
                <Link 
                    href={route('blog.index')} 
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Insights
                </Link>

                {/* Article Header */}
                <header className="mb-12">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-8">
                        <span dangerouslySetInnerHTML={{ __html: blog.title }} />
                    </h1>

                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        {blog.category && (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-[11px] font-black uppercase tracking-widest shadow-sm">
                                <Tag className="w-3.5 h-3.5" />
                                {blog.category}
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                            <Calendar className="w-3.5 h-3.5" />
                            {published ? formatDate(published) : ''}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                            <User className="w-3.5 h-3.5" />
                            {blog.author_name}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-500 text-[11px] font-bold uppercase tracking-widest">
                            <Eye className="w-3.5 h-3.5" />
                            {liveViews} Views
                        </div>
                    </div>
                </header>

                {/* Main Image (Fixed format - No Cropping) */}
                <div className="relative aspect-[21/9] bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 p-2 mb-16 shadow-2xl">
                    {blog.image_url ? (
                        <img 
                            src={blog.image_url} 
                            alt={blog.title} 
                            className="w-full h-full object-contain" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                             <span className="text-6xl font-bold text-gray-200">{(blog.title || '?').charAt(0)}</span>
                        </div>
                    )}
                </div>

                {/* Article Content */}
                <article
                    className="prose prose-blue prose-lg md:prose-xl max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed"
                    style={{ '--tw-prose-links': primary } as CSSProperties}
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {/* Related Posts Section */}
                {relatedBlogs && relatedBlogs.length > 0 && (
                    <section className="mt-24 pt-16 border-t border-gray-100">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Recommended <span className="text-blue-600">Reading</span></h2>
                        <p className="text-gray-500 font-medium mb-12">Dive deeper into topics you may be interested in.</p>
                        
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {relatedBlogs.map((item: any) => (
                                <Link
                                    key={item.id}
                                    href={route('blog.show', item.slug)}
                                    className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200 overflow-hidden"
                                >
                                    {/* Related Thumb (No Cropping) */}
                                    <div className="relative aspect-[16/10] bg-gray-50 flex items-center justify-center p-2 overflow-hidden">
                                        {item.image_url ? (
                                            <img 
                                                src={item.image_url} 
                                                alt={item.title} 
                                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                 <span className="text-4xl font-bold text-gray-200">{(item.title || '?').charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2" dangerouslySetInnerHTML={{ __html: item.title }} />
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            {item.author_name}
                                        </p>
                                        <span className="inline-flex items-center gap-2 text-sm font-black transition-all group-hover:gap-3" style={{ color: primary }}>
                                            Read More
                                            <ArrowRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer settings={landingPageSettings} />
            <CookieConsent settings={adminAllSetting || {}} />
        </div>
    );
}
