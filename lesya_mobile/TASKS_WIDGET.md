# Lesya Mobile - Android Finance Widget Implementation Plan

## Goal
Create a 4x2 Android Widget that mirrors the "Black Finance Card" from the app. It should display Net Profit, Revenue, and Expenses in real-time (or near real-time).

## 1. Setup & Dependencies
- [ ] **Install Library:** `react-native-android-widget`. This library allows us to define Android Widgets using a React-like syntax that gets converted to `RemoteViews`.
- [ ] **Config Plugin:** Add the widget configuration to `app.json` so Expo can generate the necessary Android native files (Manifest, Provider, etc.).

## 2. Widget UI Design (XML/JSX)
- [ ] **Container:** Deep Black (#171717) background with 32dp corner radius.
- [ ] **Typography:** Clean white text for values, muted grey (#A3A3A3) for labels.
- [ ] **Layout:**
    - Top Section: "NET İŞLETME KÂRI" label + Main Profit Value.
    - Bottom Row: Grid with "CİRO" and "GİDER" columns.

## 3. Data Bridge (The Glue)
- [ ] **Shared Storage:** Use `SharedGroup` or the library's built-in data sharing to store finance stats.
- [ ] **Sync Logic:** Update `useFinanceStats` hook to "push" new data to the widget whenever the app fetches fresh stats.
- [ ] **Background Update:** (Optional for MVP) Register a background task to refresh stats even if the app is closed.

## 4. Implementation Steps
1.  Install `react-native-android-widget`.
2.  Create `widgets/FinanceWidget.tsx`.
3.  Register the widget in `app.json`.
4.  Create `services/widget-service.ts` to handle data pushes.
5.  Call `widgetService.update()` from the finance hook.

## 5. Testing
- [ ] Build the app (`eas build`).
- [ ] Add widget to home screen.
- [ ] Perform a transaction in the app and verify the widget updates.
