import AnimateOnScroll from './AnimateOnScroll';

type Align = 'left' | 'center';

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: Align;
  accentColor?: string; // hex
  className?: string;
  tone?: 'light' | 'dark';
};

export default function SectionHeading({
  title,
  subtitle,
  align = 'center',
  accentColor = '#3b82f6',
  className,
  tone = 'light',
}: SectionHeadingProps) {
  const alignClass = align === 'left' ? 'text-left items-start' : 'text-center items-center';
  const titleTextClass = tone === 'dark' ? 'text-white' : 'text-gray-900';
  const subtitleTextClass = tone === 'dark' ? 'text-white/90' : 'text-gray-600';
  const gradientEnd = tone === 'dark' ? '#ffffff' : '#111827';
  const underlineMain = tone === 'dark' ? `${accentColor}cc` : accentColor;
  const underlineFaint = tone === 'dark' ? `${accentColor}66` : `${accentColor}30`;

  return (
    <div className={`flex flex-col ${alignClass} ${className || ''}`}>
      <AnimateOnScroll direction="up">
        <h2 className={`text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.2] pb-1 ${titleTextClass}`}>
          <span
            className="inline-block bg-clip-text pb-0.5 text-transparent"
            style={{
              backgroundImage: `linear-gradient(90deg, ${accentColor}, ${gradientEnd})`,
              lineHeight: 1.25,
              paddingBottom: '0.12em',
            }}
          >
            {title}
          </span>
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll direction="up" delayMs={90}>
        <div className="mt-4 flex flex-col gap-4 w-full">
          {subtitle ? (
            <p className={`text-base md:text-lg max-w-3xl ${subtitleTextClass}`}>
              {subtitle}
            </p>
          ) : null}

          <div className={`flex ${align === 'left' ? 'justify-start' : 'justify-center'}`}>
            <div className="h-1 w-24 rounded-full" style={{ backgroundColor: underlineMain }} />
            <div className="h-1 w-10 rounded-full ml-2" style={{ backgroundColor: underlineFaint }} />
          </div>
        </div>
      </AnimateOnScroll>
    </div>
  );
}

