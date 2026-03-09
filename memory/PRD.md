# AuthForge - Authentication System PRD

## Original Problem Statement
Create a login and register page with logout functionality along with Forgot Password feature using Angular 18 and Node.js in the backend with MySQL DB. The page should look like modern day web applications and with futuristic views using robust and extensive design patterns. Features include Remember Me functionality and Social Login (Google).

## User Personas
1. **End Users** - Individuals needing secure authentication to access protected resources
2. **Administrators** - Users managing authentication settings and user accounts

## Core Requirements (Static)
- [x] User Registration with email/password
- [x] User Login with credentials validation
- [x] Remember Me functionality (extended session)
- [x] Forgot Password flow
- [x] Reset Password capability
- [x] Social Login (Google OAuth via Emergent Auth)
- [x] Logout functionality with session cleanup
- [x] Secure JWT-based authentication
- [x] Session management with MongoDB

## What's Been Implemented (Jan 9, 2026)

### Tech Stack (Modified from original request)
- **Frontend**: Angular 18 with standalone components
- **Backend**: Node.js + Express (instead of original FastAPI)
- **Database**: MongoDB (MySQL not available in environment)
- **Styling**: Tailwind CSS with custom cyberpunk theme

### Features Delivered
1. **Authentication Pages**
   - Login page with email/password, remember me, forgot password link
   - Register page with name, email, password, confirm password
   - Forgot Password page with email input
   - Reset Password page with token-based reset
   - Auth Callback for Google OAuth

2. **Dashboard**
   - Post-login landing page
   - User profile display (name, email, avatar)
   - Security status indicators
   - Account information display
   - Logout functionality

3. **Backend API Endpoints**
   - POST /api/auth/register
   - POST /api/auth/login
   - GET /api/auth/me
   - POST /api/auth/logout
   - POST /api/auth/forgot-password
   - POST /api/auth/reset-password
   - POST /api/auth/google/session

4. **Design Implementation**
   - Futuristic cyberpunk dark theme
   - Split-screen layout for auth pages
   - Neon cyan (#00F0FF) & Electric violet (#BD00FF) accents
   - Glassmorphism effects
   - Rajdhani + Outfit font combination
   - Animated background visuals
   - Toast notifications

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Login functionality
- [x] Registration functionality
- [x] Logout functionality
- [x] Session management

### P1 (High Priority) - DONE
- [x] Remember me functionality
- [x] Forgot password flow
- [x] Reset password flow
- [x] Google OAuth integration

### P2 (Medium Priority) - Future
- [ ] Zoho email integration for password reset (credentials provided but not integrated per user request)
- [ ] Email verification for new registrations
- [ ] Password strength indicator
- [ ] Account settings page
- [ ] Two-factor authentication (2FA)

### P3 (Nice to have) - Future
- [ ] Profile picture upload
- [ ] Change password functionality
- [ ] Login history/activity log
- [ ] Multiple OAuth providers (GitHub, Microsoft)

## Next Tasks List
1. Integrate Zoho email for sending actual password reset emails
2. Add email verification flow for new registrations
3. Implement password strength meter in registration form
4. Add account settings page for profile management
5. Consider adding 2FA for enhanced security

## Architecture Notes
- Frontend runs on port 3000 (Angular dev server)
- Backend runs on port 8001 (Node.js/Express)
- MongoDB for data persistence
- JWT tokens stored in localStorage and httpOnly cookies
- Session management with auto-expiry (7 days default, 30 days with remember me)

## File Structure
```
/app/
├── angular-frontend/          # Angular 18 application
│   └── src/app/
│       ├── core/              # Services, guards
│       ├── features/          # Auth, Dashboard pages
│       └── shared/            # Reusable components
├── node-backend/              # Node.js Express API
│   ├── models/                # Mongoose models
│   ├── routes/                # API routes
│   └── middleware/            # Auth middleware
└── memory/
    └── PRD.md                 # This file
```
