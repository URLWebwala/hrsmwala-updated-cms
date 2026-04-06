import { useEffect, useMemo, useState } from 'react';
import AnimateOnScroll from './AnimateOnScroll';
import { useInView } from './useInView';

interface StatsProps {
    settings?: any;
}

const STATS_VARIANTS = {
    stats1: {
        section: 'py-16',
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        grid: 'grid grid-cols-2 md:grid-cols-4 gap-8 text-center',
        statValue: 'text-4xl md:text-5xl font-bold text-white mb-2',
        statLabel: 'text-blue-100 text-sm md:text-base',
        layout: 'colored'
    },
    stats2: {
        section: 'bg-gray-50 py-20',
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8',
        statValue: 'text-4xl md:text-5xl font-bold mb-3',
        statLabel: 'text-gray-600 text-sm md:text-base font-medium',
        layout: 'cards'
    },
    stats3: {
        section: 'bg-white py-16',
        container: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
        grid: 'grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12',
        statValue: 'text-3xl md:text-4xl font-bold text-gray-900 mb-2',
        statLabel: 'text-gray-600 text-sm md:text-base font-medium',
        layout: 'minimal'
    },
    stats4: {
        section: 'bg-gray-900 py-20',
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        grid: 'grid grid-cols-2 md:grid-cols-4 gap-8',
        statValue: 'text-xl md:text-2xl font-bold text-white',
        statLabel: 'text-gray-300 text-xs md:text-sm font-medium',
        layout: 'circular'
    },
    stats5: {
        section: 'py-20',
        container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
        grid: 'grid grid-cols-2 md:grid-cols-4 gap-8 text-center',
        statValue: 'text-4xl md:text-5xl font-bold text-white mb-2',
        statLabel: 'text-white text-sm md:text-base opacity-90',
        layout: 'gradient'
    }
};

export default function Stats({ settings }: StatsProps) {
    const sectionData = settings?.config_sections?.sections?.stats || {};
    const variant = sectionData.variant || 'stats1';
    const config = STATS_VARIANTS[variant as keyof typeof STATS_VARIANTS] || STATS_VARIANTS.stats1;
    
    const colors = settings?.config_sections?.colors || { primary: '#10b77f', secondary: '#059669', accent: '#f59e0b' };
    
    const defaultStats = [
        { label: 'Businesses Trust Us', value: '20,000+' },
        { label: 'Uptime Guarantee', value: '99.9%' },
        { label: 'Customer Support', value: '24/7' },
        { label: 'Countries Worldwide', value: '70+' }
    ];
    
    const stats = sectionData.stats?.length > 0 ? sectionData.stats : defaultStats;

    const { ref: sectionRef, inView } = useInView<HTMLElement>({
        rootMargin: '0px 0px -20% 0px',
        threshold: 0.2,
    });

    const parsedStats = useMemo(() => {
        return stats.map((s: any) => {
            const raw = String(s?.value ?? '');
            // extract leading number (with commas/decimals)
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
        // Reset when leaving viewport so it can run again on scroll up/down
        if (!inView) {
            setAnimatedValues(parsedStats.map((s: any) => (typeof s._numeric === 'number' ? 0 : NaN)));
            return;
        }

        const start = performance.now();
        const duration = 1100;
        const targets = parsedStats.map((s: any) => (typeof s._numeric === 'number' ? s._numeric : NaN));

        let raf = 0;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - t, 3);
            setAnimatedValues(
                targets.map((target) => {
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

    const getBackgroundStyle = () => {
        if (config.layout === 'colored') {
            return { backgroundColor: colors.primary };
        }
        if (config.layout === 'gradient') {
            return { background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})` };
        }
        return {};
    };

    const renderStat = (stat: any, index: number) => {
        const numeric = (stat as any)._numeric as number | null;
        const suffix = (stat as any)._suffix as string;
        const animated = animatedValues[index];
        const displayValue =
            typeof numeric === 'number' && Number.isFinite(animated)
                ? `${animated.toLocaleString()}${suffix ? suffix : ''}`
                : stat.value;

        if (config.layout === 'cards') {
            return (
                <div key={index} className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1">
                    <div className={config.statValue} style={{ color: colors.primary }}>{displayValue}</div>
                    <div className={config.statLabel}>{stat.label}</div>
                    <div className="mt-4 w-12 h-1 mx-auto rounded-full transition-all duration-300" style={{ backgroundColor: colors.primary, opacity: 0.3 }}></div>
                </div>
            );
        }

        if (config.layout === 'minimal') {
            return (
                <div key={index} className="text-center group">
                    <div className={`${config.statValue} transition-all duration-300 group-hover:scale-105`} style={{ color: colors.primary }}>{displayValue}</div>
                    <div className={config.statLabel}>{stat.label}</div>
                    <div className="mt-3 w-8 h-0.5 mx-auto rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100" style={{ backgroundColor: colors.primary }}></div>
                </div>
            );
        }

        if (config.layout === 'circular') {
            return (
                <div key={index} className="text-center group">
                    <div className="relative w-28 h-28 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-white/20 transition-all duration-300 group-hover:border-white/40"></div>
                        <div className="absolute inset-2 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-105" style={{ backgroundColor: `${colors.primary}20` }}>
                            <div className={config.statValue}>{displayValue}</div>
                        </div>
                    </div>
                    <div className={config.statLabel}>{stat.label}</div>
                </div>
            );
        }

        // Default layout (colored/gradient)
        return (
            <div key={index}>
                <div className={config.statValue}>{displayValue}</div>
                <div className={config.statLabel}>{stat.label}</div>
            </div>
        );
    };

    return (
        <section ref={sectionRef} className={config.section} style={getBackgroundStyle()}>
            <div className={config.container}>
                <AnimateOnScroll direction="up">
                    <div className={config.grid}>
                        {parsedStats.map((stat: any, index: number) => renderStat(stat, index))}
                    </div>
                </AnimateOnScroll>
            </div>
        </section>
    );
}