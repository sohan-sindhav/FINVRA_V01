# Finvra — Secure Personal Finance & Investment Ecosystem

Finvra is a premium, high-security MERN stack application designed for personal asset management. It combines real-time financial tracking with robust cybersecurity features to protect sensitive user data.

## 🚀 Key Features

### 🛠️ Module Management System
- **Personalized Dashboard**: Users can selectively enable or disable specific application modules based on their needs.
- **Dependency Engine**: Automatically manages linked features (e.g., enabling IPO Manager requires core banking modules).
- **Dynamic UI**: Sidebar and Dashboard filter views instantly based on active preferences.

### 🛡️ Cybersecurity & Identity
- **Brute Force Protection**: 15-minute account lockout after 5 failed authentication attempts to prevent credential stuffing.
- **Two-Factor Authentication (2FA)**: Secure, authenticator-based verification (TOTP).
- **Global Audit Logs**: Admins can monitor system-wide activity, including IP addresses, OS, and device types.
- **Advanced Rate Limiting**: Request throttling for all API and Auth-specific routes.
- **Input Sanitization**: Strict email validation (Regex) and password complexity enforcement (Min 6 chars).

### 🏦 Financial Modules
- **Bank Accounts**: Multiple account tracking with capital and balance management.
- **Transactions**: Internal transfer logs and reverse entries.
- **IPO Manager**: Active placement tracking with dependencies on core modules.
- **PAN Manager**: Secure identity and tax document management.
- **Money Diary**: Personal ledger for rough notes and daily entries.

## 💻 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, Bcrypt, Otplib.
- **Security**: express-rate-limit, cookie-parser (HttpOnly), Helmet-ready headers.

## 🔧 Installation & Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/finvra.git
   ```

2. **Backend Setup**:
   - Navigate to `/Backend`.
   - Install dependencies: `npm install`.
   - Set up `.env` (MONGO_URI, JWT_SECRET).
   - Initialize Admin: `node createAdmin.js`.

3. **Frontend Setup**:
   - Navigate to `/Frontend`.
   - Install dependencies: `npm install`.
   - Run the app: `npm run dev`.

## 📜 License
MIT License - Feel free to use and modify for your own projects!
