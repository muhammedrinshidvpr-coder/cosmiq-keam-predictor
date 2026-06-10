# CosmIQ KEAM Predictor — Project Guide

## Project Identity & Branding
A B2C SaaS platform named "CosmIQ KEAM Predictor" — an independent commercial product by CosmIQ.

- **Tech Stack:** Next.js (App Router), React, Tailwind CSS, Supabase (PostgreSQL), shadcn/ui
- **Design System:** Premium, modern, minimal. Dark mode by default with glassmorphism elements, electric blue/purple gradients, and sleek data tables. Must feel like a high-end data analytics tool, not a generic college website.

## Core Architecture & Database

### Supabase `cutoffs` Table Schema
| Column | Type | Notes |
|---|---|---|
| `id` | UUID | Primary Key |
| `college_code` | Text | |
| `college_name` | Text | |
| `department` | Text | |
| `phase` | Text | e.g., "Phase 1", "Phase 2" |
| `SM`, `EZ`, `MU`, `LA`, `DV`, `VK`, `BH`, `BX`, `KN`, `KU`, `SC`, `ST`, `EW` | Integer | Category rank cutoffs |

### RLS (Row-Level Security) — CRITICAL
- Enable RLS on `cutoffs` immediately.
- Public `SELECT` policy for anonymous read access.
- Authenticated `ALL` policy (Insert/Update/Delete) for admin only.
- Never leave the database open to public writes.

## Admin Data Pipeline (`/admin`)
- Protected route for uploading KEAM CSV data.
- Use `PapaParse` for client-side CSV parsing before Supabase insert.
- **Data Normalization (run before every insert):**
  1. Strip all trailing periods (`College.` → `College`)
  2. Fix missing spaces after commas (`Engineering,Thrissur` → `Engineering, Thrissur`)
  3. Trim leading/trailing whitespace
- Wrap Supabase inserts in `try/catch` — display toast errors on RLS violations or failures. No silent failures.

## Public Predictor Engine (Main UI)

### Inputs
- `User Rank` — Number input
- `Category` — Dropdown: SM, MU, EZ, LA, DV, VK, BH, BX, KN, KU, SC, ST, EW
- `Phase Selector` — Phase 1, Phase 2, All Phases
- `Search College` — Combobox
- `Search Branch` — Combobox

### Cascading Dropdown Logic
College → Branch dropdowns are linked. Selecting a college filters branches using `.ilike()` query showing only branches at that college.

### Prediction Math
Query `cutoffs` table. A college/branch is a **"Match"** if:
```
user_rank <= historical_cutoff_rank (for selected category)
```

### Empty States
If no colleges match, display a clean "No matches found" graphic. Never render broken UI elements.

## Development Rules
- Run all terminal commands autonomously (Next.js, shadcn/ui, Supabase client installs).
- Ask for Supabase credentials only when ready to configure `.env.local`.
- Provide SQL migrations for the Supabase SQL Editor.

## CSV Data Format
The uploaded CSV files (`Final_Master_Phase1.csv`, `Final_Master_Phase2.csv`) have these columns:
```
Department, College_Code, College_Name, Type, SM, EZ, MU, LA, DV, VK, BH, BX, KN, KU, SC, ST, EW, Other_Categories
```
The `Other_Categories` column contains comma-separated entries like `FW:10197`, `CC:28`, etc. — these are special category codes with rank values. Parse and store them appropriately or ignore non-standard categories.
