import type { CSSProperties } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Calendar, Eye, Tag, User } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BlogCardCover from '../components/BlogCardCover';
import CookieConsent from '@/components/cookie-consent';
import { formatDate } from '@/utils/helpers';
import {
    blogCardSurfaceStyle,
    blogHeadingGradientTextStyle,
    blogHeadingUnderlineStyles,
    blogPlainExcerpt,
    resolveThemeColors,
    themeStripGradientStyle,
} from '../../utils/blogDisplay';

export default function PublicShow({ blog, relatedBlogs, landingPageSettings }: any) {
    const { adminAllSetting } = usePage().props as any;
    const canonicalUrl = typeof window !== 'undefined' ? window.location.href : '';
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const blogIndexUrl = (() => {
        const raw = route('blog.index');
        return raw.startsWith('http') ? raw : `${siteUrl}${raw}`;
    })();
    const pageTitle = blog.meta_title || blog.title;
    const pageDescription = blog.meta_description || blogPlainExcerpt(blog.content || '', 160);
    const pageKeywords = blog.meta_keywords || '';
    const themeColors = landingPageSettings?.config_sections?.colors;
    const { primary, secondary } = resolveThemeColors(themeColors);
    const headingLine = blogHeadingUnderlineStyles(themeColors);
    const published = blog.published_at || blog.created_at;

    const [liveViews, setLiveViews] = useState<number>(() => Number(blog.read_count) || 0);

    useEffect(() => {
        setLiveViews(Number(blog.read_count) || 0);
    }, [blog.id, blog.read_count]);

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
        } catch {
            /* ignore network errors */
        }
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
        <div className="min-h-screen bg-transparent">
            <Head title={pageTitle}>
                <meta name="description" content={pageDescription} />
                <meta name="keywords" content={pageKeywords} />
                <meta name="robots" content="index,follow,max-image-preview:large" />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
                {blog.image_url && <meta property="og:image" content={blog.image_url} />}
                {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
                {published && <meta property="article:published_time" content={published} />}
                {blog.updated_at && <meta property="article:modified_time" content={blog.updated_at} />}
                {blog.author_name && <meta property="article:author" content={blog.author_name} />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                {blog.image_url && <meta name="twitter:image" content={blog.image_url} />}
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BlogPosting',
                    headline: blog.title,
                    mainEntityOfPage: canonicalUrl || undefined,
                    keywords: pageKeywords || undefined,
                    author: { '@type': 'Person', name: blog.author_name },
                    publisher: {
                        '@type': 'Organization',
                        name: landingPageSettings?.company_name || 'HRMswala',
                        logo: siteUrl ? { '@type': 'ImageObject', url: `${siteUrl}/logo.png` } : undefined,
                    },
                    datePublished: blog.published_at,
                    dateModified: blog.updated_at,
                    image: blog.image_url || undefined,
                    description: pageDescription || undefined,
                })}</script>
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        {
                            '@type': 'ListItem',
                            position: 1,
                            name: 'Blog',
                            item: blogIndexUrl || undefined,
                        },
                        {
                            '@type': 'ListItem',
                            position: 2,
                            name: blog.title,
                            item: canonicalUrl || undefined,
                        },
                    ],
                })}</script>
            </Head>
            <Header settings={landingPageSettings} />
            <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10 xl:px-12 py-12 pb-24">
                <Link href={route('blog.index')} className="text-sm font-medium text-gray-500 hover:text-gray-800">
                    ← Back to Blog
                </Link>

                <h1 className="mt-6 text-3xl font-bold leading-[1.2] tracking-tight pb-1 sm:text-4xl lg:text-5xl">
                    <span style={blogHeadingGradientTextStyle(primary, secondary)}>{blog.title}</span>
                </h1>
                <div className="mt-4 flex items-center gap-2" aria-hidden>
                    <div className="h-1.5 w-24 shrink-0 rounded-full" style={headingLine.main} />
                    <div className="h-1.5 w-10 shrink-0 rounded-full" style={headingLine.tail} />
                </div>

                <div className="mt-8 shadow-sm ring-1 ring-black/5 rounded-2xl overflow-hidden">
                    <BlogCardCover
                        blog={blog}
                        coverHeightClass="min-h-[260px] h-[360px] max-h-[520px] sm:h-[400px] lg:h-[440px] lg:max-h-[560px]"
                    />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    {blog.category ? (
                        <span
                            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                            style={{ backgroundColor: primary }}
                        >
                            <Tag className="mr-1.5 h-3.5 w-3.5 opacity-90" aria-hidden />
                            {blog.category}
                        </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                        {published ? formatDate(published) : ''}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                        <User className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                        {blog.author_name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 tabular-nums">
                        <Eye className="h-3.5 w-3.5 text-gray-500" aria-hidden />
                        {liveViews} {liveViews === 1 ? 'View' : 'Views'}
                    </span>
                </div>

                <article
                    className="prose prose-gray prose-lg mt-10 max-w-none sm:prose-xl prose-headings:font-bold"
                    style={
                        {
                            '--tw-prose-links': primary,
                            '--tw-prose-invert-links': primary,
                        } as CSSProperties
                    }
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {!!relatedBlogs?.length && (
                    <section className="mt-16 border-t border-gray-200 pt-12">
                        <h2 className="text-2xl font-bold leading-[1.2] pb-1">
                            <span style={blogHeadingGradientTextStyle(primary, secondary)}>Read more</span>
                        </h2>
                        <div className="mt-3 flex items-center gap-2" aria-hidden>
                            <div className="h-1 w-20 shrink-0 rounded-full" style={headingLine.main} />
                            <div className="h-1 w-8 shrink-0 rounded-full" style={headingLine.tail} />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">Other posts you may like</p>
                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {relatedBlogs.map((item: any, relIndex: number) => (
                                <Link
                                    key={item.id}
                                    href={route('blog.show', item.slug)}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-gray-200/80 shadow-sm transition-shadow hover:shadow-md"
                                    style={blogCardSurfaceStyle(themeColors)}
                                >
                                    <BlogCardCover blog={item} coverHeightClass="h-40" />
                                    <div className="h-1 w-full shrink-0" style={themeStripGradientStyle(themeColors, item.id + relIndex)} />
                                    <div className="p-4">
                                        <h3 className="font-semibold leading-[1.35] line-clamp-2 pb-0.5 transition-opacity group-hover:opacity-90">
                                            <span style={blogHeadingGradientTextStyle(primary, secondary)}>{item.title}</span>
                                        </h3>
                                        <p className="mt-2 text-xs text-gray-500">{item.author_name}</p>
                                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{blogPlainExcerpt(item.content, 100)}</p>
                                        <span
                                            className="mt-3 inline-flex items-center gap-1 text-sm font-bold"
                                            style={{ color: primary }}
                                        >
                                            Read More
                                            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
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
