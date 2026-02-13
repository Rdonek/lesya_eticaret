# Lesya Studio - Meta Ads CAPI & Cookie Consent (REVISED V2)

## Phase 1: Infrastructure & Data Logging
- [ ] **Supabase Table:** Create `marketing_events` table (id, event_name, event_id, payload, status, response_body).
- [ ] **Env Keys:** Add `NEXT_PUBLIC_META_PIXEL_ID`, `META_ACCESS_TOKEN`, `META_TEST_EVENT_CODE`.
- [ ] **Service:** Create `src/lib/services/meta-service.ts` (Handles SHA-256 hashing and API calls directly from server actions).

## Phase 2: Premium Cookie Consent (The Gatekeeper)
- [ ] **Component:** Create `components/layout/cookie-consent.tsx`.
- [ ] **Design:** `backdrop-blur-xl bg-white/80` or `bg-neutral-900/90`. Glassmorphism style to match premium vibe.
- [ ] **Logic:** 
    - No Pixel/CAPI tracking until `status === 'granted'`.
    - Set cookie `lesya_consent` for 365 days.

## Phase 3: Single-Source Event ID (The Deduplication Key)
- [ ] **Strategy:** 
    - For `PageView`, `ViewContent`, `AddToCart`: Use a session-based UUID generated on first load.
    - For `InitiateCheckout` & `Purchase`: Use the **Order ID** or a **Checkout ID** generated when the form first opens. 
    - **RULE:** The same ID must be passed to both `fbq('track', ...)` and `metaService.sendEvent(...)`.

## Phase 4: Hybrid Tracking Implementation
- [ ] **Pixel Hook:** Create `hooks/use-pixel.ts` to manage client-side events.
- [ ] **Advanced Matching (Checkout):** 
    - Update `CheckoutForm.tsx`: Add `onBlur` listeners to email/phone fields.
    - Capture data and trigger CAPI `InitiateCheckout` immediately (Server Action) to catch abandoned carts.
- [ ] **Purchase Flow:**
    - Update `api/webhook/mock`: When payment is successful, call `metaService.sendPurchaseEvent` with the **same event_id** used in the browser.

## Phase 5: Security & Privacy
- [ ] **Hashing Logic:** Ensure all PII (Personal Identifiable Information) like email, phone, city are SHA-256 hashed before leaving the server.
- [ ] **PII Removal:** Never send raw user data in client-side Pixel calls if not necessary.

## Phase 6: Validation (The Quality Test)
- [ ] **Overlap Check:** Verify in Meta Events Manager that Browser and Server events are correctly merging.
- [ ] **EMQ Score:** Target 7.0+ score.
