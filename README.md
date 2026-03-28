<div align="center">
<img src="./static/favicon.svg" width="80"/>

# DailyJournal

**DailyJournal work activity and documentation journaling system**

<a href="https://opensource.org/license/mit"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" height="24" /></a>
<a href="https://pnpm.io/"><img src="https://img.shields.io/badge/Package-PNPM-orange?style=flat-square" height="24" /></a>
<img src="https://img.shields.io/badge/Module-ECMAScript-yellow?style=flat-square" height="24" />
</div>

![Preview](https://github.com/user-attachments/assets/036426dc-9410-4562-9a02-cf63fbab3c2e)

## Features
- Create, search, update, and delete journal entry
- Attach activity documentation images and upload them into MinIO storage
- Image resize and compression to WebP to maximize the performance

## Stack Used
- Monolithic [SvelteKit](https://svelte.dev/)
- [Tailwind](https://tailwindcss.com/) with [daisyUI](https://daisyui.com/)
- [MongoDB](https://www.mongodb.com/) with [Mongoose ODM](https://mongoosejs.com/)
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
4. Run the application in development mode
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
4. Optimize the application for production
   ```sh
   pnpm run build
   ```
5. Serve the application using PM2
   ```sh
   pm2 start ecosystem.config.cjs
   ```
