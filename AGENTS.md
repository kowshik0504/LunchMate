# Rules for Coding Agents & J.A.R.V.I.S. on LunchMate

This guide governs all automated development, refactoring, and collaboration on **LunchMate** for **J.A.R.V.I.S. (Desktop Voice Assistant)** and **AI Coding Assistants (Google Antigravity, Cursor, Claude, and dev_agent)**.

---

## 1. Roles & Authority

* **J.A.R.V.I.S. (Autonomous Desktop Agent & Commander)**
  * Acts as the primary autonomous agent for the project.
  * Receives spoken or typed instructions from the user, plans changes, modifies source files directly via `dev_agent`, runs `npm run build` verification, and speaks results back to the user.
  * Directly manages dev server lifecycle, opens browser views, and monitors live health endpoints.
* **Google Antigravity & IDE Coding Assistants (Collaborative Heavy Engineering)**
  * Multi-file architecture, schema migrations, and deep refactoring in parallel sessions.
  * Synchronizes task status and history via `.jarvis_bridge.json`.

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
