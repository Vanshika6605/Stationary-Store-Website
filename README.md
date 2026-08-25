# 📝 Store Rating Web Application

A full-stack web application built for the Store Rating Coding Challenge. The platform features a robust Role-Based Access Control (RBAC) system with dedicated portals for System Administrators, Store Owners, and Normal Users.

---

## 👥 User Roles & Permissions

| Role | Key Permissions & Functionalities |
| :--- | :--- |
| **`ADMIN`** | • View system-wide dashboard metrics (Total Users, Total Stores, Total Ratings).<br>• User Management: Add new users, list all users with filters (Name, Email, Address, Role) & sorting. View Store Owner store ratings.<br>• Store Management: Add new stores, list all stores with overall ratings & filters. |
| **`STORE_OWNER`** | • Dedicated Owner Dashboard showing average store rating & total ratings count.<br>• View list of users who rated their specific store along with their rating score & date.<br>• Password Management: Update account password with validation. |
| **`NORMAL`** | • Store Exploration: Search stores by Name and Address with sorting.<br>• Interactive 5-Star Rating: Submit or modify ratings (1-5 stars) for any store.<br>• Password Management: Update account password. |

---

## 🔑 Demo & Test Credentials

The database comes pre-seeded with sample test accounts for evaluation:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@storerating.com` | `AdminPass@123` |
| **Store Owner** | `owner@storerating.com` | `OwnerPass@123` |
| **Normal User** | `user@storerating.com` | `UserPass@123` |

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js, JWT, bcryptjs, Zod
* **Database & ORM:** PostgreSQL, Prisma ORM (Prisma 7 with `@prisma/adapter-pg`)
* **Frontend:** ReactJS (Vite), React Router v6, React Hook Form, Zod, Lucide Icons

---

## ⚙️ Local Setup Instructions

### 1. Database & Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Push database schema to PostgreSQL
npx prisma db push

# (Optional) Seed demo accounts & sample store
node prisma/seed.js

# Start backend dev server (runs on http://localhost:5000)
npm run dev
```

### 2. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite frontend server (runs on http://localhost:5173)
npm run dev
```

---

## 🌿 Git Branch Structure

- `feat/step1-auth-middleware`: JWT verification & RBAC middleware.
- `feat/step2-admin-functionalities`: Admin dashboard, user management, and store management APIs.
- `feat/step3-user-functionalities`: Normal user password update, store search, and rating submission APIs.
- `feat/step4-owner-functionalities`: Store owner password update and dashboard APIs.
- `feat/step5-frontend-development`: React frontend with AuthContext, Zod forms, and role dashboards.