# Lesya Development Tasks - Detailed Checklist

## RULES FOR AI:
- Execute ONE task at a time
- Show me what you created
- WAIT for my approval
- Do NOT proceed to next task automatically
- If task says "Create file X", create ONLY file X, nothing else

---

## Milestone 1: Database Setup
- [x] Task 1.1: Create products table migration
- [x] Task 1.2: Create product_variants table migration
- [x] Task 1.3: Create product_images table migration
- [x] Task 1.4: Create orders table migration
- [x] Task 1.5: Create order_items table migration
- [x] Task 1.6: Create order_logs table migration
- [x] Task 1.7: Create returns table migration
- [x] Task 1.8: Add RLS policies migration
- [x] Task 1.9: Add triggers migration

---

## Milestone 2: Core Types & Constants
- [x] Task 2.1: Create database types
- [x] Task 2.2: Create business types
- [x] Task 2.3: Create cart types
- [x] Task 2.4: Create order status constants
- [x] Task 2.5: Create config constants
- [x] Task 2.6: Create routes constants

---

## Milestone 3: Supabase Setup
- [x] Task 3.1: Create Supabase client (browser)
- [x] Task 3.2: Create Supabase client (server)

---

## Milestone 4: Utility Functions
- [x] Task 4.1: Create format utilities
- [x] Task 4.2: Create validation utilities

---

## Milestone 5: Product Service
- [x] Task 5.1: Create product service

---

## Milestone 11: Edge Functions (Mock Payment Flow)
- [x] Task 11.1: Create create-payment API
- [x] Task 11.2: Create payment-callback Mock Webhook
- [x] Task 11.3: Create send-email Service

---

## Milestone 12: Admin Panel (Mobile-First Operations)
- [x] Task 12.1: Admin Layout & Authentication
- [x] Task 12.2: Admin Dashboard (Action Center)
- [x] Task 12.3: Order Management (List & Quick Actions)
- [x] Task 12.4: Order Detail Page
- [x] Task 12.5: Product Management (Smart Entry & Edit)

---

## Milestone 13: UI/UX Redesign (Minimal-Bento Hybrid)
- [x] Task 13.1: Update Tailwind Config
- [x] Task 13.2: Revise Base Components (Atoms)
- [x] Task 13.3: Revise Product Card (Bento Style)
- [x] Task 13.4: Revise Hero Section
- [x] Task 13.5: Create Category Rail (Merged into Catalog)
- [x] Task 13.6: Update Pages Layout

---

## Milestone 14: Global Design Harmonization & Professional UI
- [x] Task 14.1: Create Global Header
- [x] Task 14.2: Create Global Footer
- [x] Task 14.3: Implement Toast Notifications
- [x] Task 14.4: Global Color & Typography Audit
- [x] Task 14.5: Mobile Bottom Navigation

---

## Milestone 15: Autonomous Financial Intelligence (AFI)

### Task 15.1: Advanced DB Schema (Inventory Logs)
- [x] Create `supabase/migrations/017_afi_setup.sql`
- [x] Add `inventory_logs` table (track movements + cost history)
- [x] Update `finances` table with `source` column
- [x] STOP and wait for approval

### Task 15.2: Smart Stock Entry (Trigger 1)
- [x] Update `src/app/(admin)/admin/katalog/stok/page.tsx`
- [x] Add "Stock Entry Modal" (Quantity, Cost, Supplier Note)
- [x] Implement logic: Create `inventory_log` -> Create `finance` (Expense)
- [x] STOP and wait for approval

### Task 15.3: Auto-Shipping Expense (Trigger 2)
- [ ] Update `src/app/(admin)/admin/siparisler/page.tsx`
- [ ] Modify "Quick Ship" logic: Fetch shipping cost setting -> Create `finance` (Expense)
- [ ] STOP and wait for approval

### Task 15.4: Financial Dashboard Revamp
- [ ] Update `src/app/(admin)/admin/finans/page.tsx`
- [ ] Separate "Cash Flow" (Kasa) from "Profitability" (Kâr)
- [ ] Add "Stock Value" card (Total asset value in warehouse)
- [ ] STOP and wait for approval