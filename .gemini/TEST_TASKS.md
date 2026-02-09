# Lesya Project - Testing & Quality Assurance Checklist

## Milestone 1: Data Preparation (Seed)
### Task 1.1: Insert Sample Products
- [x] Run `supabase/seed.sql` (to be created) in Supabase SQL Editor
- [x] Verify products are visible in `products` table
- [x] Verify variants (Size/Color) are visible in `product_variants` table
- [x] Verify images are linked in `product_images` table

## Milestone 2: UI & Navigation Testing
### Task 2.1: Homepage & Mobile First Check
- [x] Verify header and products grid are visible on Desktop
- [x] Verify responsive layout on Mobile (Chrome DevTools -> Mobile view)
- [x] Verify "Add to Cart" button exists on cards

### Task 2.2: Product Detail Check
- [x] Click a product, verify slug-based navigation (e.g., `/urunler/siyah-elbise`)
- [x] Verify price and description are correct
- [x] Verify 404 page for non-existent slug

## Milestone 3: Cart & State Management
### Task 3.1: Cart Persistence
- [x] Add 2 items to cart, refresh page, verify items are still there (Zustand Persist)
- [x] Verify "Total updates correctly when increasing/decreasing quantity
- [x] Verify "Shipping Cost" (30 TL for < 500 TL, Free for >= 500 TL)

## Milestone 4: Checkout & Order Flow (Crucial)
### Task 4.1: Form Validation
- [x] Try empty checkout form, verify error messages
- [x] Try invalid email and phone (not starting with 05), verify validation

### Task 4.2: Stock Reservation (Backend Check)
- [x] Note current `reserved_stock` in DB for a product
- [x] Start checkout, go to `/odeme/test` page
- [x] Check DB: Verify `reserved_stock` increased by item quantity

### Task 4.3: Mock Payment Success
- [x] Click "Ödeme Başarılı (Test)"
- [x] Verify redirect to `/siparis/[id]`
- [x] Verify order record in `orders` table (status: paid)
- [x] Verify `stock` and `reserved_stock` decreased correctly in `product_variants`

### Task 4.4: Mock Payment Fail
- [x] Start a new order, go to test page
- [x] Click "Ödeme Başarısız (Test)"
- [x] Verify redirect back to `/sepet`
- [x] Verify `reserved_stock` returned to previous value in DB
- [x] Verify order status is `cancelled` in DB

---

## Milestone 5: Admin Panel & Operations

### Task 5.1: Admin Auth & Security
- [x] Try accessing `/admin` without login -> Should redirect to `/login`
- [x] Try logging in with wrong password -> Should show error
- [x] Log in with correct admin credentials -> Should redirect to `/admin`
- [x] Click "Çıkış Yap" -> Should redirect to `/login` and clear session

### Task 5.2: Dashboard (Overview)
- [x] Verify "Bekleyen Sipariş" count matches DB (status: paid)
- [x] Verify "Ürün Sayısı" matches DB count
- [x] Click "Son Siparişler" card -> Should navigate to Order Detail
- [x] Check chart visual rendering (no errors)

### Task 5.3: Category Management (Integrated)
- [x] Go to `/admin/urunler` (Katalog)
- [x] Create new category using "+" button in sidebar
- [x] Verify it appears in the sidebar list immediately
- [x] Delete category using trash icon (if no products linked)
- [x] Click a category and verify products are filtered instantly

### Task 5.4: Product Management (Smart Entry)
- [x] Go to `/admin/urunler/yeni`
- [x] Fill basic info (Name: "Yazlık Elbise", Price: 1200, Category: "Elbise")
- [x] Add Variant 1: Color "Kırmızı", Upload 1 Image, Set Stocks (S: 10, M: 5)
- [x] Add Variant 2: Color "Mavi", Upload 1 Image, Set Stocks (S: 0, M: 8)
- [x] Click "Kaydet" -> Verify success toast and redirect to list
- [x] Check DB: `products`, `product_variants`, `product_images` should be populated

### Task 5.5: Product Edit & Archive
- [x] Go to `/admin/urunler/[id]` of the created product
- [x] Change Price to 1500 -> Click "Kaydet" -> Verify update
- [x] Click "Arşivle" -> Status should change to "Arşivde"
- [x] Check Public Site: Product should NOT be visible in `/urunler` list
- [x] Click "Yayına Al" -> Status should change to "Satışta"

### Task 5.6: Order Management
- [x] Go to `/admin/siparisler`
- [x] Filter by "Hazırlanacak" -> Should show only Paid orders
- [x] Open an order detail page
- [x] Enter Tracking Number "AB123456" in the actions panel
- [x] Click "Kargola" -> Status should change to "Shipped"
- [x] Verify "Zaman Tüneli" updates with shipping info

---

## Milestone 6: Admin Pro Features

### Task 6.1: Dynamic Store Settings
- [x] Go to `/admin/ayarlar`
- [x] Change "Standart Kargo Ücreti" to 50 TL and "Ücretsiz Kargo Limiti" to 1000 TL
- [x] Go to Public Cart with a 600 TL item -> Should now show 50 TL shipping (was free)
- [x] Toggle "Mağaza Durumu" to OFF
- [x] Try accessing Public Site -> Should show "Bakım Modu" screen (if implemented)

### Task 6.2: Financial Hub (Profitability)
- [x] Go to `/admin/finans`
- [x] Verify KPI cards (Gross Revenue, Net Profit, etc.) are loading real data
- [x] Click "Gelir/Gider Ekle" -> Add a "Reklam" expense of 500 TL
- [x] Verify "Net Kar" decreases and the transaction appears in the list
- [x] Check if "Vergi" calculation matches the VAT rate set in Ayarlar

### Task 6.3: Bulk Stock & Cost Management
- [x] Go to `/admin/katalog/stok` (Hızlı Stok)
- [x] Search for a product using the search bar
- [x] Update "Maliyet (TL)" for a variant -> Verify "Kar (%)" updates instantly
- [x] Change "Stok" value for multiple rows
- [x] Click "Değişiklikleri Kaydet" -> Verify success toast
- [x] Refresh page -> Verify values are persisted in DB

### Task 6.4: CRM (Customer Analytics)
- [x] Go to `/admin/musteriler`
- [x] Verify customer list shows segment badges (VIP, Sadık, vb.)
- [x] Check if "Toplam Harcama" matches the sum of their successful orders in DB
- [x] Click a customer -> (Optional) Verify details or just ensure data integrity
- [x] Search for a customer by email

---

## Milestone 7: AFI (Autonomous Financial Intelligence) Verification

### Task 7.1: Smart Stock Entry Test
- [x] Go to `/admin/katalog/stok`
- [x] Click a product's "Stok Ekle" button
- [x] Enter Quantity: 10, Cost: 100 TL
- [x] Verify: A new record appears in `inventory_logs` table in DB
- [x] Verify: A new "Expense" record of 1000 TL appears in `/admin/finans` list
- [x] Verify: Transaction source is `system_purchase`

### Task 7.2: Auto-Shipping Expense Test
- [x] Open a "Paid" order in `/admin/siparisler`
- [x] Click "Quick Ship" and enter a tracking number
- [x] Verify: Order status changes to `shipped`
- [x] Verify: A new "Expense" record appears in `/admin/finans` list
- [x] Verify: The expense amount matches the `standard_fee` in Store Settings
- [x] Verify: Transaction source is `system_shipping`

### Task 7.3: Sales Income & COGS Test
- [x] Complete a test purchase on the public site
- [x] Verify: Order status becomes `paid`
- [x] Verify: A new "Income" record (Total Order Amount) appears in Finans list
- [x] Verify: COGS (Cost of Goods Sold) is correctly calculated based on product's `cost_price`
- [x] Verify: `Net Profit` card updates correctly (Order Total - VAT - COGS)

### Task 7.4: Inventory Valuation Test
- [x] Note the "Stok Varlığı" card value in `/admin/finans`
- [x] Change the `cost_price` of a variant in `/admin/katalog/stok`
- [x] Verify: "Stok Varlığı" card updates to reflect new valuation (Stock * New Cost)

### Task 7.5: Order Cancellation & Stock Restoration
- [x] Cancel a "Paid" order from Order Detail page
- [x] Verify: Order status changes to `cancelled`
- [x] Verify: Items are automatically added back to `product_variants` stock
- [x] Verify: A "Refund" record appears in Finans list to balance Cash Flow

### Task 7.6: Dual-Ledger Integrity
- [x] Compare "Kasa Bakiyesi" (Liquid Cash) with "Net İşletme Kârı" (Paper Profit)
- [x] Verify: Adding a manual "Rent" expense decreases both, but stock purchases only decrease "Kasa Bakiyesi" while keeping "Net İşletme Kârı" stable (until sold).
