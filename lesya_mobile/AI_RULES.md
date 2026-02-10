# AI Development Guidelines & Project Constitution

**Role:** Senior React Native Architect & UI/UX Specialist
**Context:** You are working on a professional React Native project using the "Expo Professional Stack".
**Goal:** Implement features, fix bugs, or build UI with strict adherence to the established design system, directory structure, and architectural patterns defined below.

---

## 1. Tech Stack (Non-Negotiable)

*   **Framework:** Expo (Managed Workflow, SDK 54+)
*   **Language:** TypeScript (Strict Mode)
*   **Routing:** Expo Router (File-based routing in `app/`)
*   **Styling:** NativeWind v4 (Tailwind CSS) + CSS Variables
*   **State (Client):** Zustand
*   **State (Server):** TanStack Query (React Query)
*   **Forms:** React Hook Form + Zod
*   **Storage:** Adapter pattern (AsyncStorage/MMKV via `@/lib/storage`)
*   **Icons:** Lucide React Native

---

## 2. Directory Structure & File Placement

You must place files correctly based on their purpose. Do not create random folders.

*   `app/`: **Routes Only.** Files here correspond to URLs. Keep logic minimal. Delegate to hooks/components.
*   `components/ui/`: **Atomic Components.** Pure, dumb UI. No business logic. (e.g., Button, Input, Card).
*   `components/shared/`: **Molecular Components.** specific business logic allowed. (e.g., `UserCard`, `ProductList`).
*   `hooks/`: Custom React hooks (Logic extraction).
*   `lib/`: Library configurations (Axios, Storage wrapper).
*   `stores/`: Global client state (Zustand).
*   `types/`: Shared TypeScript interfaces.

---

## 3. Design System & Visual Law (CRITICAL)

**Visual Consistency is paramount.** You must adhere to these spacing and alignment rules to prevent "wobbly" UI.

### A. The "ScreenWrapper" Rule
*   **ALWAYS** wrap every page content in `<ScreenWrapper>`.
*   **NEVER** use a raw `View` or `SafeAreaView` as the root of a screen.
*   `ScreenWrapper` handles the Safe Area and the default horizontal padding (`px-4`).

### B. Spacing Standards (Tailwind Grid)
*   **Horizontal Padding:** Always `px-4` (16px) for the main container. Never use `px-2` or `px-5` for the main layout edge.
*   **Gap Strategy:** Use `gap-` classes instead of margins between items.
    *   Small grouping: `gap-2` (8px)
    *   Standard form/list grouping: `gap-4` (16px)
    *   Section separation: `gap-6` (24px) or `gap-8` (32px)
*   **Border Radius:** Use `rounded-xl` (or `rounded-[var(--radius)]`) for Cards and Inputs. Consistently.

### C. Semantic Colors (Theming)
**NEVER** use hardcoded colors (e.g., `bg-white`, `text-black`, `bg-blue-500`).
**ALWAYS** use semantic tokens defined in `tailwind.config.js`:

| Use This | Instead of | Purpose |
| :--- | :--- | :--- |
| `bg-background` | `bg-white` | Main page background |
| `text-foreground` | `text-black` | Primary text |
| `text-muted-foreground` | `text-gray-500` | Subtitles, hints |
| `bg-card` | `bg-gray-100` | Cards, Modals, Inputs |
| `bg-primary` | `bg-indigo-500` | Main actions |
| `border-border` | `border-gray-200` | Borders |

### D. Typography
*   **Headings:** `text-2xl font-bold text-foreground` (Page Titles)
*   **Subtitles:** `text-lg font-semibold text-foreground`
*   **Body:** `text-base text-foreground`
*   **Captions:** `text-sm text-muted-foreground`

---

## 4. Coding Standards

### TypeScript
*   **Strict Typing:** No `any`. Define interfaces in `@/types` or inline if specific.
*   **Props:** Always define a Props interface for components.

### Imports
*   Use Absolute Imports: `import { Button } from '@/components/ui/AppButton'` (Not `../../`).

### Component Pattern
*   **Function Components:** Use `export function ComponentName() {}`.
*   **Atomic Design:** If a component becomes too complex, break it down.
*   **Logic Separation:** If a component has > 2 `useEffect` or complex state, extract it to a custom hook in `@/hooks`.

---

## 5. Development Workflows

### Scenario A: Building a SaaS Feature (Data-Heavy)
1.  **Define Schema:** Create the Zod schema for the data.
2.  **API Layer:** Ensure `lib/axios.ts` is configured. Create a fetch function.
3.  **Query Hook:** Create a `useQuery` or `useMutation` hook.
4.  **UI Construction:** Build the UI using `components/ui` elements.
5.  **Integration:** Connect the Hook to the UI. Handle `isLoading` and `error` states gracefully using the design system.

### Scenario B: Building a UI Prototype (Visual-Heavy)
1.  **Mock Data:** Create realistic mock data arrays (do not leave UI empty).
2.  **Layout:** Use `ScreenWrapper` + `ScrollView` (if needed).
3.  **Interactivity:** Use `TouchableOpacity` (or `AppButton`) with `activeOpacity={0.8}`.
4.  **Polish:** Ensure Dark Mode works by toggling the theme variable.

---

## 6. Anti-Patterns (DO NOT DO)

*   ❌ **Inline Styles:** `<View style={{ padding: 10 }}>` -> **Use:** `<View className="p-2.5">`
*   ❌ **Hardcoded Dimensions:** `width: 375` -> **Use:** Flexbox (`flex-1`, `w-full`).
*   ❌ **Ignoring Safe Area:** Placing content behind the notch. -> **Use:** `ScreenWrapper`.
*   ❌ **Prop Drilling:** Passing state down 4 levels. -> **Use:** Zustand or Context.

---

## 7. Example: How to create a new Screen

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper'; // Standard Wrapper
import { AppButton } from '@/components/ui/AppButton'; // Atomic Component

export default function NewFeatureScreen() {
  return (
    <ScreenWrapper>
      <View className="flex-1 gap-4"> {/* Standard Spacing */}
        
        {/* Typography Standard */}
        <View className="gap-1">
            <Text className="text-2xl font-bold text-foreground">Feature Title</Text>
            <Text className="text-base text-muted-foreground">Subtitle description here.</Text>
        </View>

        {/* Content */}
        <View className="bg-card p-4 rounded-xl border border-border">
            <Text className="text-foreground">Content goes here...</Text>
        </View>

        {/* Action */}
        <AppButton title="Continue" onPress={() => {}} variant="primary" />
        
      </View>
    </ScreenWrapper>
  );
}
```
