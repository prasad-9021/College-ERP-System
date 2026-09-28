# College ERP — Local Setup with MySQL

This guide helps you run the College ERP project on your own laptop using **MySQL** as the database.

> **Note:** The cloud version of this app uses Supabase (PostgreSQL). For local development, we provide MySQL-compatible schema + sample data here. You will need to adapt the data-access layer (`src/lib/*.functions.ts` and `src/integrations/supabase/*`) to talk to MySQL — see "Connecting the App" below.

---

## 1. Prerequisites

Install these on your machine:

| Tool         | Version | Download                                              |
| ------------ | ------- | ----------------------------------------------------- |
| Node.js      | 20+     | https://nodejs.org                                    |
| Bun          | latest  | https://bun.sh                                        |
| MySQL Server | 8.0+    | https://dev.mysql.com/downloads/mysql/                |
| MySQL Workbench *(optional GUI)* | latest | https://dev.mysql.com/downloads/workbench/ |

---

## 2. Create the Database

Open a terminal and run:

```bash
# Log in to MySQL (will prompt for your root password)
mysql -u root -p

# OR pipe the SQL files directly:
mysql -u root -p < local-setup/mysql/01_schema.sql
mysql -u root -p < local-setup/mysql/02_seed_data.sql
```

This creates:

- A database called **`college_erp`**
- All ERP tables (users, students, courses, fees, library, placements, etc.)
- Example data: 5 users, 5 students, 3 departments, courses, fees, books, drives, announcements

### Verify

```bash
mysql -u root -p -e "USE college_erp; SHOW TABLES; SELECT COUNT(*) AS students FROM students;"
```

You should see ~17 tables and `5` students.

---

## 3. Default Login Credentials

All seeded users share the password **`password123`**.

| Email                     | Role         |
| ------------------------- | ------------ |
| admin@college.edu         | Super Admin  |
| principal@college.edu     | Principal    |
| hod.cse@college.edu       | HOD (CSE)    |
| faculty1@college.edu      | Faculty      |
| librarian@college.edu     | Librarian    |

> The seed file uses a bcrypt hash for `password123`. If you change the password hashing library, regenerate the hashes.

---

## 4. Environment Variables

Create a file named **`.env.local`** in the project root:

```env
# MySQL connection
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_mysql_password
DATABASE_NAME=college_erp

# App
SESSION_SECRET=change-me-to-a-long-random-string
NODE_ENV=development
```

---

## 5. Install & Run

```bash
# Install dependencies
bun install

# Add a MySQL driver (recommended: mysql2)
bun add mysql2

# Run dev server
bun run dev
```

App will be at: **http://localhost:3000**

---

## 6. Connecting the App to MySQL

The current code uses Supabase (PostgreSQL). To switch to MySQL:

1. **Create a connection helper** — e.g. `src/lib/db.server.ts`:

   ```ts
   import mysql from "mysql2/promise";

   export const db = mysql.createPool({
     host: process.env.DATABASE_HOST,
     port: Number(process.env.DATABASE_PORT ?? 3306),
     user: process.env.DATABASE_USER,
     password: process.env.DATABASE_PASSWORD,
     database: process.env.DATABASE_NAME,
     waitForConnections: true,
     connectionLimit: 10,
   });
   ```

2. **Rewrite server functions** under `src/lib/*.functions.ts` to use `db.query(...)` instead of `context.supabase.from(...)`.

   Example:
   ```ts
   const [rows] = await db.query(
     "SELECT * FROM students WHERE status = ? ORDER BY created_at DESC LIMIT 500",
     ["active"]
   );
   return rows;
   ```

3. **Replace auth** — `src/integrations/supabase/auth-middleware.ts` validates a Supabase JWT. For local MySQL, swap it for session-cookie auth (e.g. using `jose` for JWT or `express-session`) that looks up `users` + `user_roles` from MySQL.

> Tip: keep the existing function names (`listStudents`, `createStudent`, etc.) so the React routes don't need to change.

---

## 7. Database Schema Overview

| Module          | Tables                                                                 |
| --------------- | ---------------------------------------------------------------------- |
| **Auth**        | `users`, `user_roles`                                                  |
| **Org**         | `departments`, `programs`, `batches`                                   |
| **Students**    | `students`                                                             |
| **Academics**   | `courses`, `course_offerings`, `timetable_slots`                       |
| **Attendance**  | `attendance_sessions`, `attendance_records`                            |
| **Exams**       | `exams`, `exam_marks`                                                  |
| **Fees**        | `fee_invoices`, `fee_payments`                                         |
| **Library**     | `library_books`, `library_loans`                                       |
| **Placements**  | `placement_companies`, `placement_drives`, `placement_applications`    |
| **Comms**       | `announcements`                                                        |
| **Audit**       | `audit_log`                                                            |

A full ER diagram of the relationships is described in `01_schema.sql` comments.

---

## 8. Reset the Database

To wipe and reload:

```bash
mysql -u root -p < local-setup/mysql/01_schema.sql
mysql -u root -p < local-setup/mysql/02_seed_data.sql
```

(The first file drops and recreates the `college_erp` database.)

---

## 9. Common Issues

| Problem                                 | Fix                                                                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| `Access denied for user 'root'`         | Use correct MySQL root password, or create a dedicated user with `GRANT ALL`.        |
| `ER_NOT_SUPPORTED_AUTH_MODE`            | Run `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pw';`   |
| Port 3000 already in use                | Change `PORT` in `.env.local` or kill the other process.                             |
| Foreign-key errors when re-seeding      | Re-run `01_schema.sql` first — it drops and recreates the whole database.            |

---

## 10. Next Steps

- Add more seed data in `02_seed_data.sql`
- Build the MySQL-backed auth flow
- Convert each `*.functions.ts` file to use `mysql2` queries
- Add backups: `mysqldump -u root -p college_erp > backup.sql`

Happy hacking! 🎓
