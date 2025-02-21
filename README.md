# DailyJournal
<a href="https://opensource.org/license/mit"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" height="24" /></a>
<a href="https://pnpm.io/"><img src="https://img.shields.io/badge/Package-PNPM-orange?style=flat-square" height="24" /></a>
<img src="https://img.shields.io/badge/Module-ECMAScript-yellow?style=flat-square" height="24" />

DailyJournal work activity and documentation journaling system

![image](https://github.com/user-attachments/assets/727d6701-ce13-41d5-acfa-da519f252c51)

## Features
- Create, search, update, and delete journal entry
- Attach activity documentation images and upload them into MinIO storage
- Image resize and compression to WebP to maximize the performance

## Stack Used
- [SvelteKit](https://svelte.dev/)
- [Tailwind](https://tailwindcss.com/)
- [daisyUI](https://daisyui.com/)
- [MySQL](https://www.mysql.com/)
- [Prisma ORM](https://www.prisma.io/orm)
- [MinIO](https://min.io/)

## Local Preview
1. Clone this repository to your local computer
2. Copy the default environment file and ensure all variables are correctly filled
   ```sh
   cp .env.example .env
   ```
3. Install all required dependencies
   ```sh
   pnpm i
   ```
4. Generate the Prisma client for database connection
   ```sh
   npx prisma generate
   ```
5. Run the application in development mode
   ```sh
   pnpm run dev
   ```

## Deployment
1. Clone this repository to the development server
2. Copy the default environment file and ensure all variables are correctly filled
   ```sh
   cp .env.example .env
   ```
3. Install all required dependencies
   ```sh
   pnpm i
   ```
4. Generate the Prisma client for database connection
   ```sh
   npx prisma generate
   ```
5. Optimize the application for production
   ```sh
   pnpm run build
   ```
6. Serve the application using PM2
   ```sh
   pm2 start ecosystem.config.cjs
   ```
