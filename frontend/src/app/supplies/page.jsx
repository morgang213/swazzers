'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import apiClient from '../../lib/api';

export default function SuppliesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, checkAuth, logout } = useAuthStore();
  const [supplies, setSupplies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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
  }, [isAuthenticated, search, categoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const [suppliesData, categoriesData] = await Promise.all([
        apiClient.getSupplies(params),
        apiClient.getCategories()
      ]);
      
      setSupplies(suppliesData.supplies || []);
      setCategories(categoriesData.categories || []);
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const canManage = user.role === 'admin' || user.role === 'supervisor';

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
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
      header: 'Manufacturer',
      accessor: 'manufacturer',
    },
    {
      header: 'Unit Cost',
      render: (row) => `$${parseFloat(row.unit_cost || 0).toFixed(2)}`,
    },
    {
      header: 'Par Level',
      accessor: 'default_par_level',
    },
    {
      header: 'Tracks Expiration',
      render: (row) => (
        <Badge variant={row.tracks_expiration ? 'info' : 'success'}>
          {row.tracks_expiration ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.active ? 'ok' : 'warning'}>
          {row.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Supply Catalog</h2>
          <p className="text-gray-600">Manage your agency's supply catalog</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by name, SKU, or manufacturer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
            {canManage && (
              <Button
                variant="primary"
                onClick={() => alert('Create supply feature coming soon!')}
              >
                Add New Supply
              </Button>
            )}
          </div>
        </Card>

        {/* Supplies Table */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">
            All Supplies ({supplies.length})
          </h3>
          {loading ? (
            <div className="py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table columns={columns} data={supplies} />
          )}
        </Card>
      </main>
    </div>
  );
}
