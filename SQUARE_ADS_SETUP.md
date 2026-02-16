# Square Ads Setup - Add 9337411181 to Pages

Your square ad is now ready to deploy! Use slot ID: **9337411181**

## Quick Start

Add this to any page where you want a square ad in the middle:

```tsx
import { GoogleAdsense } from '@/components/ads/GoogleAdsense';

{!isPro && (
  <div className="flex justify-center my-12">
    <GoogleAdsense 
      adSlot="9337411181"
      adFormat="rectangle"
    />
  </div>
)}
```

---

## Pages to Add Square Ads

### 1. **Shop Page** - `app\[locale]\shop\page.tsx`

```tsx
        {/* All Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ALL_TOOLS.map((tool, idx) => (
            // Tools render...
          ))}
        </div>

        {/* SQUARE AD - Middle of page */}
        {!isPro && (
          <div className="flex justify-center my-16 py-8 border-y border-white/10">
            <GoogleAdsense 
              adSlot="9337411181"
              adFormat="rectangle"
              className="max-w-md"
            />
          </div>
        )}
```

### 2. **Tools Page** - `app\[locale]\shop\tools\page.tsx`

Same pattern - add after the tools grid.

### 3. **Courses Page** - `app\[locale]\courses\page.tsx`

```tsx
        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => ...)}
        </div>

        {/* SQUARE AD */}
        {!isPro && (
          <div className="flex justify-center my-16">
            <GoogleAdsense 
              adSlot="9337411181"
              adFormat="rectangle"
            />
          </div>
        )}
```

### 4. **Blog Pages** - `app\[locale]\blog\page.tsx`

```tsx
      <section className="mb-8">
        <h2>First Section</h2>
        <p>Blog content...</p>
      </section>

      {/* MIDDLE AD - Between sections */}
      {!isPro && (
        <div className="flex justify-center my-12 py-8">
          <GoogleAdsense 
            adSlot="9337411181"
            adFormat="rectangle"
          />
        </div>
      )}

      <section className="mb-8">
        <h2>More Sections</h2>
        <p>More content...</p>
      </section>
```

---

## Ad Placements Summary

| Page | Location | Code |
|------|----------|------|
| Shop | After tools grid | See above |
| Tools | After tools grid | See above |
| Courses | After course grid | See above |
| Blog | Between sections | See above |
| Q&A | Between answers | See above |

---

## Styling Options

**Centered with border:**
```tsx
<div className="flex justify-center my-12 py-8 border-y border-white/10">
  <GoogleAdsense adSlot="9337411181" adFormat="rectangle" />
</div>
```

**Sidebar-style:**
```tsx
<div className="flex justify-end ml-8">
  <GoogleAdsense adSlot="9337411181" adFormat="rectangle" />
</div>
```

**Full-width container:**
```tsx
<div className="w-full bg-white/5 py-12">
  <div className="flex justify-center">
    <GoogleAdsense adSlot="9337411181" adFormat="rectangle" />
  </div>
</div>
```

---

## Your Current Ads

| Location | Slot | Format |
|----------|------|--------|
| After page content (auto) | 5087174988 | Horizontal |
| Middle of pages (manual) | 9337411181 | Rectangle |

Already working: ✅ Layout horizontal ads on every page
To add: 📌 Square ads to specific pages using code above

---

The square ads will appear within 24-48 hours once Google activates them!
