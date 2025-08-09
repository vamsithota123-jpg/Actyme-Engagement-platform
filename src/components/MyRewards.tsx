import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { Gift, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const MyRewards: React.FC = () => {
  const { t } = useTranslation();
  const { 
    userRewards, 
    availableRewards, 
    loading, 
    error, 
    fetchUserRewards, 
    fetchAvailableRewards,
    redeemReward
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'available'>('active');
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    fetchUserRewards();
    fetchAvailableRewards();
  }, [fetchUserRewards, fetchAvailableRewards]);

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    try {
      await redeemReward(rewardId);
    } catch (error) {
      console.error('Redemption failed:', error);
    } finally {
      setRedeeming(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'used':
        return <CheckCircle className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const activeRewards = userRewards.filter(r => r.status === 'active');
  const rewardHistory = userRewards.filter(r => r.status !== 'active');

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchUserRewards} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('rewards.title')}</h1>
        <p className="text-lg text-gray-600">{t('rewards.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('rewards.active')} ({activeRewards.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('rewards.history')} ({rewardHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              activeTab === 'available'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available ({availableRewards.length})
          </button>
        </nav>
      </div>

      {loading && <LoadingSpinner size="lg" className="py-12" />}

      {/* Active Rewards */}
      {activeTab === 'active' && !loading && (
        <div className="space-y-4">
          {activeRewards.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Rewards</h3>
              <p className="text-gray-500">{t('rewards.getStarted')}</p>
            </div>
          ) : (
            activeRewards.map((userReward) => (
              <div key={userReward.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={userReward.reward.imageUrl}
                      alt={userReward.reward.title}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{userReward.reward.title}</h3>
                      <p className="text-gray-600 mb-2">{userReward.reward.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Partner: {userReward.reward.partnerName}</span>
                        <span>•</span>
                        <span>Redeemed: {format(new Date(userReward.redeemedAt), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>Expires: {format(new Date(userReward.expiryDate), 'MMM d, yyyy')}</span>
                      </div>
                      {userReward.voucherCode && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm font-medium text-blue-900">Voucher Code:</p>
                          <p className="text-lg font-mono font-bold text-blue-700">{userReward.voucherCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(userReward.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      userReward.status === 'active' ? 'bg-green-100 text-green-800' :
                      userReward.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`rewards.status.${userReward.status}`)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reward History */}
      {activeTab === 'history' && !loading && (
        <div className="space-y-4">
          {rewardHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h3>
              <p className="text-gray-500">Your reward history will appear here</p>
            </div>
          ) : (
            rewardHistory.map((userReward) => (
              <div key={userReward.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <img
                      src={userReward.reward.imageUrl}
                      alt={userReward.reward.title}
                      className="w-12 h-12 rounded-md object-cover opacity-60"
                    />
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-900">{userReward.reward.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{userReward.reward.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Redeemed: {format(new Date(userReward.redeemedAt), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>{userReward.reward.pointsCost} points</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(userReward.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      userReward.status === 'expired' ? 'bg-red-100 text-red-800' :
                      userReward.status === 'used' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {t(`rewards.status.${userReward.status}`)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Available Rewards */}
      {activeTab === 'available' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableRewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <img
                src={reward.imageUrl}
                alt={reward.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{reward.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    reward.category === 'voucher' ? 'bg-blue-100 text-blue-800' :
                    reward.category === 'discount' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {reward.category}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{reward.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">by {reward.partnerName}</span>
                  <span className="text-lg font-bold text-blue-600">{reward.pointsCost} pts</span>
                </div>
                <button
                  onClick={() => handleRedeem(reward.id)}
                  disabled={redeeming === reward.id}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {redeeming === reward.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    t('rewards.redeem')
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRewards;