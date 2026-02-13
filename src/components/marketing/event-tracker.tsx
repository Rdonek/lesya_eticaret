'use client';

import * as React from 'react';
import { usePixel } from '@/hooks/use-pixel';

interface EventTrackerProps {
  eventName: string;
  data?: object;
  eventId?: string;
}

/**
 * LESYA EVENT TRACKER
 * A tiny client component to fire events from Server Components (like ViewContent).
 */
export function EventTracker({ eventName, data, eventId }: EventTrackerProps) {
  const { track } = usePixel();

  React.useEffect(() => {
    track(eventName, data, eventId);
  }, []); // Only once on mount

  return null;
}
