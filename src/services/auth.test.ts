import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUpUser, signInUser, signOutUser } from './auth';

// Hoist the mock object
const { mockSupabase } = vi.hoisted(() => {
  return {
    mockSupabase: {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        getUser: vi.fn(),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        resetPasswordForEmail: vi.fn(),
        updateUser: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        single: vi.fn(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
      })),
    }
  };
});

// Mock imports
vi.mock('@/lib/supabaseClient', () => ({
  supabase: mockSupabase
}));

vi.mock('../services/orders', () => ({
  linkGuestOrdersToUser: vi.fn().mockResolvedValue(true)
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUpUser', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      phone: '5551234567',
      city: 'Istanbul',
      district: 'Kadikoy'
    };

    it('should successfully sign up a new user', async () => {
      // Mock successful auth signup
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });

      // Mock successful profile insertion
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null })
      } as any);

      const result = await signUpUser(mockUserData);

      expect(result).toBe('test-user-id');
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: mockUserData.email,
        password: mockUserData.password,
        options: {
          emailRedirectTo: undefined,
          data: { full_name: mockUserData.fullName }
        }
      });
    });

    it('should return null if auth signup fails', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth failed' }
      });

      const result = await signUpUser(mockUserData);
      expect(result).toBeNull();
    });

    it('should return null if profile creation fails', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });

      // Mock failed profile insertion
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'Profile error' } })
      } as any);

      const result = await signUpUser(mockUserData);
      expect(result).toBeNull();
    });
  });

  describe('signInUser', () => {
    it('should successfully sign in a user', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null
      });

      const result = await signInUser('test@example.com', 'password123');
      expect(result).toBe('test-user-id');
    });

    it('should return null on sign in failure', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid credentials' }
      });

      const result = await signInUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('signOutUser', () => {
    it('should successfully sign out', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });
      const result = await signOutUser();
      expect(result).toBe(true);
    });

    it('should return false on sign out failure', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: { message: 'Sign out failed' } });
      const result = await signOutUser();
      expect(result).toBe(false);
    });
  });
});
