import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { User, Mail, Award, Calendar, Settings } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, userRewards, purchaseHistory, loading } = useApp();

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

  const totalSpent = purchaseHistory.reduce((sum, purchase) => sum + purchase.amount, 0);
  const activeRewardsCount = userRewards.filter(r => r.status === 'active').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-lg text-gray-600">Manage your account and view your activity</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
        <div className="flex items-center space-x-6">
          <div className="bg-blue-100 p-6 rounded-full">
            <User className="h-16 w-16 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className="flex items-center space-x-2 text-gray-600 mt-2">
              <Mail size={16} />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-600">{user.level}</span>
              </div>
              <div className="text-gray-300">|</div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-blue-600">{user.points}</span>
                <span className="text-gray-600">points</span>
              </div>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            <Settings size={16} />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rewards</p>
              <p className="text-3xl font-bold text-green-600">{activeRewardsCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-3xl font-bold text-blue-600">{purchaseHistory.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-3xl font-bold text-purple-600">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-lg font-bold text-purple-600">$</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Member since</span>
            <span className="font-medium text-gray-900">January 2024</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Current level</span>
            <span className="font-medium text-green-600">{user.level}</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Available points</span>
            <span className="font-medium text-blue-600">{user.points} points</span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-600">Lifetime rewards redeemed</span>
            <span className="font-medium text-gray-900">{userRewards.length}</span>
          </div>
          
          <div className="flex justify-between items-center py-3">
            <span className="text-gray-600">Total add-ons purchased</span>
            <span className="font-medium text-gray-900">{purchaseHistory.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;