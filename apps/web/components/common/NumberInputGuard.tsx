'use client';

import { useEffect } from 'react';

/**
 * NumberInputGuard disables native browser increment/decrement behavior on number inputs:
 * 1. Blocks ArrowUp and ArrowDown keys from changing values.
 * 2. Prevents mouse wheel scrolling from changing values.
 * Allows pure user numeric typing only.
 */
export default function NumberInputGuard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLInputElement | null;
      const isArrowKey =
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.code === 'ArrowUp' ||
        e.code === 'ArrowDown' ||
        e.keyCode === 38 ||
        e.keyCode === 40;

      if (
        isArrowKey &&
        target?.tagName === 'INPUT' &&
        target?.type === 'number'
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLInputElement | null;
      if (target?.tagName === 'INPUT' && target?.type === 'number') {
        target.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return null;
}
