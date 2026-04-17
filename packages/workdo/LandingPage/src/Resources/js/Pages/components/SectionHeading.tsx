import AnimateOnScroll from './AnimateOnScroll';

type Align = 'left' | 'center';

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  align?: Align;
  accentColor?: string; // hex (Primary)
  secondaryColor?: string; // hex (Secondary)
  className?: string;
  tone?: 'light' | 'dark';
};

export default function SectionHeading({
  title,
  subtitle,
  align = 'center',
  accentColor = '#3b82f6',
  secondaryColor,
  className,
  tone = 'light',
}: SectionHeadingProps) {
  const alignClass = align === 'left' ? 'text-left items-start' : 'text-center items-center';
  const subtitleTextClass = tone === 'dark' ? 'text-white/90' : 'text-gray-500';
  
  // High-Vibrancy Gradient Logic
  // We use Primary -> Secondary. If Secondary is missing, we calculate a darker version of Primary for the gradient
  const effectiveSecondary = secondaryColor && secondaryColor !== accentColor 
    ? secondaryColor 
    : '#1e40af'; // Fallback to a deep royal blue if secondary is missing/same

  const gradientColors = `linear-gradient(to right, ${accentColor}, ${effectiveSecondary})`;

  const underlineFaint = tone === 'dark' ? `${accentColor}44` : `${accentColor}15`;

  return (
    <div className={`flex flex-col ${alignClass} ${className || ''}`}>
      <AnimateOnScroll direction="up">
        {/* Strong Gradient Heading - No Tailwind Gradient classes to avoid conflicts */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
          <span
            style={{
              background: gradientColors,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'inline-block',
              paddingBottom: '4px'
            }}
          >
            {title}
          </span>
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll direction="up" delayMs={90}>
        <div className="mt-5 flex flex-col gap-5 w-full">
          {subtitle ? (
            <p className={`text-base md:text-lg max-w-3xl font-bold leading-relaxed ${subtitleTextClass}`}>
              {subtitle}
            </p>
          ) : null}

          <div className={`flex ${align === 'left' ? 'justify-start' : 'justify-center'}`}>
            <div className="h-2 w-28 rounded-full" style={{ background: gradientColors }} />
            <div className="h-2 w-8 rounded-full ml-2 opacity-20" style={{ backgroundColor: accentColor }} />
          </div>
        </div>
      </AnimateOnScroll>
    </div>
  );
}
