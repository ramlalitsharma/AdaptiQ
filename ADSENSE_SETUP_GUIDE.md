# Google AdSense Implementation Guide

Your ad component is now ready: `components/ads/GoogleAdsense.tsx`

## Quick Integration Steps

### 1. **Add ads to your layout** (appears site-wide)

Edit `app\[locale]\layout.tsx` - add before closing tags:

```tsx
import { GoogleAdsense } from '@/components/ads/GoogleAdsense';

// In your layout component, add to the main content area:

<main>
  {children}
  
  {/* Horizontal ad - after main content */}
  <GoogleAdsense 
    adSlot="5087174988"
    adFormat="horizontal"
    className="my-8"
  />
</main>
```

---

### 2. **Add to specific pages**

Example: Add to Shop page (`app\[locale]\shop\page.tsx`):

```tsx
import { GoogleAdsense } from '@/components/ads/GoogleAdsense';

export default function ShopPage() {
  return (
    <div>
      {/* Page content */}
      
      {/* Ad at bottom */}
      <GoogleAdsense 
        adSlot="5087174988"
        adFormat="auto"
        className="mt-12"
      />
    </div>
  );
}
```

---

### 3. **Create multiple ad slots for different placements**

Use different `adSlot` values for each placement. In your Google AdSense account, create multiple ad units with different slot IDs:

- **Header ad**: `adSlot="5087174988"` 
- **Sidebar ad**: `adSlot="YOUR_SECOND_SLOT_ID"`
- **Footer ad**: `adSlot="YOUR_THIRD_SLOT_ID"`

---

### 4. **Ad Formats Available**

- `"auto"` - Google chooses best format
- `"horizontal"` - Wide banner (728x90, 970x90)
- `"vertical"` - Tall sidebar (300x600, 160x600)
- `"rectangle"` - Medium box (300x250)

---

### 5. **Where to Place Ads (Best Locations)**

✅ **High-Traffic Spots:**
- Top of pages (after header)
- Between main content sections
- In sidebars
- After article/product listings
- Before footer

---

### Usage Examples

**In a blog post:**
```tsx
<div>
  <h1>Blog Title</h1>
  <GoogleAdsense adSlot="5087174988" className="my-6" />
  <p>Blog content...</p>
</div>
```

**In shop/tools page:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Tools grid */}
</div>
<GoogleAdsense adSlot="5087174988" className="mt-12" />
```

**Multiple ads on same page:**
```tsx
<GoogleAdsense adSlot="5087174988" adFormat="horizontal" />
{/* Content */}
<GoogleAdsense adSlot="YOUR_SLOT_2" adFormat="vertical" />
```

---

## Important Notes

⚠️ **Do NOT:**
- Click your own ads (will get account suspended)
- Place too many ads (max 3 per page recommended)
- Hide ads with CSS
- Force ads to appear in unnatural places

✅ **DO:**
- Wait 24-48 hours for ads to start appearing
- Track performance in AdSense dashboard
- Place ads where they fit naturally with content
- Test different formats and positions

---

## Verify Setup

1. Go to Google AdSense dashboard
2. Check "Ad units" section
3. Confirm your site has been approved
4. Wait for ads to show (can take 24-48 hours)

Done! Now just import the `GoogleAdsense` component wherever you want ads to appear.
