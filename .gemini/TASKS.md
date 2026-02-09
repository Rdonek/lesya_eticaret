# Lesya Mobile Admin - Roadmap

## Phase 1: Core Infrastructure (Gatekeeping)
- [x] Task 1.1: Supabase & NativeWind Setup.
- [x] Task 1.2: Base Typography & UI Atoms.
- [x] Task 1.3: Admin Login Screen Implementation.
- [x] Task 1.4: Auth Guard & Session Management (Zustand).

## Phase 2: Operations Hub (The Dashboard)
- [x] Task 2.1: Implement Main Dashboard Screen (`app/(tabs)/index.tsx`).
  - [x] UI: KPI Bento Grid (Today's Revenue, Pending Orders, Out of Stock).
  - [x] Logic: `hooks/useAdminStats.ts`.
- [x] Task 2.2: Sales Trend Micro-Chart (SVG native).

## Phase 3: Order Center (Logistics)
- [x] Task 3.1: Order List Screen (`app/(tabs)/orders.tsx`).
  - [x] UI: Status Tabs (All, Paid, Shipped, Cancelled) - Matches Web.
  - [x] Logic: `hooks/useAdminOrders.ts`.
  - [x] Feature: Search by Order # or Customer Name.
- [x] Task 3.2: Order Detail View (`app/order/[id].tsx`).
  - [x] UI: Customer Info (Name, Email, Phone, Address).
  - [x] UI: Order Items List (Product Image, Name, Size, Quantity).
  - [x] UI: Payment Summary (Subtotal, Shipping, Total).
  - [x] UI: Timeline (Created, Shipped).
  - [x] Action: "Quick Ship" Modal (Enter Tracking Number).

## Phase 4: Inventory & Catalog (Stock Intelligence)
- [x] Task 4.1: Product Manager Screen (`app/(tabs)/catalog.tsx`).
  - [x] UI: Searchable Product List.
  - [x] UI: Category Filter (Sidebar logic adapted for mobile).
  - [x] Action: Toggle Active/Archive Status.
- [x] Task 4.2: Bulk Stock Quick-Edit (`app/catalog/stock.tsx`).
  - [x] UI: Mobile optimized list for quick stock/price updates.
  - [x] Logic: Port `productService.bulkUpdateVariants` logic.
- [x] Task 4.3: Product Detail/Edit (`app/catalog/[id].tsx`).
  - [x] UI: Edit Basic Info (Name, Price, Desc).
  - [x] UI: Variant Management (Stock/Cost per size).

## Phase 5: Finance Center (AFI Integration)
- [x] Task 5.1: Financial Dashboard (`app/finance/index.tsx`).
  - [x] UI: Net Profit Card (Revenue - COGS - Expenses).
  - [x] UI: Cash Balance Card (In/Out flow).
- [x] Task 5.2: Transactions Feed.
  - [x] UI: List of recent transactions (Income/Expense colored).
  - [x] Action: Add Manual Transaction (Modal).

## Phase 6: CRM (Customer Analytics)
- [x] Task 6.1: Customer List Screen (`app/customers/index.tsx`).
  - [x] UI: Customer List with Search.
  - [x] UI: Segment Badges (VIP, New, etc.).
  - [x] Metric: LTV (Total Spent) & Total Orders.

## Phase 7: Settings (Configuration)
- [x] Task 7.1: Settings Screen (`app/settings/index.tsx`).
  - [x] UI: Store Status Toggle (Open/Maintenance).
  - [x] UI: Shipping Fee & Free Threshold Inputs.
  - [x] UI: Contact Info (Whatsapp, Email).
  - [x] Action: Sign Out.

---
**RULES:** Execute ONE task. Verify. Move on.