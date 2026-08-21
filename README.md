# CyberFolio

A Vercel-compatible portfolio for a cyber/hacker aesthetic + professional web designer identity.

## Features

- Facebook-style cover/banner + profile photo
- Home, About, Skills, Services, Projects, Experience, Achievements, Tools, Testimonials
- GitHub activity placeholder
- Dark/light theme
- Project filtering + project modal
- Hire Me / Web Making contact form
- Private admin dashboard
- Client request status: New / Contacted / Working / Completed
- Admin notes
- Contact actions
- MongoDB persistence
- Node.js API compatible with Vercel

## Setup

1. Create a MongoDB Atlas database.
2. Copy `.env.example` to `.env.local`.
3. Fill in the MongoDB URI and strong admin credentials.
4. Replace `public/assets/avatar.svg` and `public/assets/banner.svg` with your own images later.
5. Run locally with `npm install` then `npm run dev`.
6. Deploy the repository to Vercel and add the same environment variables in Project Settings.

## Important

Do not commit `.env.local` or real passwords/secrets to GitHub.

The contact form collects client information. Keep the privacy notice visible and only collect information needed to discuss a project.


## Portfolio projects

01 — Ramadan Mubarak: https://ramadan-mubarak-mehedi.vercel.app/
02 — NYSH Vault X: https://nyshvaultx.vercel.app/
03 — Happy Birthday Gift: https://happy-birthday-gift-mehedi.vercel.app/
