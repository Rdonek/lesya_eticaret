# Lesya Mobile & Web - Final Acceptance Test Plan

This document outlines the systematic testing procedures to validate the recent "Enterprise Refactoring" and new feature implementations.

## 1. 🟢 Smoke Test (Is it alive?)
*Goal: Ensure the application builds, launches, and basic navigation works.*

- [ ] **Mobile Build:**
    - [ ] Run `npx expo start` and open in Expo Go (for UI check).
    - [ ] Run `eas build --profile development --platform android` and install the APK.
    - [ ] App launches without white screen crash.
    - [ ] Splash screen animation plays correctly (no black screen loop).
- [ ] **Navigation:**
    - [ ] Navigate to Dashboard -> Orders -> Catalog -> Finance -> Notifications.
    - [ ] No "Navigation Context" or "Layout Children" warnings in console.
- [ ] **Web Build:**
    - [ ] Deploy to Vercel.
    - [ ] Site loads without 500/404 errors.

## 2. 🔴 Critical Business Logic (The Core)
*Goal: Validate that the new RPC (Server-Side) functions are working correctly and data integrity is maintained.*

### 2.1. Stock Management (AFI Engine)
- [ ] **Scenario:** Add Stock via Mobile.
    - [ ] Go to Catalog -> Select Product -> Add Stock (e.g., +10 qty, 100 TL cost).
    - [ ] **Expected:**
        - [ ] Stock increases by 10.
        - [ ] Finance: New "Expense" record created (-1000 TL).
        - [ ] Inventory Log: New entry created.
        - [ ] Cost Price: Updated via Weighted Average Logic.
- [ ] **Scenario:** Rollback Stock Entry.
    - [ ] Go to Finance -> Find the above transaction -> Delete.
    - [ ] **Expected:**
        - [ ] Finance record deleted (Money returned to Cash Balance).
        - [ ] Stock decreases by 10 (Restored to previous state).
        - [ ] Inventory Log deleted.

### 2.2. Order Lifecycle (Fulfillment)
- [ ] **Scenario:** Create Order (Web) -> Ship (Mobile).
    - [ ] Create a test order on Web Storefront.
    - [ ] Open Mobile App -> Orders. Check if new order appears with "Pending" status.
    - [ ] Click "Hızlı Kargola" (Quick Ship).
    - [ ] **Expected:**
        - [ ] Order Status -> "Shipped".
        - [ ] Finance: New "Shipping Expense" record created (Standard Fee).
        - [ ] Customer Email: "Your order is shipped" email received.
- [ ] **Scenario:** Double Shipping Prevention (Idempotency).
    - [ ] Try to click "Ship" again on the same order (if UI allows).
    - [ ] **Expected:** RPC should throw error "Order already shipped".

### 2.3. Cancellation & Refunds
- [ ] **Scenario:** Cancel an Order.
    - [ ] Find a "Pending" or "Processing" order.
    - [ ] Cancel it via Mobile.
    - [ ] **Expected:**
        - [ ] Status -> "Cancelled".
        - [ ] Stock: Items returned to inventory automatically.
        - [ ] Finance: New "Refund Expense" record created (Cash Out).

## 3. 🔵 Notification System
*Goal: Ensure the "Postman" is delivering messages.*

- [ ] **Scenario:** New Order Push.
    - [ ] Create order on Web.
    - [ ] **Expected:** Phone receives Push Notification (even if app is closed).
    - [ ] **Content:** Notification contains Order ID and Amount.
    - [ ] **Action:** Tapping notification opens Order Detail page.
- [ ] **Scenario:** Critical Stock.
    - [ ] Manually reduce a product's stock to 2 via Admin.
    - [ ] **Expected:** "Critical Stock" push notification received.

## 4. 🟡 Web Storefront & Cache
*Goal: Ensure customers see real-time data.*

- [ ] **Scenario:** Hide Product.
    - [ ] Mobile: Archive a product (`is_active = false`).
    - [ ] Web: Refresh product listing page.
    - [ ] **Expected:** Product disappears immediately (On-demand revalidation works).
- [ ] **Scenario:** Out of Stock Visibility.
    - [ ] Ensure a product with 0 stock is still visible in the collection but marked as "Sold Out".

## 5. 🟣 Edge Cases (Try to break it)
- [ ] **Input Validation:** Try entering "-5" stock or "abc" cost in mobile inputs. (Should be blocked).
- [ ] **Network:** Turn off internet on phone -> Try to Ship Order -> Turn on. (App should handle error gracefully or retry).
- [ ] **Missing Settings:** What if Shipping Fee setting is deleted from DB? (RPC has a fallback to 30 TL, verify this).

## 6. Execution Log
| Test ID | Status | Notes |
| :--- | :--- | :--- |
| 1.1 Mobile Build | ⬜ | |
| 2.1 Stock Add | ⬜ | |
| 2.1 Stock Rollback | ⬜ | |
| 2.2 Order Ship | ⬜ | |
| 3.1 Push Notif | ⬜ | |
| ... | | |
