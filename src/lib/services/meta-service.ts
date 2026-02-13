import { createAdminClient } from '../supabase/admin';
import * as crypto from 'crypto';

/**
 * LESYA META ADS SERVICE (CAPI)
 * Standardized service for sending server-side events to Meta Ads.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE; // Only for testing

/**
 * Hashes data to SHA-256 as required by Meta for PII.
 */
function hashData(data: string | undefined): string | null {
  if (!data) return null;
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

export type MetaUserData = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  zip?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
};

export type MetaCustomData = {
  value?: number;
  currency?: string;
  contentName?: string;
  contentIds?: string[];
  contents?: Array<{ id: string; quantity: number; price: number }>;
  orderId?: string;
};

export const metaService = {
  async sendEvent(
    eventName: string,
    eventId: string,
    userData: MetaUserData,
    customData?: MetaCustomData
  ) {
    if (!PIXEL_ID || !ACCESS_TOKEN) {
      console.warn('[MetaCAPI] Missing API keys. Event skipped:', eventName);
      return;
    }

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: 'website',
          user_data: {
            em: userData.email ? [hashData(userData.email)] : undefined,
            ph: userData.phone ? [hashData(userData.phone)] : undefined,
            fn: userData.firstName ? [hashData(userData.firstName)] : undefined,
            ln: userData.lastName ? [hashData(userData.lastName)] : undefined,
            ct: userData.city ? [hashData(userData.city)] : undefined,
            zp: userData.zip ? [hashData(userData.zip)] : undefined,
            client_ip_address: userData.clientIpAddress,
            client_user_agent: userData.clientUserAgent,
            fbp: userData.fbp,
            fbc: userData.fbc,
          },
          custom_data: customData ? {
            value: customData.value,
            currency: customData.currency || 'TRY',
            content_name: customData.contentName,
            content_ids: customData.contentIds,
            contents: customData.contents,
            order_id: customData.orderId,
          } : undefined,
        },
      ],
      // CORRECT: test_event_code must be at the root level
      test_event_code: TEST_EVENT_CODE || undefined,
    };

    try {
      const response = await fetch(
        `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      // LOG TO SUPABASE
      const supabase = createAdminClient();
      await supabase.from('marketing_events').insert({
        event_name: eventName,
        event_id: eventId,
        payload: payload,
        status: response.status,
        response_body: JSON.stringify(result),
        user_email_hashed: userData.email ? hashData(userData.email) : null
      });

      return result;
    } catch (error) {
      console.error('[MetaCAPI] Error sending event:', error);
    }
  },
};
