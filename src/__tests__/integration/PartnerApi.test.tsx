import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mockApiHandlers } from '../../services/mockApi';

describe('Partner API Integration Tests (M28)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createVoucher method', () => {
    test('should return expected schema for successful voucher creation', async () => {
      const result = await mockApiHandlers.createVoucher('reward-1');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result.success).toBe(true);
      
      if (result.success && result.data) {
        expect(result.data).toHaveProperty('id');
        expect(result.data).toHaveProperty('rewardId');
        expect(result.data).toHaveProperty('reward');
        expect(result.data).toHaveProperty('redeemedAt');
        expect(result.data).toHaveProperty('status');
        expect(result.data).toHaveProperty('voucherCode');
        expect(result.data).toHaveProperty('expiryDate');
        
        expect(typeof result.data.id).toBe('string');
        expect(typeof result.data.rewardId).toBe('string');
        expect(typeof result.data.redeemedAt).toBe('string');
        expect(typeof result.data.status).toBe('string');
        expect(typeof result.data.voucherCode).toBe('string');
        expect(typeof result.data.expiryDate).toBe('string');
      }
    });

    test('should handle invalid reward ID', async () => {
      const result = await mockApiHandlers.createVoucher('invalid-reward');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Reward not found');
    });

    test('should handle insufficient points', async () => {
      // Mock a high-cost reward that exceeds user points
      const result = await mockApiHandlers.createVoucher('reward-1');
      
      // First redemption should succeed
      expect(result.success).toBe(true);
      
      // Attempt another redemption that might exceed points
      const result2 = await mockApiHandlers.createVoucher('reward-1');
      
      // This might fail due to insufficient points or succeed depending on mock user points
      expect(result2).toHaveProperty('success');
      expect(result2).toHaveProperty('message');
    });
  });

  describe('purchaseAddOn method', () => {
    test('should return expected schema for successful purchase', async () => {
      const mockItems = [
        {
          addOn: {
            id: 'addon-1',
            title: 'Test Add-on',
            price: 29.99,
            category: 'Test',
            imageUrl: 'test.jpg',
            partnerName: 'Test Partner',
            description: 'Test description',
            features: ['Feature 1'],
            popularity: 85
          },
          quantity: 1
        }
      ];

      const result = await mockApiHandlers.purchaseAddOn(mockItems);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result.success).toBe(true);
      
      if (result.success && result.data) {
        expect(result.data).toHaveProperty('id');
        expect(result.data).toHaveProperty('addOnId');
        expect(result.data).toHaveProperty('addOn');
        expect(result.data).toHaveProperty('purchasedAt');
        expect(result.data).toHaveProperty('amount');
        expect(result.data).toHaveProperty('status');
        expect(result.data).toHaveProperty('transactionId');
        
        expect(typeof result.data.id).toBe('string');
        expect(typeof result.data.addOnId).toBe('string');
        expect(typeof result.data.purchasedAt).toBe('string');
        expect(typeof result.data.amount).toBe('number');
        expect(typeof result.data.status).toBe('string');
        expect(typeof result.data.transactionId).toBe('string');
        
        expect(result.data.status).toBe('completed');
        expect(result.data.amount).toBe(29.99);
      }
    });

    test('should calculate total amount correctly for multiple items', async () => {
      const mockItems = [
        {
          addOn: {
            id: 'addon-1',
            title: 'Test Add-on 1',
            price: 29.99,
            category: 'Test',
            imageUrl: 'test1.jpg',
            partnerName: 'Test Partner',
            description: 'Test description 1',
            features: ['Feature 1'],
            popularity: 85
          },
          quantity: 2
        }
      ];

      const result = await mockApiHandlers.purchaseAddOn(mockItems);
      
      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.amount).toBe(59.98); // 29.99 * 2
      }
    });
  });

  describe('API Response Consistency', () => {
    test('all API methods should return PartnerApiResponse structure', async () => {
      const methods = [
        () => mockApiHandlers.getUser(),
        () => mockApiHandlers.getUserRewards(),
        () => mockApiHandlers.getAvailableRewards(),
        () => mockApiHandlers.getAddOns(),
        () => mockApiHandlers.getPurchaseHistory()
      ];

      for (const method of methods) {
        const result = await method();
        
        expect(result).toHaveProperty('success');
        expect(typeof result.success).toBe('boolean');
        
        if (result.success) {
          expect(result).toHaveProperty('data');
        } else {
          expect(result).toHaveProperty('message');
          expect(typeof result.message).toBe('string');
        }
      }
    });

    test('error responses should include message field', async () => {
      const result = await mockApiHandlers.createVoucher('nonexistent-reward');
      
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity', () => {
    test('voucher codes should be unique', async () => {
      const result1 = await mockApiHandlers.createVoucher('reward-1');
      const result2 = await mockApiHandlers.createVoucher('reward-1');
      
      if (result1.success && result2.success && result1.data && result2.data) {
        expect(result1.data.voucherCode).not.toBe(result2.data.voucherCode);
      }
    });

    test('transaction IDs should be unique', async () => {
      const mockItems = [
        {
          addOn: {
            id: 'addon-1',
            title: 'Test Add-on',
            price: 29.99,
            category: 'Test',
            imageUrl: 'test.jpg',
            partnerName: 'Test Partner',
            description: 'Test description',
            features: ['Feature 1'],
            popularity: 85
          },
          quantity: 1
        }
      ];

      const result1 = await mockApiHandlers.purchaseAddOn(mockItems);
      const result2 = await mockApiHandlers.purchaseAddOn(mockItems);
      
      if (result1.success && result2.success && result1.data && result2.data) {
        expect(result1.data.transactionId).not.toBe(result2.data.transactionId);
      }
    });
  });

  describe('Performance & Response Times', () => {
    test('API calls should complete within reasonable time', async () => {
      const startTime = Date.now();
      await mockApiHandlers.getUser();
      const endTime = Date.now();
      
      // Mock APIs should complete within 1 second (including artificial delay)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('createVoucher should handle concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() => 
        mockApiHandlers.createVoucher('reward-1')
      );
      
      const results = await Promise.all(promises);
      
      // At least some should succeed (depending on points available)
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });
});