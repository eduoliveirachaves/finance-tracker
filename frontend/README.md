# Frontend - Personal Finance Manager

Technical documentation for the Next.js frontend of the Personal Finance Manager application. This frontend provides a modern, responsive interface for managing accounts, transactions, budgets, and financial reports with real-time data synchronization.

## Overview

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: TanStack React Query (server state)
- **Component Library**: Shadcn/ui (headless, accessible components)
- **Icons**: Lucide React
- **HTTP Client**: Native fetch with custom wrapper

## Pages & Routes

### Route Structure

The frontend uses Next.js App Router with layout groups:
- **`(auth)`**: Public routes for authentication
- **`(app)`**: Protected routes for authenticated users

### Public Routes (Auth Layout Group)

#### Login Page
- **Route**: `/login`
- **File**: `app/(auth)/login/page.tsx`
- **Purpose**: User authentication with email/password
- **Components**: Card, Form (Input, Label, Button)
- **Features**:
  - Email and password inputs
  - Form validation
  - Error display
  - Loading state during submission
  - Link to register page
- **API Call**: `POST /auth/login`
- **Behavior**: On success, redirects to dashboard

#### Register Page
- **Route**: `/register`
- **File**: `app/(auth)/register/page.tsx`
- **Purpose**: New user account creation
- **Components**: Card, Form (Input, Label, Button)
- **Features**:
  - Email and password inputs
  - Password confirmation validation
  - Error display
  - Loading state
  - Link to login page
- **API Call**: `POST /auth/register`
- **Behavior**: On success, redirects to dashboard

---

### Protected Routes (App Layout Group)

All routes under `(app)` are protected by the layout (`app/(app)/layout.tsx`) which:
1. Checks for `access_token` cookie
2. Validates token with `GET /auth/me`
3. Redirects to `/login` if unauthorized

#### Dashboard Page
- **Route**: `/` (dashboard)
- **File**: `app/(app)/page.tsx`
- **Purpose**: Financial overview and summary
- **State**:
  - `year`, `month`: Current view month/year
- **Components**:
  - **DashboardSummary**: 3-card grid (income, expenses, net balance)
  - **BudgetAlertList**: Categories over budget
  - **MonthPicker**: Month/year navigation
  - **AmountDisplay**: Formatted currency
  - Transaction table (recent 5-10 transactions)
- **API Calls**:
  - `GET /dashboard?year={year}&month={month}`
- **Query Key**: `["dashboard", year, month]`
- **Features**:
  - Month navigation with prev/next buttons
  - Real-time budget alerts
  - Recent transaction list
  - Summary metrics (income/expenses/net)

#### Transactions Page
- **Route**: `/transactions`
- **File**: `app/(app)/transactions/page.tsx`
- **Purpose**: List, create, edit, and delete transactions
- **State**:
  - `year`, `month`: Filter by month
  - `categoryFilter`: Optional category filter
  - `editingId`, `showForm`: Form visibility
- **Components**:
  - **TransactionList**: Table view of transactions
  - **TransactionForm**: Modal form for create/edit
  - **MonthPicker**: Month navigation
  - **CategoryFilter**: Dropdown selector
  - **Dialog**, **Button**, **Select**
- **API Calls**:
  - `GET /transactions?year={year}&month={month}&category_id={id}`
  - `POST /transactions`
  - `PUT /transactions/{id}`
  - `DELETE /transactions/{id}`
- **Query Key**: `["transactions", year, month, categoryFilter]`
- **Features**:
  - Month and category filtering
  - Inline edit/delete buttons
  - Modal form for new transactions
  - Automatic query invalidation on mutation

#### Accounts Page
- **Route**: `/accounts`
- **File**: `app/(app)/accounts/page.tsx`
- **Purpose**: Manage bank accounts and cards
- **State**:
  - `mode`: create/edit account/card state
  - Form fields for account/card creation
- **Components**:
  - **AccountCard**: Individual account with nested cards
  - **CardBadge**: Single card display with edit/delete
  - **Dialog** for forms
  - **Button**
- **API Calls**:
  - `GET /accounts`
  - `POST /accounts`
  - `PUT /accounts/{id}`
  - `DELETE /accounts/{id}`
  - `POST /accounts/{id}/cards`
  - `PUT /cards/{cardId}`
  - `DELETE /cards/{cardId}`
- **Query Key**: `["accounts"]`
- **Features**:
  - Grid layout of account cards (responsive: md:2, lg:3 columns)
  - Nested cards under each account
  - Inline edit/delete per card
  - Add card to account
  - Card type indicators (credit vs debit)

#### Categories Page
- **Route**: `/categories`
- **File**: `app/(app)/categories/page.tsx`
- **Purpose**: Create, rename, and manage transaction categories
- **State**:
  - `mode`: create/rename state
  - `editingId`: Category being edited
  - `confirmDelete`: Delete confirmation
- **Components**:
  - **CategoryForm**: Simple text input form
  - **Badge**: Category display
  - **Button**, **Separator**
- **API Calls**:
  - `GET /categories?include_archived=true`
  - `POST /categories`
  - `PUT /categories/{id}`
  - `DELETE /categories/{id}`
- **Query Key**: `["categories", "all"]`
- **Features**:
  - Active and archived sections
  - Inline rename via modal
  - Deletion shows archived instead if used in transactions
  - Empty state messaging

#### Recurring Transactions Page
- **Route**: `/recurring`
- **File**: `app/(app)/recurring/page.tsx`
- **Purpose**: Manage recurring payments and income
- **State**:
  - `editingId`: Recurring being edited
  - Form fields for recurring transaction
- **Components**:
  - **RecurringForm**: Complex form in modal
  - **Badge**: Status indicators (active/inactive)
  - **Separator**, **Button**
- **API Calls**:
  - `GET /recurring`
  - `POST /recurring`
  - `PUT /recurring/{id}`
  - `DELETE /recurring/{id}`
- **Query Key**: `["recurring"]`
- **Features**:
  - Separate sections for active/inactive
  - Toggle enable/disable without delete
  - Edit amount, due day, and category
  - Delete existing recurring
  - Shows all associated data (category, modality, due day)

#### Estimates Page
- **Route**: `/estimates`
- **File**: `app/(app)/estimates/page.tsx`
- **Purpose**: Set monthly budget estimates for categories
- **State**:
  - `year`, `month`: Current month view
  - `editingId`: Estimate being edited
- **Components**:
  - **EstimateForm**: Modal for adding estimate
  - **MonthPicker**: Month navigation
  - **Table**: Two tables (expenses, income)
  - **AmountDisplay**: Formatted currency
  - **Button**
- **API Calls**:
  - `GET /estimates?year={year}&month={month}`
  - `POST /estimates`
  - `PUT /estimates/{id}`
  - `DELETE /estimates/{id}`
- **Query Key**: `["estimates", year, month]`
- **Features**:
  - Separate expense and income estimate tables
  - Inline edit with save/cancel buttons
  - Month/year navigation
  - Delete estimates
  - Shows estimated amount per category per type

#### Reports Page
- **Route**: `/reports`
- **File**: `app/(app)/reports/page.tsx`
- **Purpose**: Compare estimated vs actual spending
- **State**:
  - `year`, `month`: Report month/year
- **Components**:
  - **MonthlyReportTable**: Detailed breakdown
  - **Card**: Summary cards
  - **MonthPicker**: Navigation
  - **AmountDisplay**: Currency formatting
- **API Calls**:
  - `GET /reports/monthly?year={year}&month={month}`
- **Query Key**: `["reports", year, month]`
- **Features**:
  - Summary cards (total estimated/actual for expenses/income)
  - Expense breakdown table (category, estimated, actual, difference)
  - Income breakdown table
  - Over-budget indicators
  - Totals row with bold styling

---

## Components

### Shared Components (`components/shared/`)

#### Navbar.tsx
- **Purpose**: Sidebar navigation for authenticated users
- **Props**: None
- **Features**:
  - Links to all pages (Dashboard, Transactions, Accounts, Categories, Recurring, Estimates, Reports)
  - Active route highlighting
  - User email display
  - Sign out button
  - Lucide icons for visual indicators
- **Dependencies**: `useCurrentUser()`, `logout()`
- **Location**: Used in `(app)` layout

#### AmountDisplay.tsx
- **Props**:
  - `amount: string | number`
  - `className?: string`
- **Purpose**: Format and display currency amounts in Brazilian Real
- **Formatting**: `Intl.NumberFormat` with `pt-BR` locale, `BRL` currency
- **Output Example**: `R$ 1.234,56`
- **Used in**: Tables, summaries, cards, forms

#### MonthPicker.tsx
- **Props**:
  - `year: number`
  - `month: number`
  - `onChange: (year: number, month: number) => void`
- **Purpose**: Navigate between months
- **Features**:
  - Previous/Next buttons
  - Handles year rollover (Dec→Jan, Jan→Dec)
  - Displays month name and year
  - Month name displayed in Portuguese

---

### Module-Specific Components

#### Accounts Components (`components/accounts/`)

**AccountCard.tsx**
- **Props**: Account data, callbacks for edit/delete/add card
- **Purpose**: Display bank account with nested cards
- **Features**:
  - Account name header
  - List of nested CardBadges
  - Add card button
  - Edit/delete buttons
- **Composed from**: Card (UI), Button, CardBadge

**CardBadge.tsx**
- **Props**: Card data, callbacks for edit/delete
- **Purpose**: Display individual card (credit/debit)
- **Features**:
  - Card type icon (CreditCard for credit, Wallet for debit)
  - Card name
  - Edit/delete buttons
  - Badge styling

#### Dashboard Components (`components/dashboard/`)

**DashboardSummary.tsx**
- **Props**: `data: { total_income, total_expenses, net_balance }`
- **Purpose**: Summary cards for financial metrics
- **Features**:
  - 3-column grid layout (responsive)
  - Color coding:
    - Green: Income
    - Red: Expenses
    - Blue: Net (if positive), Red (if negative)
  - AmountDisplay formatting
  - Icon indicators

**BudgetAlertList.tsx**
- **Props**: `alerts: BudgetAlert[]`
- **Purpose**: Display over-budget categories
- **Features**:
  - Red tinted list items
  - Shows estimated vs actual amounts
  - Difference calculation
  - Empty state message

#### Transactions Components (`components/transactions/`)

**TransactionForm.tsx**
- **Props**:
  - `initialData?: Transaction`
  - `onSubmit: (data) => Promise<void>`
  - `onCancel: () => void`
- **Purpose**: Form for creating/editing transactions
- **Fields**:
  - Date picker
  - Amount input (decimal)
  - Type selector (income/expense)
  - Category dropdown (searchable)
  - Modality selector (dinheiro, debito, credito, pix, transferencia)
  - Account/Card hierarchical selector
  - Notes textarea
- **Validation**:
  - Required: date, amount, type, category
  - Optional: account, card, notes
  - Decimal validation on amount
- **State**: Form fields, loading, error
- **API Integration**: POST for create, PUT for edit

**TransactionList.tsx**
- **Props**: `transactions: Transaction[]`, callbacks for edit/delete
- **Purpose**: Table view of transactions
- **Columns**:
  - Date
  - Description (category or notes)
  - Type (income/expense)
  - Modality (payment method)
  - Account/Card
  - Amount (with +/- indicator)
  - Actions (edit, delete)
- **Features**:
  - Color coding by type (green income, red expense)
  - Sortable columns
  - Edit/delete buttons per row
  - Empty state message

---

## State Management & Data Flow

### TanStack React Query

Query management for server state with cache invalidation on mutations.

**Query Key Patterns**:
- `["dashboard", year, month]`
- `["transactions", year, month, categoryFilter]`
- `["accounts"]`
- `["categories", "all"]`
- `["recurring"]`
- `["estimates", year, month]`
- `["reports", year, month]`
- `["auth", "me"]`

### Form State Management

Local React state for forms with error/loading states and validation feedback.

### Authentication Flow

1. **Login/Register**: `POST /auth/login` → Sets `access_token` cookie → Redirects to dashboard
2. **Protected Routes**: Layout checks for cookie and validates with `GET /auth/me`
3. **Unauthorized**: 401 from API → Auto-redirect to `/login`
4. **Token Refresh**: `POST /auth/refresh` refreshes `access_token`

---

## Code Organization

### Directory Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── transactions/page.tsx
│   │   ├── accounts/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── recurring/page.tsx
│   │   ├── estimates/page.tsx
│   │   └── reports/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   └── globals.css
├── components/
│   ├── shared/
│   ├── accounts/
│   ├── dashboard/
│   ├── transactions/
│   ├── categories/
│   ├── recurring/
│   ├── estimates/
│   ├── reports/
│   └── ui/
├── lib/
│   ├── types.ts
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
└── package.json
```

---

## Development Patterns

### Adding a New Page

1. Create page directory: `app/(app)/newfeature/page.tsx`
2. Add route and state management with useQuery
3. Add navigation link in Navbar.tsx

### Adding a New Component

1. Create component file with TypeScript props interface
2. Use consistent pattern with error/loading states
3. Integrate with TanStack React Query for data fetching

### Query Invalidation Pattern

After mutations, invalidate related query keys to refetch fresh data.

### Form Submission Pattern

Standard pattern with error handling, loading states, and success callbacks.

---

## Useful Resources

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Component Library](https://ui.shadcn.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
