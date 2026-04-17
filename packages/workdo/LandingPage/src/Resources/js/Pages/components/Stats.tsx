import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Globe, Headset, CheckCircle2 } from 'lucide-react';
import AnimateOnScroll from './AnimateOnScroll';
import { useInView } from './useInView';

interface StatsProps {
    settings?: any;
}

export default function Stats({ settings }: StatsProps) {
    const { t } = useTranslation();
    const sectionData = settings?.config_sections?.sections?.stats || {};
    const colors = settings?.config_sections?.colors || { primary: '#3b82f6', secondary: '#2563eb', accent: '#f59e0b' };
    
    const defaultStats = [
        { label: 'Businesses Trust Us', value: '120+', icon: 'users' },
        { label: 'Uptime Guarantee', value: '99.9%', icon: 'check' },
        { label: 'Customer Support', value: '24/7', icon: 'support' },
        { label: 'Countries Worldwide', value: '70+', icon: 'globe' }
    ];
    
    const stats = sectionData.stats?.length > 0 ? sectionData.stats : defaultStats;

    const { ref: sectionRef, inView } = useInView<HTMLDivElement>({
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
    });

    const parsedStats = useMemo(() => {
        return stats.map((s: any) => {
            const raw = String(s?.value ?? '');
            const match = raw.match(/^[\s]*([\d,]+(?:\.\d+)?)/);
            if (!match) return { ...s, _numeric: null, _suffix: raw };
            const numeric = Number(match[1].replace(/,/g, ''));
            const suffix = raw.replace(match[1], '').trim();
            return { ...s, _numeric: Number.isFinite(numeric) ? numeric : null, _suffix: suffix };
        });
    }, [stats]);

    const [animatedValues, setAnimatedValues] = useState<number[]>(() =>
        parsedStats.map((s: any) => (typeof s._numeric === 'number' ? 0 : NaN))
    );

    useEffect(() => {
        if (!inView) {
            setAnimatedValues(parsedStats.map((s: any) => (typeof s._numeric === 'number' ? 0 : NaN)));
            return;
        }

        const start = performance.now();
        const duration = 1500;
        const targets = parsedStats.map((s: any) => (typeof s._numeric === 'number' ? s._numeric : NaN));

        let raf = 0;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setAnimatedValues(
                targets.map((target: number) => {
                    if (!Number.isFinite(target)) return NaN;
                    const v = target * eased;
                    return target % 1 === 0 ? Math.round(v) : Math.round(v * 10) / 10;
                })
            );
            if (t < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, parsedStats]);

    const getIcon = (icon?: string, index?: number) => {
        const iconType = icon || defaultStats[index ?? 0]?.icon;
        switch (iconType) {
            case 'globe': return <Globe className="w-5 h-5 md:w-6 md:h-6" />;
            case 'support': return <Headset className="w-5 h-5 md:w-6 md:h-6" />;
            case 'check': return <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />;
            case 'users':
            default: return <Users className="w-5 h-5 md:w-6 md:h-6" />;
        }
    };

    return (
        <div ref={sectionRef} className="relative z-20 -mt-10 mb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimateOnScroll direction="up">
                    <div className="bg-white rounded-[2.5rem] md:rounded-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100 p-3 md:p-4 backdrop-blur-xl">
                        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                            {parsedStats.map((stat: any, index: number) => {
                                const numeric = stat._numeric as number | null;
                                const suffix = stat._suffix as string;
                                const animated = animatedValues[index];
                                const displayValue = typeof numeric === 'number' && Number.isFinite(animated)
                                    ? `${animated.toLocaleString()}${suffix}`
                                    : stat.value;

                                return (
                                    <div key={index} className="px-6 py-6 md:py-4 group transition-all duration-300 hover:bg-gray-50/50 first:rounded-t-[2rem] lg:first:rounded-l-full last:rounded-b-[2rem] lg:last:rounded-r-full">
                                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                                            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm" style={{ backgroundColor: `${colors.primary}10`, color: colors.primary }}>
                                                {getIcon(stat.icon, index)}
                                            </div>
                                            <div className="text-center md:text-left">
                                                <div className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                                                    <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to bottom, #111827, #374151)` }}>
                                                        {displayValue}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                                    {t(stat.label)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </AnimateOnScroll>
            </div>
        </div>
    );
}