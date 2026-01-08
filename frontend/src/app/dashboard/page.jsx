'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-brand-primary">
                EMS Supply Tracker
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="info">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Inventory Value</h3>
            <p className="text-3xl font-bold text-gray-900">$12,450</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Expiring Soon (30 days)</h3>
            <p className="text-3xl font-bold text-status-warning">23</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Below Par Level</h3>
            <p className="text-3xl font-bold text-status-critical">8</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Units Active</h3>
            <p className="text-3xl font-bold text-status-ok">4</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="primary" size="lg" className="w-full">
              Record Usage
            </Button>
            <Button variant="secondary" size="lg" className="w-full">
              View Inventory
            </Button>
            <Button variant="secondary" size="lg" className="w-full">
              Create Order
            </Button>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">Epinephrine used - Medic 1</p>
                <p className="text-sm text-gray-600">Incident #2024-001 - 2 hours ago</p>
              </div>
              <Badge variant="info">Usage</Badge>
            </div>
            <div className="flex justify-between items-center py-3 border-b">
              <div>
                <p className="font-medium">Inventory adjusted - Station 1</p>
                <p className="text-sm text-gray-600">Gauze 4x4 restocked - 5 hours ago</p>
              </div>
              <Badge variant="success">Restock</Badge>
            </div>
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium">Low stock alert - BLS 1</p>
                <p className="text-sm text-gray-600">N95 Masks below par - 1 day ago</p>
              </div>
              <Badge variant="warning">Alert</Badge>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
