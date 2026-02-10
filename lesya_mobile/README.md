# React Native Professional Boilerplate

A robust, scalable, and type-safe React Native starter template powered by **Expo**, **Expo Router**, **NativeWind v4**, and **TypeScript**.

This boilerplate is designed to enforce strict architectural patterns, consistent styling, and best practices for modern mobile development.

## 🚀 Tech Stack

- **Framework:** Expo (Managed Workflow, SDK 54)
- **Routing:** Expo Router (File-based routing)
- **Styling:** NativeWind v4 (Tailwind CSS) + CSS Variables
- **State Management:**
  - *Client State:* Zustand
  - *Server State:* TanStack Query (React Query)
- **Forms:** React Hook Form + Zod Validation
- **Storage:** Abstracted Storage Adapter (AsyncStorage / MMKV)
- **Icons:** Lucide React Native

---

## 🛠 Project Structure

We follow a strict **Feature-Based** + **Atomic Design** hybrid structure.

```
/
├── app/                  # Expo Router Pages (The "Screens")
│   ├── (auth)/           # Authentication routes (Login, Signup)
│   ├── (tabs)/           # Main tab navigation
│   └── _layout.tsx       # Root layout & providers
├── assets/               # Static assets & Global CSS
├── components/           # UI Components
│   ├── ui/               # ATOMIC components (Button, Input, Card). NO Business Logic here.
│   └── shared/           # MOLECULAR components (ProductCard, UserHeader). Business Logic allowed.
├── hooks/                # Custom React Hooks
├── lib/                  # 3rd Party Library Configs (Axios, QueryClient, Storage)
├── stores/               # Global Client State (Zustand)
├── types/                # Global TS Types
└── utils/                # Helper functions
```

---

## 📏 Development Rules & Guidelines

### 1. Styling & Theming (Crucial)
**⛔ DO NOT** use hardcoded hex colors or standard Tailwind colors like `bg-blue-500` or `bg-white`.
**✅ DO** use Semantic Colors defined in `tailwind.config.js`.

**Why?** This ensures Dark Mode works automatically and consistent branding.

| Utility Class | Description |
| :--- | :--- |
| `bg-background` | Main screen background |
| `text-foreground` | Main text color |
| `bg-card` | Background for cards/modals |
| `bg-primary` | Main brand color (Buttons, Active states) |
| `text-muted-foreground` | Secondary text (Subtitles, hints) |
| `border-border` | Standard border color |

**How to change the theme?**
1. Open `assets/global.css`.
2. Update the HSL/RGB values in `:root` (Light Mode) and `.dark` (Dark Mode).

### 2. Component Creation
- **Atomic Components (`components/ui`):** Must be dumb. They receive props and render UI. They should leverage `nativewind` classes.
- **Screen Components (`app/**/*`):** Should strictly manage layout and data fetching triggers. Offload complex logic to custom hooks.

### 3. State Management
- **Server Data:** Always use **TanStack Query** (`useQuery`, `useMutation`). Do not store API data in Redux/Zustand manually.
- **UI State:** Use **Zustand** for global UI state (Theme, Auth Token, Sidebar status).
- **Form State:** Use **React Hook Form**.

### 4. Storage
We use a wrapper in `lib/storage.ts`.
- Currently configured to use `AsyncStorage` for maximum compatibility with Expo Go.
- Can be easily swapped to `MMKV` for production builds by updating this single file.

---

## 🏁 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start the App:**
   ```bash
   # Clears cache to ensure NativeWind loads correctly
   npx expo start -c
   ```

---
## 🧩 How to Add...

### A New Page
Create a file in `app/`.
- `app/profile.tsx` -> Routes to `/profile`
- `app/settings/security.tsx` -> Routes to `/settings/security`

### A New API Call
1. Define the fetcher in `lib/axios.ts` or a service file.
2. Create a custom hook using `useQuery` or `useMutation`.
   ```typescript
   // Example
   export const useUser = (id: string) => {
     return useQuery({
       queryKey: ['user', id],
       queryFn: () => api.get(`/users/${id}`).then(r => r.data)
     })
   }
   ```

### A New Form
1. Define schema with **Zod**.
2. Use `useForm` with `zodResolver`.
3. Use the `AppInput` component with `Controller`.
   *(See `app/(tabs)/demo.tsx` for a complete example)*

---

## ⚠️ Troubleshooting

**"SafeAreaView has been deprecated" Warning:**
This comes from 3rd party libraries. It is harmless. We have suppressed it in `app/_layout.tsx` using `LogBox`.

**"Unable to resolve module..."**
If you install a new package, always restart the bundler with clear cache: `npx expo start -c`.
