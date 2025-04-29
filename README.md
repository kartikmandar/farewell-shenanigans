# Farewell Shenanigans - Multiplayer Game Platform

A production-ready multiplayer game hub built with the latest Next.js, React, and Vercel technologies. This project features real-time multiplayer gameplay, authentication, and persistent leaderboards.

## Architecture

![Architecture Diagram](https://mermaid.ink/img/pako:eNqNkk9rwzAMxb-K8blb2h129gYbLDDYoXSH4SCsJN5qZMtI8v6w77Ma1hU6eEiy9OPx9CQLdA4lSowdOF8pbQuXEgYnbNYxwWsY-O8eRgvZpuGhCTCW4-Ri1EXHAr5GbC1EKI6WQ6p0PJ92TFa5CK4BH3yK4QdScbRl09z05_i7Z1O3iWlHKTHJbqtDf_dJtGQZI45QopOMOUK2FQVkDo4XGMnBa9LYzxP24ZCeJbVnCd54FeXxuP96kDvQNXRoSC_QiPr1kkw5QIRLFFiPV-V-vxv_dPNBwvCKYcJ7r2KGwhtVpxQDpPX3smhlJE95jCZPzIaUpXQgLc0i-4UEkRDvbkzPkDlZlEuVp2qzLp93xXKepctFsazWxWJW5Yt5sc7y-lDR9zRk8p_d0Y7yA6r3PxWK2Vg?type=png)

### Key Components

1. **Frontend**: Next.js 14 App Router with React 19 RC and Server Components
2. **UI**: Material UI v6 with Tailwind CSS 4.1 utilities
3. **State Management**: Zustand v5.0.3 for client-side state
4. **Authentication**: Auth.js v5 (formerly next-auth) with Google OAuth
5. **Data Storage**:
   - Vercel Postgres for users, games, and leaderboards
   - Vercel KV (Redis) for ephemeral room state and presence
6. **Real-time Communication**: WebSockets via Socket.IO
7. **Edge Functions**: Vercel Edge Functions for fast data reads
8. **Cron Jobs**: Automated room cleanup and maintenance

## Tech Stack

- **Frontend**:
  - Next.js 14 App Router
  - React 19 RC
  - Material UI v6
  - Tailwind CSS 4.1

- **Backend**:
  - Vercel Edge Functions
  - Vercel Node.js Functions (for Socket.IO)
  - Vercel Cron Jobs

- **Data Storage**:
  - Vercel Postgres
  - Vercel KV (Redis)

- **Authentication**:
  - Auth.js v5 with Google OAuth

- **Package Management**:
  - pnpm 10.10.0
  - Node.js 22

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/farewell-shenanigans.git
   cd farewell-shenanigans
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Fill in all required environment variables

4. **Set up database**:
   - Create Postgres and KV instances in Vercel Dashboard
   - Run the SQL scripts in `db/schema.sql` to set up the database schema

5. **Development server**:
   ```bash
   pnpm dev
   ```

6. **Production build**:
   ```bash
   pnpm build
   pnpm start
   ```

## Deployment on Vercel

1. **Link to Vercel project**:
   ```bash
   vercel link
   ```

2. **Add Storage**:
   - In Vercel Dashboard, add Postgres and KV to your project

3. **Deploy**:
   ```bash
   vercel deploy
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXTAUTH_SECRET` | Secret for NextAuth.js sessions | Yes |
| `NEXTAUTH_URL` | Full URL of your application | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `KV_URL` | Vercel KV Redis URL | Yes |
| `KV_REST_API_URL` | Vercel KV REST API URL | Yes |
| `KV_REST_API_TOKEN` | Vercel KV API token | Yes |
| `KV_REST_API_READ_ONLY_TOKEN` | Vercel KV read-only token | Yes |
| `POSTGRES_URL` | Vercel Postgres connection URL | Yes |
| `POSTGRES_PRISMA_URL` | Vercel Postgres Prisma URL | Yes |
| `POSTGRES_URL_NON_POOLING` | Vercel Postgres non-pooling URL | Yes |
| `POSTGRES_USER` | Vercel Postgres username | Yes |
| `POSTGRES_HOST` | Vercel Postgres host | Yes |
| `POSTGRES_PASSWORD` | Vercel Postgres password | Yes |
| `POSTGRES_DATABASE` | Vercel Postgres database name | Yes |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | Yes |

## Vercel Quota Limits (Hobby Plan)

| Resource | Limit |
|----------|-------|
| Serverless Functions | 100 GB-hrs/month |
| Edge Functions | 12 invocations/sec |
| Bandwidth | 100 GB/month |
| KV Storage | 200 MB |
| Postgres Storage | 256 MB |
| Cron Jobs | 2 jobs, 1/hr maximum |

## Migration to Vercel Pro

To migrate from Hobby to Pro plan, you'll need to:

1. Upgrade in the Vercel Dashboard
2. Adjust the following:
   - Update `vercel.json` with multiple regions for higher availability
   - Configure larger database sizes
   - Set up custom domains and SSL certificates
   - Configure team access and permissions
   - Set up monitoring and alerts

## Project Structure

```
farewell-shenanigans/
├── db/                   # Database scripts and migrations
├── infra/                # Infrastructure configuration
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router routes
│   │   ├── api/          # API routes
│   │   ├── games/        # Game pages
│   │   ├── history/      # User history page
│   │   ├── profile/      # User profile page
│   │   └── page.tsx      # Next.js page component
│   ├── components/       # Reusable React components
│   ├── lib/              # Utility functions and hooks
│   ├── store/            # Zustand state management
│   ├── theme/            # UI theme configuration
│   └── types/            # TypeScript type definitions
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore configuration
├── next.config.js        # Next.js configuration
├── package.json          # Project dependencies
├── README.md             # Project documentation
└── tsconfig.json         # TypeScript configuration
```

## Features

- **User Authentication**: Google OAuth login with custom gameplay ID
- **Game Lobbies**: Real-time game rooms with host controls
- **Multiplayer Games**: Multiple game types with real-time interaction
- **Leaderboards**: Live score tracking during games
- **User Profiles**: Customizable display names and gameplay IDs
- **Game History**: Track past games and performance
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Dark Mode**: Toggle between light and dark themes

## License

MIT License
