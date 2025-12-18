import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder, updateOrderStatus, deleteOrder } from './orders';

// Hoist mock
const { mockSupabase } = vi.hoisted(() => {
  return {
    mockSupabase: {
      auth: {
        getSession: vi.fn(),
        getUser: vi.fn(),
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

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  }
}));

describe('Orders Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    const mockOrderData = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '5551234567',
      city: 'Istanbul',
      district: 'Kadikoy',
      customerType: 'individual' as const,
      programId: 'prog-123',
      programSlug: 'test-program',
      programTitle: 'Test Program',
      programPrice: 1000,
      subtotal: 1000,
      discountPercentage: 0,
      discountAmount: 0,
      taxRate: 18,
      taxAmount: 180,
      totalAmount: 1180,
      paymentMethod: 'credit_card',
      installment: 1,
      paymentStatus: 'completed' as const,
      cardName: 'Test User',
      cardLastFour: '1234',
      sendpulseSent: false
    };

    it('should create an order successfully', async () => {
      // Mock auth session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } }
      });

      // Mock duplicate check (return empty list)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ data: [], error: null }), // No duplicates
        insert: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ 
          data: { id: 'order-123', order_number: 'ORD-123' }, 
          error: null 
        })
      } as any);

      const result = await createOrder(mockOrderData);

      expect(result).toBe('order-123');
      expect(mockSupabase.from).toHaveBeenCalledWith('orders');
    });

    it('should block duplicate orders', async () => {
      // Mock auth session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { user: { id: 'user-123' } } }
      });

      // Mock duplicate check (return existing order)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({ 
          data: [{ id: 'existing-123' }], 
          error: null 
        })
      } as any);

      const result = await createOrder(mockOrderData);

      expect(result).toBeNull();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status successfully', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      } as any);

      const result = await updateOrderStatus('order-123', 'completed');
      expect(result).toBe(true);
    });

    it('should handle update failure', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Update failed' } })
      } as any);

      const result = await updateOrderStatus('order-123', 'completed');
      expect(result).toBe(false);
    });
  });

  describe('deleteOrder', () => {
    it('should delete order successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      } as any);

      const result = await deleteOrder('order-123');
      expect(result).toBe(true);
    });

    it('should handle delete failure', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
      } as any);

      const result = await deleteOrder('order-123');
      expect(result).toBe(false);
    });
  });
});
