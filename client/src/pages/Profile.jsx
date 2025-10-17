import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

const Badge = ({ children }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{children}</span>
);

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl shadow">{user.name?.[0] || 'U'}</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <div className="mt-1 flex items-center space-x-2">
                <Badge>{user.role}</Badge>
                {user.verified && <Badge>verified</Badge>}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-700">Account</h2>
              <div className="mt-4">
                <InfoRow label="Name" value={user.name} />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Role" value={user.role} />
                <InfoRow label="Verified" value={user.verified ? 'Yes' : 'No'} />
                <InfoRow label="User ID" value={user.id} />
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-700">Security</h2>
              <p className="text-sm text-gray-600 mt-4">You're signed in with a secure token. Keep your account safe by not sharing your login details.</p>
              <div className="mt-6">
                <a href="/orders" className="btn-primary inline-flex">View your orders</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
