# Lesya Studio - Meta Ads & Compliance Testing Protocol

This plan validates that marketing data is accurate, legal, and deduplicated.

## 1. 🟢 Step 1: Legal & Consent (The Gatekeeper)
*Goal: Ensure no tracking occurs without user permission.*

- [ ] **Scenario:** Fresh visit.
    - [ ] Open incognito tab. 
    - [ ] **Expected:** Cookie banner appears after 2 seconds.
    - [ ] **Verification:** Check `Application > Local Storage`. `lesya_cookie_consent` must be empty.
    - [ ] **Verification:** Check console. No `[Pixel] Initialized` log should be present.
- [ ] **Scenario:** Reject Consent.
    - [ ] Click "Reddet".
    - [ ] **Expected:** Banner hides. LocalStorage sets `denied`. 
    - [ ] **Verification:** Refresh page. Banner does not appear. Pixel does NOT initialize.
- [ ] **Scenario:** Accept Consent.
    - [ ] Clear LocalStorage and refresh. Click "Kabul Et".
    - [ ] **Expected:** Banner hides. LocalStorage sets `granted`.
    - [ ] **Verification:** Console shows `[Pixel] Initialized and PageView tracked.`.

## 2. 🔵 Step 2: Browser Tracking (The Pixel)
*Goal: Validate client-side events are firing with correct data.*

- [ ] **Scenario:** View Product.
    - [ ] Go to a product detail page.
    - [ ] **Verification:** Meta Pixel Helper (Extension) shows `PageView` and `ViewContent`.
- [ ] **Scenario:** Add to Cart.
    - [ ] Click "Sepete Ekle".
    - [ ] **Verification:** Console shows `[Pixel] Event Tracked: AddToCart`.

## 3. 🔴 Step 3: Advanced Matching & CAPI (The Magic)
*Goal: Validate server-side tracking and user data capture.*

- [ ] **Scenario:** Initiate Checkout (Abandonment Recovery).
    - [ ] Go to Checkout page.
    - [ ] Type your email (e.g., `test@example.com`) and click outside the box (Blur).
    - [ ] **Verification:** Console shows `[Pixel] Event Tracked: InitiateCheckout`.
    - [ ] **Verification:** Check Supabase table `marketing_events`. A new row with `event_name: InitiateCheckout` and `status: 200` must appear.
    - [ ] **Deduplication Check:** The `event_id` in the console log MUST match the `event_id` in the Supabase table.

## 4. 🟣 Step 4: Final Conversion (The Purchase)
*Goal: Validate the final transaction is sent via Server (CAPI) with full data.*

- [ ] **Scenario:** Complete Payment.
    - [ ] Finish checkout and pay (Simulation).
    - [ ] **Verification:** Check Supabase table `marketing_events`. 
    - [ ] **Expected Row:** `event_name: Purchase`.
    - [ ] **Data Check:** The payload should contain hashed email, hashed phone, and the correct `value` (total amount).
    - [ ] **Status Check:** Meta response must be `200` (Success).

## 5. 🟡 Step 5: Data Integrity (Admins only)
- [ ] **Scenario:** Hashing Verification.
    - [ ] Look at the `user_email_hashed` column in `marketing_events`. 
    - [ ] **Expected:** It should be a long hex string (e.g., `5e88489...`), NEVER plain text.

## Execution Scorecard
| Test Phase | Result | Notes |
| :--- | :--- | :--- |
| 1. Consent | ⬜ | |
| 2. Pixel | ⬜ | |
| 3. CAPI Logic | ⬜ | |
| 4. Purchase | ⬜ | |
| 5. Hashing | ⬜ | |
