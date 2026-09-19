# Security Notes

## 🔐 Authentication & Authorization

### Current Implementation (Demo/Development)
This project uses a **simplified authentication system** suitable for educational purposes and local development:

- **Password hashing**: SHA-256 with static salt (`_ecosort_salt_2026`)
- **Session management**: Client-side storage with `x-user-id` header
- **Admin routes**: Currently open (no role-based access control enforced)

### ⚠️ Before Production Deployment

**This authentication system is NOT production-ready.** For production use, implement:

1. **Proper password hashing**: Replace SHA-256 with `bcrypt` or `argon2`
2. **JWT or session tokens**: Replace the `x-user-id` header with signed tokens
3. **Admin route protection**: Add middleware to verify `role === 'admin'` on all `/api/admin/*` endpoints
4. **Rate limiting**: Install `express-rate-limit` to protect AI endpoints from abuse
5. **CORS configuration**: Configure allowed origins in production

## 🔑 Environment Variables

Required secrets (never commit these):

```bash
GEMINI_API_KEY=your_actual_gemini_api_key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecosort
```

Keep these in `.env` (gitignored). See `.env.example` for the template.

## 📂 Runtime Data

The `data/` folder is gitignored and contains:
- `users.json` — user accounts with password hashes
- `scans.json` — waste classification scan history
- `waste_rules.json` — municipal waste disposal rules

These files are created automatically on first run and persist locally.

## 🛡️ Demo Credentials

**Default demo accounts** (hardcoded in `server/db.ts`):

| Email | Password | Role |
|-------|----------|------|
| `demo@ecosort.org` | `password123` | user |
| `admin@ecosort.org` | `admin123` | admin |

**Change or remove these before deploying publicly.**

## 🚨 Known Security Limitations

1. **No CSRF protection** — add `csurf` middleware for production
2. **No input sanitization** — text inputs are not sanitized for XSS
3. **Open admin API** — anyone can create/modify/delete waste rules
4. **20MB body limit** — could enable memory exhaustion without rate limiting
5. **Client-side auth** — `x-user-id` header is trivially spoofable

## 📝 Reporting Security Issues

This is an educational/demo project. For security concerns, open an issue on GitHub.
