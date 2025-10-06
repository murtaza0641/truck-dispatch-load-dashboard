
# Drive Now Logistics Admin Dashboard

This is a Next.js 14 administrative dashboard for Drive Now Logistics. It features CRUD management for Users, Loads, Drivers, and Assignments, styled with Tailwind CSS, and connects to an Express.js backend API running on localhost.

## Features
- Modern, responsive UI with persistent navigation
- CRUD operations for Users, Loads, Drivers, Assignments
- API integration with Express.js backend
- Built with Next.js, Tailwind CSS, and JavaScript

## Getting Started

1. **Install dependencies:**
	```bash
	npm install
	```
2. **Run the development server:**
	```bash
	npm run dev
	```
3. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## API Endpoints
The app expects the backend API to be running locally with the following endpoints:

- `/api/users` (CRUD)
- `/api/loads` (CRUD)
- `/api/drivers` (CRUD)
- `/api/assignments` (CRUD, plus dispatcher/driver queries)

## Project Structure
- `src/app/` — Main app pages and routing
- `src/components/` — Reusable UI components
- `src/utils/` — API utility functions

---

Replace this README as you customize the dashboard for your needs.
