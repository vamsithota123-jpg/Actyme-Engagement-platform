import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { ShoppingBag, Plus, Minus, ShoppingCart, Star, TrendingUp, History } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const AddOnStore: React.FC = () => {
  const { t } = useTranslation();
  const {
    addOns,
    cart,
    purchaseHistory,
    loading,
    error,
    fetchAddOns,
    fetchPurchaseHistory,
    addToCart,
    removeFromCart,
    clearCart,
    purchaseCart
  } = useApp();

  const [activeTab, setActiveTab] = useState<'store' | 'cart' | 'history'>('store');
  const [purchasing, setPurchasing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchAddOns();
    fetchPurchaseHistory();
  }, [fetchAddOns, fetchPurchaseHistory]);

  const handlePurchase = async () => {
    if (cart.items.length === 0) return;
    
    setPurchasing(true);
    try {
      await purchaseCart();
      setActiveTab('history');
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(addOns.map(addon => addon.category)))];
  const filteredAddOns = selectedCategory === 'all' 
    ? addOns 
    : addOns.filter(addon => addon.category === selectedCategory);

  const getItemQuantityInCart = (addOnId: string) => {
    const item = cart.items.find(item => item.addOn.id === addOnId);
    return item ? item.quantity : 0;
  };

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchAddOns} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('store.title')}</h1>
        <p className="text-lg text-gray-600">{t('store.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('store')}
            className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              activeTab === 'store'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Store ({filteredAddOns.length})
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              activeTab === 'cart'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('store.cart')} ({cart.items.reduce((sum, item) => sum + item.quantity, 0)})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('store.purchaseHistory')} ({purchaseHistory.length})
          </button>
        </nav>
      </div>

      {loading && <LoadingSpinner size="lg" className="py-12" />}

      {/* Store Tab */}
      {activeTab === 'store' && !loading && (
        <div>
          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAddOns.map((addOn) => {
              const quantityInCart = getItemQuantityInCart(addOn.id);
              return (
                <div key={addOn.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={addOn.imageUrl}
                      alt={addOn.title}
                      className="w-full h-48 object-cover"
                    />
                    {addOn.popularity > 80 && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <TrendingUp size={12} />
                        <span>{t('store.popular')}</span>
                      </div>
                    )}
                    {addOn.originalPrice && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {Math.round(((addOn.originalPrice - addOn.price) / addOn.originalPrice) * 100)}% OFF
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{addOn.title}</h3>
                      <div className="flex items-center text-yellow-400">
                        <Star size={16} className="fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{addOn.popularity}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{addOn.description}</p>
                    
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">{t('store.features')}:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {addOn.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-green-600">${addOn.price}</span>
                          {addOn.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">${addOn.originalPrice}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">by {addOn.partnerName}</p>
                      </div>
                    </div>
                    
                    {quantityInCart === 0 ? (
                      <button
                        onClick={() => addToCart(addOn)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                      >
                        <Plus size={16} />
                        <span>{t('store.addToCart')}</span>
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFromCart(addOn.id)}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                        >
                          <Minus size={16} />
                          <span>{t('store.removeFromCart')}</span>
                        </button>
                        <div className="bg-gray-100 px-3 py-2 rounded-md">
                          <span className="font-medium text-gray-900">{quantityInCart}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cart Tab */}
      {activeTab === 'cart' && !loading && (
        <div>
          {cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('store.emptyCart')}</h3>
              <p className="text-gray-500">Add some add-ons to get started</p>
              <button
                onClick={() => setActiveTab('store')}
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Browse Store
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.addOn.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.addOn.imageUrl}
                        alt={item.addOn.title}
                        className="w-20 h-20 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{item.addOn.title}</h3>
                        <p className="text-gray-600 mb-2">{item.addOn.description}</p>
                        <p className="text-sm text-gray-500">by {item.addOn.partnerName}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm text-gray-500">Qty:</span>
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        <div className="text-xl font-bold text-green-600">
                          ${(item.addOn.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.addOn.id)}
                          className="mt-2 text-sm text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between text-xl font-bold mb-4">
                  <span>{t('store.total')}:</span>
                  <span className="text-green-600">${cart.total.toFixed(2)}</span>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={clearCart}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    {purchasing ? <LoadingSpinner size="sm" /> : t('store.purchase')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purchase History Tab */}
      {activeTab === 'history' && !loading && (
        <div className="space-y-4">
          {purchaseHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchases Yet</h3>
              <p className="text-gray-500">Your purchase history will appear here</p>
            </div>
          ) : (
            purchaseHistory.map((purchase) => (
              <div key={purchase.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={purchase.addOn.imageUrl}
                      alt={purchase.addOn.title}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{purchase.addOn.title}</h3>
                      <p className="text-gray-600 mb-2">{purchase.addOn.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Purchased: {format(new Date(purchase.purchasedAt), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>ID: {purchase.transactionId}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600 mb-2">
                      ${purchase.amount.toFixed(2)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                      purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {purchase.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AddOnStore;