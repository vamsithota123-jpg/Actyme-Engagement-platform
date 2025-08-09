export interface User {
  id: string;
  email: string;
  name: string;
  points: number;
  level: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'voucher' | 'discount' | 'cashback';
  imageUrl: string;
  partnerName: string;
  expiryDate?: string;
  terms?: string;
}

export interface UserReward {
  id: string;
  rewardId: string;
  reward: Reward;
  redeemedAt: string;
  status: 'pending' | 'active' | 'expired' | 'used';
  voucherCode?: string;
  expiryDate: string;
}

export interface AddOn {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  partnerName: string;
  features: string[];
  popularity: number;
}

export interface CartItem {
  addOn: AddOn;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface PurchaseHistory {
  id: string;
  addOnId: string;
  addOn: AddOn;
  purchasedAt: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  transactionId: string;
}

export interface PartnerApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}