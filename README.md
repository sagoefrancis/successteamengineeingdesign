# S.T.E.D — SuccessTeam Engineering Design

A modern static website for showcasing engineering design proposals, CAD concept samples, and client-facing project communication. The project is designed to present technical work in a clean, premium format while giving an admin dashboard for publishing proposal content.

## Overview

This project combines:

- a public-facing portfolio/proposal site
- an admin interface for uploading and managing proposals
- CAD sample presentation for design concepts
- Supabase-backed data storage for persistent proposals and design assets
- WhatsApp-based client request flow for proposal access

## Features

- Public landing page with engineering design branding
- Proposal gallery and viewing interface
- Admin dashboard for content management
- Supabase integration for proposals and CAD sample data
- File/image support for uploaded design assets
- Responsive layout for desktop and mobile viewing
- Contact and WhatsApp request actions for client engagement

## Project structure

```text
.
├── admin.html
├── admin.js
├── cad.js
├── config.js
├── database.js
├── index.html
├── login.html
├── proposals.html
├── proposals.js
├── script.js
├── styles.css
├── SETUP.md
├── README.md
└── .gitignore
```

## Tech stack

- HTML5
- CSS3
- JavaScript
- Supabase
- GitHub Pages / Netlify / Vercel deployment compatible

## Local setup

1. Clone the repository:

```bash
git clone https://github.com/sagoefrancis/successteamengineeingdesign.git
cd successteamengineeingdesign
```

2. Open the project in a browser.

Because this is a static website, you can run it by simply opening `index.html` in a browser, or by serving the folder locally with a simple static server.

Example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Supabase configuration

The app uses Supabase for persistent proposal and CAD data.

1. Create a Supabase project.
2. Copy your project URL and public anon key.
3. Update the values in `config.js`:

```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

4. Follow the database and storage setup in `SETUP.md` to create the required tables and storage buckets.

## Admin access

- Open `login.html` to sign in.
- Use the admin user created in Supabase authentication.
- After login, the dashboard is available through `admin.html`.

## Deployment

This project is compatible with static hosting platforms such as:

- GitHub Pages
- Netlify
- Vercel

For deployment instructions, refer to the setup guide in `SETUP.md`.

## Business purpose

S.T.E.D is positioned as a professional engineering design and proposal studio. It helps communicate technical capability, present proposal concepts clearly, and enable a streamlined request workflow for clients.

## Contact

- Email: info.sted.eng@gmail.com
- WhatsApp: +233 55 877 5196

## License

This project is for portfolio and business use. Please check with the owner before reusing it for commercial distribution outside the intended project scope.
