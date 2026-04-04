import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getImagePath } from '@/utils/helpers';

interface HowWorksVideosProps {
    settings?: any;
}

export default function HowWorksVideos({ settings }: HowWorksVideosProps) {
    const { t } = useTranslation();

    // Videos are rendered next to Gallery; avoid duplicate standalone section
    const galleryVisible = settings?.config_sections?.section_visibility?.gallery !== false;
    if (galleryVisible) {
        return null;
    }

    const sectionData = settings?.config_sections?.sections?.how_works_videos || {};
    const title = sectionData.title || 'How it works';
    const subtitle = sectionData.subtitle || 'See Hrmswala Tracker in action';

    const videos: Array<{ url: string; title?: string }> = useMemo(() => {
        const raw = sectionData.videos || [];
        if (Array.isArray(raw) && raw.length > 0) {
            // Support both string[] and object[] shapes
            return raw
                .map((v: any) => (typeof v === 'string' ? { url: v } : { url: v?.url || v?.video || '', title: v?.title }))
                .filter((v: any) => typeof v.url === 'string' && v.url.length > 0);
        }

        return [];
    }, [sectionData]);

    if (videos.length === 0) {
        return null;
    }

    return (
        <section className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{t(title)}</h2>
                    <p className="text-lg text-gray-600">{t(subtitle)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video, index) => {
                        const src = video.url.startsWith('http') ? video.url : getImagePath(video.url);
                        return (
                            <div key={`${video.url}-${index}`} className="group overflow-hidden rounded-xl shadow-lg border border-gray-100 bg-white">
                                <div className="relative">
                                    <video
                                        src={src}
                                        className="w-full h-64 object-cover"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        controls={false}
                                        preload="metadata"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                                {(video.title || '').length > 0 && (
                                    <div className="p-4">
                                        <div className="text-sm font-semibold text-gray-900">{t(video.title || '')}</div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

