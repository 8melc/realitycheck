'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook that alerts clicks outside of the passed ref
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  onClickOutside: () => void,
  isActive: boolean = true,
  excludeSelectors: string[] = []
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!isActive || !ref.current) return;

      // Check if the click was on an excluded element
      const isExcluded = excludeSelectors.some(selector => 
        (event.target as HTMLElement).closest(selector)
      );
      
      if (isExcluded) return;

      // If the clicked element is not inside the ref's element, trigger callback
      if (!ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, onClickOutside, isActive, excludeSelectors]);
}

