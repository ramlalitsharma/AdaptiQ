# Environment Variables Setup

## Required Variables

Create a `.env.local` file in the root directory with these variables:

### 1. Clerk Authentication (Required)

Get these from [Clerk Dashboard](https://dashboard.clerk.com) → API Keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
CLERK_SECRET_KEY=sk_test_your_actual_key_here
```

**Important**: 
- ❌ Do NOT use placeholder values like `pk_test_...`
- ✅ Copy the actual keys from Clerk Dashboard
- ✅ The publishable key should start with `pk_test_` or `pk_live_`
- ✅ The secret key should start with `sk_test_` or `sk_live_`

**Where to find them:**
1. Go to https://dashboard.clerk.com
2. Select your application
3. Go to "API Keys" in the sidebar
4. Copy the "Publishable Key" → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
5. Copy the "Secret Key" → `CLERK_SECRET_KEY`

### 2. MongoDB Atlas (Required)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms?retryWrites=true&w=majority
MONGODB_DB_NAME=lms
```

**Where to find them:**
1. Go to https://www.mongodb.com/atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password

### 3. OpenAI API (Required)

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**Where to find it:**
1. Go to https://platform.openai.com
2. Navigate to "API Keys"
3. Create a new secret key
4. Copy it to `OPENAI_API_KEY`

**Important Notes:**
- ✅ Add a payment method to get higher rate limits
- ✅ Free tier has very low limits (3 requests per minute)
- ✅ Add credits to use the API

### 4. Optional Variables

```env
# Webhook secret (only for production)
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# App URL (for local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Upstash Redis (optional, for caching)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

## Complete .env.local Template

```env
# Clerk Authentication (REQUIRED - Get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_51AbC123...
CLERK_SECRET_KEY=sk_test_51XyZ789...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# MongoDB Atlas (REQUIRED - Get from https://mongodb.com/atlas)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/lms
MONGODB_DB_NAME=lms

# OpenAI API (REQUIRED - Get from https://platform.openai.com)
OPENAI_API_KEY=sk-proj-abc123def456...

# Webhook (Optional - Only for production)
# CLERK_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common Issues

### ❌ "Publishable key not valid"
- **Problem**: Clerk keys are invalid or placeholder values
- **Solution**: 
  1. Go to Clerk Dashboard → API Keys
  2. Make sure you copied the FULL key (not just `pk_test_...`)
  3. Remove any spaces or extra characters
  4. Restart dev server after updating

### ❌ "OPENAI_API_KEY is not set"
- **Problem**: API key missing in `.env.local`
- **Solution**: Add your OpenAI API key and restart server

### ❌ "Rate limit exceeded" or "Insufficient quota"
- **Problem**: OpenAI account has no credits or hit rate limits
- **Solution**:
  1. Go to https://platform.openai.com/account/billing
  2. Add payment method
  3. Add credits to your account
  4. For higher rate limits, add a paid plan

### ❌ "CLERK_SECRET_KEY not set"
- **Problem**: Missing Clerk secret key
- **Solution**: Add `CLERK_SECRET_KEY` to `.env.local` from Clerk Dashboard

## Verification

After setting up your `.env.local`:

1. **Restart your dev server** (Ctrl+C, then `npm run dev`)
2. **Check the console** - Should not see "key not valid" errors
3. **Test authentication** - Sign in should work
4. **Test quiz generation** - Should generate questions (if OpenAI has credits)

## Security Notes

- ✅ `.env.local` is in `.gitignore` - never commit it
- ✅ Use test keys for development
- ✅ Use production keys only in production environment
- ✅ Never share your secret keys

