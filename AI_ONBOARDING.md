# Inbound Advantage - Admin UI: AI Onboarding & Architecture Guide

## 1. Project Overview & Mission
**Inbound Advantage** is a lead assignment and workflow automation platform. This repository works as the **Admin UI** (internal tool) that allows operators to configure complex assignment rules for customers.

**Primary Goal**: Enable the configuration of precise "Rule Groups" that determine how incoming leads (e.g., from HubSpot) are routed, tagged, or processed.
**Key Priority**: Reliability and clarity. Operators must easily understand the logic flow (Customer -> Groups -> Rules).

---

## 2. Technology Stack
*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS v4 + shadcn/ui components
*   **Database**: Supabase (PostgreSQL)
*   **State Management**: React Server Components (fetching) + local React state (forms/interactivity). No global state store (Redux/Zustand) is currently used or needed.
*   **Deployment**: Localhost (currently).

---

## 3. Database Schema & Data Model
The data model is designed around `domain` as a stable business identifier, though `customers` uses a UUID Primary Key.

### 3.1. Customers Table
*   **PK**: `id` (UUID)
*   **Business Key**: `domain` (Text, Unique). *Crucial: Relationships often use `domain`.*
*   **Core Fields**: `company_name`, `primary_contact_name`, `hubspot_access_token`.

### 3.2. Rule Groups (`rule_groups`)
*   **Concept**: A logical container for rules. Example: "Enterprise Routing" or "Competitor Tagging".
*   **PK**: `id` (UUID)
*   **FK**: `customer_domain` references `customers(domain)`. *Note: references `domain`, not `id`.*
*   **Fields**:
    *   `action_type`: What happens if rules match (e.g., 'assign', 'tag').
    *   `evaluation_mode`: 'first_match' (stop after first hit) or 'all_match' (evaluate all).
    *   `priority`: Integer for ordering groups.

### 3.3. Rules (`rules`)
*   **Concept**: An individual condition-action pair.
*   **PK**: `id` (UUID)
*   **FK**: `rule_group_id` references `rule_groups(id)`.
*   **Fields**:
    *   `name`: Human-readable name.
    *   `trigger_type`: Event triggering evaluation (e.g., "Contact created").
    *   `field`, `operator`, `value`: The condition logic (e.g., `employee_count > 100`).
    *   `action_value`: The outcome (e.g., "Assign to Sarah").

---

## 4. Architecture & Key Pattern Decisions

### 4.1. Server vs. Client Components
*   **Server Components** (`src/app/customers/[id]/page.tsx`): Responsible for initial data fetching. We fetch `customers` and join `rule_groups` (+ nested `rules`).
*   **Client Components** (`CustomerDetail.tsx`, `RuleGroupCard.tsx`): Responsible for interactivity (expanding groups, adding rules, deleting items).

### 4.2. Identification Strategy
*   **Hybrid ID/Domain Usage**:
    *   The UI URL structure is `/customers/[domain]`.
    *   We query the `customers` table by `domain` match.
    *   This allows friendly URLs (`/customers/securitypalhq.com`) and reliable deep linking.

### 4.3. UI Component Hierarchy
1.  **`CustomerList`**: Searchable table of customers.
2.  **`CustomerDetail`**: Parent container. Manages the state of rule groups.
    *   **`CreateRuleGroupForm`**: Form to spawn new groups.
    *   **`RuleGroupCard`**: Visual container for a specific group.
        *   **`CreateRuleForm`**: Nested form to add rules *specifically* to that group context.

---

## 5. Critical Workflows

### 5.1. Creating a Rule Group
1.  User enters Name, Action Type, Evaluation Mode.
2.  Submits to `rule_groups` table with `customer_domain`.
3.  UI optimistically updates or re-fetches to show the new card.

### 5.2. Creating a Rule
1.  User expands a `RuleGroupCard`.
2.  Fills out Trigger, Condition, and Action.
3.  Submits to `rules` table with `rule_group_id`.
4.  Rule is appended to that specific group's list.

---

## 6. Future Roadmap & "Gotchas"
*   **Priority/Ordering**: The DB has `priority` columns, but currently the UI might rely on insertion order or simple sorting. Implementing Drag-and-Drop ordering is a high-value future task.
*   **Complex Operators**: Currently supports basic strings/numbers. Future need for `IN`, `CONTAINS`, `IS_EMPTY`.
*   **Authentication**: Currently disabled/non-existent. Must be added before public/cloud deployment.
*   **Validation**: Frontend validation is basic. Stronger Zod schema validation on forms is recommended.

## 7. How to Resume Work
1.  **Run Dev**: `npm run dev` (Port 3000).
2.  **Env**: Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are valid.
3.  **Check Schema**: If you see errors about "relation does not exist", ensure the `rule_groups` table exists via standard SQL creation.
