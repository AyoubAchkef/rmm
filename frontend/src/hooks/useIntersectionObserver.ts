/**
 * Intersection Observer Hook
 * Detects when an element enters the viewport
 * Useful for lazy loading, animations on scroll, etc.
 */

import { useEffect, useState, useRef, RefObject } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  }: UseIntersectionObserverOptions = {}
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return entry;
}

/**
 * Hook to check if element is visible
 */
export function useIsVisible(
  elementRef: RefObject<Element>,
  options?: UseIntersectionObserverOptions
): boolean {
  const entry = useIntersectionObserver(elementRef, options);
  return !!entry?.isIntersecting;
}

/**
 * Hook for lazy loading
 */
export function useLazyLoad<T extends Element = Element>(
  options?: UseIntersectionObserverOptions
) {
  const ref = useRef<T>(null);
  const isVisible = useIsVisible(ref, {
    ...options,
    freezeOnceVisible: true, // Only load once
  });

  return { ref, isVisible };
}
