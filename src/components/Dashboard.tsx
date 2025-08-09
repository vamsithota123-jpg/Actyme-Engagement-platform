import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { Award, TrendingUp, Gift, Star } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, userRewards, loading } = useApp();

  if (loading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('common.error')}</p>
      </div>
    );
  }

  const activeRewards = userRewards.filter(r => r.status === 'active').length;
  const totalRedeemedValue = userRewards.reduce((sum, r) => sum + r.reward.pointsCost, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('dashboard.welcome')}, {user.name}!
        </h1>
        <p className="text-lg text-gray-600">
          You're doing great! Keep completing tasks to earn more rewards.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.points')}</p>
              <p className="text-3xl font-bold text-blue-600">{user.points.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.level')}</p>
              <p className="text-3xl font-bold text-green-600">{user.level}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rewards</p>
              <p className="text-3xl font-bold text-purple-600">{activeRewards}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Redeemed</p>
              <p className="text-3xl font-bold text-amber-600">{totalRedeemedValue}</p>
              <p className="text-xs text-gray-500">points value</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        
        {userRewards.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{t('rewards.noRewards')}</p>
            <p className="text-sm text-gray-400 mt-2">{t('rewards.getStarted')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userRewards.slice(0, 5).map((userReward) => (
              <div key={userReward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-4">
                  <img
                    src={userReward.reward.imageUrl}
                    alt={userReward.reward.title}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{userReward.reward.title}</h3>
                    <p className="text-sm text-gray-500">
                      Redeemed on {new Date(userReward.redeemedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    userReward.status === 'active' ? 'bg-green-100 text-green-800' :
                    userReward.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    userReward.status === 'expired' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {t(`rewards.status.${userReward.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;