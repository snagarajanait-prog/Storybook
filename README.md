# ACSE AI — Demo Website

A front-end demo for the ACSE AI utility-automation product, built from the
July 14 client meeting requirements. It presents a marketing site **and** an
interactive AI-assistant demo where a visitor picks a synthetic customer and
watches the assistant resolve utility requests end-to-end.

> All data is synthetic. Nothing is sent anywhere — the whole experience runs in
> the browser.

## Tech stack

- **React + Vite** (TypeScript)
- **shadcn/ui** components (Radix + Tailwind CSS)
- **Redux Toolkit** for state (`dataSource` toggle + `demo` flow)
- **lucide-react** icons, **sonner** toasts

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build
```

## How it maps to the client's requirements

| Requirement (from the meeting) | Where it lives |
| --- | --- |
| No login / website open to everyone | Demo opens straight to the customer list — no auth |
| **List of values** of predefined customers sets the chatbot context | `src/components/demo/CustomerSelect.tsx`, `src/data/customers.ts` (several have multiple accounts) |
| Chatbot greets with the customer and offers use-case pills + free text | `src/components/demo/ChatWindow.tsx` |
| **Storyboards** — pick a use case, the AI plays it start→finish ("showtime") | `src/data/scenarios.ts` (start/stop/transfer, high bill, payment plan, outage, contact update, leak) |
| Account dashboard: address, dues, month-on-month usage, notifications | `src/components/demo/AccountDashboard.tsx` |
| **Internal-only C2M ↔ Autonomous DB toggle**, not exposed to end users | `src/components/demo/DataSourceToggle.tsx` (corner control) — its choice is interpolated live into the conversation, e.g. *"Reading history from C2M (live)…"* vs *Autonomous DB* |
| Lead capture for interested prospects | Contact form in `src/components/sections/ContactSection.tsx` (stored in Redux) |
| ACSE branding (dark navy / cyan / red) | `src/index.css` + `tailwind.config.js` |

### The internal data-source toggle

The corner **"Internal control"** panel flips the assistant between:

- **Autonomous DB (ATP)** — synthetic data; the default for the public demo so
  the real C2M application is never touched.
- **C2M (live)** — the internal path used to prove the flow end-to-end.

It sits above the demo dialog on purpose, so an operator can flip it mid-demo.
In production this control would **not** be shown to end users.

## Project structure

```
src/
  components/
    ui/          shadcn primitives
    layout/      Navbar, Footer, Logo
    sections/    Hero, Demo, Platform, UseCases, Billing, Contact
    demo/        DemoDialog, CustomerSelect, AccountDashboard,
                 ChatWindow, DataSourceToggle, DemoLauncher
  data/          customers, useCases, scenarios (all mock)
  store/         Redux Toolkit slices (dataSource, demo)
```
