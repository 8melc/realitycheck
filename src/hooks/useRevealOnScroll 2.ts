import { useEffect } from 'react';

const useRevealOnScroll = () => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    const elements = document.querySelectorAll<HTMLElement>('[class*="motion-"]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((element) => {
      element.classList.add('is-hidden');
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);
};

export default useRevealOnScroll;
