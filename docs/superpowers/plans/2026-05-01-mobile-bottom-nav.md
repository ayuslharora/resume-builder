# Mobile Bottom Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mobile hamburger drawer with a fixed bottom navigation bar while keeping the desktop sidebar unchanged.

**Architecture:** Keep `src/components/layout/Sidebar.jsx` as the shared navigation source, but split the render path by breakpoint: desktop continues to show the existing sidebar, while mobile renders a fixed bottom bar with five actions. Update `src/components/layout/AppLayout.jsx` so mobile pages reserve bottom space instead of top space.

**Tech Stack:** React, React Router, Tailwind CSS utility classes, existing Lucide icons

---

### Task 1: Refactor `Sidebar.jsx` for dual desktop/mobile navigation

**Files:**
- Modify: `src/components/layout/Sidebar.jsx`

- [ ] **Step 1: Inspect the current navigation structure and identify mobile-only code**

Read:
```bash
sed -n '1,260p' src/components/layout/Sidebar.jsx
```

Expected: a single component that currently mixes desktop sidebar rendering with mobile drawer state (`mobileOpen`) and top-bar/drawer markup.

- [ ] **Step 2: Remove mobile drawer state and imports that are no longer needed**

Edit `src/components/layout/Sidebar.jsx` to remove:

```js
import { useEffect, useState } from "react";
```

and replace it with:

```js
import { useEffect } from "react";
```

Also remove unused icons from the Lucide import:

```js
Menu, X
```

and remove this state:

```js
const [mobileOpen, setMobileOpen] = useState(false);
```

and this effect:

```js
useEffect(() => {
  setMobileOpen(false);
}, [location.pathname]);
```

- [ ] **Step 3: Define explicit desktop and mobile navigation item sets**

Inside `Sidebar.jsx`, keep the existing desktop links:

```js
  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Resumes", path: "/resumes", icon: FileText },
    { name: "Resume Grader", path: "/grader", icon: CheckSquare },
    { name: "Resources", path: "/resources", icon: BookOpen },
  ];
```

Add a second array for the mobile bottom bar:

```js
  const mobileLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, type: "link" },
    { name: "Grader", path: "/grader", icon: CheckSquare, type: "link" },
    { name: "New", path: "/builder/new", icon: Plus, type: "action" },
    { name: "Resources", path: "/resources", icon: BookOpen, type: "link" },
    { name: "Profile", path: "/profile", icon: null, type: "profile" },
  ];
```

- [ ] **Step 4: Add a mobile-safe active route helper**

Add this helper above the JSX return so route matching is explicit:

```js
  function isMobileLinkActive(link) {
    if (link.path === "/builder/new") return location.pathname === "/builder/new";
    return location.pathname.startsWith(link.path);
  }
```

Expected: `Dashboard`, `Grader`, `Resources`, and `Profile` highlight for their routes; `New` only highlights on `/builder/new`.

- [ ] **Step 5: Extract a mobile profile avatar helper**

Add a small helper for the profile tab icon:

```js
  function MobileProfileIcon() {
    if (userDoc?.photoURL) {
      return <img src={userDoc.photoURL} alt="Profile" className="w-5 h-5 rounded-full object-cover" />;
    }

    return (
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-on-surface"
        style={{ background: "rgba(35,41,60,0.95)", border: "1px solid rgba(6,182,212,0.25)" }}
      >
        {initials}
      </span>
    );
  }
```

- [ ] **Step 6: Replace the mobile topbar/drawer markup with a fixed bottom bar**

Replace the current mobile return block:

```jsx
      {/* Mobile topbar */}
      ...
      {/* Mobile backdrop */}
      ...
```

with a new mobile bottom-nav block:

```jsx
      <nav
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2"
        style={{
          background: "linear-gradient(180deg, rgba(7,13,31,0) 0%, rgba(7,13,31,0.75) 18%, rgba(7,13,31,0.92) 100%)",
        }}
      >
        <div
          className="mx-auto grid grid-cols-5 items-end gap-1 rounded-[1.75rem] px-2 py-2"
          style={{
            background: "rgba(7,13,31,0.82)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {mobileLinks.map((link) => {
            const isActive = isMobileLinkActive(link);
            const baseClass = link.type === "action"
              ? "flex flex-col items-center justify-center gap-1 -mt-5"
              : "flex flex-col items-center justify-center gap-1 py-1";

            if (link.type === "profile") {
              return (
                <Link key={link.name} to={link.path} className={baseClass}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${isActive ? "bg-primary/15 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.18)]" : "bg-transparent"}`}>
                    <MobileProfileIcon />
                  </span>
                  <span className={`text-[11px] font-medium ${isActive ? "text-on-surface" : "text-on-surface-variant"}`}>{link.name}</span>
                </Link>
              );
            }

            const Icon = link.icon;

            return (
              <Link key={link.name} to={link.path} className={baseClass}>
                <span
                  className={`flex items-center justify-center transition ${
                    link.type === "action"
                      ? "h-14 w-14 rounded-2xl text-on-surface shadow-[0_12px_24px_rgba(8,145,178,0.35)]"
                      : "h-10 w-10 rounded-2xl"
                  } ${isActive ? "text-on-surface" : "text-on-surface-variant"}`}
                  style={link.type === "action"
                    ? {
                        background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }
                    : {
                        background: isActive ? "rgba(6,182,212,0.12)" : "transparent",
                        boxShadow: isActive ? "inset 0 0 0 1px rgba(6,182,212,0.14)" : "none",
                      }}
                >
                  <Icon size={link.type === "action" ? 20 : 18} strokeWidth={link.type === "action" ? 2.4 : 2.2} />
                </span>
                <span className={`text-[11px] font-medium ${isActive || link.type === "action" ? "text-on-surface" : "text-on-surface-variant"}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
```

Expected: mobile shows a fixed bottom bar with five actions and no hamburger menu.

- [ ] **Step 7: Keep the desktop sidebar rendering intact**

Ensure the desktop `<aside>` still renders with:

```jsx
className="hidden lg:flex fixed top-0 left-0 h-screen z-20 flex-col w-[260px]"
```

and continues to render `<SidebarContent />`.

Expected: desktop navigation behavior is unchanged.

### Task 2: Update mobile layout spacing in `AppLayout.jsx`

**Files:**
- Modify: `src/components/layout/AppLayout.jsx`

- [ ] **Step 1: Inspect current main spacing**

Read:
```bash
sed -n '1,220p' src/components/layout/AppLayout.jsx
```

Expected: the `<main>` element uses `mt-16` on mobile to account for the old fixed top bar.

- [ ] **Step 2: Replace top offset with bottom-safe spacing**

Update the `<main>` class from:

```jsx
className="flex-1 pt-6 lg:pt-10 px-4 sm:px-6 lg:px-10 pb-12 w-full mt-16 lg:mt-0"
```

to:

```jsx
className="flex-1 pt-6 lg:pt-10 px-4 sm:px-6 lg:px-10 pb-28 lg:pb-12 w-full"
```

Expected: mobile content no longer reserves top space for a removed bar and now has enough bottom padding to clear the fixed bottom nav.

### Task 3: Verify the mobile nav behavior

**Files:**
- Verify: `src/components/layout/Sidebar.jsx`
- Verify: `src/components/layout/AppLayout.jsx`

- [ ] **Step 1: Run a targeted build**

Run:
```bash
npm run build
```

Expected: build completes successfully without JSX or import errors.

- [ ] **Step 2: Sanity-check the final diff**

Run:
```bash
git diff -- src/components/layout/Sidebar.jsx src/components/layout/AppLayout.jsx docs/superpowers/specs/2026-05-01-mobile-bottom-nav-design.md docs/superpowers/plans/2026-05-01-mobile-bottom-nav.md
```

Expected: diff shows the mobile drawer removal, new bottom bar, layout spacing update, and documentation files.

- [ ] **Step 3: Commit once verified**

Run:
```bash
git add src/components/layout/Sidebar.jsx src/components/layout/AppLayout.jsx docs/superpowers/specs/2026-05-01-mobile-bottom-nav-design.md docs/superpowers/plans/2026-05-01-mobile-bottom-nav.md
git commit -m "feat: replace mobile drawer with bottom nav"
```

Expected: one commit containing the navigation change and its supporting spec/plan docs.
