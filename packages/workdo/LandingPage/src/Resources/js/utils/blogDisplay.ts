import type { CSSProperties } from 'react';

export type ThemeColors = { primary?: string; secondary?: string; accent?: string };

export function resolveThemeColors(colors?: ThemeColors | null) {
    return {
        primary: colors?.primary || '#3b82f6',
        secondary: colors?.secondary || '#2563eb',
        accent: colors?.accent || '#f59e0b',
    };
}

/** Rotates primary → secondary → accent for card accent bars (solid). */
export function themeStripAtIndex(colors: ThemeColors | undefined | null, index: number): string {
    const c = resolveThemeColors(colors);
    return [c.primary, c.secondary, c.accent][index % 3];
}

/** Horizontal gradient for card strips / underlines (rotates through theme pairs). */
export function themeStripGradientStyle(colors: ThemeColors | undefined | null, index: number): CSSProperties {
    const c = resolveThemeColors(colors);
    const pairs: [string, string][] = [
        [c.primary, c.secondary],
        [c.secondary, c.accent],
        [c.primary, c.accent],
    ];
    const [a, b] = pairs[index % 3];
    return {
        background: `linear-gradient(90deg, ${a} 0%, ${b} 100%)`,
    };
}

/** Gradient fill for headings (same pattern as SectionHeading: brand → dark). */
export function blogHeadingGradientTextStyle(primary: string, secondary?: string): CSSProperties {
    const end = secondary && secondary !== primary ? secondary : '#111827';
    return {
        backgroundImage: `linear-gradient(90deg, ${primary}, ${end})`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        display: 'inline-block',
        lineHeight: 1.25,
        paddingTop: '0.04em',
        paddingBottom: '0.14em',
        overflow: 'visible',
    };
}

/** Card body: transparent so no extra panel colour (inherits page behind). */
export function blogCardSurfaceStyle(_colors?: ThemeColors | null): CSSProperties {
    return {
        backgroundColor: 'transparent',
    };
}

export function blogHeadingUnderlineStyles(colors: ThemeColors | undefined | null): {
    main: CSSProperties;
    tail: CSSProperties;
} {
    const c = resolveThemeColors(colors);
    return {
        main: {
            background: `linear-gradient(90deg, ${c.primary} 0%, ${c.secondary} 100%)`,
        },
        tail: {
            background: `linear-gradient(90deg, color-mix(in srgb, ${c.primary} 55%, transparent), color-mix(in srgb, ${c.secondary} 35%, transparent))`,
        },
    };
}

export function blogPlainExcerpt(html: string | null | undefined, maxLen = 160): string {
    if (!html) return '';
    const text = String(html)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (text.length <= maxLen) return text;
    return `${text.slice(0, maxLen).trim()}…`;
}

export function blogCoverGradientStyle(blog: { id: number }): CSSProperties {
    const hue = (blog.id * 47) % 360;
    const hue2 = (hue + 42) % 360;
    return {
        background: `linear-gradient(135deg, hsl(${hue}, 52%, 42%), hsl(${hue2}, 58%, 32%))`,
    };
}
