import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { User, UserReward, AddOn, Cart, PurchaseHistory } from '../types';

interface AppState {
  user: User | null;
  userRewards: UserReward[];
  availableRewards: any[];
  addOns: AddOn[];
  cart: Cart;
  purchaseHistory: PurchaseHistory[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_USER_REWARDS'; payload: UserReward[] }
  | { type: 'SET_AVAILABLE_REWARDS'; payload: any[] }
  | { type: 'SET_ADD_ONS'; payload: AddOn[] }
  | { type: 'ADD_TO_CART'; payload: AddOn }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_PURCHASE_HISTORY'; payload: PurchaseHistory[] }
  | { type: 'ADD_PURCHASE'; payload: PurchaseHistory }
  | { type: 'REDEEM_REWARD'; payload: UserReward };

const initialState: AppState = {
  user: null,
  userRewards: [],
  availableRewards: [],
  addOns: [],
  cart: { items: [], total: 0 },
  purchaseHistory: [],
  loading: false,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_USER_REWARDS':
      return { ...state, userRewards: action.payload };
    case 'SET_AVAILABLE_REWARDS':
      return { ...state, availableRewards: action.payload };
    case 'SET_ADD_ONS':
      return { ...state, addOns: action.payload };
    case 'ADD_TO_CART':
      const existingItem = state.cart.items.find(item => item.addOn.id === action.payload.id);
      let newItems;
      if (existingItem) {
        newItems = state.cart.items.map(item =>
          item.addOn.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.cart.items, { addOn: action.payload, quantity: 1 }];
      }
      const total = newItems.reduce((sum, item) => sum + (item.addOn.price * item.quantity), 0);
      return { ...state, cart: { items: newItems, total } };
    case 'REMOVE_FROM_CART':
      const filteredItems = state.cart.items.filter(item => item.addOn.id !== action.payload);
      const newTotal = filteredItems.reduce((sum, item) => sum + (item.addOn.price * item.quantity), 0);
      return { ...state, cart: { items: filteredItems, total: newTotal } };
    case 'CLEAR_CART':
      return { ...state, cart: { items: [], total: 0 } };
    case 'SET_PURCHASE_HISTORY':
      return { ...state, purchaseHistory: action.payload };
    case 'ADD_PURCHASE':
      return { ...state, purchaseHistory: [action.payload, ...state.purchaseHistory] };
    case 'REDEEM_REWARD':
      return {
        ...state,
        userRewards: [action.payload, ...state.userRewards]
      };
    default:
      return state;
  }
};

interface AppContextType extends AppState {
  fetchUserData: () => Promise<void>;
  fetchUserRewards: () => Promise<void>;
  fetchAvailableRewards: () => Promise<void>;
  fetchAddOns: () => Promise<void>;
  fetchPurchaseHistory: () => Promise<void>;
  addToCart: (addOn: AddOn) => void;
  removeFromCart: (addOnId: string) => void;
  clearCart: () => void;
  purchaseCart: () => Promise<void>;
  redeemReward: (rewardId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const fetchUserData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/ota/user');
      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'SET_USER', payload: result.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message || 'Failed to fetch user data' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchUserRewards = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/ota/rewards/user');
      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'SET_USER_REWARDS', payload: result.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message || 'Failed to fetch user rewards' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchAvailableRewards = useCallback(async () => {
    try {
      const response = await fetch('/api/ota/rewards/available');
      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'SET_AVAILABLE_REWARDS', payload: result.data });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    }
  }, []);

  const fetchAddOns = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/ota/addons');
      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'SET_ADD_ONS', payload: result.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message || 'Failed to fetch add-ons' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const fetchPurchaseHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/ota/purchases/history');
      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'SET_PURCHASE_HISTORY', payload: result.data });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    }
  }, []);

  const addToCart = useCallback((addOn: AddOn) => {
    dispatch({ type: 'ADD_TO_CART', payload: addOn });
  }, []);

  const removeFromCart = useCallback((addOnId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: addOnId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const purchaseCart = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/ota/purchases/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: state.cart.items })
      });
      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'ADD_PURCHASE', payload: result.data });
        dispatch({ type: 'CLEAR_CART' });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message || 'Purchase failed' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.cart.items]);

  const redeemReward = useCallback(async (rewardId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/ota/vouchers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId })
      });
      const result = await response.json();
      if (result.success) {
        dispatch({ type: 'REDEEM_REWARD', payload: result.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.message || 'Redemption failed' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Network error' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const value: AppContextType = {
    ...state,
    fetchUserData,
    fetchUserRewards,
    fetchAvailableRewards,
    fetchAddOns,
    fetchPurchaseHistory,
    addToCart,
    removeFromCart,
    clearCart,
    purchaseCart,
    redeemReward,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};