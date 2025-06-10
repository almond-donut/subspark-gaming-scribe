# VODSCRIBE Web Application

## Overview

VODSCRIBE is a web application that provides subtitle generation services for content creators. Users can submit videos for subtitling and manage their requests through a comprehensive dashboard.

## Features

- **Authentication System**: Complete user authentication with login, signup, and session management
- **Subscription Management**: Different subscription tiers with credit-based usage tracking
- **Payment Integration**: Support for PayPal and Ko-fi payment processors
- **Dashboard Interface**: User-friendly dashboard to track subscription usage and request history
- **Webhook Integration**: Real-time payment status updates from payment processors

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Supabase for authentication and database
- **API**: Express.js for webhook handling
- **Payment Processing**: PayPal and Ko-fi integrations

## Getting Started

### Prerequisites

- Node.js 18+ and npm/bun
- Supabase account
- PayPal Developer account (for payment processing)
- Ko-fi account (for alternative payment processing)

### How to edit this code

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e977fe36-3553-4b60-af25-ac980f45d099) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Set up environment variables
cp .env.example .env
# Then edit .env with your actual values

# Step 5: Run development servers
# For frontend only
npm run dev

# For API server only (webhooks)
npm run dev:server

# For both frontend and API server
npm run dev:all

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Supabase (Authentication and Database)
- Express.js (API server for webhooks)

## Webhook System

The application includes a webhook system to receive real-time payment status updates from PayPal and Ko-fi. These webhooks allow the application to automatically:

1. Update subscription statuses when payments are completed
2. Handle payment failures and refunds
3. Track subscription renewals and cancellations

### Setting up webhooks

1. **PayPal Webhooks**
   - Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
   - Set up a webhook pointing to `https://your-domain.com/api/webhooks/paypal`
   - Add the webhook secret to your `.env` file

2. **Ko-fi Webhooks**
   - Log in to your [Ko-fi account](https://ko-fi.com)
   - Go to Settings > API
   - Set up a webhook pointing to `https://your-domain.com/api/webhooks/kofi`
   - Add the verification token to your `.env` file

For detailed documentation about webhook implementation and testing, see:
- [Webhook Documentation](./docs/WEBHOOKS.md)
- [Production Deployment Guide](./docs/WEBHOOK-DEPLOYMENT.md)
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/e977fe36-3553-4b60-af25-ac980f45d099) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
