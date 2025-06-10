# VODSCRIBE Authentication and Subscription System

This document explains how the authentication and subscription management system works in VODSCRIBE.

## System Overview

The VODSCRIBE application uses Supabase for authentication and database functionality. The authentication flow is as follows:

1. Users can access free previews without authentication
2. Authentication is required for paid plans
3. When purchasing a paid plan, users are redirected to login/signup if not authenticated
4. User subscriptions track credits used and remaining based on the selected plan
5. The dashboard displays subscription status and request history

## Database Structure

The system uses the following database tables:

### Users Table
- Stores user profile information
- Links to Supabase auth.users via UUID
- Contains name, email, and creation timestamps

### Subscriptions Table
- Tracks active subscriptions for users
- Contains plan type, status, credits used/total
- Links to users via user_id

### Requests Table
- Stores all subtitle requests
- Tracks status, payment status, and content information
- Can be linked to users when authenticated

### Payments Table
- Records payment history
- Links to users and subscriptions

## Subscription Tiers

- **Free Preview**: 1 credit for basic translation preview (no login required)
- **Starter**: $4.99 - 2 credits for full translations (login required)
- **Quick Clips**: $11.99 - 8 credits with weekly reset (login required)
- **Creator Pro**: $44.99 - 50 credits per month (login required)

## Authentication Flow

1. Users submit free preview requests without login
2. When upgrading to paid plans, they are guided to create an account
3. Once authenticated, they can purchase subscription plans
4. Credits are assigned based on the subscription tier
5. Dashboard allows users to track credit usage and request history

## Dashboard Features

The dashboard provides:

1. Overview of subscription status and credits remaining
2. History of requests and their current status
3. Download links for completed translations
4. Account management options

## Setup Instructions

### Supabase Configuration

1. Create a Supabase project
2. Run the migration SQL script in `supabase/migrations/20250610_init_db.sql`
3. Update the Supabase URL and anon key in `src/integrations/supabase/client.ts`
4. Enable Email Auth provider in Supabase Auth settings

### Local Development

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Test authentication flow by clicking "Login" or purchasing a paid plan

### Environment Variables

For a production environment, create a `.env` file with:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Implementation Details

- AuthContext provides user state management across the application
- Authentication is handled by Supabase Auth
- Payment is integrated with PayPal, Ko-fi, and Wise
- Subscription data is stored and updated in Supabase
- Row-level security ensures users can only access their own data
