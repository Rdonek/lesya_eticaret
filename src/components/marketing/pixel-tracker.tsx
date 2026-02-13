'use client';

import * as React from 'react';
import { usePixel } from '@/hooks/use-pixel';

function PixelTrackerInner() {
  usePixel();
  return null;
}

export function PixelTracker() {
  return (
    <React.Suspense fallback={null}>
      <PixelTrackerInner />
    </React.Suspense>
  );
}
