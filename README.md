<div align="center">

# 🎓 College ERP System

### A modern, full-stack college management platform

**React · TypeScript · TanStack Start · Supabase · Tailwind CSS**

[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack](https://img.shields.io/badge/TanStack-Start-EF4444?style=for-the-badge)](https://tanstack.com/start)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

*An integrated interface for managing students, academics, administration, and campus operations.*

</div>

---

## ✨ Overview

**College ERP System** is a full-stack web application designed to bring core college administration workflows into one interface. The repository includes a React/TypeScript frontend, TanStack Start routes and server functions, Supabase authentication and database integrations, and SQL migration files.

> **Project status:** The repository contains the modules listed below. A successful local run and the completeness of individual workflows depend on configuring the connected Supabase project, database schema, and access permissions.

## 🧩 Modules

| Module | Purpose |
|:--|:--|
| 📊 **Dashboard** | Central overview of college information |
| 🎓 **Students** | Student listing, registration and detail pages |
| 🏛️ **Departments & Programs** | Academic organization and program management |
| 📚 **Academics** | Academic administration and course-related workflows |
| 📅 **Attendance** | Attendance-related workflows |
| 📝 **Examinations** | Exam and marks-related workflows |
| 💳 **Fees** | Fee administration |
| 📖 **Library** | Library management |
| 💼 **Placements** | Placement-related workflows |
| 📢 **Communications** | College announcements and communications |
| 🔐 **Authentication & Profile** | Sign-in and user profile pages |
| 🛡️ **Audit Logs** | Audit activity interface |

## 🛠️ Technology stack

| Layer | Technologies |
|:--|:--|
| **UI** | React 19, TypeScript, Tailwind CSS 4, Radix UI |
| **Application framework** | TanStack Start, TanStack Router, Vite 7 |
| **Data fetching** | TanStack Query |
| **Forms and validation** | React Hook Form, Zod |
| **Backend integration** | Supabase JS, Supabase Auth, PostgreSQL |
| **Visualizations and icons** | Recharts, Lucide React |
| **Tooling** | npm / Bun, ESLint, Prettier |

## 🖼️ Screenshots

> Add actual screenshots from your running application to `screenshots/`. The images below are placeholders until screenshots are added.

| Login | Dashboard |
|:--:|:--:|
| *Screenshot coming soon* | *Screenshot coming soon* |

| Student Management | Attendance |
|:--:|:--:|
| *Screenshot coming soon* | *Screenshot coming soon* |

Suggested image paths: `screenshots/login.png`, `screenshots/dashboard.png`, `screenshots/students.png`, and `screenshots/attendance.png`.

## 🚀 Getting started

### 1. Prerequisites

- Node.js **20 or later** and npm (a current LTS release is recommended)
- Git
- A Supabase project configured for this application's schema and authentication

### 2. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/College-ERP-System.git
cd College-ERP-System
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 3. Install dependencies

```bash
npm ci
```

`npm ci` uses the committed `package-lock.json` to install the locked dependencies. Alternatively, run `npm install` if you intentionally need to update the lockfile.

### 4. Configure environment variables

Create a `.env` file in the **same folder as `package.json`**:

```dotenv
# Public client configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY

# Server configuration
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
```

Obtain the appropriate values from your own Supabase dashboard. **Never commit `.env`, database passwords, service-role keys, or private user data.** A service-role key bypasses row-level security and must remain server-only. If you have accidentally committed one, rotate it in Supabase.

The repository contains Supabase SQL migrations under `supabase/`. Apply the required schema and configure the relevant policies and authentication settings in your own Supabase project before testing database-backed features.

### 5. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite in the terminal (commonly `http://localhost:3000`).

### 6. Build and preview

```bash
npm run build
npm run preview
```

### Other scripts

```bash
npm run lint      # Run ESLint
npm run format    # Format the codebase with Prettier
```

## 🗂️ Project structure

```text
College-ERP-System/
├── src/
│   ├── components/           # Reusable UI components
│   ├── integrations/         # Supabase integration
│   ├── lib/                  # Application and server utilities
│   └── routes/               # Authentication and ERP module routes
├── supabase/                 # Supabase-related SQL and migrations
├── local-setup/
│   └── mysql/                # Alternative MySQL schema and seed data
├── package.json              # Dependencies and scripts
├── package-lock.json         # npm dependency lockfile
├── vite.config.ts            # Vite configuration
└── README.md
```

## 🗄️ Database notes

**The current application is integrated with Supabase (PostgreSQL).** The `local-setup/mysql/` folder also includes MySQL schema and example seed files. These are **not a drop-in replacement** for the running Supabase backend. Using MySQL requires adapting server-side data access and authentication; see `local-setup/README.md` for the outline.

Do not treat sample MySQL user accounts as working Supabase credentials, and do not deploy sample passwords to a production environment.

## 🔒 Security and responsible use

- Keep `.env` and `.env.local` out of Git.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `VITE_` variable or client bundle.
- Use appropriate database access policies and role checks.
- Do not commit real student records, financial information, or credentials.
- Review SQL seed data before publishing the repository.

## 🧯 Troubleshooting

| Issue | What to check |
|:--|:--|
| `ENOENT: package.json` | Run commands from the project directory containing `package.json`, not its parent folder. |
| `run is not recognized` | Use **`npm run dev`**, not `run dev`. |
| `python app.py` not found | This is a TypeScript/TanStack application, not a Python Flask app. |
| Supabase authentication fails | Check the `.env` values, auth configuration, and registered users. |
| Database pages fail | Verify migrations, row-level security policies, and server-side environment variables. |
| Port already in use | Use the URL printed by Vite, or stop the process using the port. |

## 🔄 Updating the GitHub repository

```bash
git add .
git status
git commit -m "Update College ERP System"
git push
```

Before committing, review `git status` to ensure no environment files, secrets, or personal data are staged.

---

<div align="center">

### 👨‍💻 Project by Prasad Kumbhar

**MCA Student · Full-Stack Development · Data Analytics**

*Built to explore practical, integrated college management workflows.*

⭐ If you find this project useful, consider starring the repository.

</div>
