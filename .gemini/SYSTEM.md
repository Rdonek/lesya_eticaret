# LESYA PROJECT - ABSOLUTE RULES

## CRITICAL: READ BEFORE EVERY CODE GENERATION

### DESIGN LANGUAGE: MINIMAL-BENTO HYBRID (2026)

**Core Philosophy:**
- **Minimalist Product:** Clean, whitespace-heavy, focus on imagery.
- **Bento Structure:** Modular, grid-based layouts for navigation/categories.
- **Softer Feel:** Rounded corners, subtle depth, neutral palette.

**Colors (Strict Palette):**
- **Primary:** bg-neutral-900 (Black), text-neutral-900 (Buttons, Headings)
- **Secondary:** bg-white, text-neutral-500 (Descriptions, Secondary UI)
- **Accent:** ONLY bg-red-600 for Errors and bg-green-600 for Success.
- **Rules:** 
  - NO more Blue-600 in the UI. 
  - ALL primary buttons MUST be `bg-neutral-900`. 
  - ALL background states MUST be `neutral-50` or `white`.

**Border Radius (Bento Style):**
- rounded-sm (4px) - Tags, small badges
- rounded-md (8px) - Buttons, Inputs
- rounded-xl (12px) - Product Cards
- rounded-2xl (16px) - Bento Grid Items, Modals, Large Containers
- rounded-full - Pills, Avatars

**Shadows (Soft & Deep):**
- shadow-none
- shadow-sm (0 1px 2px 0 rgb(0 0 0 / 0.05)) - Subtlest
- shadow-bento (0 4px 6px -1px rgb(0 0 0 / 0.02), 0 2px 4px -1px rgb(0 0 0 / 0.02)) - Cards default
- shadow-hover (0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -2px rgb(0 0 0 / 0.025)) - Hover state

**Spacing Scale:**
- Standard Tailwind spacing (p-4, p-6, p-8, p-12)

---

### TAILWIND CSS - STRICT ENFORCEMENT

**FORBIDDEN (Build will fail):**
```tsx
w-[100px]
h-[50px]
p-[15px]
m-[20px]
text-[14px]
bg-[#f5f5f5]
gap-[12px]
```

**REQUIRED (Only these):**

**Spacing:**
- 0: space-0, p-0, m-0
- 4px: space-1, p-1, m-1
- 8px: space-2, p-2, m-2
- 12px: space-3, p-3, m-3
- 16px: space-4, p-4, m-4
- 24px: space-6, p-6, m-6
- 32px: space-8, p-8, m-8
- 48px: space-12, p-12, m-12

**Colors (ONLY these):**
- Primary: bg-blue-600, text-blue-600, border-blue-600
- Text: text-neutral-900, text-neutral-600, text-neutral-400
- Background: bg-white, bg-neutral-50, bg-neutral-100
- Border: border-neutral-200, border-neutral-300
- Success: bg-green-600, text-green-600
- Error: bg-red-600, text-red-600

**Typography:**
- text-xs (12px)
- text-sm (14px)
- text-base (16px)
- text-lg (18px)
- text-xl (20px)
- text-2xl (24px)
- text-3xl (30px)

**Border Radius:**
- rounded-none
- rounded-sm (2px)
- rounded-md (6px) - Button, Input
- rounded-lg (8px) - Card
- rounded-full - Avatar

**Shadow:**
- shadow-none
- shadow-sm - Card
- shadow - Dropdown
- shadow-md - Modal

---

### COMPONENT STANDARDS - MANDATORY

**Every component MUST follow this exact structure:**
```tsx
// 1. IMPORTS (this order exactly)
import { useState } from 'react'           // React first
import { Button } from '@/components/ui'   // Internal components
import { formatPrice } from '@/lib/utils'  // Utils
import type { Product } from '@/types'     // Types last

// 2. TYPES (component-specific)
type ProductCardProps = {
  product: Product
  onAddToCart?: (id: string) => void
}

// 3. COMPONENT
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // 3a. HOOKS (state first, effects after)
  const [loading, setLoading] = useState(false)
  
  // 3b. HANDLERS (alphabetical order, prefix with 'handle')
  const handleAddToCart = () => {
    setLoading(true)
    onAddToCart?.(product.id)
  }
  
  // 3c. COMPUTED VALUES
  const price = formatPrice(product.price)
  
  // 3d. EARLY RETURN (if needed)
  if (!product) return null
  
  // 3e. JSX (max 50 lines, otherwise split)
  return (
    <div className="p-6 rounded-lg shadow-sm bg-white">
      ...
    </div>
  )
}
```

**Component Padding (NEVER change):**
```tsx
<Card className="p-6" />
<Button className="px-4 py-2" />
<Input className="px-3 py-2" />
<Modal className="p-8" />
<Section className="py-12" />
```

---

### FILE NAMING - STRICT

**CORRECT:**
```
product-card.tsx
use-cart.ts
format-price.ts
order-status.ts
```

**FORBIDDEN:**
```
ProductCard.tsx
useCart.ts
formatPrice.ts
ORDER_STATUS.ts
```

**Rule:** kebab-case for ALL files.

---

### TYPESCRIPT - NO EXCEPTIONS

**REQUIRED:**
```tsx
// Type (not interface)
type Product = {
  id: string
  name: string
}

// Props type
type CardProps = {
  title: string
  onClick?: () => void
}

// Return type
function getProduct(id: string): Promise<Product> { ... }
```

**FORBIDDEN:**
```tsx
interface Product { ... }    // NO interface
function getData(id: any)    // NO any
export default Component     // NO default export
```

---

### VARIANT PATTERN - MANDATORY

**Every component uses this:**
```tsx
<Component variant="..." size="..." />
```

**Allowed variants:**
- default
- primary
- secondary
- outline
- ghost
- destructive

**Allowed sizes:**
- sm
- md (default)
- lg

**Example:**
```tsx
<Button variant="primary" size="md" />
<Card variant="outline" />
```

**FORBIDDEN:**
```tsx
<Button type="primary" />      // NO 'type'
<Card style="outline" />       // NO 'style'
<Input mode="filled" />        // NO 'mode'
```

---

### IMPORTS - STRICT RULES

**REQUIRED:**
```tsx
import { X } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils/format'
```

**FORBIDDEN:**
```tsx
import { X } from '../../../components/ui/button'
import { X } from './button'
```

**Rule:** ALWAYS use @/ alias. NEVER relative paths beyond 1 level.

---

### MAGIC NUMBER BAN

**FORBIDDEN:**
```tsx
const total = price + 30
const isEligible = amount > 500
```

**REQUIRED:**
```tsx
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/constants/config'
const total = price + SHIPPING_COST
const isEligible = amount > FREE_SHIPPING_THRESHOLD
```

---

### CONSTANTS FORMAT

**File: lib/constants/config.ts**
```tsx
export const CONFIG = {
  SHIPPING_COST: 30,
  FREE_SHIPPING_THRESHOLD: 500,
  VAT_RATE: 0.20
} as const
```

**File: lib/constants/order-status.ts**
```tsx
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]
```

---

### ERROR HANDLING - MANDATORY PATTERN
```tsx
try {
  const result = await service.create(data)
  return result
} catch (error) {
  if (error instanceof Error) {
    console.error('Operation failed:', error.message)
    throw error
  }
  throw new Error('Unknown error occurred')
}
```

---

### FORBIDDEN PATTERNS

**NEVER use these:**
```tsx
// Inline styles
<div style={{ width: 100 }} />

// Default export
export default Component

// Index files
// components/ui/index.ts

// CSS modules
import styles from './component.module.css'

// Styled components
const Div = styled.div`...`

// any type
function getData(id: any)

// console.log in production
console.log('debug')
```

---

### WORKFLOW - MANDATORY

1. Read TASKS.md completely
2. Execute ONE task only
3. Stop and wait for approval
4. Do NOT proceed to next task
5. Do NOT assume approval
6. Do NOT create multiple files at once
7. Show me what you created
8. Wait for my "continue" or "fix" command

---

### COMMIT MESSAGE FORMAT
```
<type>: <description>

Types:
feat: New feature
fix: Bug fix
refactor: Code improvement
docs: Documentation
style: Formatting
test: Tests
chore: Config

Examples:
feat: product card component added
fix: cart total calculation error
refactor: checkout form split into components
```

---

### BEFORE GENERATING ANY CODE

**ASK YOURSELF:**
1. Am I using arbitrary Tailwind values? → STOP
2. Are there magic numbers? → STOP
3. Is file naming kebab-case? → STOP
4. Am I using 'type' not 'interface'? → STOP
5. Is this ONE task from TASKS.md? → STOP
6. Am I waiting for approval? → STOP

---

### FILE SIZE LIMITS

- Component: Max 200 lines
- Utility: Max 100 lines
- Type: Max 50 lines

If exceeded → Split into multiple files

---

### RESPONSIVE DESIGN - MANDATORY

**All design will be done with a mobile-first structure. NO EXCEPTIONS.**

**Example:**
```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
```

**Breakpoints (ONLY these):**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

---

### ACCESSIBILITY - MANDATORY
```tsx
// Button always has type
<button type="button">

// Image always has alt
<img src="..." alt="Description" />

// Input always has label
<label htmlFor="email">Email</label>
<input id="email" />

// Use semantic HTML
<header>, <nav>, <main>, <footer>, <article>, <section>
```

---

**THIS IS NON-NEGOTIABLE. NO EXCEPTIONS. NO CREATIVE INTERPRETATION.**