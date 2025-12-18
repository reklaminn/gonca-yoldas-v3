# Gonca Yoldaş Bilingual Education Platform

## Security Features

This application implements comprehensive security measures:

### 🔒 Authentication & Authorization
- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control** (Student, Parent, Admin)
- **Account lockout** after 5 failed login attempts (30-minute lockout)
- **Session management** with automatic cleanup
- **Password history** tracking (prevents reuse of last 10 passwords)

### 🛡️ Password Security
- **Minimum 8 characters** required
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Password expiry** after 90 days
- **Server-side validation** with client-side instant feedback

### 🔐 OTP System
- **Time-limited OTPs** (default 10 minutes)
- **Single-use codes** (automatically invalidated after use)
- **Purpose-specific** (login, password reset, email verification, 2FA)
- **Automatic cleanup** of expired OTPs

### 📊 Audit Logging
- All security-relevant actions logged
- Tracks:
  - Login attempts (successful and failed)
  - Account lockouts
  - OTP generation and verification
  - Session creation
  - Password changes
- Admin-only access to audit logs

### 🔑 API Key Protection
- Environment variables for sensitive data
- No API keys exposed in client code
- Service role key usage restricted to server-side only

### 🚨 Security Best Practices
1. **Input Sanitization** - XSS prevention
2. **Rate Limiting** - Client-side rate limiting helper
3. **Secure Storage** - Wrapper for localStorage with error handling
4. **Session Validation** - Automatic session security checks
5. **Email Verification** - Track verification status

## Database Security

### RLS Policies Implemented

#### Profiles Table
- Users can read/update their own profile
- Users cannot change their own role
- Admins can read/update all profiles

#### Programs & Lessons
- Public can read published programs
- Only enrolled users can access lessons
- Admins have full access

#### Orders
- Users can read their own orders
- Admins can read/update all orders

#### Blog Posts
- Public can read published posts
- Admins can manage all posts

#### Enrollments & Progress
- Users can manage their own data
- Admins can read all data

#### Certificates
- Users can read their own certificates
- Admins can manage all certificates

#### Audit Logs
- Admin-only read access
- System can insert logs

#### Sessions & OTPs
- Users can manage their own sessions
- No direct access to OTPs (system-only)

#### Password History
- System-only access (no user access)

## Security Functions

### Available RPC Functions
- `validate_password_strength(password)` - Server-side password validation
- `is_account_locked(user_uuid)` - Check account lock status
- `record_failed_login(user_uuid)` - Track failed login attempts
- `reset_failed_login(user_uuid, login_ip)` - Reset on successful login
- `generate_otp(user_uuid, purpose, expiry_minutes)` - Generate OTP
- `verify_otp(user_uuid, code, purpose)` - Verify OTP
- `cleanup_expired_data()` - Clean up expired sessions and OTPs
- `check_password_history(user_uuid, password_hash)` - Prevent password reuse
- `add_password_to_history(user_uuid, password_hash)` - Track password changes

## Maintenance

### Scheduled Tasks
Run `cleanup_expired_data()` daily to:
- Remove expired sessions
- Clean up old OTPs
- Maintain audit log size

This can be set up as a Supabase cron job or Edge Function.

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials
3. **NEVER** commit `.env` to version control
4. **NEVER** expose service_role key in client code

## Security Checklist

✅ RLS enabled on all tables
✅ Strong password requirements
✅ Account lockout mechanism
✅ OTP expiry system
✅ Session management
✅ Audit logging
✅ Password history tracking
✅ Role-based access control
✅ API key protection
✅ Input sanitization
✅ Rate limiting
✅ Secure storage wrapper

## Next Steps

1. Set up Supabase cron job for `cleanup_expired_data()`
2. Configure email templates for OTP delivery
3. Implement 2FA for admin accounts
4. Set up monitoring and alerting for security events
5. Regular security audits of audit logs
