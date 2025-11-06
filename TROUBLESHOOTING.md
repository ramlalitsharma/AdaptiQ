# Troubleshooting Guide

## Common Issues and Solutions

### ❌ Error: "Failed to generate question"

This error usually means the OpenAI API call failed. Here's how to fix it:

#### 1. Check OpenAI API Key

**Problem**: `OPENAI_API_KEY` is not set or invalid.

**Solution**:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys section
3. Create a new API key
4. Add it to your `.env.local` file:
   ```env
   OPENAI_API_KEY=sk-your-actual-key-here
   ```
5. Restart your development server:
   ```bash
   npm run dev
   ```

#### 2. Check API Key Has Credits

**Problem**: OpenAI account has no credits or quota exceeded.

**Solution**:
1. Go to OpenAI Dashboard → Billing
2. Add payment method if needed
3. Add credits to your account
4. Check usage limits in Settings

#### 3. Check Network Connection

**Problem**: Network error preventing API call.

**Solution**:
- Check your internet connection
- Try again in a moment
- Check if OpenAI API is experiencing issues

#### 4. Check Server Logs

Look at your terminal/console for detailed error messages:
- `OPENAI_API_KEY is not set` → Add API key to `.env.local`
- `Rate limit exceeded` → Wait a moment and try again
- `Insufficient quota` → Add credits to OpenAI account
- `Unauthorized` → API key is invalid, create a new one

---

### ❌ Error: "Unauthorized" (401)

**Problem**: User is not authenticated.

**Solution**:
1. Make sure you're signed in to Clerk
2. Check that Clerk keys are set in `.env.local`
3. Verify middleware is working correctly

---

### ❌ Error: "MongoDB connection failed"

**Problem**: Cannot connect to MongoDB Atlas.

**Solution**:
1. Check `MONGODB_URI` in `.env.local`
2. Verify your IP is whitelisted in MongoDB Atlas
3. Check database user credentials
4. Ensure cluster is running (not paused)

---

### ❌ Webhook Warnings (Safe to Ignore)

**Problem**: `CLERK_WEBHOOK_SECRET not set` warning.

**Solution**: 
- ✅ **This is normal for local development!**
- Users will sync automatically when they visit the dashboard
- Only configure webhooks when deploying to production
- See [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md) for details

---

### ❌ Quiz Not Loading

**Problem**: Quiz component shows loading but never loads.

**Possible Causes**:

1. **OpenAI API Key Missing**
   - Check `.env.local` has `OPENAI_API_KEY`
   - Restart dev server after adding

2. **API Route Error**
   - Check browser Network tab
   - Look for `/api/quiz/generate` request
   - Check response for error details

3. **Authentication Issue**
   - Make sure you're signed in
   - Check Clerk authentication is working

---

## Debug Steps

### 1. Check Environment Variables

Run this to verify your `.env.local` file:
```bash
# Make sure these are set:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# CLERK_SECRET_KEY
# MONGODB_URI
# OPENAI_API_KEY
```

### 2. Check Server Console

Look at your terminal where `npm run dev` is running for detailed error messages.

### 3. Check Browser Console

Open browser DevTools (F12) and check:
- Console tab for client-side errors
- Network tab for failed API requests

### 4. Test API Route Directly

You can test the API route directly:
```bash
curl -X POST http://localhost:3000/api/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"topic":"Mathematics","difficulty":"easy"}'
```

(Note: This will fail without authentication, but you'll see the error response)

---

## Quick Fixes Checklist

- [ ] Restarted dev server after adding/changing `.env.local`
- [ ] Verified OpenAI API key is valid and has credits
- [ ] Checked Clerk authentication is working
- [ ] Verified MongoDB connection string is correct
- [ ] Checked browser console for client errors
- [ ] Checked server terminal for server errors
- [ ] Cleared browser cache and tried again

---

## Getting Help

If you're still stuck:

1. Check the error message in browser console
2. Check server logs in terminal
3. Verify all environment variables are set
4. Try creating a new OpenAI API key
5. Ensure all accounts (Clerk, MongoDB, OpenAI) are active

---

## Common Error Messages

| Error Message | Solution |
|--------------|----------|
| `OPENAI_API_KEY is not set` | Add API key to `.env.local` |
| `Failed to generate quiz` | Check OpenAI API key and credits |
| `Unauthorized` | Sign in to Clerk |
| `MongoDB connection failed` | Check MongoDB URI and IP whitelist |
| `Rate limit exceeded` | Wait a moment and try again |
| `Insufficient quota` | Add credits to OpenAI account |
| `Webhook secret not configured` | Normal for local dev, ignore |

