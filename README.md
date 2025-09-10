# Loan-borrower-UI

The borrower interface for Krida's product. This application allows borrowers to submit loan applications, upload documents, and track their application status.

## Technologies

- Framework: [React](https://reactjs.org/)
- Server: [TanStack Start](https://tanstack.com/start/latest)
- State Management: [TanStack Query](https://tanstack.com/query/latest)
- UI Library: [Mantine UI](https://mantine.dev/)
- Authentication: [Clerk](https://clerk.dev/)
- Icons: [Tabler Icons](https://tabler.io/icons) & [Huge Icons](https://hugeicons.com/)

## Features

- **User Authentication**: Secure signup and login via Clerk
- **Loan Application**: Multi-step application form with validation
- **Document Upload**: Drag-and-drop document upload with support for various file types
- **Application Dashboard**: Track application status and progress
- **Email Verification**: Email verification flow for new users
- **Invitation System**: Accept invitations to join organizations

## Screenshots

Here are some screenshots of the borrower interface:

### Dashboard

### Loan Application Form

### Document Upload

### Confirmation Page

## Getting Started

### Prerequisites
- [pnpm](https://pnpm.io/) installed
- Clerk account and API keys

### Installation

1. Navigate to the borrower-ui directory:
   ```bash
   cd frontend/borrower-ui
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables by creating a `.env` file:
   ```env
   CLERK_SECRET_KEY=<your-clerk-secret-key>
   CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
   ```

4. Start the development server:
   ```bash
   pnpm run dev
   ```

The application will be available at `http://localhost:3001`.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CLERK_SECRET_KEY` | Clerk secret key for server-side authentication | Yes |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key for client-side authentication | Yes |

## Scripts

- `pnpm run dev` - Start development server on port 3001
- `pnpm run build` - Build the application for production
- `pnpm run start` - Start the production server
- `pnpm run lint` - Run linting
- `pnpm run lint:fix` - Fix linting issues
- `pnpm run format` - Check code formatting
- `pnpm run format:fix` - Fix code formatting
- `pnpm run check` - Run all checks
- `pnpm run check:fix` - Fix all issues

## Local Development with ngrok

### Why ngrok?

This application uses Clerk webhooks to handle organization membership events (see `src/routes/_callbacks/clerk-organization-membership-creation.ts`). When a user is added to an organization in Clerk, a webhook is sent to create the corresponding user in our backend service via the bouncer client.

Since webhooks require a publicly accessible URL, we use ngrok to expose our local development server to the internet during development.

### Setting up ngrok

1. Install ngrok:
   ```bash
   npm install -g ngrok
   # or
   brew install ngrok
   ```

2. Start your development server:
   ```bash
   pnpm run dev
   ```

3. In a separate terminal, expose your local server (assuming it runs on port 3001):
   ```bash
   ngrok http 3001
   ```

4. Copy the public ngrok URL (e.g., `https://abc123.ngrok.io`) and configure it in your Clerk dashboard:
   - Go to your Clerk dashboard
   - Navigate to Webhooks
   - Click "Add Endpoint"
   - Set the endpoint URL to: `https://your-ngrok-url.ngrok.io/_callbacks/clerk-organization-membership-creation`
   - Enable the `organizationMembership.created` event
   - Copy the webhook secret (starts with `whsec_`) and add it to your `.env` file as `CLERK_WEBHOOK_SECRET`

5. **Important**: Update `vite.config.ts` to allow ngrok hosts by adding your ngrok subdomain to the `allowedHosts` array:
   ```typescript
   server: {
     port: 3001,
     allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', 'your-ngrok-subdomain.ngrok.io']
   }
   ```

For detailed webhook setup instructions, see the [Clerk webhook documentation](https://clerk.com/docs/webhooks/sync-data#create-a-route-handler-to-verify-the-webhook).

### Webhook Flow

When a user joins an organization in Clerk:
1. Clerk sends a webhook to our ngrok URL
2. The webhook handler verifies the request and extracts user data
3. A new user is created in the backend via the bouncer service
4. The user role is determined based on their Clerk organization role (`org:loan_officer` or `org:loan_applicant`)


## Application Structure

```
src/
├── components/                                         # Reusable UI components
│   ├── application/
│   │   ├── reviewSections/                             # Review Page Forms
│   │   │   ├── BusinessInfoSection/
│   │   │   │   ├── BusinessInfoSection.tsx
│   │   │   │   ├── BusinessInfoSection.module.css
│   │   │   ├── FinancialStatementSection/
│   │   │   │   ├── ContingentLiabilitiesSection.tsx
│   │   │   │   ├── FinancialAndLiabilitiesSection.tsx
│   │   │   │   ├── FinancialStatementSection.tsx
│   │   │   │   ├── FinancialStatementSection.module.css
│   │   │   ├── PersonalInfoSection/
│   │   │   │   ├── ContactInfoSection.tsx
│   │   │   │   ├── OwnerInfoSection.tsx
│   │   │   │   ├── PersonalInfoSection.tsx
│   │   │   │   ├── PersonalInfoSection.module.css
│   │   ├── UploadFlowIndicator.tsx                     # Upload flow 
│   │   ├── UploadFlowIndicator.module.css
│   ├── root/
│   │   ├── ExpandableIconLink/                         # Navbar link
│   │   │   ├── ExpandableIconLink.tsx
│   │   │   ├── ExpandableIconLink.module.css
│   │   │   ├── index.ts
│   ├── DefaultCatchBoundary.tsx
│   └── NotFound.tsx
├── routes/                                             # Application routes
│   ├── authed/
│   │   ├── _mainLayout/
│   │   │   ├── upload/                                 # Upload flow pages
│   │   │   │   ├── confirmation.tsx                    # Confirmation page
│   │   │   │   ├── confirmation.module.css
│   │   │   │   ├── index.tsx                           # Upload page
│   │   │   │   ├── review.tsx                          # Review page
│   │   │   │   ├── submit.tsx                          # Submit page
│   │   │   │   ├── submit.module.css
│   │   │   │   ├── upload.module.css
│   │   │   ├── dashboard.tsx                           # Application home page
│   │   ├── _mainLayout.tsx                             # Shared layout
│   │   ├── _mainLayout.module.css                      
│   │   ├── accept-invitation.tsx                       # Organization invitations
│   │   ├── verify-email.tsx                            # Email verification
│   ├── __root.tsx                                      # Root layout
│   ├── authed.tsx                                      # User authentication
│   ├── authed.module.css 
│   ├── index.tsx                                       # User direction
│   └── signin.tsx                                      # User signin
├── styles/                                             # Global styles and theme
│   ├── app.css
│   └── theme.ts
├── server.tsx                                          # Server-side rendering setup
└── router.tsx                                          # Router configuration
```

## Development

### Authentication Flow

1. **Signup**: Users create accounts through the signup page
2. **Email Verification**: New users must verify their email addresses
3. **Organization Invitations**: Users can be invited to join organizations
4. **Dashboard Access**: Verified users can access their dashboard

### Styling

The application uses Mantine UI components with custom theming. Styles are organized in:
- `src/styles/app.css` - Global styles
- `src/styles/theme.ts` - Mantine theme configuration

### Code Quality

This project uses Biome for code linting and formatting. Run checks before committing:

```bash
pnpm run check:fix
```

## Production Build

To build the application for production:

```bash
pnpm run build
```

The built files will be in the `dist/` directory.

## Deployment

The application is built as a static site that can be deployed to any static hosting service. Ensure environment variables are properly configured in your deployment environment.

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for type safety
3. Test your changes thoroughly
4. Run linting and formatting checks before submitting
