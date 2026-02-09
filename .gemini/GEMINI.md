# Lesya E-Commerce Project - Context & Rules

## Project Overview

Micro e-commerce site for women's clothing (3-4 products initially).

**Key Principles:**
- Manual control over automation
- Simple, scalable architecture
- No Shopify/ready-made platforms
- Professional quality
- **Mobile-first design (Strict enforcement)**

---

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS (no arbitrary values)
- Zustand (state management)

**Backend:**
- Supabase (PostgreSQL)
- Supabase Edge Functions (Deno)
- Supabase Storage (images)

**External Services:**
- iyzico (payment)
- Resend.com (email)

**Hosting:**
- Digital Ocean (frontend - already available)
- Supabase (backend)

---

## Database Schema

### products
```sql
id: UUID PRIMARY KEY
name: TEXT NOT NULL
slug: TEXT UNIQUE NOT NULL
description: TEXT
base_price: DECIMAL(10,2)
category: TEXT
is_active: BOOLEAN DEFAULT true
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

### product_variants
```sql
id: UUID PRIMARY KEY
product_id: UUID REFERENCES products(id) ON DELETE CASCADE
sku: TEXT UNIQUE NOT NULL
size: TEXT (nullable)
color: TEXT (nullable)
price: DECIMAL(10,2) (nullable, uses base_price if null)
stock: INTEGER DEFAULT 0
reserved_stock: INTEGER DEFAULT 0
created_at: TIMESTAMPTZ DEFAULT now()
```

### product_images
```sql
id: UUID PRIMARY KEY
product_id: UUID REFERENCES products(id) ON DELETE CASCADE
url: TEXT NOT NULL
display_order: INTEGER DEFAULT 0
created_at: TIMESTAMPTZ DEFAULT now()
```

### orders
```sql
id: UUID PRIMARY KEY
order_number: TEXT UNIQUE NOT NULL
customer_name: TEXT NOT NULL
email: TEXT NOT NULL
phone: TEXT NOT NULL
address_line: TEXT NOT NULL
city: TEXT NOT NULL
postal_code: TEXT
subtotal: DECIMAL(10,2) NOT NULL
shipping_cost: DECIMAL(10,2) DEFAULT 0
total_amount: DECIMAL(10,2) NOT NULL
status: TEXT NOT NULL
payment_id: TEXT UNIQUE
tracking_number: TEXT
cancelled_reason: TEXT
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

### order_items
```sql
id: UUID PRIMARY KEY
order_id: UUID REFERENCES orders(id) ON DELETE CASCADE
product_variant_id: UUID REFERENCES product_variants(id)
quantity: INTEGER NOT NULL
unit_price: DECIMAL(10,2) NOT NULL
product_snapshot: JSONB NOT NULL
created_at: TIMESTAMPTZ DEFAULT now()
```

### order_logs
```sql
id: UUID PRIMARY KEY
order_id: UUID REFERENCES orders(id) ON DELETE CASCADE
old_status: TEXT
new_status: TEXT NOT NULL
note: TEXT
created_by: TEXT
created_at: TIMESTAMPTZ DEFAULT now()
```

### returns
```sql
id: UUID PRIMARY KEY
order_id: UUID REFERENCES orders(id)
reason: TEXT NOT NULL
status: TEXT NOT NULL
refund_amount: DECIMAL(10,2)
add_stock_back: BOOLEAN DEFAULT false
admin_note: TEXT
created_at: TIMESTAMPTZ DEFAULT now()
updated_at: TIMESTAMPTZ DEFAULT now()
```

---

## Business Rules

### Order Status Flow
```
pending → paid → processing → shipped → delivered
              ↓
          cancelled
```

**Status Definitions:**
- pending: Payment initiated, waiting for iyzico confirmation
- paid: Payment successful, admin not yet acted
- processing: Admin preparing shipment
- shipped: Sent to cargo, tracking number added
- delivered: Customer received
- cancelled: Order cancelled (before or after payment)

### Stock Management

**CRITICAL RULE: Stock decreases on payment success**

**Flow:**
1. User checkout → Edge Function checks stock
2. Stock available → Create order (status: pending) + Reserve stock (reserved_stock++)
3. Redirect to iyzico
4. Payment success → Webhook receives confirmation
5. Webhook → status: paid + Permanent stock decrease (stock--, reserved_stock--)
6. Payment fail/timeout (15min) → reserved_stock-- (stock returned)

**Cancel/Return:**
- Cancel after payment: stock++
- Return (damaged): admin decides, manual stock++
- Return (regret): admin decides, manual stock++

### Pricing & Shipping

**Constants (lib/constants/config.ts):**
```tsx
export const CONFIG = {
  SHIPPING_COST: 30,           // Fixed 30 TL
  FREE_SHIPPING_THRESHOLD: 500, // Free if total >= 500 TL
  VAT_RATE: 0.20,              // 20% VAT
  RESERVATION_TIMEOUT_MINUTES: 15
} as const
```

**Calculation:**
```
subtotal = sum(item.unit_price * item.quantity)
shipping = subtotal >= 500 ? 0 : 30
total = subtotal + shipping
```

### Payment Flow

1. Checkout form submitted
2. Edge Function: `create-payment`
   - Validate cart
   - Check stock
   - Create order (status: pending)
   - Reserve stock
   - Call iyzico API
   - Return payment URL
3. User redirected to iyzico
4. User pays
5. iyzico → Webhook: `payment-callback`
   - Verify payment_id
   - Update order (status: paid)
   - Decrease stock permanently
   - Send email
   - Return 200 OK
6. User redirected to success page

**Idempotency:**
- payment_id is unique
- Same payment_id twice → ignore, return 200

### Admin Workflow

**Order Management:**
1. New order arrives (status: paid)
2. Admin sees in dashboard
3. Admin clicks "Prepare shipment" → status: processing
4. Admin packages, calls cargo company
5. Admin enters tracking_number → status: shipped
6. Auto email/SMS sent to customer

**Return/Cancel:**
1. Customer contacts via WhatsApp
2. Admin opens order detail
3. Admin clicks "Cancel" or "Return"
4. Admin fills reason
5. Admin checks "Add stock back?" (yes/no)
6. System updates status + stock
7. Admin manually refunds via iyzico dashboard

---

## File Structure
```
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    # Home
│   │   ├── urunler/
│   │   │   ├── page.tsx                # Product list
│   │   │   └── [slug]/page.tsx         # Product detail
│   │   ├── sepet/page.tsx              # Cart
│   │   ├── odeme/page.tsx              # Checkout
│   │   └── siparis/[id]/page.tsx       # Order success
│   ├── (admin)/
│   │   └── admin/
│   │       ├── siparisler/
│   │       │   ├── page.tsx            # Orders list
│   │       │   └── [id]/page.tsx       # Order detail
│   │       └── urunler/
│   │           ├── page.tsx            # Products list
│   │           ├── yeni/page.tsx       # New product
│   │           └── [id]/page.tsx       # Edit product
│   └── api/
│       └── webhook/
│           └── iyzico/route.ts         # iyzico callback
├── components/
│   ├── ui/                             # Base components
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── admin/
│   └── layout/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts                    # Auto-generated
│   ├── services/
│   │   ├── product-service.ts
│   │   ├── order-service.ts
│   │   ├── cart-service.ts
│   │   └── payment-service.ts
│   ├── utils/
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   └── constants/
│       ├── order-status.ts
│       ├── routes.ts
│       └── config.ts
├── hooks/
│   ├── use-cart.ts
│   ├── use-products.ts
│   └── use-orders.ts
├── store/
│   ├── cart-store.ts
│   └── admin-store.ts
├── types/
│   ├── product.ts
│   ├── order.ts
│   └── cart.ts
└── schemas/
    ├── product-schema.ts
    ├── order-schema.ts
    └── checkout-schema.ts
```

---

## Supabase Edge Functions

### create-payment
```
Input: { cartItems, customerData }
Process:
  1. Validate cart (stock check)
  2. Create order (status: pending)
  3. Reserve stock (reserved_stock++)
  4. Call iyzico.payment.create()
  5. Return { paymentUrl }
Output: { paymentUrl: string }
```

### payment-callback
```
Input: iyzico webhook payload
Process:
  1. Verify signature
  2. Find order by payment_id
  3. If paid:
     - Update status: paid
     - Decrease stock permanently
     - Send email (call send-email function)
  4. Return 200 OK
Output: 200 OK
```

### send-email
```
Input: { orderId, type: 'confirmation' | 'shipped' | 'cancelled' }
Process:
  1. Get order data
  2. Generate email template
  3. Call Resend API
  4. Log email sent
Output: { success: boolean }
```

---

## Component Examples

### Product Card (components/product/product-card.tsx)
```tsx
type ProductCardProps = {
  product: Product
  onAddToCart?: (id: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [loading, setLoading] = useState(false)
  
  const handleAddToCart = () => {
    setLoading(true)
    onAddToCart?.(product.id)
  }
  
  const price = formatPrice(product.price)
  
  return (
    <div className="p-6 rounded-lg shadow-sm bg-white">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover rounded-md"
      />
      <h3 className="mt-4 text-xl font-semibold text-neutral-900">
        {product.name}
      </h3>
      <p className="mt-2 text-base text-neutral-600">{price}</p>
      <Button 
        variant="primary" 
        size="md"
        onClick={handleAddToCart}
        disabled={loading}
        className="mt-4 w-full"
      >
        Sepete Ekle
      </Button>
    </div>
  )
}
```

---

## Workflow Rules for AI

**MANDATORY PROCESS:**

1. **Before starting ANY task:**
   - Read TASKS.md completely
   - Identify current task number
   - Read task description 3 times
   - Ask yourself: "Do I understand completely?"

2. **During task execution:**
   - Create ONLY files mentioned in current task
   - Do NOT create related files
   - Do NOT anticipate next steps
   - Stop after completing current task

3. **After task completion:**
   - Show me what you created
   - List files created/modified
   - Wait for my explicit "continue" command
   - Do NOT proceed automatically

4. **If uncertain:**
   - STOP
   - Ask me for clarification
   - Do NOT guess
   - Do NOT assume

5. **File creation:**
   - ONE file at a time
   - Show me the content
   - Wait for approval
   - Then create next file

---

## Example Session

**Correct workflow:**
```
AI: "I will now work on Task 1.1: Create products table migration"
AI: "Creating file: supabase/migrations/001_products_table.sql"
AI: [shows SQL content]
AI: "Task 1.1 complete. Waiting for approval to continue."

User: "Looks good, continue"

AI: "Moving to Task 1.2: Create product_variants table migration"
AI: "Creating file: supabase/migrations/002_product_variants.sql"
...
```

**Incorrect workflow:**
```
AI: "Creating all database tables at once..."
AI: [creates 10 files]
AI: "All tables done, moving to services..."
❌ WRONG - Did not wait for approval between tasks
```

---

**END OF GEMINI.md**