'use server';

import { metaService, MetaUserData, MetaCustomData } from '@/lib/services/meta-service';
import { headers } from 'next/headers';

/**
 * LESYA MARKETING ACTIONS
 * Server-side actions for Meta Ads Conversion API.
 */

export async function trackServerEvent(
  eventName: string,
  eventId: string,
  userData: MetaUserData,
  customData?: MetaCustomData
) {
  const headerList = headers();
  
  // Capture request metadata for better matching
  const ip = headerList.get('x-forwarded-for') || '0.0.0.0';
  const userAgent = headerList.get('user-agent') || '';

  // Enrich user data with server-side info
  const enrichedUserData: MetaUserData = {
    ...userData,
    clientIpAddress: ip,
    clientUserAgent: userAgent,
  };

  return await metaService.sendEvent(
    eventName,
    eventId,
    enrichedUserData,
    customData
  );
}
