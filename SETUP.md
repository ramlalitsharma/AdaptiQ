# Setup Guide

## Step-by-Step Setup Instructions

### 1. Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
### 2. Clerk Setup

1. **Create Clerk Account**
   - Go to [clerk.com](https://clerk.com) and sign up
   - Create a new application

2. **Configure Authentication**
   - In Clerk Dashboard, go to "Authentication"
   - Enable email/password and OAuth providers (Google, GitHub, etc.)
   - Set sign-in URL: `/sign-in`
   - Set sign-up URL: `/sign-up`
   - Set after sign-in URL: `/dashboard`

3. **Set up Webhooks** (⚠️ **OPTIONAL for local development**)
   - **Skip this for local development** - webhooks require a public URL
   - Users will sync automatically on first dashboard visit
   - For production setup, see [WEBHOOK_SETUP.md](./WEBHOOK_SETUP.md)
   - If setting up now:
     - Go to "Webhooks" in Clerk Dashboard
     - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
     - Subscribe to events: `user.created`, `user.updated`
     - Copy the webhook signing secret to `CLERK_WEBHOOK_SECRET`

4. **Configure Subscriptions (Premium Feature)**
   - Go to "Billing" or "Subscriptions" in Clerk Dashboard
   - Create a subscription plan: "Premium" at $19/month
   - Configure subscription metadata fields:
     - `subscriptionTier`: 'free' | 'premium'
     - `subscriptionStatus`: 'active' | 'canceled' | 'past_due' | 'trialing'
     - `subscriptionCurrentPeriodEnd`: ISO date string

### 3. MongoDB Atlas Setup

1. **Create Cluster**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a free M0 cluster
   - Choose a cloud provider and region

2. **Database Access**
   - Go to "Database Access"
   - Create a database user (save username and password)
   - Set user privileges to "Atlas Admin" (or create custom role)

3. **Network Access**
   - Go to "Network Access"
   - Add IP address: `0.0.0.0/0` for development (or your specific IP)
   - For production, whitelist specific IPs

4. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Add to `MONGODB_URI` in `.env.local`

### 4. OpenAI Setup

1. **Create Account**
   - Go to [platform.openai.com](https://platform.openai.com)
   - Sign up and add payment method (required)

2. **Get API Key**
   - Go to "API Keys" section
   - Create a new secret key
   - Copy to `OPENAI_API_KEY` in `.env.local`

3. **Set Usage Limits** (Recommended)
   - Go to "Usage" → "Usage Limits"
   - Set monthly budget to prevent unexpected costs
   - Set rate limits if needed

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 7. Verify Setup

1. **Test Authentication**
   - Click "Sign In" on homepage
   - Create an account or sign in
   - Should redirect to dashboard

2. **Test Quiz Generation**
   - Go to dashboard
   - Start an adaptive quiz
   - Verify questions are generated

3. **Test Database**
   - Complete a quiz
   - Check MongoDB Atlas to see if progress is saved

4. **Test Subscriptions**
   - Go to `/pricing`
   - Check subscription status
   - Upgrade to premium (if Clerk billing is configured)

## Production Deployment

### Netlify Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 20

4. **Add Environment Variables**
   - Go to "Site settings" → "Environment variables"
   - Add all variables from `.env.local`
   - **Important**: Use production Clerk keys, MongoDB URI, etc.

5. **Set up Clerk Webhook (Production)**
   - Update webhook URL in Clerk Dashboard to: `https://your-site.netlify.app/api/webhooks/clerk`
   - Test webhook to ensure it's receiving events

### Vercel Deployment (Alternative)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `./`

3. **Add Environment Variables**
   - Add all variables from `.env.local`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Troubleshooting

### Common Issues

1. **Clerk Authentication Not Working**
   - Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are correct
   - Check Clerk Dashboard for URL configuration
   - Ensure middleware.ts is properly configured

2. **MongoDB Connection Failed**
   - Verify connection string format
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user has correct permissions

3. **OpenAI API Errors**
   - Check API key is correct
   - Verify account has credits
   - Check rate limits in OpenAI dashboard

4. **Webhook Not Receiving Events**
   - Verify `CLERK_WEBHOOK_SECRET` matches Clerk Dashboard
   - Check webhook URL is accessible (no localhost in production)
   - Test webhook in Clerk Dashboard

5. **Subscription Status Not Updating**
   - Check Clerk webhook is configured correctly
   - Verify webhook handler is saving metadata
   - Check user metadata in Clerk Dashboard

## Next Steps

1. **Customize UI**: Update colors, fonts, and components in `components/` directory
2. **Add More Quiz Topics**: Create topics in the quiz generator
3. **Configure Analytics**: Set up Google Analytics or similar
4. **Set up Monitoring**: Add Sentry or similar error tracking
5. **Optimize Performance**: Add Redis caching for frequently accessed data

## Support

For issues, check:
- [Clerk Documentation](https://clerk.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
