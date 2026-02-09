# Lesya Autonomous Financial Intelligence (AFI) Architecture

This document defines the core architecture for the autonomous financial system of Lesya. The goal is to automate 90% of financial record-keeping, ensuring real-time profit analysis and cash flow tracking without manual intervention.

---

## 1. Core Philosophy: The Dual Ledger System

The system tracks money in two parallel dimensions:

### A. Cash Flow Ledger (Kasa Defteri)
**Question:** "How much money do I have right now?"
*   Tracks actual money movement.
*   **Income:** Payment received from Iyzico.
*   **Expense:** Payment sent to Suppliers, Cargo, Ads.
*   **Metric:** `Cash Balance`

### B. Profit & Loss Ledger (Kârlılık Analizi)
**Question:** "Is this business profitable?"
*   Tracks value generation.
*   **Income:** Sales Revenue.
*   **Expense:** COGS (Cost of Goods Sold), Marketing, Operations.
*   **Metric:** `Net Profit`

---

## 2. Database Schema Extensions

### A. `inventory_logs` Table
Tracks every stock movement to calculate weighted average cost.
```sql
id: UUID
product_variant_id: UUID
type: 'purchase' | 'sale' | 'return' | 'adjustment'
quantity: INTEGER (+ for buy/return, - for sale)
unit_cost: DECIMAL(10,2) -- Cost at the time of movement
total_value: DECIMAL(10,2) -- quantity * unit_cost
created_at: TIMESTAMPTZ
created_by: UUID (Admin or System)
```

### B. `finances` Table Updates
Add a `source` column to track automation.
```sql
source: 'manual' | 'system_sale' | 'system_purchase' | 'system_shipping' | 'system_return'
related_id: UUID (points to order_id or inventory_log_id)
```

---

## 3. Automation Triggers (The "Brain")

### Trigger 1: Stock Purchase -> Cash Expense
**Action:** Admin adds stock in "Hızlı Stok" page.
**Logic:**
1.  Admin enters: `Quantity: +50`, `Unit Cost: 200 TL`.
2.  System creates `inventory_log` entry.
3.  System calculates Total: `50 * 200 = 10,000 TL`.
4.  System **automatically** creates a `finance` record:
    *   Type: `expense`
    *   Category: `inventory`
    *   Amount: `10,000`
    *   Source: `system_purchase`
    *   Desc: "Stok Alımı: [Product Name] - 50 Adet"

### Trigger 2: Order Shipment -> Shipping Expense
**Action:** Admin clicks "Kargola" and enters tracking number.
**Logic:**
1.  System fetches `standard_shipping_cost` from Store Settings (e.g., 45 TL).
2.  System updates order status to `shipped`.
3.  System **automatically** creates a `finance` record:
    *   Type: `expense`
    *   Category: `shipping`
    *   Amount: `45` (or whatever setting is)
    *   Source: `system_shipping`
    *   Desc: "Kargo Gideri: Sipariş #[OrderNo]"

### Trigger 3: Return Approved -> Revenue Reversal & Stock Asset
**Action:** Admin approves a return.
**Logic:**
1.  **Revenue Reversal:** Create negative `income` record for the refund amount.
2.  **Asset Recovery:** Add item back to stock.
    *   Create `inventory_log` (Type: `return`).
    *   Value: Use the *original* cost from the order snapshot.
3.  **Loss Recording:** If shipping fee is not refunded to customer, record it as pure loss.

---

## 4. Financial Dashboard Logic (Real-time)

### A. Net Profit Calculation (The Formula)
```typescript
Total Revenue (Paid Orders)
- Total COGS (Snapshot Cost * Qty of SOLD items)
- Total Operating Expenses (Marketing + Rent + Salaries)
- Total Shipping Expenses (Actual cost paid to cargo company)
- Estimated VAT (Revenue - (Revenue / 1.20))
= NET PROFIT
```

### B. Cash Balance Calculation
```typescript
Total Income (All 'income' records in finances)
- Total Expenses (All 'expense' records in finances)
= CASH BALANCE
```

---

## 5. UI/UX Requirements

### A. Bulk Stock Page
- Add "Add Stock" modal (not just overwrite stock count).
- Input: `Quantity to Add` and `Unit Cost`.
- Toggle: "Record as Expense?" (Default: Yes).

### B. Order Detail Page
- "Kargola" modal should show "Estimated Cost: 45 TL" (editable).
- "Iade Al" modal should ask "Restock Item?" and "Refund Amount".

### C. Finance Page
- Filter by "Source" (Manual vs System).
- Show "Pending Stock Value" (Total value of unsold inventory).

---

## 6. Future Roadmap: Advanced Accounting (ERP Level)

This section details how to implement advanced tax and return logic in future versions (V2).

### A. Advanced KDV Ledger (VAT Offset)
**Goal:** Track "Input VAT" (from purchases) vs "Output VAT" (from sales) to calculate exact tax liability.

**Database Changes:**
1.  Add `tax_rate` (e.g., 20) and `tax_amount` columns to `inventory_logs` table.
2.  Add `vat_ledger` table:
    *   `type`: 'input' (purchase) | 'output' (sale)
    *   `amount`: decimal
    *   `period`: '2024-02'

**Implementation Logic:**
1.  **On Stock Purchase (`product-service.ts`):**
    *   Calculate VAT included in `unitCost` (e.g., Unit Cost 120 TL = 100 Base + 20 VAT).
    *   Record 20 TL * Quantity as 'input' VAT in `vat_ledger`.
2.  **On Sale (`finance-service.ts`):**
    *   Calculate VAT from Sales Price.
    *   Record as 'output' VAT.
3.  **Dashboard:**
    *   Show "Net KDV Borcu" = Output VAT - Input VAT.

### B. Smart Return Cost Logic (WAC Adjustment)
**Goal:** When an item is returned, put it back into stock at its *original sold cost*, not current cost, to avoid skewing weighted averages.

**Implementation Logic (`order-service.ts`):**
1.  **Fetch Snapshot:** Retrieve the `unit_cost` from `order_items.snapshot` json when processing return.
2.  **Inventory Log:**
    *   Insert `inventory_log` with `type: 'return'`.
    *   `unit_cost`: Use the snapshot cost.
3.  **WAC Recalculation:**
    *   Trigger the Weighted Average Cost formula again:
    *   `New Cost = ((Current Stock * Current Cost) + (Returned Qty * Snapshot Cost)) / Total Stock`
    
**Why:** This ensures that if you bought cheap, sold high, and got a return, your inventory value doesn't artificially inflate to the current market price.