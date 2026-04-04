import { useEffect, useRef, useState } from 'react';

export type InViewOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
};

export function useInView<T extends Element>(options: InViewOptions = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInView(Boolean(entry?.isIntersecting));
      },
      {
        root: options.root ?? null,
        rootMargin: options.rootMargin ?? '0px 0px -10% 0px',
        threshold: options.threshold ?? 0.15,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.root, options.rootMargin, JSON.stringify(options.threshold)]);

  return { ref, inView } as const;
}

