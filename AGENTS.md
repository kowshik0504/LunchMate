# Rules for Coding Agents & J.A.R.V.I.S. on LunchMate

This guide governs all automated development, refactoring, and collaboration on **LunchMate** for **J.A.R.V.I.S. (Desktop Voice Assistant)** and **AI Coding Assistants (Google Antigravity, Cursor, Claude, and dev_agent)**.

---

## 1. Division of Responsibility

* **J.A.R.V.I.S. (The Commander & Desktop Monitor)**
  * Voice interface for the user (`"Jarvis, check LunchMate status"`, `"Jarvis, start LunchMate dev server"`, `"Jarvis, verify the build"`).
  * Real-time monitoring of live endpoints (`https://lunchmate-1hq9.onrender.com/api/health`, `https://lunch-mate-opal.vercel.app`).
  * Displays status cards in the JARVIS Qt HUD panel and delegates complex code modifications.
* **Google Antigravity & IDE Coding Assistants (The Implementation Engineers)**
  * Full-stack architecture, complex multi-file features, and state machine refactoring.
  * Schema migrations (`npx prisma db push`), production builds (`npm run build`), and git commits.
  * Always updates `.jarvis_bridge.json` after completing major work so JARVIS stays synchronized.

---

## 2. Core Architecture Rules

1. **Frontend**: React 18 + Vite (`frontend/`). State lives centrally in `frontend/src/context/AppStateContext.jsx`. Components access state via `useAppState()`.
2. **Backend**: Express 5 on Node.js (`backend/`). Routes live in `backend/src/routes/` and controllers in `backend/src/controllers/`. Database access is strictly through Prisma (`prisma/schema.prisma`).
3. **Payments & Escrow**:
   * Pay-In: YouPI 0% fee dynamic UPI QR and 12-digit UTR reconciliation (`/api/payments/youpi/*`).
   * Pay-Out: RazorpayX driver disbursement unlocked only upon school gate OTP handshake (`/api/payments/razorpayx/payout`).
4. **Delivery Protocol**: The 8-step delivery procedure in `PROCEDURE.md` is strictly enforced.
5. **No Hardcoded URLs**: Always read `import.meta.env.VITE_API_URL` (Frontend) and `process.env.PORT` / `process.env.DATABASE_URL` (Backend).

---

## 3. Strict Safety & Secret Constraints

* **Protected Files**: NEVER modify or stage `.env`, `.env.*`, `*.key`, `*.pem`, `testing/`, or `.git/` files.
* **Pre-Commit Verification**: Run `npm run build` in `frontend/` before pushing code. Never push broken builds.
* **Bridge State Sync**: Whenever code is committed or fixed, append a log entry to `.jarvis_bridge.json` under `recent_assistant_work`.
