# Lesya Mobile - Admin Command Center

## Project Overview
This is the native management application for the Lesya E-Commerce ecosystem. It is a strictly **Admin-only** tool designed for real-time store monitoring, logistics management, and financial oversight.

**Core Goal:** To provide the store owner with a high-performance, professional mobile interface to manage orders, stock, and finances on the go.

**Design Aesthetic:**
- **Editorial Monochrome:** Professional, black-and-white, minimalist.
- **Data-Dense Bento:** Information organized in clean, rounded grid modules.
- **Speed & Precision:** Instant feedback for management actions (shipping, stock updates).

---

## Technical Architecture
- **Engine:** Expo 54+ (Managed)
- **Styling:** NativeWind v4 (Tailwind for Native)
- **Data:** TanStack Query + Supabase (Using Service Role/Admin privileges where necessary via backend).
- **Navigation:** Expo Router (File-based).

## Critical Rules
1. **NO Customer Features:** Do not implement "Register", "Shopping Cart" (for customers), or "Public Profiles". This is a management tool.
2. **Action Oriented:** Every screen should lead to a management decision or action.
3. **Consistency:** Must mirror the logic and data integrity of the Web Admin Pro features (AFI engine).

---
**END OF GEMINI.MD**