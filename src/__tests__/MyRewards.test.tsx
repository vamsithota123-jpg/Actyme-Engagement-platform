import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MyRewards from '../components/MyRewards';
import { AppProvider } from '../contexts/AppContext';
import '../i18n';

// Mock the mock API
vi.mock('../services/mockApi', () => ({
  mockApiHandlers: {
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
    })
  }
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>{children}</AppProvider>
);

describe('MyRewards Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders rewards component', async () => {
    render(
      <TestWrapper>
        <MyRewards />
      </TestWrapper>
    );

    expect(screen.getByText('My Rewards & Redemptions')).toBeInTheDocument();
    expect(screen.getByText('Track your earned rewards and redemption history')).toBeInTheDocument();
  });

  test('displays tabs correctly', async () => {
    render(
      <TestWrapper>
        <MyRewards />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /available/i })).toBeInTheDocument();
  });

  test('switches between tabs', async () => {
    render(
      <TestWrapper>
        <MyRewards />
      </TestWrapper>
    );

    const historyTab = screen.getByRole('button', { name: /history/i });
    fireEvent.click(historyTab);

    expect(historyTab).toHaveClass('border-blue-500', 'text-blue-600');
  });

  test('handles empty state', async () => {
    // Mock empty rewards
    const mockEmpty = vi.fn().mockResolvedValue({
      success: true,
      data: []
    });
    
    vi.doMock('../services/mockApi', () => ({
      mockApiHandlers: {
        getUserRewards: mockEmpty,
        getAvailableRewards: mockEmpty
      }
    }));

    render(
      <TestWrapper>
        <MyRewards />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No Active Rewards')).toBeInTheDocument();
    });
  });
});