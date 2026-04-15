import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import BlogCardCover from './BlogCardCover';
import BlogMetaRow from './BlogMetaRow';
import {
    blogCardSurfaceStyle,
    blogHeadingGradientTextStyle,
    blogPlainExcerpt,
    resolveThemeColors,
    themeStripGradientStyle,
} from '../../utils/blogDisplay';

interface BlogsProps {
    settings?: any;
    blogs?: any[];
}

export default function Blogs({ settings, blogs = [] }: BlogsProps) {
    const { t } = useTranslation();
    const sectionData = settings?.config_sections?.sections?.blogs || {};
    const colors = settings?.config_sections?.colors || { primary: '#10b77f', secondary: '#059669', accent: '#f59e0b' };
    const { primary: themePrimary, secondary: themeSecondary } = resolveThemeColors(colors);

    if (!blogs.length) {
        return null;
    }

    return (
        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    title={sectionData.title || t('Latest Blogs')}
                    subtitle={sectionData.subtitle || t('Fresh updates and practical business insights from our CMS.')}
                    align="center"
                    accentColor={colors.primary}
                />

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-10">
                    {blogs.slice(0, 3).map((blog: any, index: number) => {
                        const excerpt = blogPlainExcerpt(blog.content, 155);
                        return (
                            <article
                                key={blog.id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 shadow-sm transition-shadow hover:shadow-lg"
                                style={blogCardSurfaceStyle(colors)}
                            >
                                <BlogCardCover blog={blog} imgClassName="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
                                <div
                                    className="h-1 w-full shrink-0"
                                    style={themeStripGradientStyle(colors, index)}
                                    aria-hidden
                                />
                                <div className="flex flex-1 flex-col p-5 pt-4">
                                    <BlogMetaRow
                                        publishedAt={blog.published_at || blog.created_at}
                                        authorName={blog.author_name}
                                        accentColor={colors.primary}
                                    />
                                    <h3 className="mt-3 text-lg font-bold leading-[1.35] line-clamp-2 pb-0.5">
                                        <span style={blogHeadingGradientTextStyle(themePrimary, themeSecondary)}>{blog.title}</span>
                                    </h3>
                                    <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-4">{excerpt}</p>
                                    <Link
                                        href={route('blog.show', blog.slug)}
                                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold transition-opacity hover:opacity-85"
                                        style={{ color: colors.primary }}
                                    >
                                        {t('Read More')}
                                        <ArrowRight className="h-4 w-4" aria-hidden />
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <div className="text-center mt-10">
                    <Link
                        href={route('blog.index')}
                        className="inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95"
                        style={{
                            background: `linear-gradient(90deg, ${themePrimary} 0%, ${themeSecondary} 100%)`,
                        }}
                    >
                        {t('View All Blogs')}
                    </Link>
                </div>
            </div>
        </section>
    );
}
