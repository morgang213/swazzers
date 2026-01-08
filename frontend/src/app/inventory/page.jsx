'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import apiClient from '../../lib/api';

export default function InventoryPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth, logout } = useAuthStore();
  const [inventory, setInventory] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryData, unitsData] = await Promise.all([
        apiClient.getAllInventory(),
        apiClient.request('/admin/units')
      ]);
      setInventory(inventoryData.inventory || []);
      setUnits(unitsData.units || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const columns = [
    {
      header: 'Supply',
      accessor: 'supply_name',
    },
    {
      header: 'SKU',
      accessor: 'sku',
    },
    {
      header: 'Category',
      accessor: 'category_name',
    },
    {
      header: 'Total Quantity',
      accessor: 'total_quantity',
    },
    {
      header: 'Par Level',
      accessor: 'total_par_level',
    },
    {
      header: 'Status',
      render: (row) => {
        const quantity = parseInt(row.total_quantity);
        const parLevel = parseInt(row.total_par_level);
        
        if (quantity === 0) {
          return <Badge variant="out_of_stock">Out of Stock</Badge>;
        } else if (quantity <= parLevel * 0.25) {
          return <Badge variant="critical">Critical</Badge>;
        } else if (quantity < parLevel) {
          return <Badge variant="below_par">Below Par</Badge>;
        } else {
          return <Badge variant="ok">OK</Badge>;
        }
      },
    },
  ];

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
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={() => router.push('/dashboard')} variant="secondary" size="sm">
                Dashboard
              </Button>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Inventory Overview</h2>
          <p className="text-gray-600">View and manage supply inventory across all locations</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Units Quick Access */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Quick Access by Unit</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {units.map((unit) => (
              <Button
                key={unit.id}
                variant="secondary"
                size="md"
                className="w-full"
                onClick={() => router.push(`/inventory/units/${unit.id}`)}
              >
                {unit.name}
              </Button>
            ))}
          </div>
        </Card>

        {/* Inventory Summary Table */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">All Supplies</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push('/supplies')}
            >
              Manage Supplies
            </Button>
          </div>
          <Table columns={columns} data={inventory} />
        </Card>
      </main>
    </div>
  );
}
