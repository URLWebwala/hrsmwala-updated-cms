import { blogCoverGradientStyle } from '../../utils/blogDisplay';

type BlogLike = {
    id: number;
    title?: string;
    image_url?: string | null;
};

interface BlogCardCoverProps {
    blog: BlogLike;
    className?: string;
    imgClassName?: string;
    /** Tailwind height classes for both image and placeholder (default card strip). */
    coverHeightClass?: string;
    roundedClass?: string;
}

export default function BlogCardCover({
    blog,
    className = '',
    imgClassName = 'w-full object-contain',
    coverHeightClass = 'h-52',
    roundedClass = '',
}: BlogCardCoverProps) {
    if (blog.image_url) {
        return (
            <div className={`relative overflow-hidden bg-gray-100 ${coverHeightClass} ${roundedClass} ${className}`}>
                <img src={blog.image_url} alt={blog.title || ''} className={`h-full w-full ${imgClassName}`} loading="lazy" />
            </div>
        );
    }

    const initial = (blog.title || '?').charAt(0).toUpperCase();

    return (
        <div
            className={`relative flex ${coverHeightClass} w-full items-center justify-center text-white ${roundedClass} ${className}`}
            style={blogCoverGradientStyle(blog)}
            aria-hidden={!blog.title}
        >
            <span className="text-5xl font-black tracking-tight opacity-90 drop-shadow-md">{initial}</span>
        </div>
    );
}
