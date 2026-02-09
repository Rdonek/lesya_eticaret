# LESYA MOBILE ADMIN - SYSTEM LAWS

## 1. DESIGN LANGUAGE: MANAGEMENT BENTO

**Typography (Strict):**
- **Headings:** `text-2xl font-black tracking-tighter uppercase italic text-foreground`
- **Metric Numbers:** `text-3xl font-bold tracking-tight text-foreground`
- **Labels:** `text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground`
- **Data Rows:** `text-sm font-bold text-foreground`

**Spacing (Atomic):**
- **Page Padding:** Always `px-4` or `px-6` depending on screen context.
- **Component Gap:** Use `gap-4` for small items, `gap-8` for sections.
- **Card Padding:** Standard `p-6` for Bento items.

**Color Palette:**
- `bg-background`: #FFFFFF
- `bg-card`: #F9F9F9 (Subtle gray for Bento blocks)
- `bg-primary`: #000000 (Buttons/Headings)
- `border-border`: #EDEDED

---

## 2. COMPONENT STANDARDS (NON-NEGOTIABLE)

- **Layouts:** Every screen must use `<ScreenWrapper>`.
- **Buttons:** Use `@/components/ui/AppButton` with `primary`, `outline`, or `destructive` variants.
- **Inputs:** Use `@/components/ui/AppInput`.
- **Lists:** Use `FlatList` with `FlashList` optimization patterns.

---

## 3. ARCHITECTURAL PATTERNS

- **Data Fetching:** Named hooks only (e.g., `useAdminOrders`, `useFinanceStats`).
- **Logic:** Business logic MUST live in `@/lib/services/` or custom hooks.
- **Auth:** Strict gatekeeping at `_layout.tsx`. Redirect to `/(auth)/login` if no session.
- **File Naming:** kebab-case. `order-detail.tsx`, `stock-manager.tsx`.

---
**STRICT COMPLIANCE REQUIRED.**