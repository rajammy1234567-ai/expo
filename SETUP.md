# VIZ India Digital Expo — Setup & Quickstart Guide

This document outlines exact, step-by-step commands to run and test **VIZ India Digital Expo** locally with zero database setup required.

---

## 1. Quick Prerequisites
- **Node.js**: v18.0+ or v20.0+
- **NPM**: v9.0+
- *MongoDB is optional*: An intelligent in-memory store fallback is built-in and auto-seeded out of the box.

---

## 2. Running the Application

### Step 1: Start Backend Server
Open a terminal in the root directory:
```bash
cd server
npm install
npm run dev
```
- **Backend Port**: `http://localhost:5000`
- **Socket.io**: `ws://localhost:5000`
- **Pre-seeded data loaded**: 6 verified franchise brands across Food, EV, Fitness, Education, Retail, and Salon + 1 pending review brand, 3 demo users, 5 Kanban leads, 2 meetings, and 2 closed deals with server-calculated 3% + GST math.

### Step 2: Start Client Web Portal
Open a second terminal:
```bash
cd client-portal
npm install
npm run dev
```
- **Web App URL**: `http://localhost:5173` (or port indicated in Vite output)

---

## 3. Demo Credentials (1-Click or Manual Email Login)

Password for all pre-seeded accounts: **`Demo@1234`** *(also accepts `Password123`)*

| Persona / Role | Name | Email | Phone | Target Route |
|---|---|---|---|---|
| **Investor** | Rohit Sharma | `rohit.sharma@gmail.com` | `+91 98888 12345` | `/expo-floor` |
| **Brand Admin** | Vikram Sethi | `franchise@burgerblast.in` | `+91 98111 22334` | `/brand-portal` |
| **VIZ Admin (Super Admin)** | VIZ Admin | `admin@vizexpo.in` | `+91 99999 00000` | `/admin-dashboard` |

> 💡 **Tip:** On the landing page (`/`), you can use the **1-Click Demo Personas** buttons to switch between all three roles instantly without restarting the server.

---

## 4. Feature Verification & Walkthrough Guide

### A. 1-Click Demo Switcher & Live Stats Bar
1. Visit `http://localhost:5173`.
2. Observe the **Live Platform Metrics Bar** in the hero section displaying real seeded numbers: GMV, 6+ Verified Brands, 142+ Registered Investors, and Facilitated Deals.
3. Click any of the 3 persona cards (**Rohit Sharma**, **Vikram Sethi**, or **VIZ Admin**) to log in instantly via real JWT authentication.

### B. Mobile OTP Simulation Flow
1. Select the **Mobile OTP** tab on the login screen.
2. Enter a phone number (e.g. `+91 98888 12345`) and click **Send Secure OTP**.
3. A 6-digit dev OTP code is generated server-side and displayed for auto-fill.
4. An active **30-second cooldown timer** counts down before allowing resend.
5. Click **Verify & Launch App** to log in and land on the appropriate workspace.

### C. Registration (New Accounts)
1. Select the **Register** tab.
2. Enter Name, Email, Mobile, Password, and select **Investor** or **Brand Franchisor**.
3. Submitting actually creates a real user and profile in the store and logs the user in immediately without fake alerts.

### D. Investor Experience (`/expo-floor`, `/chats`, `/deals`, `/meetings`)
- **Filter Brands**: Use the budget sliders, category filters (F&B, EV, Fitness, Education, Retail, Salon), and business models (FOFO / FOCO) to query live seeded brands.
- **Compare Brands**: Select 2–4 brands to view side-by-side economics and Capex comparisons.
- **Chat with Founder**: Open any brand detail and click **Chat with Founder** to start a real-time conversation via Socket.io with image upload, typing indicators, and read receipts.
- **Book Discovery Meeting**: Submit meeting dates; meeting records appear under **My Meetings**.
- **My Deals & Pipeline**: View official closed deal records (deal number, 3% success fee, 18% GST invoice) and active pipeline milestone cards.

### E. Brand Admin Experience (`/brand-portal`)
- **Leads Kanban Board**: Drag and drop leads between columns (`New` → `Contacted` → `Meeting Scheduled` → `Negotiation` → `Closed Won`). State changes persist to `PUT /api/leads/:id/stage` and remain after page refresh.
- **Add Franchise Listing Wizard**: Complete the 4-step wizard. The newly created brand enters `PENDING_REVIEW` and is isolated from the public expo floor until approved by VIZ Admin.
- **Record Closed Deal**: Select a lead and enter deal value. The **server strictly calculates** the 3% platform fee + 18% GST and increments the invoice number (`VIZ-DEAL-YYYY-XXXX`).

### F. VIZ Super Admin Experience (`/admin-dashboard`)
- **KYC Queue**: Filter by All, Pending Review, Verified, or Rejected. Click **✓ Approve & Verify** on a pending brand (e.g. *Stealth Organic Cafe*) to immediately publish it to the public expo floor, or **✕ Reject** to deny.
- **Reconciliation Ledger**: View all closed deals across brands. Update status through `PENDING_INVOICE` → `INVOICE_SENT` → `RECEIVED_SETTLED`.
- **Bank Settlement Recording**: When settling, enter the bank transaction/UTR reference (`bankSettlementRef`).
- **Export to CSV**: Click **Export Ledger (.CSV)** to download the entire deal reconciliation ledger.

---

## 5. Security & Isolation Controls
- **Strict Server-Side Fee Math**: Platform fee (3%) and GST (18%) are calculated solely in backend code (`dealController.ts`); client-sent commission numbers are ignored.
- **Tenant Isolation**: Brand Admin operations are strictly scoped by `req.user.brandId` via `verifyBrandOwnership`.
- **Rate Limiting**: Rate limiter applied to `/api/auth/*` (60 requests per 15 minutes per IP).
- **File Upload Safeguards**: Strictly enforces image MIME types (`jpeg`, `png`, `webp`, `gif`) and rejects files exceeding 10MB.
