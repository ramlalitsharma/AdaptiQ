# Clerk Webhook Setup Guide

## ⚠️ Webhooks Are Optional for Local Development

**You can skip webhook setup for now!** Webhooks require a publicly accessible URL, which isn't available on localhost. For local development, the app will automatically sync users to MongoDB on first login.

## 🔄 How It Works

### Without Webhooks (Local Development)
- Users are automatically synced to MongoDB when they first visit the dashboard
- The `syncUserToDatabase()` function handles this automatically
- No webhook configuration needed!

### With Webhooks (Production)
- Users are automatically created/updated in MongoDB when they sign up/update in Clerk
- Real-time synchronization
- Required for production environments

---

## 📋 Setting Up Webhooks Later (For Production)

### Step 1: Get Webhook Secret from Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Enter your production URL:
   ```
   https://your-domain.com/api/webhooks/clerk
   ```
6. Subscribe to these events:
   - ✅ `user.created`
   - ✅ `user.updated`
7. Click **Add Endpoint**
8. Copy the **Signing Secret** (starts with `whsec_...`)

### Step 2: Add Secret to Environment Variables

Add the webhook secret to your `.env.local` (or production environment):

```env
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 3: Test the Webhook

1. In Clerk Dashboard, click on your webhook endpoint
2. Click **Test Endpoint**
3. Select an event (e.g., `user.created`)
4. Verify the webhook is received successfully

---

## 🛠️ For Local Development Testing

If you want to test webhooks locally, you can use a tool like **ngrok**:

### Using ngrok:

1. **Install ngrok**: Download from [ngrok.com](https://ngrok.com)

2. **Start your Next.js app**:
   ```bash
   npm run dev
   ```

3. **Start ngrok** in another terminal:
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

5. **Add webhook in Clerk Dashboard**:
   - Endpoint: `https://abc123.ngrok.io/api/webhooks/clerk`
   - Subscribe to `user.created` and `user.updated`
   - Copy the signing secret

6. **Add to `.env.local`**:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_your_secret_here
   ```

7. **Test**: Create a new user in Clerk and verify it syncs to MongoDB

---

## ✅ Current Setup (Works Without Webhooks)

The app is already configured to work without webhooks:

- ✅ Users sync automatically on first dashboard visit
- ✅ Webhook handler gracefully handles missing secret
- ✅ No errors when `CLERK_WEBHOOK_SECRET` is not set
- ✅ Works perfectly for local development

---

## 🚀 When to Set Up Webhooks

Set up webhooks when:
- ✅ Deploying to production
- ✅ You need real-time user synchronization
- ✅ You want automatic user creation (without visiting dashboard first)
- ✅ You're testing subscription webhooks

**You can develop everything locally without webhooks!**

---

## 🔍 Verify Webhook is Working

After setting up webhooks in production:

1. Check Clerk Dashboard → Webhooks → Recent requests
2. Verify requests show `200 OK` status
3. Check MongoDB to see users are created automatically
4. Test by creating a new user account

---

## 📝 Quick Reference

### Required for Local Development:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
MONGODB_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
```

### Optional for Local Development:
```env
CLERK_WEBHOOK_SECRET=whsec_...  # Skip for now!
```

### Required for Production:
```env
# All of the above PLUS:
CLERK_WEBHOOK_SECRET=whsec_...  # Now required!
```

---

## 🆘 Troubleshooting

### "Webhook secret not configured" warning
- ✅ **This is normal for local development**
- ✅ App will still work - users sync on dashboard visit
- ✅ Only configure when deploying to production

### Webhook returning errors in production
1. Verify webhook URL is accessible (not localhost)
2. Check `CLERK_WEBHOOK_SECRET` matches Clerk Dashboard
3. Verify webhook endpoint is receiving POST requests
4. Check server logs for errors

### Users not syncing automatically
- If webhooks are set up: Check Clerk Dashboard webhook logs
- If webhooks are NOT set up: Users will sync on first dashboard visit (this is expected!)

---

**Summary: You can develop everything locally without webhooks. Set them up only when deploying to production!** 🎉
