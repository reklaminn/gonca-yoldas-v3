import { supabase } from './supabaseClient';

export interface AuditLogEntry {
  action: string;
  resource: string;
  metadata?: Record<string, any>;
}

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Log security-relevant actions for audit trail
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: entry.action,
      resource: entry.resource,
      metadata: entry.metadata || {},
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Check if user account is locked
 */
export async function isAccountLocked(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_account_locked', {
      user_uuid: userId,
    });

    if (error) throw error;
    return data as boolean;
  } catch (error) {
    console.error('Failed to check account lock status:', error);
    return false;
  }
}

/**
 * Record failed login attempt
 */
export async function recordFailedLogin(userId: string): Promise<void> {
  try {
    await supabase.rpc('record_failed_login', {
      user_uuid: userId,
    });
  } catch (error) {
    console.error('Failed to record failed login:', error);
  }
}

/**
 * Reset failed login attempts on successful login
 */
export async function resetFailedLogin(userId: string): Promise<void> {
  try {
    await supabase.rpc('reset_failed_login', {
      user_uuid: userId,
      login_ip: null, // Could be obtained from request headers in production
    });
  } catch (error) {
    console.error('Failed to reset failed login:', error);
  }
}

/**
 * Generate OTP for user
 */
export async function generateOTP(
  userId: string,
  purpose: 'login' | 'password_reset' | 'email_verification' | '2fa',
  expiryMinutes: number = 10
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('generate_otp', {
      user_uuid: userId,
      otp_purpose: purpose,
      expiry_minutes: expiryMinutes,
    });

    if (error) throw error;
    
    await logAuditEvent({
      action: 'otp_requested',
      resource: 'auth',
      metadata: { purpose, expiry_minutes: expiryMinutes },
    });

    return data as string;
  } catch (error) {
    console.error('Failed to generate OTP:', error);
    return null;
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  userId: string,
  code: string,
  purpose: 'login' | 'password_reset' | 'email_verification' | '2fa'
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('verify_otp', {
      user_uuid: userId,
      otp_code: code,
      otp_purpose: purpose,
    });

    if (error) throw error;
    return data as boolean;
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return false;
  }
}

/**
 * Validate password strength (server-side)
 */
export async function validatePasswordStrength(password: string): Promise<PasswordValidationResult> {
  try {
    const { data, error } = await supabase.rpc('validate_password_strength', {
      password,
    });

    if (error) throw error;
    return data as PasswordValidationResult;
  } catch (error) {
    console.error('Failed to validate password:', error);
    return { valid: false, errors: ['Failed to validate password'] };
  }
}

/**
 * Client-side password validation (instant feedback)
 */
export function validatePasswordClient(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Şifre en az bir özel karakter içermelidir (!@#$%^&* vb.)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create session with tracking
 */
export async function createSession(
  userId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  try {
    await supabase.from('user_sessions').insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    });

    await logAuditEvent({
      action: 'session_created',
      resource: 'user_sessions',
      metadata: { user_id: userId },
    });
  } catch (error) {
    console.error('Failed to create session:', error);
  }
}

/**
 * Clean up expired sessions and OTPs
 */
export async function cleanupExpiredData(): Promise<void> {
  try {
    await supabase.rpc('cleanup_expired_data');
  } catch (error) {
    console.error('Failed to cleanup expired data:', error);
  }
}

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Secure local storage wrapper
 */
export const secureStorage = {
  setItem(key: string, value: string): void {
    try {
      // In production, consider encrypting sensitive data
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to set item in storage:', error);
    }
  },

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get item from storage:', error);
      return null;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from storage:', error);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },
};

/**
 * Check if password has expired (90 days)
 */
export async function isPasswordExpired(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('password_changed_at')
      .eq('id', userId)
      .single();

    if (error || !data?.password_changed_at) return false;

    const passwordAge = Date.now() - new Date(data.password_changed_at).getTime();
    const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;

    return passwordAge > ninetyDaysInMs;
  } catch (error) {
    console.error('Failed to check password expiry:', error);
    return false;
  }
}

/**
 * Validate session and check for suspicious activity
 */
export async function validateSession(): Promise<boolean> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) return false;

    // Check if account is locked
    const locked = await isAccountLocked(session.user.id);
    if (locked) {
      await supabase.auth.signOut();
      return false;
    }

    // Check if password has expired
    const expired = await isPasswordExpired(session.user.id);
    if (expired) {
      // Don't sign out, but flag for password change
      await logAuditEvent({
        action: 'password_expired',
        resource: 'auth',
        metadata: { user_id: session.user.id },
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to validate session:', error);
    return false;
  }
}
