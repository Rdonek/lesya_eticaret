# Lesya E-Commerce & AFI (Autonomous Financial Intelligence)

Lesya is a premium, minimalist e-commerce platform for women's clothing, built with **Next.js 14** and **Supabase**. Unlike standard e-commerce sites, Lesya features an integrated **AFI (Autonomous Financial Intelligence)** engine that acts as a real-time accountant for your business.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E.svg)

---

## 🚀 Key Features

### 🧠 AFI (Autonomous Financial Intelligence)
The "Brain" of Lesya. It automates your bookkeeping:
- **Weighted Average Cost (WAC):** Automatically calculates your real product costs as you buy new stock at different prices.
- **Dual Ledger System:** Separates your **Cash Flow** (Actual money in safe) from **Profitability** (Paper profit after COGS, VAT, and Shipping).
- **Automated Expense Tracking:** Shipping costs, inventory purchases, and sales are recorded automatically.
- **Real-time P&L:** Instantly see your Net Profit, VAT liabilities, and Inventory Valuation.

### 🛡️ Pro Admin Dashboard
- **Bulk Stock Intelligence:** Update prices and costs in a spreadsheet-style grid, or use the "Smart Stock Add" modal.
- **Logistics Center:** One-click shipping with automatic customer notification and expense recording.
- **CRM & Analytics:** Track customer lifetime value (LTV) and segments (VIP, Returning, New).
- **Dynamic Settings:** Manage shipping thresholds, VAT rates, and maintenance mode without touching code.

### 👗 Premium Storefront
- **Editorial Design:** High-fashion, minimalist aesthetic inspired by top luxury brands.
- **Mobile-First UX:** Perfectly optimized for mobile shopping with a focus on speed and clarity.
- **Smart Showcase:** Algorithm-based "Trending Now" and "Editor's Choice" sections.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React.
- **State Management:** Zustand (with Persistence).
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).
- **Payment:** iyzico (Integration ready).
- **Email:** Resend (Automated transactional emails).

---

## ⚙️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Rdonek/lesya_eticaret.git
   cd lesya_eticaret
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file and add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run Migrations:**
   Apply the SQL files in `supabase/migrations` to your Supabase instance.

5. **Start Development:**
   ```bash
   npm run dev
   ```

---

## 📈 Future Roadmap

- [ ] **AFI V2:** Advanced VAT offset tracking (Input vs Output VAT).
- [ ] **Mobile App:** High-performance native iOS/Android app via Expo.
- [ ] **POS Integration:** Direct physical store sales tracking within the same finance engine.

---

## 📄 License

This project is licensed under the MIT License. Created with ❤️ for Lesya Studio.
