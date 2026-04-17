import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Calendar, User } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CookieConsent from '@/components/cookie-consent';
import { Pagination } from '@/components/ui/pagination';
import {
    blogPlainExcerpt,
    resolveThemeColors,
} from '../../utils/blogDisplay';

export default function PublicIndex({ blogs, landingPageSettings }: any) {
    const { adminAllSetting } = usePage().props as any;
    const canonicalUrl = typeof window !== 'undefined' ? window.location.href : '';
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const blogIndexTitle = 'HRMswala Blog';
    const blogIndexDescription = 'Read our latest business and product blogs.';
    const robotsContent = blogs?.current_page > 1 ? 'noindex,follow' : 'index,follow';
    const themeColors = landingPageSettings?.config_sections?.colors;
    const theme = resolveThemeColors(themeColors);
    const { primary, secondary } = theme;

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <Head title="Blog">
                <meta name="description" content={blogIndexDescription} />
                <meta name="keywords" content="business blogs, HRM, CRM, payroll, attendance, productivity" />
                <meta name="robots" content={robotsContent} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={blogIndexTitle} />
                <meta property="og:description" content={blogIndexDescription} />
                {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={blogIndexTitle} />
                <meta name="twitter:description" content={blogIndexDescription} />
            </Head>
            <Header settings={landingPageSettings} />
            
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
                {/* Header Section */}
                <div className="mb-14 text-center">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
                        Latest <span style={{ 
                            backgroundImage: `linear-gradient(90deg, ${primary}, ${secondary})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent'
                        }}>Insights</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-base text-gray-500 font-medium">
                        Tips, product updates, and ideas — with featured images, quick reads, and full articles.
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <div className="h-1 w-16 rounded-full" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
                        <div className="h-1 w-6 rounded-full opacity-30" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
                    </div>
                </div>

                {/* Blog Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {(blogs.data || []).map((blog: any) => {
                        const excerpt = blogPlainExcerpt(blog.content, 140);
                        const date = new Date(blog.published_at || blog.created_at).toLocaleDateString();
                        
                        return (
                            <article
                                key={blog.id}
                                className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200 overflow-hidden"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[16/10] bg-gray-50 flex items-center justify-center p-2">
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
                                    <div className="flex items-center gap-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {date}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            {blog.author_name || 'Admin'}
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                        <span dangerouslySetInnerHTML={{ __html: blog.title }} />
                                    </h2>

                                    <p className="flex-1 text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6">
                                        {excerpt}
                                    </p>

                                    <Link
                                        href={route('blog.show', blog.slug)}
                                        className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
                                        style={{ color: primary }}
                                    >
                                        Read More
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {/* Pagination */}
                {blogs.last_page > 1 && (
                    <div className="mt-16 flex justify-center border-t border-gray-100 pt-10">
                        <Pagination data={blogs} routeName="blog.index" filters={{}} />
                    </div>
                )}
            </main>

            <Footer settings={landingPageSettings} />
            <CookieConsent settings={adminAllSetting || {}} />
        </div>
    );
}
