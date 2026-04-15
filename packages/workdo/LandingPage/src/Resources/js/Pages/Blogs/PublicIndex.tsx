import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BlogCardCover from '../components/BlogCardCover';
import BlogMetaRow from '../components/BlogMetaRow';
import CookieConsent from '@/components/cookie-consent';
import { Pagination } from '@/components/ui/pagination';
import {
    blogCardSurfaceStyle,
    blogHeadingGradientTextStyle,
    blogHeadingUnderlineStyles,
    blogPlainExcerpt,
    resolveThemeColors,
    themeStripGradientStyle,
} from '../../utils/blogDisplay';

export default function PublicIndex({ blogs, landingPageSettings }: any) {
    const { adminAllSetting } = usePage().props as any;
    const canonicalUrl = typeof window !== 'undefined' ? window.location.href : '';
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const blogIndexTitle = 'HRMswala Blog';
    const blogIndexDescription = 'Read our latest business and product blogs.';
    const robotsContent = blogs?.current_page > 1 ? 'noindex,follow' : 'index,follow';
    const blogItemList = (blogs?.data || []).map((blog: any, index: number) => {
        const blogUrl = route('blog.show', blog.slug);
        return ({
        '@type': 'ListItem',
        position: index + 1,
        url: blogUrl.startsWith('http') ? blogUrl : `${siteUrl}${blogUrl}`,
        name: blog.title,
        });
    });
    const themeColors = landingPageSettings?.config_sections?.colors;
    const theme = resolveThemeColors(themeColors);
    const { primary, secondary } = theme;
    const headingLine = blogHeadingUnderlineStyles(themeColors);

    return (
        <div className="min-h-screen bg-transparent">
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
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'CollectionPage',
                    name: blogIndexTitle,
                    description: blogIndexDescription,
                    url: canonicalUrl || undefined,
                    isPartOf: siteUrl || undefined,
                    publisher: {
                        '@type': 'Organization',
                        name: landingPageSettings?.company_name || 'HRMswala',
                        logo: siteUrl ? { '@type': 'ImageObject', url: `${siteUrl}/logo.png` } : undefined,
                    },
                })}</script>
                {blogItemList.length > 0 && (
                    <script type="application/ld+json">{JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'ItemList',
                        itemListElement: blogItemList,
                    })}</script>
                )}
            </Head>
            <Header settings={landingPageSettings} />
            <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-10 xl:px-12 py-14 pb-20">
                <div className="mb-10 text-center sm:text-left">
                    <h1 className="text-4xl font-black tracking-tight leading-[1.2] pb-1 sm:text-5xl">
                        <span style={blogHeadingGradientTextStyle(primary, secondary)}>Blog</span>
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
                        Tips, product updates, and ideas — with featured images, quick reads, and full articles.
                    </p>
                    <div className="mx-auto mt-4 flex items-center justify-center gap-2 sm:justify-start" aria-hidden>
                        <div className="h-1.5 w-24 shrink-0 rounded-full" style={headingLine.main} />
                        <div className="h-1.5 w-10 shrink-0 rounded-full" style={headingLine.tail} />
                    </div>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {blogs.data.map((blog: any, index: number) => {
                        const excerpt = blogPlainExcerpt(blog.content, 165);
                        return (
                            <article
                                key={blog.id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 shadow-md shadow-gray-300/40 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                                style={blogCardSurfaceStyle(themeColors)}
                            >
                                <BlogCardCover blog={blog} imgClassName="" />
                                <div className="h-1 w-full shrink-0" style={themeStripGradientStyle(themeColors, blog.id + index)} aria-hidden />
                                <div className="flex flex-1 flex-col p-5 pt-4">
                                    <BlogMetaRow
                                        publishedAt={blog.published_at || blog.created_at}
                                        authorName={blog.author_name}
                                        accentColor={primary}
                                    />
                                    <h2 className="mt-3 text-lg font-bold leading-[1.35] line-clamp-2 pb-0.5">
                                        <span style={blogHeadingGradientTextStyle(primary, secondary)}>{blog.title}</span>
                                    </h2>
                                    <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-4">{excerpt}</p>
                                    <Link
                                        href={route('blog.show', blog.slug)}
                                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-85"
                                        style={{ color: primary }}
                                    >
                                        Read More
                                        <ArrowRight className="h-4 w-4" aria-hidden />
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>

                {blogs.last_page > 1 && (
                    <div className="mt-12 flex justify-center">
                        <Pagination data={blogs} routeName="blog.index" filters={{}} />
                    </div>
                )}
            </main>
            <Footer settings={landingPageSettings} />
            <CookieConsent settings={adminAllSetting || {}} />
        </div>
    );
}
