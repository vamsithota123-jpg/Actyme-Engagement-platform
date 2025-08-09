import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Dashboard from '../../components/Dashboard';
import MyRewards from '../../components/MyRewards';
import AddOnStore from '../../components/AddOnStore';
import { AppProvider } from '../../contexts/AppContext';
import '../../i18n';

// Mock the API calls
vi.mock('../../services/mockApi', () => ({
  mockApiHandlers: {
    getUser: vi.fn().mockResolvedValue({
      success: true,
      data: {
        id: 'user-1',
        email: 'test@actyme.com',
        name: 'Test User',
        points: 2500,
        level: 'Gold'
      }
    }),
    getUserRewards: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 'reward-1',
          rewardId: 'test-reward',
          reward: {
            id: 'test-reward',
            title: 'Test Reward',
            description: 'Test Description',
            pointsCost: 100,
            category: 'voucher',
            imageUrl: 'test-image.jpg',
            partnerName: 'Test Partner'
          },
          redeemedAt: '2024-01-01T00:00:00Z',
          status: 'active',
          voucherCode: 'TEST123',
          expiryDate: '2024-12-31T23:59:59Z'
        }
      ]
    }),
    getAvailableRewards: vi.fn().mockResolvedValue({
      success: true,
      data: []
    }),
    getAddOns: vi.fn().mockResolvedValue({
      success: true,
      data: [
        {
          id: 'addon-1',
          title: 'Test Add-on',
          description: 'Test Description',
          price: 29.99,
          category: 'Test',
          imageUrl: 'test-image.jpg',
          partnerName: 'Test Partner',
          features: ['Feature 1', 'Feature 2'],
          popularity: 85
        }
      ]
    }),
    getPurchaseHistory: vi.fn().mockResolvedValue({
      success: true,
      data: []
    })
  }
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>{children}</AppProvider>
);

describe('Dashboard Integration Tests (M27)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Dashboard integrates with partner mock data', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Wait for user data to load
    await waitFor(() => {
      expect(screen.getByText('Welcome to Actyme, Test User!')).toBeInTheDocument();
    });

    // Check that user points and level are displayed
    expect(screen.getByText('2,500')).toBeInTheDocument(); // Points
    expect(screen.getByText('Gold')).toBeInTheDocument(); // Level

    // Check that active rewards count is displayed
    expect(screen.getByText('1')).toBeInTheDocument(); // Active rewards count
  });

  test('MyRewards component calls OTA endpoints', async () => {
    const { mockApiHandlers } = await import('../../services/mockApi');
    
    render(
      <TestWrapper>
        <MyRewards />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockApiHandlers.getUserRewards).toHaveBeenCalled();
      expect(mockApiHandlers.getAvailableRewards).toHaveBeenCalled();
    });

    // Check that rewards data is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Reward')).toBeInTheDocument();
    });
  });

  test('AddOnStore component calls OTA endpoints', async () => {
    const { mockApiHandlers } = await import('../../services/mockApi');
    
    render(
      <TestWrapper>
        <AddOnStore />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockApiHandlers.getAddOns).toHaveBeenCalled();
      expect(mockApiHandlers.getPurchaseHistory).toHaveBeenCalled();
    });

    // Check that add-on data is displayed
    await waitFor(() => {
      expect(screen.getByText('Test Add-on')).toBeInTheDocument();
    });
  });

  test('State management updates across components', async () => {
    const TestIntegration: React.FC = () => {
      const [currentComponent, setCurrentComponent] = React.useState('dashboard');

      return (
        <div>
          <button onClick={() => setCurrentComponent('dashboard')}>Dashboard</button>
          <button onClick={() => setCurrentComponent('rewards')}>Rewards</button>
          <button onClick={() => setCurrentComponent('store')}>Store</button>
          
          {currentComponent === 'dashboard' && <Dashboard />}
          {currentComponent === 'rewards' && <MyRewards />}
          {currentComponent === 'store' && <AddOnStore />}
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestIntegration />
      </TestWrapper>
    );

    // Start with dashboard
    await waitFor(() => {
      expect(screen.getByText('Welcome to Actyme, Test User!')).toBeInTheDocument();
    });

    // Switch to rewards
    const rewardsButton = screen.getByText('Rewards');
    rewardsButton.click();

    await waitFor(() => {
      expect(screen.getByText('My Rewards & Redemptions')).toBeInTheDocument();
    });

    // Switch to store
    const storeButton = screen.getByText('Store');
    storeButton.click();

    await waitFor(() => {
      expect(screen.getByText('Add-On Store')).toBeInTheDocument();
    });
  });

  test('Error handling in dashboard components', async () => {
    // Mock API failure
    vi.doMock('../../services/mockApi', () => ({
      mockApiHandlers: {
        getUser: vi.fn().mockResolvedValue({
          success: false,
          message: 'Failed to fetch user data'
        }),
        getUserRewards: vi.fn().mockResolvedValue({
          success: false,
          message: 'Failed to fetch rewards'
        }),
        getAvailableRewards: vi.fn().mockResolvedValue({
          success: true,
          data: []
        }),
        getAddOns: vi.fn().mockResolvedValue({
          success: false,
          message: 'Failed to fetch add-ons'
        }),
        getPurchaseHistory: vi.fn().mockResolvedValue({
          success: true,
          data: []
        })
      }
    }));

    const { rerender } = render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Dashboard should handle user fetch failure gracefully
    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    // Test MyRewards error handling
    rerender(
      <TestWrapper>
        <MyRewards />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch rewards')).toBeInTheDocument();
    });
  });
});