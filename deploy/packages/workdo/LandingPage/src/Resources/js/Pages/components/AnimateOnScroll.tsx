import { PropsWithChildren, useMemo } from 'react';
import { useInView } from './useInView';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

type AnimateOnScrollProps = PropsWithChildren<{
  className?: string;
  direction?: Direction;
  delayMs?: number;
  durationMs?: number;
  amount?: number; // px
}>;

export default function AnimateOnScroll({
  children,
  className,
  direction = 'up',
  delayMs = 0,
  durationMs = 650,
  amount = 24,
}: AnimateOnScrollProps) {
  const { ref, inView } = useInView<HTMLDivElement>({
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.12,
  });

  const transformFrom = useMemo(() => {
    if (direction === 'none') return 'translate3d(0,0,0)';
    if (direction === 'up') return `translate3d(0, ${amount}px, 0)`;
    if (direction === 'down') return `translate3d(0, ${-amount}px, 0)`;
    if (direction === 'left') return `translate3d(${amount}px, 0, 0)`;
    return `translate3d(${-amount}px, 0, 0)`;
  }, [direction, amount]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translate3d(0,0,0)' : transformFrom,
        transitionProperty: 'opacity, transform',
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delayMs}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

