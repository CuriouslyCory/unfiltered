# Slak.me - Executive Order Analysis Platform

A modern web application built with the T3 Stack that provides clear, comprehensive, and unbiased analysis of executive orders and bills from the White House. The platform helps citizens understand the implications of important governmental actions by breaking down complex legal documents into clear, actionable insights.

## Features

- 📑 Detailed analysis of executive orders and bills
- 🔍 Risk score assessment for each document
- 📊 Comprehensive breakdowns including:
  - ELI5 (Explain it Like I'm 5) summaries
  - Key points analysis
  - Constitutional implications
  - Potential legal challenges
  - Real-world impacts
  - Historical context
- 🔄 Regular updates and amendments tracking
- 📱 Responsive design with dark/light mode support
- 👤 Admin panel for content management

## Tech Stack

- [Next.js](https://nextjs.org) - React framework for production
- [NextAuth.js](https://next-auth.js.org) - Authentication solution
- [Prisma](https://prisma.io) - Database ORM
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [tRPC](https://trpc.io) - End-to-end typesafe APIs
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```

4. Initialize the database:
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

## Available Scripts

- `pnpm build` - Build the production application
- `pnpm dev` - Start the development server with Turbo
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm format:check` - Check code formatting
- `pnpm format:write` - Fix code formatting
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:backup` - Create database backup

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-source and available under the MIT license.
