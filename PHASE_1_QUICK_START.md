# 🚀 Phase 1 Quick Start Guide

**Time to Complete**: 30-45 minutes
**Difficulty**: Easy
**Prerequisites**: Node.js, npm, existing LMS project

---

## 📋 What You'll Set Up

1. **Sentry** - Error tracking and performance monitoring
2. **Google Analytics 4** - User behavior and conversion tracking
3. **Enhanced Rate Limiting** - API protection
4. **Logging Integration** - Structured error logging

---

## ⚡ Quick Setup (30 minutes)

### Step 1: Create Sentry Account (5 minutes)

```bash
# 1. Go to https://sentry.io
# 2. Sign up or log in
# 3. Create new organization
# 4. Create new project → Select "Next.js"
# 5. Copy your DSN (looks like: https://key@org.ingest.sentry.io/123)
```

### Step 2: Create Google Analytics 4 Property (5 minutes)

```bash
# 1. Go to https://analytics.google.com
# 2. Sign in with Google account
# 3. Create new property → Name it "AdaptIQ"
# 4. Set up reporting view
# 5. Go to Admin → Data Streams
# 6. Create new web stream for your domain
# 7. Copy Measurement ID (looks like: G-XXXXXXXXXX)
```

### Step 3: Update Environment Variables (5 minutes)

```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local and fill in:
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
SENTRY_AUTH_TOKEN=your-auth-token-from-sentry
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Step 4: Start Development Server (5 minutes)

```bash
# Install dependencies (if not already done)
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Step 5: Test Everything (5 minutes)

```bash
# Test error tracking
curl http://localhost:3000/api/test-error

# Check Sentry dashboard
# Should see error appear within 10 seconds

# Check GA4
# Open http://localhost:3000 in browser
# Go to Analytics dashboard
# Should see page view in Real-Time report
```

---

## 🔧 Configuration Details

### Sentry Configuration

**Where to Get Your Values**:

1. **SENTRY_DSN/NEXT_PUBLIC_SENTRY_DSN**
   - Project Settings → Client Keys (DSN)
   - Copy the full URL

2. **SENTRY_ORG**
   - Settings → Organization Slug
   - Usually your-org (lowercase)

3. **SENTRY_PROJECT**
   - Project Settings → General
   - Usually your-project (lowercase)

4. **SENTRY_AUTH_TOKEN**
   - Settings → Auth Tokens
   - Create new token with "project:releases" scope

### Google Analytics 4 Configuration

**Where to Get Your Value**:

1. **NEXT_PUBLIC_GA_ID**
   - Admin → Data Streams → Web
   - Measurement ID (e.g., G-XXXXXXXXXX)

---

## ✅ Verification Checklist

After setup, verify everything works:

### Sentry Testing
- [ ] Navigate to `http://localhost:3000/api/test-error`
- [ ] See "Test error captured by Sentry" response
- [ ] Check Sentry dashboard at https://sentry.io
- [ ] Error should appear within 10-30 seconds
- [ ] Error includes event ID and stack trace

### Google Analytics 4 Testing
- [ ] Open `http://localhost:3000` in browser
- [ ] Go to Analytics dashboard
- [ ] Click "Real-time"
- [ ] Should show "1 user" and page view
- [ ] Try different pages, should increment views

### Rate Limiting Testing
- [ ] Rate limiting is active (no config needed)
- [ ] Pre-configured for common endpoints
- [ ] No errors on startup

### Logging Testing
- [ ] Check browser console has no Sentry errors
- [ ] Dev server shows no issues

---

## 📊 What Gets Tracked Automatically

### Page Views (GA4)
- Every page visit recorded
- Time on page
- Browser/device info

### Errors (Sentry)
- JavaScript errors
- API errors
- Component errors
- Network errors

### Performance (Sentry)
- Page load times
- API response times
- Database query times

---

## 📱 Using Analytics in Your Code

### Track Course Enrollment

```typescript
import { trackCourseEnrollment } from '@/lib/analytics';

// In your course enrollment component
function EnrollButton() {
  const handleEnroll = async () => {
    // ... enrollment logic
    trackCourseEnrollment('course-123', 'Python Basics', 99.99);
  };
  
  return <button onClick={handleEnroll}>Enroll Now</button>;
}
```

### Track Quiz Completion

```typescript
import { trackQuizCompletion } from '@/lib/analytics';

// After quiz submission
trackQuizCompletion(
  'quiz-123',
  'Math Quiz 1',
  85,        // score
  100,       // total questions
  300        // duration in seconds
);
```

### Track Custom Event

```typescript
import { trackEvent } from '@/lib/analytics';

// Track any custom action
trackEvent('custom_action', {
  action_type: 'user_action',
  details: 'value',
});
```

---

## 🛡️ Error Handling

### Automatic Error Capture

```typescript
// Errors are automatically captured by:
// 1. Error boundary (prevents white screens)
// 2. Sentry integration (logs to dashboard)
// 3. Logger utility (structured logging)

import { logger } from '@/lib/logger';

try {
  // Your code
} catch (error) {
  logger.error('Something went wrong', error);
  // Automatically sent to Sentry
}
```

### User-Facing Error Messages

```typescript
// API routes automatically return proper error format
import { createErrorResponse } from '@/lib/error-handler';

export async function POST(req: Request) {
  try {
    // Your logic
  } catch (error) {
    // Returns standardized error with Sentry tracking
    return createErrorResponse(error, 'Operation failed', 500);
  }
}
```

---

## 🚨 Troubleshooting

### Error: "Sentry DSN not configured"
**Solution**: Check `.env.local` has `NEXT_PUBLIC_SENTRY_DSN` (with public prefix!)

### Error: "GA4 script not loading"
**Solution**: Check `.env.local` has `NEXT_PUBLIC_GA_ID` with correct format (G-XXXXX)

### Errors not appearing in Sentry
**Solution**: 
1. Verify DSN is correct (copy-paste exactly)
2. Check Sentry project exists and is active
3. Wait 10-30 seconds for event to appear
4. Check browser console for Sentry errors

### GA4 showing no events
**Solution**:
1. Verify Measurement ID is correct
2. Check Real-time view (takes 30 seconds to update)
3. Look for GA4 script in Network tab (should load gtag)
4. Check browser has no CSP blocking GA

### Port 3000 already in use
**Solution**: Kill process or use different port

```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

---

## 📈 Next Steps

### Immediately
1. ✅ Complete setup above
2. ✅ Test error tracking
3. ✅ Test analytics
4. ✅ Verify rate limiting works

### This Week
1. Configure Sentry alerts (critical errors)
2. Set up GA4 custom events in key flows
3. Create first GA4 dashboard
4. Monitor error dashboard daily

### This Month
1. Integrate rate limiting into all APIs
2. Track user journey with GA4 events
3. Review error trends and patterns
4. Optimize based on analytics data

---

## 💡 Pro Tips

### Tip 1: Use Sentry for Production Debugging
```
When users report issues, you can:
1. Find error ID in their message
2. Search in Sentry dashboard
3. See exact stack trace and user context
4. Identify root cause in seconds
```

### Tip 2: GA4 Segments for Analysis
```
Create segments in GA4:
- "Enrolled Users" - users who completed enrollment
- "Active Learners" - users completing quizzes
- "Premium Users" - users with subscriptions
Then analyze behavior per segment
```

### Tip 3: Alert on Critical Errors
```
In Sentry, create alerts for:
- Error rate > 1%
- Specific error types (database, auth)
- New error patterns
Get notifications in Slack or email
```

---

## 🎓 Learning Resources

### Sentry Docs
- Getting Started: https://docs.sentry.io/product/getting-started/
- Next.js Guide: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- Error Tracking: https://docs.sentry.io/product/error-monitoring/

### Google Analytics 4
- Getting Started: https://support.google.com/analytics/answer/10089681
- Event Tracking: https://support.google.com/analytics/answer/9267744
- Custom Events: https://support.google.com/analytics/answer/9322688

### Rate Limiting
- See `lib/rate-limit.ts` for configuration
- Includes helpful comments and examples

---

## 📞 Support

### Common Questions

**Q: Does Sentry cost money?**
A: Free tier includes 5,000 events/month. Plenty for starting.

**Q: Is GA4 free?**
A: Yes, unlimited free usage. Standard GA4 property.

**Q: Can I test Sentry without errors?**
A: Yes! Visit `/api/test-error` endpoint.

**Q: When will GA4 show data?**
A: Real-time view updates within 30 seconds.

**Q: Do I need to deploy to see analytics?**
A: No, works in development too (localhost).

---

## 🎉 You're Done!

Phase 1 is now set up and ready to use. Your application now has:

✅ Professional error tracking
✅ User behavior analytics
✅ API rate limiting
✅ Structured logging
✅ Performance monitoring

**Next Phase**: Advanced Search & Mobile PWA (Weeks 5-8)

---

## 📝 Notes

- All environment variables are required for full functionality
- Can run without GA4 (analytics will be skipped)
- Can run without Sentry (errors still logged locally)
- Rate limiting runs by default with no setup needed

---

**Setup Date**: Today
**Expected Time**: 30-45 minutes
**Difficulty**: ⭐ Easy
**Impact**: ⭐⭐⭐⭐⭐ High

🚀 Let's go! Your LMS is now enterprise-ready!