import { v4 as uuidv4 } from 'uuid';
import { User, UserReward, Reward, AddOn, PurchaseHistory, PartnerApiResponse } from '../types';

// Mock data
const mockUser: User = {
  id: 'user-1',
  email: 'user@actyme.com',
  name: 'Alex Johnson',
  points: 2500,
  level: 'Gold'
};

const mockRewards: Reward[] = [
  {
    id: 'reward-1',
    title: '$10 Amazon Gift Card',
    description: 'Redeem for any purchase on Amazon',
    pointsCost: 1000,
    category: 'voucher',
    imageUrl: 'https://images.pexels.com/photos/1292294/pexels-photo-1292294.jpeg?auto=compress&cs=tinysrgb&w=400',
    partnerName: 'Amazon',
    terms: 'Valid for 1 year from redemption date'
  },
  {
    id: 'reward-2',
    title: '20% Off Next Purchase',
    description: 'Get 20% discount on your next order',
    pointsCost: 500,
    category: 'discount',
    imageUrl: 'https://images.pexels.com/photos/3962294/pexels-photo-3962294.jpeg?auto=compress&cs=tinysrgb&w=400',
    partnerName: 'Store Partner',
    terms: 'Valid for 30 days from redemption'
  }
];

const mockAddOns: AddOn[] = [
  {
    id: 'addon-1',
    title: 'Premium Analytics Dashboard',
    description: 'Advanced analytics and reporting tools for better insights',
    price: 29.99,
    originalPrice: 49.99,
    category: 'Analytics',
    imageUrl: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=400',
    partnerName: 'Analytics Pro',
    features: ['Real-time dashboards', 'Custom reports', 'Data export', 'API access'],
    popularity: 85
  },
  {
    id: 'addon-2',
    title: 'Social Media Boost',
    description: 'Enhance your social media presence with automation tools',
    price: 19.99,
    category: 'Marketing',
    imageUrl: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400',
    partnerName: 'Social Boost',
    features: ['Auto-posting', 'Content calendar', 'Analytics tracking', '24/7 support'],
    popularity: 92
  },
  {
    id: 'addon-3',
    title: 'Cloud Storage Plus',
    description: 'Extra 100GB cloud storage with advanced security',
    price: 9.99,
    category: 'Storage',
    imageUrl: 'https://images.pexels.com/photos/2881229/pexels-photo-2881229.jpeg?auto=compress&cs=tinysrgb&w=400',
    partnerName: 'CloudSafe',
    features: ['100GB storage', 'End-to-end encryption', 'File sharing', 'Version history'],
    popularity: 78
  }
];

let mockUserRewards: UserReward[] = [
  {
    id: 'user-reward-1',
    rewardId: 'reward-1',
    reward: mockRewards[0],
    redeemedAt: '2024-01-15T10:30:00Z',
    status: 'active',
    voucherCode: 'AMZ-ABC123',
    expiryDate: '2025-01-15T23:59:59Z'
  }
];

let mockPurchaseHistory: PurchaseHistory[] = [
  {
    id: 'purchase-1',
    addOnId: 'addon-1',
    addOn: mockAddOns[0],
    purchasedAt: '2024-01-10T14:20:00Z',
    amount: 29.99,
    status: 'completed',
    transactionId: 'txn_abc123def456'
  }
];

// API delay simulation
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API endpoints
export const mockApiHandlers = {
  async getUser(): Promise<PartnerApiResponse<User>> {
    await delay(500);
    return { success: true, data: mockUser };
  },

  async getUserRewards(): Promise<PartnerApiResponse<UserReward[]>> {
    await delay(300);
    return { success: true, data: mockUserRewards };
  },

  async getAvailableRewards(): Promise<PartnerApiResponse<Reward[]>> {
    await delay(400);
    return { success: true, data: mockRewards };
  },

  async getAddOns(): Promise<PartnerApiResponse<AddOn[]>> {
    await delay(600);
    return { success: true, data: mockAddOns };
  },

  async getPurchaseHistory(): Promise<PartnerApiResponse<PurchaseHistory[]>> {
    await delay(300);
    return { success: true, data: mockPurchaseHistory };
  },

  async createVoucher(rewardId: string): Promise<PartnerApiResponse<UserReward>> {
    await delay(800);
    
    const reward = mockRewards.find(r => r.id === rewardId);
    if (!reward) {
      return { success: false, message: 'Reward not found' };
    }

    if (mockUser.points < reward.pointsCost) {
      return { success: false, message: 'Insufficient points' };
    }

    const newUserReward: UserReward = {
      id: uuidv4(),
      rewardId,
      reward,
      redeemedAt: new Date().toISOString(),
      status: 'active',
      voucherCode: `${reward.partnerName.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    mockUserRewards.unshift(newUserReward);
    mockUser.points -= reward.pointsCost;

    return { success: true, data: newUserReward };
  },

  async purchaseAddOn(items: any[]): Promise<PartnerApiResponse<PurchaseHistory>> {
    await delay(1000);
    
    const totalAmount = items.reduce((sum, item) => sum + (item.addOn.price * item.quantity), 0);
    
    const newPurchase: PurchaseHistory = {
      id: uuidv4(),
      addOnId: items[0].addOn.id, // Simplified for single item
      addOn: items[0].addOn,
      purchasedAt: new Date().toISOString(),
      amount: totalAmount,
      status: 'completed',
      transactionId: `txn_${Math.random().toString(36).substring(2, 15)}`
    };

    mockPurchaseHistory.unshift(newPurchase);

    return { success: true, data: newPurchase };
  }
};

// Setup mock server endpoints
if (typeof window !== 'undefined') {
  // Mock fetch for development
  const originalFetch = window.fetch;
  
  window.fetch = async (url: string | URL | Request, options?: RequestInit): Promise<Response> => {
    const urlString = url.toString();
    
    if (urlString.includes('/api/ota/')) {
      let result;
      
      if (urlString.includes('/api/ota/user')) {
        result = await mockApiHandlers.getUser();
      } else if (urlString.includes('/api/ota/rewards/user')) {
        result = await mockApiHandlers.getUserRewards();
      } else if (urlString.includes('/api/ota/rewards/available')) {
        result = await mockApiHandlers.getAvailableRewards();
      } else if (urlString.includes('/api/ota/addons')) {
        result = await mockApiHandlers.getAddOns();
      } else if (urlString.includes('/api/ota/purchases/history')) {
        result = await mockApiHandlers.getPurchaseHistory();
      } else if (urlString.includes('/api/ota/vouchers/create')) {
        const body = options?.body ? JSON.parse(options.body as string) : {};
        result = await mockApiHandlers.createVoucher(body.rewardId);
      } else if (urlString.includes('/api/ota/purchases/create')) {
        const body = options?.body ? JSON.parse(options.body as string) : {};
        result = await mockApiHandlers.purchaseAddOn(body.items);
      } else {
        result = { success: false, message: 'Endpoint not found' };
      }
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return originalFetch(url, options);
  };
}