import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AddOnStore from '../components/AddOnStore';
import { AppProvider } from '../contexts/AppContext';
import '../i18n';

// Mock the mock API
vi.mock('../services/mockApi', () => ({
  mockApiHandlers: {
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

describe('AddOnStore Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders store component', async () => {
    render(
      <TestWrapper>
        <AddOnStore />
      </TestWrapper>
    );

    expect(screen.getByText('Add-On Store')).toBeInTheDocument();
    expect(screen.getByText('Enhance your experience with premium add-ons')).toBeInTheDocument();
  });

  test('displays tabs correctly', async () => {
    render(
      <TestWrapper>
        <AddOnStore />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /store/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cart/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /purchase history/i })).toBeInTheDocument();
  });

  test('adds item to cart', async () => {
    render(
      <TestWrapper>
        <AddOnStore />
      </TestWrapper>
    );

    await waitFor(() => {
      const addToCartButton = screen.getByText('Add to Cart');
      expect(addToCartButton).toBeInTheDocument();
    });

    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(screen.getByText('Remove from Cart')).toBeInTheDocument();
    });
  });

  test('displays empty cart state', async () => {
    render(
      <TestWrapper>
        <AddOnStore />
      </TestWrapper>
    );

    const cartTab = screen.getByRole('button', { name: /cart/i });
    fireEvent.click(cartTab);

    await waitFor(() => {
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    });
  });

  test('filters by category', async () => {
    render(
      <TestWrapper>
        <AddOnStore />
      </TestWrapper>
    );

    await waitFor(() => {
      const testCategoryButton = screen.getByText('Test');
      expect(testCategoryButton).toBeInTheDocument();
    });

    const testCategoryButton = screen.getByText('Test');
    fireEvent.click(testCategoryButton);

    expect(testCategoryButton).toHaveClass('bg-blue-600', 'text-white');
  });
});